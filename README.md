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
[![Models](https://img.shields.io/badge/models-134%20served-412991?style=for-the-badge)](https://docs.layerx1.com)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 Quick start](#-quick-start) · [🎁 Free tier](#-free-tier--how-much-you-get) · [🤖 Models](#-models--all-134-of-them) · [🧪 Use the API](#-how-to-use-the-api) · [✅ Verified](#-verified-working--every-key-is-tested) · [🧭 How it works](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [⚙️ Options](#️-cli-options) · [🛰️ Proxies](#️-behind-a-proxy) · [🐞 Issues](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ Why this exists

Sideren (LayerX1) hands every account **$2 of free credit** and its own API key, and both live on the **account** — so the useful unit is *one account per key*. The API at `api.sideren.io/v1` speaks **both protocols**, OpenAI (`/v1/chat/completions`) and Anthropic (`/v1/messages`), with the same key. This tool mints accounts and keys over plain REST — no browser, no mailbox.

## 🎁 Free tier — how much you get

**Every new Sideren account gets a one-off $2 credit, granted server-side at sign-up — no card, no mailbox.**

| What | Value |
| --- | --- |
| Welcome credit | **$2.00** per account (`GET /v1/me` → `balance_usd: 2`, `plan: "free"`) — measured |
| Card required | **No** |
| Rate limit | free plan: first 3 days **15 req/min + 2 concurrent**, then **4 req/min + 1 concurrent** until a plan is bought |
| Token wall | 600k tokens/month, 50k input / 4k output per call |
| Sign-up | REST: e-mail + password (`POST /auth/v1/signup`) — no e-mail code, no browser |
| The unit that scales | **one account = one key** → `--count N` is really "N free accounts" |

**How to get more:** the credit lives on the account — one account per key, and `--count N` mints N accounts, each with its own $2. A minted key answers `200` on `/v1/models`, `/v1/me` and a real chat completion, so the credit is spendable right away (`trial.ends_at` is three days after creation).

> 💡 The free tier is set by Sideren and can change. Check the live numbers at [sideren.io](https://sideren.io) — and let the tool's own gate decide:

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 Models — all 134 of them

`GET /v1/models` returns **134 models** (see [`models.json`](src/models.json)) and both protocols are served by the same key. Headline ids:

|Model|✓|
|---|---|
|`@sdn/deepseek-v4.1-flash`|✓|
|`@sdn/gpt-oss-120b`|✓|

The catalogue holds **134 ids**; the **Free plan** covers these two models — everything else answers `not in the Free plan` (Starter/Pro required).

Live probe of one key:

```bash
curl https://api.sideren.io/v1/chat/completions \
  -H "Authorization: Bearer lx1_…" -H "Content-Type: application/json" \
  -d '{"model":"sdn-glm-5.3","messages":[{"role":"user","content":"hi"}]}'
```

## 🧪 How to use the API

The base URL is **`https://api.sideren.io/v1`**; the same key also answers the Anthropic protocol at `/v1/messages` (`x-api-key`).

**OpenAI protocol**

```python
from openai import OpenAI
client = OpenAI(base_url="https://api.sideren.io/v1", api_key="lx1_…")
print(client.chat.completions.create(model="sdn-glm-5.3",
      messages=[{"role": "user", "content": "hi"}]).choices[0].message.content)
```

**Anthropic protocol** (`/v1/messages`, `x-api-key`):

```bash
curl https://api.sideren.io/v1/messages \
  -H "x-api-key: lx1_…" -H "anthropic-version: 2023-06-01" \
  -H "Content-Type: application/json" \
  -d '{"model":"sdn-glm-5.3","max_tokens":16,"messages":[{"role":"user","content":"hi"}]}'
```

**Any agent / tool with a custom base URL** (Cursor, OpenCode, Kilo Code, …): base URL `https://api.sideren.io/v1`, paste a key, pick any model id from the catalogue.

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

The tools read `proxies.txt` from the **repository root** and write `keys.txt`, `accounts.json` and `outputs/` there too. `keys.txt` (mirrored to `%USERPROFILE%\sideren-keys.txt`) is written **only** after a key answers `GET /v1/models`, `GET /v1/me` and a real chat completion.

### 🖱️ The launcher

The launcher asks for the proxy list and count, remembers them in `launcher.config.json`, and runs the CLI with the right flags; `node src/launcher.js --connect-9router` registers the minted keys in a local 9Router.

## ✅ Verified working — every key is tested

| Check | Result |
| --- | --- |
| `POST /auth/v1/signup` | **30/30 → 200** with an access token (session usable immediately) |
| `POST /rest/v1/rpc/create_api_key` | **30/30 → 200** with an `lx1_…` key |
| `GET /v1/models` + `GET /v1/me` | **30/30 → 200**, `plan: "free"`, `balance_usd: 2` per account |
| `POST /v1/chat/completions` (OpenAI protocol) | **200** with real content |
| `POST /v1/messages` (Anthropic protocol, `x-api-key`) | **200**, `content: [{type:"text", text:"ok"}]`, `stop_reason: "end_turn"` |
| a final sweep of the shipped list | **30/30 OK** |

```bash
node src/cli.js --verify-only    # models + balance + a chat call for every key
```

## 🧭 How it works

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: Sideren page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://api.sideren.io/v1/chat/completions → real content = the key is live
```

| Step | Call | Notes |
| --- | --- | --- |
| account | `POST https://data.sideren.io/auth/v1/signup {email,password}` | the identity backend answers with a session immediately |
| key | `POST https://data.sideren.io/rest/v1/rpc/create_api_key {p_name}` (Bearer access token) | the same RPC the panel calls; returns `lx1_…` (alias `sdn_…`) |
| credit | granted server-side at signup | `GET https://api.sideren.io/v1/me` → `balance_usd: 2`, `plan: "free"` |
| verify | `GET /v1/models`, `GET /v1/me`, `POST /v1/chat/completions` | a key is written to `keys.txt` only after all three answer |

## ⚙️ CLI options

```bash
node src/cli.js --count N        # mint N accounts (any N, default 30)
node src/cli.js --preset turbo   # run shape: turbo = 5 workers, balanced = 4, safe = 2
node src/cli.js --verify-only    # re-verify every key in keys.txt
node src/cli.js --help
```

| Environment variable | Default | Meaning |
| --- | --- | --- |
| `SIDEREN_PROXIES` | `proxies.txt` | pool file, one proxy per line |
| `PIN_PROXY` | — | pin a single egress for every call (e.g. `socks5://127.0.0.1:40000`) |

Turbo önerilir (5); daha fazlası zayıf bilgisayarda yük/ban riski.

## 🛰️ Behind a proxy

Provider traffic goes through your pool (or a pinned proxy). Signup is a single short call, so an exit only has to survive one round-trip; the verification pass is the longer path and simply re-picks another exit when one dies.

## 📄 Files

| Path | Contents |
| --- | --- |
| `keys.txt` | one verified key per line — git-ignored, never committed |
| `accounts.json` | e-mail / password / user id / key / verification record per account |
| [`models.json`](src/models.json) | the live 134-model catalogue |
| `outputs/` | verification sweep results — git-ignored |

## 🔌 Connect to 9Router

[9Router](https://9router.com) is a self-hosted, OpenAI-compatible router. One `openai-compatible` node for Sideren, one connection per key:

```bash
node src/connect-9router.js \
  --base http://localhost:20128 --password 123456 \
  --api-key <key>            # or env NINEROUTER_API_KEY
```

Defaults: base `http://localhost:20128`, password `123456`, node `Sideren`, prefix `sideren`, upstream `https://api.sideren.io/v1`, default model `@sdn/llama-3.3-70b`. Register another minted key with `--name "<label 2>"` — every key becomes another connection 9Router can load-balance across. Models are then served as `sideren/<model id>`.

## 🔑 What one key gets you

| | |
| --- | --- |
| 🏢 Provider | **Sideren** — [sideren.io](https://sideren.io) · API docs at [docs.layerx1.com](https://docs.layerx1.com) |
| 🎁 What the provider gives | free $2 credit per account — two REST calls per key, OpenAI + Anthropic protocols |
| 🔑 What one key gets you | one API key scoped to its own account: the model ids on the endpoint below, at your plan's limits. The quota lives on the **account**, which is exactly why this tool creates one account per key |
| 🌐 API shape | OpenAI-compatible: `POST https://api.sideren.io/v1/chat/completions` |
| 🔒 Your data | only `data.sideren.io` (signup + key RPC) and `api.sideren.io` (inference) are contacted; keys stay on your machine |

## 🐞 Issues

If Sideren changes its identity backend (signup settings, the RPC name, the key prefix), the tool stops at that step and says so. **[Open an issue](../../issues)** with the command you ran and the exact output; PRs are welcome.

## 📄 License

MIT © 2026 — see [LICENSE](LICENSE).

<div align="center">

**[MIT](LICENSE)** © 2026 sideren-bulk-apikey contributors

</div>
