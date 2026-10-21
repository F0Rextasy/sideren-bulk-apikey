#!/usr/bin/env node
'use strict';

/**
 * Interactive launcher for the compiled build.
 *
 * The CLI is obfuscated, so its options are not obvious from reading it; this
 * launcher asks for them, remembers the answers in `launcher.config.json`, and
 * runs the CLI with the right flags — including the proxy list, which is the
 * setting people most often need and cannot guess.
 *
 * Usage: node src/launcher.js            (menu)
 *        node src/launcher.js --help
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { spawnSync } = require('child_process');

// Keep the menu alive when a task's socket dies mid-run.
process.on('uncaughtException', (e) => console.log(`WARN uncaught: ${String(e && e.message).slice(0, 180)}`));

const CONFIG = path.join(__dirname, 'launcher.config.json');
const CLI = path.join(__dirname, 'cli.js');
const CONNECT = path.join(__dirname, 'connect-9router.js');

const defaults = {
  count: 30,
  preset: '',
  proxyFile: process.env.SIDEREN_PROXIES || 'proxies.txt',
  pinProxy: '',
};

function loadConfig() {
  try {
    return { ...defaults, ...JSON.parse(fs.readFileSync(CONFIG, 'utf8')) };
  } catch (e) {
    return { ...defaults };
  }
}

function saveConfig(cfg) {
  try {
    // 0600: pinProxy is an egress line and can carry user:password.
    fs.writeFileSync(CONFIG, JSON.stringify(cfg, null, 2) + '\n', { mode: 0o600 });
  } catch (e) {
    console.error(`  ! could not write ${path.basename(CONFIG)}: ${e.message}`);
  }
}

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (question, fallback) =>
  new Promise((resolve) => {
    const hint = fallback ? ` [${String(fallback).slice(0, 30)}${String(fallback).length > 30 ? '…' : ''}]` : '';
    rl.question(`  ${question}${hint}: `, (answer) => resolve(answer.trim() || fallback || ''));
  });

// same as ask(), but nothing that is typed is echoed — the prompt stays visible, the key never does
const askSecret = (question) => new Promise((resolve) => {
  const write = rl._writeToOutput;
  const prompt = `  ${question}: `;
  rl._writeToOutput = function (s) {
    if (s === prompt) rl.output.write(s);
    else if (s === '\r\n' || s === '\n') rl.output.write('\n');
  };
  rl.question(prompt, (answer) => {
    rl._writeToOutput = write;
    resolve(answer.trim());
  });
});

function run(args, env = {}) {
  console.log('');
  const res = spawnSync(process.execPath, [CLI, ...args], {
    windowsHide: true,
    cwd: __dirname,
    stdio: 'inherit',
    env: { ...process.env, ...env },
  });
  if (res.status !== 0) console.log(`  ! exited with code ${res.status}`);
}

const BANNER_LOGO = String.raw`
███████╗██╗██████╗ ███████╗██████╗ ███████╗███╗   ██╗
██╔════╝██║██╔══██╗██╔════╝██╔══██╗██╔════╝████╗  ██║
███████╗██║██║  ██║█████╗  ██████╔╝█████╗  ██╔██╗ ██║
╚════██║██║██║  ██║██╔══╝  ██╔══██╗██╔══╝  ██║╚██╗██║
███████║██║██████╔╝███████╗██║  ██║███████╗██║ ╚████║
╚══════╝╚═╝╚═════╝ ╚══════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═══╝
`;

function banner() {
  const cyan = '\x1b[36m';
  const dim = '\x1b[2m';
  const bold = '\x1b[1m';
  const reset = '\x1b[0m';
  const lines = BANNER_LOGO.replace(/^\n/, '').replace(/\n$/, '').split('\n');
  const width = Math.max(...lines.map((l) => [...l].length));
  const pad = (s) => s + ' '.repeat(width - [...s].length);
  const inner = width + 4;
  console.log('');
  console.log(`${cyan}╔${'═'.repeat(inner)}╗${reset}`);
  console.log(`${cyan}║${' '.repeat(inner)}║${reset}`);
  for (const line of lines) console.log(`${cyan}║${reset}  ${bold}${pad(line)}${reset}  ${cyan}║${reset}`);
  console.log(`${cyan}║${' '.repeat(inner)}║${reset}`);
  console.log(`${cyan}║${reset}  ${pad('sideren-bulk-apikey')}  ${cyan}║${reset}`);
  console.log(`${cyan}║${reset}  ${dim}${pad('one account per key — two REST calls each')}${reset}  ${cyan}║${reset}`);
  console.log(`${cyan}║${' '.repeat(inner)}║${reset}`);
  console.log(`${cyan}╚${'═'.repeat(inner)}╝${reset}`);
  console.log(`  ${dim}MIT  ·  OpenAI-compatible  ·  9Router connector${reset}`);
  console.log('');
}

async function mintFlow(cfg) {
  cfg.count = parseInt(await ask('How many accounts/keys do you want (any number)', cfg.count), 10) || cfg.count;
  const preset = String(await ask('Run-shape preset (turbo/balanced/safe, blank = the repo default)', cfg.preset)).trim().toLowerCase();
  cfg.preset = preset;
  cfg.proxyFile = await ask('Proxy list file (one proxy per line)', cfg.proxyFile);
  cfg.pinProxy = await ask('Pin one egress for every call? (e.g. socks5://127.0.0.1:40000, blank = rotate)', cfg.pinProxy);
  saveConfig(cfg);

  const env = { SIDEREN_PROXIES: cfg.proxyFile };
  if (cfg.pinProxy) env.PIN_PROXY = cfg.pinProxy;
  // turbo = 5 workers (recommended), balanced = 4, safe = 2 — cli.js forwards it.
  run(['--count', String(cfg.count), ...(preset ? ['--preset=' + preset] : [])], env);
}

async function verifyFlow(cfg) {
  cfg.proxyFile = await ask('Proxy list file', cfg.proxyFile);
  saveConfig(cfg);
  run(['--verify-only'], { SIDEREN_PROXIES: cfg.proxyFile });
}

async function connectFlow() {
  console.log('\n9Router — register this provider node and one API key with a local 9Router instance');
  const base = await ask('9Router base URL', 'http://localhost:20128');
  const password = await ask('9Router password', '123456');
  const apiKey = await askSecret('API key to register (blank = skip)');
  if (!apiKey) {
    console.log('  no key given — nothing to register');
    return;
  }
  const name = await ask('connection label', 'Sideren');
  const model = await ask('default model', '@sdn/llama-3.3-70b');
  console.log('');
  const res = spawnSync(process.execPath, [CONNECT, '--base', base, '--password', password, '--name', name, '--model', model], {
    windowsHide: true,
    cwd: __dirname,
    stdio: 'inherit',
    env: { ...process.env, NINEROUTER_API_KEY: apiKey },
  });
  if (res.status !== 0) console.log(`  ! 9Router connector exited with code ${res.status}`);
}

async function main() {
  const cfg = loadConfig();
  banner();
  console.log('  1) Mint keys   — one Supabase signup + one RPC call per key, then verify');
  console.log('  2) Verify keys — re-check every key (models + balance + chat)');
  console.log('  3) Settings    — show what this launcher remembers');
  console.log('  4) Help        — CLI options and notes');
  console.log('  5) 9Router     — register a key with a local 9Router instance (asks for base/password/key)');
  console.log('  q) Quit\n');
  const choice = (await ask('Choose', '1')).toLowerCase();

  if (choice === '1') await mintFlow(cfg);
  else if (choice === '2') await verifyFlow(cfg);
  else if (choice === '3') console.log('\n' + JSON.stringify(cfg, null, 2));
  else if (choice === '4') run(['--help']);
  else if (choice === '5') await connectFlow();
  rl.close();
}

if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log('Interactive launcher: run `node src/launcher.js` and pick a menu item.');
  process.exit(0);
}

if (process.argv.includes('--connect-9router')) {
  connectFlow()
    .then(() => rl.close())
    .catch((e) => {
      console.error('[fatal]', e.message);
      process.exit(1);
    });
} else {
  main().catch((e) => {
    console.error('[fatal]', e.message);
    process.exit(1);
  });
}
