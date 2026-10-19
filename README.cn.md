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

**批量创建 Sideren（sideren.io）账户并自动生成 API 密钥 —— 兼容 OpenAI 的推理服务 + 9Router 连接器。**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-134%20served-412991?style=for-the-badge)](https://docs.layerx1.com)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 快速开始](#-quick-start) · [🎁 免费额度](#-free-tier--how-much-you-get) · [🤖 模型](#-models--all-134-of-them) · [🧪 使用 API](#-how-to-use-the-api) · [✅ 已验证](#-verified-working--every-key-is-tested) · [🧭 工作原理](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [⚙️ 选项](#️-cli-options) · [🛰️ 代理](#️-behind-a-proxy) · [🐞 问题反馈](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ 为什么会有这个项目

Sideren（LayerX1）会为每个账户提供 **$2 的免费额度**以及该账户专属的 API 密钥，而这两者都绑定在**账户**上 —— 因此真正有用的单位是*一个账户对应一个密钥*。`api.sideren.io/v1` 上的 API **同时支持两种协议**：OpenAI（`/v1/chat/completions`）与 Anthropic（`/v1/messages`），且使用同一个密钥。本工具通过纯 REST 请求创建账户和密钥 —— 无需浏览器，无需邮箱。

## 🎁 免费额度 —— 你能拿到多少

**每个新建的 Sideren 账户都会在注册时由服务端一次性发放 $2 额度 —— 不需要银行卡，也不需要邮箱。**

| 项目 | 数值 |
| --- | --- |
| 注册赠金 | 每账户 **$2.00**（`GET /v1/me` → `balance_usd: 2`，`plan: "free"`）—— 实测 |
| 是否需要银行卡 | **不需要** |
| 速率限制 | 免费套餐：前 3 天为 **15 请求/分钟 + 2 并发**，之后为 **4 请求/分钟 + 1 并发**，直至购买套餐 |
| Token 上限 | 每月 60 万 tokens，单次调用 5 万输入 / 4 千输出 |
| 注册方式 | REST：邮箱 + 密码（`POST /auth/v1/signup`）—— 无需邮箱验证码，无需浏览器 |
| 可扩展的单位 | **一个账户 = 一个密钥** → `--count N` 实际上就是“N 个免费账户” |

**如何获得更多：** 额度绑定在账户上 —— 一个账户一个密钥，而 `--count N` 会创建 N 个账户，每个账户各有自己的 $2。生成的密钥在 `/v1/models`、`/v1/me` 以及一次真实聊天补全上都能返回 `200`，因此额度可以立即使用（`trial.ends_at` 为创建时间三天后）。

> 💡 免费套餐由 Sideren 设定，可能会变更。请在 [sideren.io](https://sideren.io) 查看实时数据 —— 并让工具自身的校验来决定：

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 模型 —— 全部 134 个

`GET /v1/models` 返回 **134 个模型**（见 [`models.json`](src/models.json)），且两种协议由同一个密钥提供服务；下面这 5 个 id 在 2026-10-19 的真实聊天调用中均返回 `200`：

|模型|✓|
|---|---|
|`@sdn/deepseek-v4.1-flash`|✓|
|`@sdn/gpt-oss-120b`|✓|
|`@sdn/deepseek-v4.1-flash-1017`|✓|
|`@sdn/devstral-2-123b`|✓|
|`@sdn/kimi-k2.5`|✓|

目录中共有 **134 个 id**；**免费套餐**仅覆盖这五个模型 —— 其他模型都会返回 `not in the Free plan`（需要 Starter/Pro 套餐）。

单个密钥的实时探测：

```bash
curl https://api.sideren.io/v1/chat/completions \
  -H "Authorization: Bearer lx1_…" -H "Content-Type: application/json" \
  -d '{"model":"sdn-glm-5.3","messages":[{"role":"user","content":"hi"}]}'
```

## 🧪 如何使用 API

基础 URL 为 **`https://api.sideren.io/v1`**；同一个密钥也能通过 `/v1/messages`（`x-api-key`）响应 Anthropic 协议。

**OpenAI 协议**

```python
from openai import OpenAI
client = OpenAI(base_url="https://api.sideren.io/v1", api_key="lx1_…")
print(client.chat.completions.create(model="sdn-glm-5.3",
      messages=[{"role": "user", "content": "hi"}]).choices[0].message.content)
```

**Anthropic 协议**（`/v1/messages`，`x-api-key`）：

```bash
curl https://api.sideren.io/v1/messages \
  -H "x-api-key: lx1_…" -H "anthropic-version: 2023-06-01" \
  -H "Content-Type: application/json" \
  -d '{"model":"sdn-glm-5.3","max_tokens":16,"messages":[{"role":"user","content":"hi"}]}'
```

**任何支持自定义基础 URL 的智能体 / 工具**（Cursor、OpenCode、Kilo Code 等）：基础 URL 填 `https://api.sideren.io/v1`，粘贴密钥，从目录中任选一个模型 id。

## 🛠 快速开始

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

这些工具会从**仓库根目录**读取 `proxies.txt`，并把 `keys.txt`、`accounts.json` 和 `outputs/` 也写到那里。`keys.txt`（同时镜像到 `%USERPROFILE%\sideren-keys.txt`）**只有**在某个密钥通过 `GET /v1/models`、`GET /v1/me` 以及一次真实聊天补全的验证后才会写入。

### 🖱️ 启动器

启动器会询问代理列表和数量，将它们记录在 `launcher.config.json` 中，并用正确的参数运行 CLI；`node src/launcher.js --connect-9router` 会把生成的密钥注册到本地 9Router 中。

## ✅ 已验证可用 —— 每个密钥都经过测试

| 检查项 | 结果 |
| --- | --- |
| `POST /auth/v1/signup` | **30/30 → 200**，返回访问令牌（会话可立即使用） |
| `POST /rest/v1/rpc/create_api_key` | **30/30 → 200**，返回 `lx1_…` 密钥 |
| `GET /v1/models` + `GET /v1/me` | **30/30 → 200**，每个账户 `plan: "free"`、`balance_usd: 2` |
| `POST /v1/chat/completions`（OpenAI 协议） | **200**，返回真实内容 |
| `POST /v1/messages`（Anthropic 协议，`x-api-key`） | **200**，`content: [{type:"text", text:"ok"}]`，`stop_reason: "end_turn"` |
| 对随附列表的最终全量检查 | **30/30 全部通过** |

```bash
node src/cli.js --verify-only    # models + balance + a chat call for every key
```

## 🧭 工作原理

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: Sideren page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://api.sideren.io/v1/chat/completions → real content = the key is live
```

| 步骤 | 调用 | 说明 |
| --- | --- | --- |
| 账户 | `POST https://data.sideren.io/auth/v1/signup {email,password}` | 身份后端会立即返回一个会话 |
| 密钥 | `POST https://data.sideren.io/rest/v1/rpc/create_api_key {p_name}`（Bearer 访问令牌） | 与面板调用的同一个 RPC；返回 `lx1_…`（别名 `sdn_…`） |
| 额度 | 注册时由服务端发放 | `GET https://api.sideren.io/v1/me` → `balance_usd: 2`，`plan: "free"` |
| 验证 | `GET /v1/models`、`GET /v1/me`、`POST /v1/chat/completions` | 只有这三项都通过后，密钥才会写入 `keys.txt` |

## ⚙️ CLI 选项

```bash
node src/cli.js --count N        # mint N accounts (any N, default 30)
node src/cli.js --preset turbo   # run shape: turbo = 5 workers, balanced = 4, safe = 2
node src/cli.js --verify-only    # re-verify every key in keys.txt
node src/cli.js --help
```

| 环境变量 | 默认值 | 含义 |
| --- | --- | --- |
| `SIDEREN_PROXIES` | `proxies.txt` | 代理池文件，每行一个代理 |
| `PIN_PROXY` | — | 为所有调用固定使用单一出口（例如 `socks5://127.0.0.1:40000`） |

推荐使用 Turbo（5）；在性能较弱的机器上使用更多并发会有负载过高/被封的风险。

## 🛰️ 在代理之后

服务商的流量会经过你的代理池（或固定代理）。注册只是一次很短的调用，因此一个出口只需撑过一次往返；验证阶段是更长的路径，当某个出口失效时会直接重新选择另一个出口。

## 📄 文件

| 路径 | 内容 |
| --- | --- |
| `keys.txt` | 每行一个已验证的密钥 —— 已被 git 忽略，永不提交 |
| `accounts.json` | 每个账户的邮箱 / 密码 / 用户 id / 密钥 / 验证记录 |
| [`models.json`](src/models.json) | 实时的 134 个模型目录 |
| `outputs/` | 验证全量检查结果 —— 已被 git 忽略 |

## 🔌 连接到 9Router

[9Router](https://9router.com) 是一个自托管、兼容 OpenAI 的路由器。为 Sideren 建一个 `openai-compatible` 节点，每个密钥一条连接：

```bash
node src/connect-9router.js \
  --base http://localhost:20128 --password 123456 \
  --api-key <key>            # or env NINEROUTER_API_KEY
```

默认值：基础地址 `http://localhost:20128`，密码 `123456`，节点 `Sideren`，前缀 `sideren`，上游 `https://api.sideren.io/v1`，默认模型 `@sdn/llama-3.3-70b`。用 `--name "<label 2>"` 再注册一个生成的密钥 —— 每个密钥都会成为 9Router 可负载均衡的另一条连接。随后模型将以 `sideren/<model id>` 的形式提供。

## 🔑 一个密钥能带来什么

| | |
| --- | --- |
| 🏢 服务商 | **Sideren** —— [sideren.io](https://sideren.io) · API 文档见 [docs.layerx1.com](https://docs.layerx1.com) |
| 🎁 服务商提供什么 | 每账户 $2 免费额度 —— 每个密钥只需两次 REST 调用，支持 OpenAI + Anthropic 协议 |
| 🔑 一个密钥能带来什么 | 一个绑定其所属账户的 API 密钥：可使用下方端点上的模型 id，受你所选套餐的限制。配额绑定在**账户**上，这正是本工具为每个密钥创建一个账户的原因 |
| 🌐 API 形态 | 兼容 OpenAI：`POST https://api.sideren.io/v1/chat/completions` |
| 🔒 你的数据 | 只会访问 `data.sideren.io`（注册 + 密钥 RPC）和 `api.sideren.io`（推理）；密钥始终留在你的机器上 |

## 🐞 问题反馈

如果 Sideren 更改了其身份后端（注册设置、RPC 名称、密钥前缀），工具会在相应步骤停下并说明原因。请**[提交 issue](../../issues)**，附上你运行的命令和完整输出；欢迎 PR。

## 📄 许可证

MIT © 2026 —— 见 [LICENSE](LICENSE)。

<div align="center">

**[MIT](LICENSE)** © 2026 sideren-bulk-apikey contributors

</div>