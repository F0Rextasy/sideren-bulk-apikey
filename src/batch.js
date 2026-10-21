#!/usr/bin/env node
'use strict';
/**
 * Sideren batch mint — Node-only REST path (measured 2026-10-14):
 *   1. POST https://data.sideren.io/auth/v1/signup {email,password}   -> session (autoconfirm, no captcha)
 *   2. POST https://data.sideren.io/rest/v1/rpc/create_api_key {p_name} -> { key: "lx1_…" }
 *   3. verify: GET /v1/models + GET /v1/me (balance_usd>0) + chat @sdn/llama-3.3-70b
 *
 *   node src/batch.js --count=29 [--conc=3] [--tag=b1] [--broker=1]
 *
 * Persists: keys.txt (one per line), accounts.json, mirror %USERPROFILE%\sideren-keys.txt,
 * outputs/batch-<tag>.jsonl (events), outputs/batch-<tag>.summary.md.
 * Exits: warm pool -> union pool -> proxy SOCKS last resort. A pool is optional:
 * with none (no pool files, no `proxies.txt`, no $SIDEREN_PROXIES) the tool
 * connects directly.
 */
const fs = require('fs');
const crypto = require('crypto');
const os = require('os');
const path = require('path');
const { CookieJar, fetchUrl } = require('./vendor/http.js');
const { parseProxy, parseProxyText, isLocalHost } = require('./proxy.js');

const opt = (n, d) => { const h = process.argv.find((a) => a.startsWith(`--${n}=`)); return h ? h.split('=').slice(1).join('=') : d; };
/** A flag that ends up in a loop bound or a worker count must be a number:
 *  `--count abc` used to be NaN, and `n >= NaN` is never true — the worker
 *  loop then minted accounts until someone killed it. */
function numFlag(name, raw, { min = 0, max = Infinity, int = false } = {}) {
  const n = int ? parseInt(raw, 10) : parseFloat(raw);
  if (!Number.isFinite(n) || n < min || n > max) throw new Error(`--${name}: "${raw}" is not a number in ${min}..${max}`);
  return n;
}
// Run-shape presets (operator standard v3): `--preset=turbo|balanced|safe` sets the
// worker count (turbo = 5, under this repo's 6-worker ceiling) and the pacing gap;
// an explicit `--conc` / `--gap` wins and no `--preset` keeps today's defaults.
const { presetArgv, resolvePreset } = require('./preset');
const PRESET = resolvePreset({
  preset: presetArgv(process.argv.slice(2)),
  conc: null,
  gap: opt('gap', null) == null ? null : numFlag('gap', opt('gap', null)),
  defaultConc: 3,
});
const GAP_MS = PRESET.gap == null ? null : PRESET.gap * 1000;
const COUNT = numFlag('count', opt('count', '29'), { min: 1, int: true });
const CONC = Math.max(1, Math.min(6, numFlag('conc', opt('conc', String(PRESET.conc)), { min: 1, int: true })));
const TAG = opt('tag', 'b1');
const USE_BROKER = opt('broker', '1') === '1';
const BROKER = numFlag('broker-port', opt('broker-port', '9700'), { min: 1, max: 65535, int: true });


const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'outputs');
const PL = path.join(__dirname, '..');
const SUPA = 'https://data.sideren.io';
const ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlwcXFzenJtY3h5Ymp1b2J0Zmx2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0NzE5MzMsImV4cCI6MjA5ODA0NzkzM30.25uc5g50oqfBqmQmKocMDIukfQ8mKLvJlzesP-vRxyY';
const COOKIE_NAME = 'sb-ypqqszrmcxybjuobtflv-auth-token';

process.on('unhandledRejection', (e) => log(`[unhandled] ${String((e && e.message) || e).slice(0, 120)}`));
process.on('uncaughtException', (e) => log(`[uncaught] ${String((e && e.message) || e).slice(0, 120)}`));

// The events file lands in outputs/, and the summary is written there too: on a
// fresh clone the directory does not exist yet, so create it once here instead
// of letting the summary write die with ENOENT after a finished run.
fs.mkdirSync(OUT, { recursive: true });
const EVF = path.join(OUT, `batch-${TAG}.jsonl`);
function log(msg) { console.log(`[${new Date().toISOString().slice(11, 19)}] ${msg}`); }
function ev(obj) { try { fs.appendFileSync(EVF, JSON.stringify({ at: new Date().toISOString(), ...obj }) + '\n'); } catch (e) {} }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ------------------------------------------------------------- persistence

const ACCOUNTS_FILE = path.join(ROOT, 'accounts.json');
/** Write-then-rename: accounts.json is the only copy of every account password,
 *  and a crash inside a plain writeFileSync truncates it for good. 0600 because
 *  that file is a credential, not a log. */
function writeAccounts(accounts) {
  const tmp = ACCOUNTS_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(accounts, null, 1), { mode: 0o600 });
  fs.renameSync(tmp, ACCOUNTS_FILE);
}
let persistChain = Promise.resolve();
/** Serializes read-modify-write of accounts.json across concurrent workers. */
function persist(mutator) {
  const run = persistChain.then(async () => {
    const accounts = fs.existsSync(ACCOUNTS_FILE) ? JSON.parse(fs.readFileSync(ACCOUNTS_FILE, 'utf8')) : [];
    await mutator(accounts);
    writeAccounts(accounts);
    return accounts;
  });
  persistChain = run.catch(() => {});
  return run;
}

// -------------------------------------------------------------------- pools

/** The files an exit pool is read from, beside $SIDEREN_PROXIES. */
const POOL_FILES = [
  path.join(OUT, 'warm-pool.txt'),
  path.join(OUT, 'warm-api.txt'),
  path.join(PL, 'sideren-live.txt'),
  path.join(PL, 'router-siderenapi-live.txt'),
  path.join(PL, 'union-live.txt'),
  path.join(PL, 'proxies.txt'),
];
/** A pool the operator configured but that holds nothing usable is fatal: this script
 *  installs an uncaughtException handler that only logs, so a plain throw here would
 *  end the run with exit code 0 and no exit pool. */
const fatal = (msg) => {
  console.error(msg);
  process.exit(1);
};
function pool() {
  const lines = [];
  const bad = []; // a source the operator configured that holds no proxy line at all
  let local = 0;
  const add = (label, text) => {
    let ok = 0;
    for (const l of String(text).split(/\r?\n/)) {
      const c = l.split(/\s+#/)[0].trim();
      if (!c || c.startsWith('#') || c.startsWith('//')) continue;
      const p = parseProxy(c);
      if (!p) continue;
      // A loopback exit is worth keeping: WARP and `ssh -D` bridges listen there and the
      // README's own example line is one. Dropping it (as this did) turned a one-line
      // pool into a silent direct run; the note below is the warning that was missing.
      if (isLocalHost(p.host)) local += 1;
      lines.push(c);
      ok += 1;
    }
    if (!ok) bad.push(label);
  };
  for (const f of POOL_FILES) if (fs.existsSync(f)) add(f, fs.readFileSync(f, 'utf8'));
  const env = process.env.SIDEREN_PROXIES;
  if (env) {
    // The README documents the variable as "one proxy per line", so a value that parses
    // as a list is the list itself. Reading every value as a path (as this did) dropped
    // an inline pool and the run then left from this machine's address.
    if (fs.existsSync(env)) add(env, fs.readFileSync(env, 'utf8'));
    else if (parseProxyText(env).length) add('$SIDEREN_PROXIES', env);
    // A path with no file behind it is the launcher's own default (`proxies.txt`).
    else if (/[\\/]|\.(txt|list)$/i.test(env)) console.log(`! $SIDEREN_PROXIES=${env} names no existing file — no exits loaded from it`);
    else bad.push(`$SIDEREN_PROXIES=${env}`);
  }
  const uniq = [...new Set(lines)].map((l) => parseProxy(l)).filter(Boolean);
  if (!uniq.length) {
    // A pool the operator configured must never become a direct run: they asked for an
    // exit, and this machine's own address is the one thing that must not stand in.
    if (bad.length) fatal(`${bad.join(', ')} holds no usable proxy line — fix it, or remove it to run direct on purpose`);
    // No pool at all = DIRECT mode: a proxy is recommended at scale (per-IP limits,
    // bans) but the tool works without one. `null` is the direct sentinel.
    console.log('no proxy list found — running WITHOUT a proxy (direct). Put exits in proxies.txt (or set SIDEREN_PROXIES) to route through them.');
    return [null];
  }
  if (local) console.log(`note: ${local} loopback exit(s) in the pool — right for a local tunnel client (WARP, ssh -D), but a local pass-through proxy still leaves from this machine's address.`);
  if (!process.env.NO_WARP) {
    const warp = parseProxy('socks5://127.0.0.1:40000');
    if (warp) uniq.push(warp);
  }
  return uniq;
}
let EXITS = pool();
/** Run-header truth: in direct mode the "pool" is the single `null` sentinel. */
const POOL_DESC = EXITS.some(Boolean) ? `pool ${EXITS.length} ${EXITS.length === 1 ? 'exit' : 'exits'}` : 'direct (no proxy list)';
function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
/** Order for attempts: proxy first for 1-2-exit requests (it is the reliable one);
 *  for larger requests: a few random pool exits, then proxy, then the rest.
 *  Direct mode hands out the single `null` slot instead. */
function pickExits(n) {
  if (!EXITS.some(Boolean)) return [null];
  const warp = EXITS.filter((p) => p && p.host === '127.0.0.1');
  const rest = shuffle(EXITS.filter((p) => p && p.host !== '127.0.0.1'));
  if (n <= 2) return [...warp, ...rest.slice(0, n)];
  const head = rest.slice(0, Math.max(1, n - warp.length - 2));
  const tailN = Math.max(0, n - head.length - warp.length);
  return [...head, ...warp, ...rest.slice(head.length, head.length + tailN)];
}

/** One request with exit hopping. Returns {status, text, proxy}. */
async function req(url, { method = 'GET', body, token, timeoutMs = 10000, tries = 8 } = {}) {
  const exits = pickExits(tries);
  let last = null;
  for (const pr of exits) {
    try {
      const headers = { apikey: ANON, 'content-type': 'application/json', Accept: 'application/json' };
      if (token) headers.authorization = `Bearer ${token}`;
      const res = await fetchUrl(url, { method, body: body ? JSON.stringify(body) : undefined, headers, proxy: pr, timeoutMs, jar: new CookieJar() });
      return { status: res.status, text: res.text || '', proxy: pr };
    } catch (e) { last = e; }
  }
  throw last || new Error('all exits failed');
}

// ------------------------------------------------------------------ broker

function brokerPost(pathq, timeoutMs = 125000) {
  return new Promise((resolve, reject) => {
    const req0 = require('http').request({ host: '127.0.0.1', port: BROKER, path: pathq, method: 'POST', timeout: timeoutMs }, (res) => {
      let b = ''; res.on('data', (c) => (b += c));
      res.on('end', () => { try { resolve(JSON.parse(b)); } catch (e) { reject(new Error(b.slice(0, 100))); } });
    });
    req0.on('timeout', () => req0.destroy(new Error('broker timeout')));
    req0.on('error', reject);
    req0.end();
  });
}

function genEmail() {
  const r = Math.random().toString(36).slice(2, 10);
  return `sd${r}-${Math.random().toString(36).slice(2, 6)}@inbound-mailtrap.io`;
}

// ------------------------------------------------------------------ verify

async function verifyKey(key) {
  const out = { modelsStatus: null, meStatus: null, balance: null, chatStatus: null, chatOk: false, model: '@sdn/llama-3.3-70b', snippet: null, exit: null };
  for (let a = 0; a < 6; a++) {
    const pr = pickExits(1)[0];
    try {
      const models = await fetchUrl('https://api.sideren.io/v1/models', { proxy: pr, timeoutMs: 12000, headers: { authorization: `Bearer ${key}`, Accept: 'application/json' }, jar: new CookieJar() });
      out.modelsStatus = models.status;
      if (models.status !== 200) throw new Error(`models ${models.status}`);
      const me = await fetchUrl('https://api.sideren.io/v1/me', { proxy: pr, timeoutMs: 12000, headers: { authorization: `Bearer ${key}`, Accept: 'application/json' }, jar: new CookieJar() });
      out.meStatus = me.status;
      try { const mj = JSON.parse(me.text || '{}'); out.balance = mj.balance_usd; out.plan = mj.plan; } catch (e) {}
      const chat = await fetchUrl('https://api.sideren.io/v1/chat/completions', {
        method: 'POST', proxy: pr, timeoutMs: 30000, jar: new CookieJar(),
        headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ model: out.model, messages: [{ role: 'user', content: 'Reply with the single word: ok' }], max_tokens: 16 }),
      });
      out.chatStatus = chat.status;
      const cj = JSON.parse(chat.text || '{}');
      out.snippet = (cj.choices && cj.choices[0] && cj.choices[0].message && cj.choices[0].message.content) || '';
      out.chatOk = chat.status === 200 && typeof out.snippet === 'string' && out.snippet.trim().length > 0;
      out.exit = pr ? `${pr.host}:${pr.port}` : 'direct';
      if (out.modelsStatus === 200 && out.chatOk) return out;
    } catch (e) {
      const at = pr ? `${pr.host}:${pr.port}` : 'direct';
      out.lastErr = `${at} ${e.code || String(e.message).slice(0, 50)}`;
      out.exit = at;
    }
    await sleep(1500 + a * 1000);
  }
  return out;
}

// ----------------------------------------------------------------- account

async function mintOne(n) {
  const t0 = Date.now();
  let mailbox = null;
  if (USE_BROKER) {
    try {
      const b = await brokerPost('/create');
      if (b && b.address && b.token) mailbox = { address: b.address, provider: 'mailtrap', token: b.token };
    } catch (e) { ev({ n, tag: 'broker-fail', err: String(e.message).slice(0, 80) }); }
  }
  const email = mailbox ? mailbox.address : genEmail();
  const password = `Sd!${crypto.randomBytes(6).toString('hex')}A${10 + (crypto.randomBytes(1)[0] % 90)}`;
  const name = ['Ada Lovelace', 'Grace Hopper', 'Alan Turing', 'Katherine Johnson', 'Linus Pauling', 'Marie Curie', 'Dennis Ritchie', 'Barbara Liskov'][n % 8];

  // 1) signup
  let su = null;
  for (let a = 1; a <= 4; a++) {
    try {
      const r = await req(SUPA + '/auth/v1/signup', { method: 'POST', body: { email, password, data: {} }, tries: 8 });
      su = JSON.parse(r.text || '{}');
      ev({ n, tag: 'signup', status: r.status, exit: r.proxy ? `${r.proxy.host}:${r.proxy.port}` : 'direct', user: su.user && su.user.id, ms: Date.now() - t0 });
      if (r.status === 429 || su.error_code === 'over_email_send_rate_limit') { await sleep(15000); continue; }
      if ((r.status === 400 || r.status === 422) && /already registered|already exists/i.test(r.text || '')) {
        // signup landed on an earlier attempt but the response was lost: log in instead
        const lr = await req(SUPA + '/auth/v1/token?grant_type=password', { method: 'POST', body: { email, password }, tries: 8 });
        su = JSON.parse(lr.text || '{}');
        ev({ n, tag: 'login-fallback', status: lr.status, user: su.user && su.user.id });
        if (lr.status === 200 && su.access_token) break;
      }
      if (r.status !== 200 || !su.access_token) throw new Error(`signup ${r.status}: ${(r.text || '').slice(0, 120)}`);
      break;
    } catch (e) {
      ev({ n, tag: 'signup-retry', attempt: a, err: String(e.message).slice(0, 100) });
      if (a === 4) throw e;
      await sleep(2000 * a);
    }
  }
  if (!su || !su.access_token) throw new Error('signup failed');

  // 2) create key (access token valid 1h; refresh not needed this fast)
  let key = null;
  for (let a = 1; a <= 4; a++) {
    try {
      const r = await req(SUPA + '/rest/v1/rpc/create_api_key', { method: 'POST', body: { p_name: `agent-${TAG}-${n}` }, token: su.access_token, tries: 8 });
      const j = JSON.parse(r.text || '{}');
      ev({ n, tag: 'rpc', status: r.status, exit: r.proxy ? `${r.proxy.host}:${r.proxy.port}` : 'direct', id: j.id, key4: j.last4 });
      if (r.status === 200 && typeof j.key === 'string' && /^(sdn_|lx1_)/.test(j.key)) { key = j.key; break; }
      throw new Error(`rpc ${r.status}: ${(r.text || '').slice(0, 120)}`);
    } catch (e) {
      ev({ n, tag: 'rpc-retry', attempt: a, err: String(e.message).slice(0, 100) });
      if (a === 4) throw e;
      await sleep(2000 * a);
    }
  }

  const record = {
    n, email, name, password,
    mailbox,
    userId: (su.user && su.user.id) || null,
    key,
    keyPrefix: `${key.slice(0, 8)}…${key.slice(-4)}`,
    createdAt: new Date().toISOString(),
    exit: null,
  };

  // 3) persist immediately (key only counted after verify)
  await persist(async (accounts) => {
    record.n = accounts.length + 1;
    accounts.push(record);
    // accounts.json carries the key and the password, so the record has to land even
    // when a locked or read-only keys.txt refuses the append: throwing out of this
    // mutator used to leave the account's only copy unwritten and the key lost.
    try { fs.appendFileSync(path.join(ROOT, 'keys.txt'), key + '\n', { mode: 0o600 }); } catch (e) {
      ev({ n, tag: 'keys-append-fail', err: String(e.message).slice(0, 80) });
      console.log(`! keys.txt append failed (${String(e.message).slice(0, 60)}) — the key is in accounts.json`);
    }
    try { fs.appendFileSync(path.join(os.homedir(), 'sideren-keys.txt'), key + '\n', { mode: 0o600 }); } catch (e) { ev({ n, tag: 'mirror-fail', err: String(e.message).slice(0, 80) }); }
  });

  // 4) verify
  const v = await verifyKey(key);
  record.verify = v;
  await persist(async (accounts) => {
    const i = accounts.findIndex((a) => a.key === key);
    if (i >= 0) accounts[i] = record;
  });
  ev({ n, tag: 'verify', models: v.modelsStatus, me: v.meStatus, balance: v.balance, chat: v.chatStatus, ok: v.chatOk, balanceOk: v.balance > 0, snippet: v.snippet, exit: v.exit });
  return { record, verify: v };
}

// -------------------------------------------------------------------- main

(async () => {
  log(`batch ${TAG}: target ${COUNT} accounts · conc ${CONC} · ${POOL_DESC}`);
  ev({ tag: 'start', count: COUNT, conc: CONC, pool: EXITS.filter(Boolean).length });
  let done = 0;
  let idx = 0;
  const results = [];
  const failures = [];
  async function worker(w) {
    for (;;) {
      const n = idx++;
      if (n >= COUNT) return;
      console.log(`… #${n + 1} başladı (${POOL_DESC})`);
      try {
        const { record, verify } = await mintOne(n + 1);
        done++;
        results.push({ n: record.n, key: record.keyPrefix, ok: verify.chatOk && verify.balance > 0, balance: verify.balance });
        log(`[${done}/${COUNT}] ${record.keyPrefix} models=${verify.modelsStatus} balance=$${verify.balance} chat=${verify.chatStatus}${verify.chatOk ? ' ok' : ' FAIL'} (${verify.snippet || ''})`);
        console.log(`✓ #${n + 1} KEY ALINDI: ${record.keyPrefix}   [${done} ok / ${n + 1} deneme]`);
      } catch (e) {
        failures.push({ n: n + 1, err: String(e.message).slice(0, 140) });
        log(`[fail ${n + 1}] ${String(e.message).slice(0, 120)}`);
        console.log(`✗ #${n + 1} key yok: ${String(e.message).slice(0, 200)}`);
      }
      if (GAP_MS) await sleep(GAP_MS);
    }
  }
  await Promise.all(Array.from({ length: CONC }, (_, w) => worker(w)));

  const verified = results.filter((r) => r.ok).length;
  const summary = {
    at: new Date().toISOString(), tag: TAG, target: COUNT, minted: done, verified,
    balanceSum: results.reduce((a, r) => a + (r.balance || 0), 0),
    results, failures,
  };
  fs.writeFileSync(path.join(OUT, `batch-${TAG}.summary.json`), JSON.stringify(summary, null, 2));
  log(`done: minted ${done}/${COUNT}, verified ${verified}, failures ${failures.length}`);
  console.log(`BATCH ${verified}/${COUNT}${verified < COUNT ? ' — short of the target' : ' OK'}`);
  if (verified < COUNT) process.exitCode = 1;
  ev({ tag: 'finish', ...summary, results: undefined, failures: undefined });
})();
