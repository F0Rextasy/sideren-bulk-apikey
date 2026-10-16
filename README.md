<div align="center">

```
███████╗██╗██████╗ ███████╗██████╗ ███████╗███╗   ██╗
██╔════╝██║██╔══██╗██╔════╝██╔══██╗██╔════╝████╗  ██║
███████╗██║██║  ██║█████╗  ██████╔╝█████╗  ██╔██╗ ██║
╚════██║██║██║  ██║██╔══╝  ██╔══██╗██╔══╝  ██║╚██╗██║
███████║██║██████╔╝███████╗██║  ██║███████╗██║ ╚████║
╚══════╝╚═╝╚═════╝ ╚══════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═══╝
```

# sideren-bulk-apikey

**Bulk-create Sideren (sideren.io) accounts with auto-generated API keys — OpenAI-compatible inference + 9Router connector.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-134-412991?style=for-the-badge)](https://docs.layerx1.com)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6.svg?style=for-the-badge)](#-connect-to-9router)

[🛠 Quick start](#-quick-start) · [✅ Verified](#-verified-working--every-key-is-tested) · [🧭 How it works](#-how-it-works) · [🤖 Models & free tier](#-models--free-tier) · [🔌 9Router](#-connect-to-9router) · [⚙️ Options](#️-cli-options) · [🛰️ Proxies](#️-behind-a-proxy) · [🐞 Issues](#-issues)

</div>

---

> **Mint as many accounts/keys as you need — there is no cap.** `--count N` (default `30`)
> accepts any N.

## ✨ What this does

Sideren (LayerX1) hands every account **$2 of free credit** and its own API key, and both live on
the **account** — so the useful unit is *one account per key*. The API at `api.sideren.io/v1` speaks
**both protocols**, OpenAI (`/v1/chat/completions`) and Anthropic (`/v1/messages`), with the same key.

This tool mints accounts and keys over plain REST — no browser, no mailbox — and writes a key to
`keys.txt` only after the live API answers with it:

```
POST https://data.sideren.io/auth/v1/signup              {email, password}
   └─▶ 200 + access_token          (the session is usable immediately)
POST https://data.sideren.io/rest/v1/rpc/create_api_key  {p_name}   (Bearer access_token)
   └─▶ 200 { "key": "lx1_…" }
              │
              ▼
   GET /v1/models  ·  GET /v1/me (balance)  ·  a real chat completion   → then keys.txt
```

Two REST calls per account, and the **$2 free credit is granted server-side** at sign-up, so the
panel never has to be visited.

## 🛠 Quick start

```bash
git clone https://github.com/F0Rextasy/sideren-bulk-apikey.git
cd sideren-bulk-apikey

# 1) your proxy list, one per line (http://, socks5://, socks4:// or bare host:port)
printf 'socks5://127.0.0.1:1080\n' > proxies.txt

# 2) go
node src/launcher.js            # interactive: mint / verify / settings / help
# or directly:
node src/cli.js --count 30      # any N — 30 is just the default sample
```

The tools read `proxies.txt` from the **repository root** and write `keys.txt`, `accounts.json`
and `outputs/` there too — the code lives in `src/`, the data stays beside the README.

`keys.txt` (one key per line
, mirrored to `%USERPROFILE%\sideren-keys.txt`) is written **only** after a
key answers `GET /v1/models`, `GET /v1/me` and a real chat completion; `accounts.json` keeps the
e-mail/password/user-id/key record for every account.

### 🖱️ The launcher

```
╔═════════════════════════════════════════════════════════╗
║                                                         ║
║  ███████╗██╗██████╗ ███████╗██████╗ ███████╗███╗   ██╗  ║
║  ██╔════╝██║██╔══██╗██╔════╝██╔══██╗██╔════╝████╗  ██║  ║
║  ███████╗██║██║  ██║█████╗  ██████╔╝█████╗  ██╔██╗ ██║  ║
║  ╚════██║██║██║  ██║██╔══╝  ██╔══██╗██╔══╝  ██║╚██╗██║  ║
║  ███████║██║██████╔╝███████╗██║  ██║███████╗██║ ╚████║  ║
║  ╚══════╝╚═╝╚═════╝ ╚══════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═══╝  ║
║                                                         ║
║  sideren-bulk-apikey                                    ║
║  one account per key — two REST calls each              ║
║                                                         ║
╚═════════════════════════════════════════════════════════╝
  MIT · OpenAI-compatible · 9Router connector
```

## ✅ Verified working — every key is tested

| Check | Result |
| --- | --- |
| `POST /auth/v1/signup` | **30/30 → 200** with an access token (session usable immediately) |
| `POST /rest/v1/rpc/create_api_key` | **30/30 → 200** with an `lx1_…` key |
| `GET /v1/models` + `GET /v1/me` | **30/30 → 200**, `plan: "free"`, `balance_usd: 2` per account |
| `POST /v1/chat/completions` (OpenAI protocol) | **200** with real content |
| `POST /v1/messages` (Anthropic protocol, `x-api-key`) | **200**, `content: [{type:"text", text:"ok"}]`, `stop_reason: "end_turn"` |
| A final sweep of the shipped list | **30/30 OK** |

```bash
node src/cli.js --verify-only    # models + balance + a chat call for every key
```

## 🧭 How it works

| Step | Call | Notes |
| --- | --- | --- |
| account | `POST https://data.sideren.io/auth/v1/signup {email,password}` | the identity backend answers with a session immediately |
| key | `POST https://data.sideren.io/rest/v1/rpc/create_api_key {p_name}` (Bearer access token) | the same RPC the panel calls; returns `lx1_…` (alias `sdn_…`) |
| credit | granted server-side at signup | `GET https://api.sideren.io/v1/me` → `balance_usd: 2`, `plan: "free"` |
| verify | `GET /v1/models`, `GET /v1/me`, `POST /v1/chat/completions` | a key is written to `keys.txt` only after all three answer |

## 🤖 Models & free tier

`GET /v1/models` returns **134 models** (see [`models.json`](src/models.json)) and both protocols are served
by the same key:

```
sdn-deepseek-v4-pro · sdn-deepseek-v4-flash · sdn-glm-5.3 · sdn-glm-5.3-flash
sdn-kimi-k2.7-code · sdn-gemini-3.8-flash · sdn-gpt-6-astra · sdn-gpt-oss-120b
sdn-nemotron-3-120b · sdn-qwen3.8-27b · sdn-mai-thinking-1 · sdn-glm-4.7-flash
```

**What a fresh account gets (measured):** `plan: "free"` and **`balance_usd: 2`** — a one-off $2
credit granted at sign-up, with `trial.ends_at` three days after the account was created. A minted
key answers `200` on `/v1/models`, on `/v1/me` and on a real chat completion, so the credit is
spendable right away.

**Limits, per the provider's docs:** the free plan covers the first 3 days at 15 req/min + 2
concurrent, then 4 req/min + 1 concurrent until a plan is bought; a 600k tokens/month wall with
50k input / 4k output per call.

**How to get more:** the credit lives on the account — one account per key. `--count N` mints N
accounts, each with its own $2.

```bash
curl https://api.sideren.io/v1/chat/completions \
  -H "Authorization: Bearer lx1_…" -H "Content-Type: application/json" \
  -d '{"model":"@sdn/llama-3.3-70b","messages":[{"role":"user","content":"hi"}]}'
```

## 🔌 Connect to 9Router

The keys this tool mints are ordinary OpenAI-compatible credentials, so a local
9Router instance can serve them like any other provider: one `openai-compatible`
node for Sideren (sideren.io), one connection per key.

```bash
node src/connect-9router.js \
  --base http://localhost:20128 --password 123456 \
  --api-key <key>            # or env NINEROUTER_API_KEY
```

The launcher menu and the CLI dispatcher drive the same connector:

```bash
node src/launcher.js --connect-9router    # asks for base URL, password and key (the key is not echoed)
node src/cli.js connect --api-key <key>   # the same task, non-interactive
node src/connect-9router.js --help        # every flag and default
```

Defaults: base `http://localhost:20128`, password `123456`, model prefix
`sideren`, node `sideren`, upstream `https://api.sideren.io/v1`, default model
`@sdn/llama-3.3-70b`. Register another minted key with `--name "<label 2>"` — the node stays and
every key becomes another connection 9Router can load-balance across. Then pick a model inside
9Router:

```
sideren/@sdn/llama-3.3-70b
sideren/sdn-glm-5.3
```

## ⚙️ CLI options

```bash
node src/cli.js --count N        # mint N accounts (any N, default 30)
node src/cli.js --verify-only    # re-verify every key in keys.txt
node src/cli.js --help
```

| Environment variable | Default | Meaning |
| --- | --- | --- |
| `SIDEREN_PROXIES` | `proxies.txt` | pool file, one proxy per line |
| `PIN_PROXY` | — | pin a single egress for every call (e.g. `socks5://127.0.0.1:40000`) |

## 🛰️ Behind a proxy

Provider traffic goes through your pool (or a pinned proxy). Signup is a single short call, so an
exit only has to survive one round-trip; the verification pass is the longer path and simply re-picks
another exit when one dies.

## 📄 Files

| Path | Contents |
| --- | --- |
| `keys.txt` | one verified key per line — git-ignored, never committed |
| `accounts.json` | e-mail / password / user id / key / verification record per account |
| [`models.json`](src/models.json) | the live 134-model catalogue |
| `outputs/` | verification sweep results — git-ignored |

## 🐞 Issues

If Sideren changes its identity backend (signup settings, the RPC name, the key prefix), the tool
stops at that step and says so. **[Open an issue](../../issues)**
with the command you ran and the exact output; PRs are welcome.

## 📄 License

[MIT](LICENSE) © 2026 sideren-bulk-apikey contributors — use it on accounts you are allowed to create.

