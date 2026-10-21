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
const { parseProxy, isLocalHost } = require('./proxy.js');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'outputs');
const PL = path.join(__dirname, '..');
const KEYS = process.argv[2] || path.join(ROOT, 'keys.txt');
process.on('unhandledRejection', (e) => console.log('[unhandled]', String((e && e.message) || e).slice(0, 100)));
process.on('uncaughtException', (e) => console.log('[uncaught]', String((e && e.message) || e).slice(0, 100)));

function pool() {
  const files = [
    path.join(OUT, 'warm-api.txt'),
    path.join(PL, 'router-siderenapi-live.txt'),
    path.join(PL, 'union-live.txt'),
    path.join(PL, 'proxies.txt'),
    process.env.SIDEREN_PROXIES,
  ].filter((f) => f && fs.existsSync(f));
  const lines = [];
  for (const f of files) for (const l of fs.readFileSync(f, 'utf8').split(/\r?\n/)) { const c = l.split(/\s+#/)[0].trim(); if (c && !c.startsWith('#')) lines.push(c); }
  const arr = [...new Set(lines)].map((l) => parseProxy(l)).filter((p) => p && !isLocalHost(p.host));
  if (!arr.length) {
    // No pool = DIRECT mode: a proxy is recommended at scale (per-IP limits,
    // bans) but the tool works without one. `null` is the direct sentinel.
    console.log('no proxy list found — running WITHOUT a proxy (direct). Put exits in proxies.txt (or set SIDEREN_PROXIES) to route through them.');
    return [null];
  }
  const warp = parseProxy('socks5://127.0.0.1:40000');
  if (warp) arr.unshift(warp);
  return arr;
}
/** Read once at startup so the direct-mode notice prints a single time. */
const EXITS = pool();

async function check(key) {
  const out = { key: `${key.slice(0, 8)}…${key.slice(-4)}`, models: null, me: null, balance: null, plan: null, chat: null, snippet: null, ok: false, exit: null, err: null };
  for (let a = 0; a < Math.min(EXITS.length, 10); a++) {
    const pr = EXITS[(a + Math.floor(Math.random() * 3)) % EXITS.length];
    try {
      const h = { authorization: `Bearer ${key}`, Accept: 'application/json' };
      const m = await fetchUrl('https://api.sideren.io/v1/models', { proxy: pr, timeoutMs: 12000, headers: h, jar: new CookieJar() });
      out.models = m.status;
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
      if (out.ok) return out;
    } catch (e) {
      out.err = `${pr ? `${pr.host}:${pr.port}` : 'direct'} ${e.code || String(e.message).slice(0, 50)}`;
    }
  }
  return out;
}

(async () => {
  const keys = fs.readFileSync(KEYS, 'utf8').split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  console.log(`verifying ${keys.length} keys`);
  const results = [];
  const CONC = 3;
  for (let i = 0; i < keys.length; i += CONC) {
    const slice = keys.slice(i, i + CONC);
    const done = await Promise.all(slice.map((k) => check(k)));
    for (const r of done) { results.push(r); console.log(`${r.ok ? 'OK ' : 'FAIL'} ${r.key} models=${r.models} me=${r.me} balance=${r.balance} chat=${r.chat} ${r.snippet || ''}`); }
  }
  const ok = results.filter((r) => r.ok).length;
  fs.writeFileSync(path.join(OUT, 'verification.json'), JSON.stringify({ at: new Date().toISOString(), total: keys.length, ok, results }, null, 1));
  // mirror into accounts.json
  const af = path.join(ROOT, 'accounts.json');
  if (fs.existsSync(af)) {
    const acc = JSON.parse(fs.readFileSync(af, 'utf8'));
    for (const a of acc) { const r = results.find((x) => x.key === `${a.key.slice(0, 8)}…${a.key.slice(-4)}`); if (r) a.verifyFinal = r; }
    fs.writeFileSync(af, JSON.stringify(acc, null, 1));
  }
  console.log(`\nverified ${ok}/${keys.length}`);
})();
