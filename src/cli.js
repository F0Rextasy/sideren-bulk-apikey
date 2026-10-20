#!/usr/bin/env node
'use strict';

/**
 * sideren-bulk-apikey — one Sideren (LayerX1) account per API key, any number.
 *
 * The panel gates signup behind Cloudflare Turnstile, but the identity backend
 * is Supabase/GoTrue and answers without any captcha:
 *
 *   POST https://data.sideren.io/auth/v1/signup      {email,password}  -> access_token
 *   POST https://data.sideren.io/rest/v1/rpc/create_api_key  (Bearer) -> { key: "lx1_…" }
 *
 * Two REST calls per account; the $2 free credit is granted server-side. Every
 * key is verified with GET /v1/models, GET /v1/me (balance) and a real chat
 * completion before it is written to keys.txt.
 *
 * Usage:
 *   node src/cli.js --count N        mint N accounts (default 30, no cap)
 *   node src/cli.js --verify-only    re-verify every key in keys.txt
 *   node src/cli.js --connect-9router --api-key <key>   register the provider node + key with a local 9Router
 *   node src/cli.js --help
 *
 * Egress: provider traffic goes through your proxy list (`proxies.txt` next to
 * the repo, the warm-pool files, or $SIDEREN_PROXIES) — OPTIONAL: with a pool,
 * every request exits through it and a dead exit fails that attempt instead of
 * silently falling back to the direct line; with no pool the tool connects
 * directly. A single egress can be pinned with PIN_PROXY=socks5://127.0.0.1:40000.
 */
const path = require('path');
const { spawnSync } = require('child_process');

const args = process.argv.slice(2);
const arg = (name, fallback) => { const i = args.indexOf(name); return i === -1 ? fallback : args[i + 1]; };

if (args.includes('--help') || args.includes('-h')) {
  console.log(require('fs').readFileSync(path.join(__dirname, '..', 'README.md'), 'utf8').split('## ⚙️')[1] || 'see README.md');
  console.log('Requests go through your proxy list when one is provided (SIDEREN_PROXIES / proxies.txt).');
  console.log('Without a pool the tool connects directly.');
  process.exit(0);
}

if (args.includes('--connect-9router')) {
  const res = spawnSync(process.execPath, [path.join(__dirname, 'connect-9router.js'), ...args.filter((a) => a !== '--connect-9router')], {
    windowsHide: true,
    cwd: __dirname,
    stdio: 'inherit',
  });
  process.exit(res.status ?? 0);
}

// Run-shape presets (operator standard v3) and the flags they set are forwarded to
// batch.js verbatim; without --preset batch.js keeps its own historical defaults.
const forwarded = [];
for (const name of ['--preset', '--conc', '--gap']) {
  const v = arg(name, null);
  if (v != null) forwarded.push(`${name}=${v}`);
}

const child = args.includes('--verify-only')
  ? ['verify.js']
  : ['batch.js', '--count=' + arg('--count', '30'), ...forwarded];

const res = spawnSync(process.execPath, [path.join(__dirname, child[0]), ...child.slice(1)], {
  windowsHide: true,
  stdio: 'inherit',
  cwd: path.resolve(__dirname, '..'),
});
process.exit(res.status ?? 0);
