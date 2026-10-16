#!/usr/bin/env node
'use strict';
/**
 * REST-only Supabase signup for sideren (no Turnstile, no browser):
 *   POST https://data.sideren.io/auth/v1/signup  -> autoconfirmed user + session
 * Then builds the @supabase/ssr "base64url" cookie(s) the app expects so the
 * session can be injected into a browser context (or reused for REST calls).
 *
 *   node src/rest-signup.js <email> [password] [--out=file.json]
 *   node src/rest-signup.js auto            # creates a mailbox via broker 9700
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const { CookieJar, fetchUrl } = require(path.join(__dirname, '..', '..', 'baseten', 'src', 'http'));
const { parseProxy } = require('./proxy.js');

const SUPA = 'https://data.sideren.io';
const ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlwcXFzenJtY3h5Ymp1b2J0Zmx2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0NzE5MzMsImV4cCI6MjA5ODA0NzkzM30.25uc5g50oqfBqmQmKocMDIukfQ8mKLvJlzesP-vRxyY';
const POOL = process.env.SIDEREN_PROXIES || path.join(__dirname, '..', 'proxies.txt');
const OUT = path.join(__dirname, '..', 'outputs');

process.on('unhandledRejection', (e) => console.log('[unhandled]', String((e && e.message) || e).slice(0, 100)));
process.on('uncaughtException', (e) => console.log('[uncaught]', String((e && e.message) || e).slice(0, 100)));

/** The ssr cookie name the app's createBrowserClient uses. */
const COOKIE_NAME = 'sb-ypqqszrmcxybjuobtflv-auth-token';

function pool() {
  const files = [
    path.join(OUT, 'warm-pool.txt'),
    path.join(OUT, 'warm-api.txt'),
    path.join(__dirname, '..', 'proxies.txt'),
    path.join(__dirname, '..', 'proxies.txt'),
    POOL,
  ].filter((f) => fs.existsSync(f));
  const lines = [];
  for (const f of files) for (const l of fs.readFileSync(f, 'utf8').split(/\r?\n/)) {
    const c = l.split(/\s+#/)[0].trim();
    if (c && !c.startsWith('#')) lines.push(c);
  }
  const arr = [...new Set(lines)].map((l) => parseProxy(l)).filter(Boolean);
  // WARP SOCKS last-resort egress (shared exit; fine for a single account run)
  const warp = parseProxy('socks5://127.0.0.1:40000');
  if (warp) arr.push(warp);
  return arr;
}

async function viaProxy(url, opts = {}) {
  const lines = process.env.PIN_PROXY ? [parseProxy(process.env.PIN_PROXY)] : pool();
  let last = null;
  for (let i = 0; i < Math.min(lines.length, 16); i++) {
    const pr = lines[(Date.now() + i * 23) % lines.length];
    try {
      return { res: await fetchUrl(url, Object.assign({ proxy: pr, timeoutMs: 30000, jar: new CookieJar() }, opts)), proxy: pr };
    } catch (e) { last = e; }
  }
  throw last || new Error('all exits failed');
}

async function brokerCreate() {
  return new Promise((resolve, reject) => {
    const req = require('http').request({ host: '127.0.0.1', port: 9700, path: '/create', method: 'POST', timeout: 130000 }, (res) => {
      let b = ''; res.on('data', (c) => (b += c));
      res.on('end', () => { try { resolve(JSON.parse(b)); } catch (e) { reject(new Error(b.slice(0, 120))); } });
    });
    req.on('timeout', () => req.destroy(new Error('broker timeout')));
    req.on('error', reject);
    req.end();
  });
}

/** base64url like supabase's r6 (no padding). */
function b64url(str) { return Buffer.from(str, 'utf8').toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }

/** Replicates @supabase/ssr r0(name, base64value, 3180): encodeURIComponent-chunked cookie pieces. */
function chunkCookie(name, value, chunkSize = 3180) {
  let enc = encodeURIComponent(value);
  if (enc.length <= chunkSize) return [{ name, value }];
  const out = [];
  while (enc.length > 0) {
    let piece = enc.slice(0, chunkSize);
    const pct = piece.lastIndexOf('%');
    if (pct > chunkSize - 3) piece = piece.slice(0, pct);
    let dec = '';
    let rest = piece;
    while (rest.length > 0) {
      try { dec = decodeURIComponent(rest); break; } catch (e) {
        if (rest.endsWith('%') && rest.length > 3) { rest = rest.slice(0, -3); } else throw e;
      }
    }
    out.push(dec);
    enc = enc.slice(rest.length);
  }
  return out.map((v, i) => ({ name: `${name}.${i}`, value: v }));
}

/** From a GoTrue session payload, the JSON supabase-js stores in the cookie. */
function sessionCookieValue(session) {
  const payload = {
    access_token: session.access_token,
    token_type: session.token_type || 'bearer',
    expires_in: session.expires_in,
    expires_at: session.expires_at || Math.floor(Date.now() / 1000) + (session.expires_in || 3600),
    refresh_token: session.refresh_token,
    user: session.user,
  };
  return 'base64-' + b64url(JSON.stringify(payload));
}

(async () => {
  const emailArg = process.argv[2];
  if (!emailArg) { console.log('usage: node src/rest-signup.js <email|auto> [password] [--out=file]'); process.exit(1); }
  const outHit = process.argv.find((a) => a.startsWith('--out='));
  const outFile = outHit ? outHit.split('=')[1] : path.join(OUT, `account-${Date.now()}.json`);

  let email = emailArg;
  let mailbox = null;
  if (emailArg === 'auto') {
    mailbox = await brokerCreate();
    email = mailbox.address;
  }
  const password = process.argv[3] && !process.argv[3].startsWith('--') ? process.argv[3] : `Sd!${Math.random().toString(36).slice(2, 10)}A7`;

  const { res, proxy } = await viaProxy(SUPA + '/auth/v1/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password, data: {} }),
    headers: { apikey: ANON, authorization: `Bearer ${ANON}`, 'content-type': 'application/json', Accept: 'application/json' },
  });
  const text = res.text || '';
  let json = null;
  try { json = JSON.parse(text); } catch (e) { /* keep null */ }
  console.log('signup', res.status, 'exit', proxy.host + ':' + proxy.port);
  if (!json || !json.access_token) {
    console.log('body:', text.slice(0, 400));
    console.log('FAILED');
    process.exit(2);
  }
  const record = {
    email, password, mailbox, at: new Date().toISOString(),
    exit: `${proxy.protocol}//${proxy.host}:${proxy.port}`,
    user_id: json.user && json.user.id,
    access_token: json.access_token,
    refresh_token: json.refresh_token,
    expires_in: json.expires_in,
    expires_at: json.expires_at,
    token_type: json.token_type,
    user: json.user,
    cookieName: COOKIE_NAME,
    cookieValue: sessionCookieValue(json),
    cookieChunks: chunkCookie(COOKIE_NAME, sessionCookieValue(json)).map((c) => c.name),
  };
  record.cookies = chunkCookie(COOKIE_NAME, sessionCookieValue(json));
  fs.writeFileSync(outFile, JSON.stringify(record, null, 1));
  try { fs.appendFileSync(path.join(OUT, 'rest-signups.jsonl'), JSON.stringify({ at: record.at, email, user_id: record.user_id, outFile }) + '\n'); } catch (e) {}
  console.log('user', record.user_id);
  console.log('cookies', record.cookies.map((c) => `${c.name}(${c.value.length})`).join(' '));
  console.log('saved', outFile);
  // sanity: authenticated "me" call with the access token
  try {
    const me = await viaProxy(SUPA + '/auth/v1/user', {
      headers: { apikey: ANON, authorization: `Bearer ${json.access_token}`, Accept: 'application/json' },
    });
    console.log('me', me.res.status, (me.res.text || '').slice(0, 200));
  } catch (e) { console.log('me ERR', e.code || e.message); }
})();
