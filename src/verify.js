#!/usr/bin/env node
'use strict';
/**
 * Final verification sweep over keys.txt:
 *   for each key: GET /v1/models (200) + GET /v1/me (balance) + chat @sdn/llama-3.3-70b (content)
 * Exits: pool + proxy fallback; with no pool the tool connects directly. Results
 * to outputs/verification.json and accounts.json.
 *
 *   node src/verify.js [keysFile]
 */
const fs = require('fs');
const path = require('path');
const { CookieJar, fetchUrl } = require('./vendor/http.js');
const { parseProxy, parseProxyText, isLocalHost } = require('./proxy.js');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'outputs');
const PL = path.join(__dirname, '..');
const KEYS = process.argv[2] || path.join(ROOT, 'keys.txt');
process.on('unhandledRejection', (e) => console.log('[unhandled]', String((e && e.message) || e).slice(0, 100)));
process.on('uncaughtException', (e) => console.log('[uncaught]', String((e && e.message) || e).slice(0, 100)));

/** The files an exit pool is read from, beside $SIDEREN_PROXIES. */
const POOL_FILES = [
  path.join(OUT, 'warm-api.txt'),
  path.join(PL, 'router-siderenapi-live.txt'),
  path.join(PL, 'union-live.txt'),
  path.join(PL, 'proxies.txt'),
];
/** A configured pool that holds nothing usable is fatal: the uncaughtException handler
 *  only logs, so a plain throw here would end the run with exit code 0. */
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
      // WARP and `ssh -D` bridges listen on loopback; dropping them (as this did) made a
      // one-line pool a silent direct run.
      if (isLocalHost(p.host)) local += 1;
      lines.push(c);
      ok += 1;
    }
    if (!ok) bad.push(label);
  };
  for (const f of POOL_FILES) if (fs.existsSync(f)) add(f, fs.readFileSync(f, 'utf8'));
  const env = process.env.SIDEREN_PROXIES;
  if (env) {
    // "one proxy per line" (README): a value that parses as a list is the list itself,
    // and reading it as a path only (as this did) let the sweep leave from this machine.
    if (fs.existsSync(env)) add(env, fs.readFileSync(env, 'utf8'));
    else if (parseProxyText(env).length) add('$SIDEREN_PROXIES', env);
    // A path with no file behind it is the launcher's own default (`proxies.txt`).
    else if (/[\\/]|\.(txt|list)$/i.test(env)) console.log(`! $SIDEREN_PROXIES=${env} names no existing file — no exits loaded from it`);
    else bad.push(`$SIDEREN_PROXIES=${env}`);
  }
  const arr = [...new Set(lines)].map((l) => parseProxy(l)).filter(Boolean);
  if (!arr.length) {
    // A configured pool must not become a direct run.
    if (bad.length) fatal(`${bad.join(', ')} holds no usable proxy line — fix it, or remove it to run direct on purpose`);
    // No pool = DIRECT mode: a proxy is recommended at scale (per-IP limits, bans)
    // but the tool works without one. `null` is the direct sentinel.
    console.log('no proxy list found — running WITHOUT a proxy (direct). Put exits in proxies.txt (or set SIDEREN_PROXIES) to route through them.');
    return [null];
  }
  if (local) console.log(`note: ${local} loopback exit(s) in the pool — right for a local tunnel client (WARP, ssh -D), but a local pass-through proxy still leaves from this machine's address.`);
  const warp = parseProxy('socks5://127.0.0.1:40000');
  if (warp) arr.unshift(warp);
  return arr;
}
/** Read once at startup so the direct-mode notice prints a single time. */
const EXITS = pool();

async function check(key) {
  const out = { key: `${key.slice(0, 8)}…${key.slice(-4)}`, models: null, me: null, balance: null, plan: null, chat: null, snippet: null, ok: false, exit: null, err: null, rejected: false, verdict: null };
  for (let a = 0; a < Math.min(EXITS.length, 10); a++) {
    const pr = EXITS[(a + Math.floor(Math.random() * 3)) % EXITS.length];
    try {
      const h = { authorization: `Bearer ${key}`, Accept: 'application/json' };
      const m = await fetchUrl('https://api.sideren.io/v1/models', { proxy: pr, timeoutMs: 12000, headers: h, jar: new CookieJar() });
      out.models = m.status;
      if (m.status === 401 || m.status === 403) out.rejected = true; // the provider answered about this key
      if (m.status !== 200) throw new Error(`models ${m.status}`);
      const me = await fetchUrl('https://api.sideren.io/v1/me', { proxy: pr, timeoutMs: 12000, headers: h, jar: new CookieJar() });
      out.me = me.status;
      try { const j = JSON.parse(me.text || '{}'); out.balance = j.balance_usd; out.plan = j.plan; } catch (e) {}
      const chat = await fetchUrl('https://api.sideren.io/v1/chat/completions', {
        method: 'POST', proxy: pr, timeoutMs: 30000, jar: new CookieJar(),
        headers: { ...h, 'content-type': 'application/json' },
        body: JSON.stringify({ model: '@sdn/llama-3.3-70b', messages: [{ role: 'user', content: 'Reply with the single word: ok' }], max_tokens: 16 }),
      });
      out.chat = chat.status;
      const cj = JSON.parse(chat.text || '{}');
      out.snippet = ((cj.choices && cj.choices[0] && cj.choices[0].message && cj.choices[0].message.content) || '').trim().slice(0, 40);
      out.ok = out.models === 200 && out.chat === 200 && out.snippet.length > 0;
      out.exit = pr ? `${pr.protocol}//${pr.host}:${pr.port}` : 'direct';
      if (out.ok) { out.verdict = 'ok'; return out; }
    } catch (e) {
      out.err = `${pr ? `${pr.host}:${pr.port}` : 'direct'} ${e.code || String(e.message).slice(0, 50)}`;
    }
  }
  // 401/403 = the provider rejected this key; a rate limit, a 5xx or no exit
  // answering at all says nothing about the key, so the two must not print the same.
  out.verdict = out.rejected ? 'dead' : 'unverified';
  return out;
}

(async () => {
  if (!fs.existsSync(KEYS)) {
    console.error(`no key file: ${KEYS} — mint some first (node src/cli.js --count N)`);
    process.exit(1);
  }
  // verification.json and the accounts.json mirror below both live in outputs/: on a
  // fresh clone that directory does not exist yet, and the write used to die with
  // ENOENT in the unhandledRejection handler — a whole sweep, exit code 0, nothing
  // written and nothing said.
  fs.mkdirSync(OUT, { recursive: true });
  const keys = fs.readFileSync(KEYS, 'utf8').split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  console.log(`verifying ${keys.length} keys`);
  const results = [];
  const CONC = 3;
  for (let i = 0; i < keys.length; i += CONC) {
    const slice = keys.slice(i, i + CONC);
    const done = await Promise.all(slice.map((k) => check(k)));
    for (const r of done) { results.push(r); console.log(`${r.ok ? 'OK ' : r.verdict === 'dead' ? 'DEAD' : 'UNVERIFIED'} ${r.key} models=${r.models} me=${r.me} balance=${r.balance} chat=${r.chat} ${r.snippet || ''}`); }
  }
  const ok = results.filter((r) => r.ok).length;
  fs.writeFileSync(path.join(OUT, 'verification.json'), JSON.stringify({ at: new Date().toISOString(), total: keys.length, ok, results }, null, 1));
  // mirror into accounts.json
  const af = path.join(ROOT, 'accounts.json');
  if (fs.existsSync(af)) {
    const acc = JSON.parse(fs.readFileSync(af, 'utf8'));
    for (const a of acc) { const r = results.find((x) => x.key === `${(a.key || '').slice(0, 8)}…${(a.key || '').slice(-4)}`); if (r) a.verifyFinal = r; }
    // Write-then-rename: a truncated accounts.json is every account password lost.
    const tmp = af + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(acc, null, 1), { mode: 0o600 });
    fs.renameSync(tmp, af);
  }
  console.log(`\nverified ${ok}/${keys.length}`);
})();
