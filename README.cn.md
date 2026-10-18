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

**批量创建 Sideren (sideren.io) 账户并自动生成 API 密钥 — 兼容 OpenAI 的推理 + 9Router 连接器。**

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

## ✨ 为什么有这个项目

Sideren (LayerX1) 为每个账户提供 **$2 免费额度** 和专属 API 密钥，两者都绑定在 **账户** 上——所以有用的单位是 *一个账户对应一个密钥*。`api.sideren.io/v1` 的 API **同时支持两种协议**：OpenAI（`/v1/chat/completions`）和 Anthropic（`/v1/messages`），使用同一个密钥。本工具通过纯 REST 创建账户和密钥——无需浏览器，无需邮箱。

## 🎁 免费额度 — 你能获得多少

**每个新的 Sideren 账户在注册时由服务器端发放一次性 $2 额度——无需银行卡，无需邮箱。**

| 项目 | 值 |
| --- | --- |
| 欢迎额度 | 每账户 **$2.00**（`GET /v1/me` → `balance_usd: 2`，`plan: "free"`）——已实测 |
| 需要银行卡 | **否** |
| 速率限制 | 免费计划：前 3 天 **15 请求/分钟 + 2 并发**，之后 **4 请求/分钟 + 1 并发**，直到购买计划 |
| Token 上限 | 每月 600k tokens，每次调用 50k 输入 / 4k 输出 |
| 注册 | REST：邮箱 + 密码（`POST /auth/v1/signup`）——无需邮箱验证码，无需浏览器 |
| 可扩展的单位 | **一个账户 = 一个密钥** → `--count N` 实际就是“N 个免费账户” |

**如何获得更多：** 额度绑定在账户上——一个账户一个密钥，`--count N` 会创建 N 个账户，每个都有自己的 $2。生成的密钥在 `/v1/models`、`/v1/me` 和真实聊天补全上返回 `200`，所以额度可以立即使用（`trial.ends_at` 为创建后三天）。

> 💡 免费额度由 Sideren 设定，可能发生变化。请在 [sideren.io](https://sideren.io) 查看实时数据——并让工具自身的验证来决定：

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 模型 — 全部 134 个

`GET /v1/models` 返回 **134 个模型**（见 [`models.json`](src/models.json)），两种协议由同一个密钥提供服务。主要 id：

|Model|✓|
|---|---|
|`sdn-llama-3.3-70b`|✓|

单个密钥的实时探测：

```bash
curl https://api.sideren.io/v1/chat/completions \
  -H "Authorization: Bearer lx1_…" -H "Content-Type: application/json" \
  -d '{"model":"sdn-glm-5.3","messages":[{"role":"user","content":"hi"}]}'
```

## 🧪 如何使用 API

基础 URL 为 **`https://api.sideren.io/v1`**；同一个密钥也可在 `/v1/messages`（`x-api-key`）上响应 Anthropic 协议。

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

**任何支持自定义基础 URL 的 agent / 工具**（Cursor、OpenCode、Kilo Code 等）：基础 URL 填 `https://api.sideren.io/v1`，粘贴密钥，从目录中选择任意模型 id。

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

工具从 **仓库根目录** 读取 `proxies.txt`，并在同一位置写入 `keys.txt`、`accounts.json` 和 `outputs/`。`keys.txt`（同步到 `%USERPROFILE%\sideren-keys.txt`）**仅在** 密钥通过 `GET /v1/models`、`GET /v1/me` 和真实聊天补全验证后才会写入。

### 🖱️ 启动器

启动器会询问代理列表和数量，将其保存在 `launcher.config.json` 中，并使用正确的参数运行 CLI；`node src/launcher.js --connect-9router` 会将生成的密钥注册到本地 9Router。

## ✅ 已验证可用 — 每个密钥都经过测试

| 检查 | 结果 |
| --- | --- |
| `POST /auth/v1/signup` | **30/30 → 200**，返回访问令牌（会话可立即使用） |
| `POST /rest/v1/rpc/create_api_key` | **30/30 → 200**，返回 `lx1_…` 密钥 |
| `GET /v1/models` + `GET /v1/me` | **30/30 → 200**，每账户 `plan: "free"`，`balance_usd: 2` |
| `POST /v1/chat/completions`（OpenAI 协议） | **200**，返回真实内容 |
| `POST /v1/messages`（Anthropic 协议，`x-api-key`） | **200**，`content: [{type:"text", text:"ok"}]`，`stop_reason: "end_turn"` |
| 对发布列表的最终扫描 | **30/30 通过** |

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
| 账户 | `POST https://data.sideren.io/auth/v1/signup {email,password}` | 身份后端立即返回会话 |
| 密钥 | `POST https://data.sideren.io/rest/v1/rpc/create_api_key {p_name}`（Bearer 访问令牌） | 与面板调用的相同 RPC；返回 `lx1_…`（别名 `sdn_…`） |
| 额度 | 注册时由服务器端发放 | `GET https://api.sideren.io/v1/me` → `balance_usd: 2`，`plan: "free"` |
| 验证 | `GET /v1/models`、`GET /v1/me`、`POST /v1/chat/completions` | 只有三者都响应后，密钥才会写入 `keys.txt` |

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
| `PIN_PROXY` | — | 为每次调用固定单一出口（例如 `socks5://127.0.0.1:40000`） |

Turbo önerilir (5); daha fazlası zayıf bilgisayarda yük/ban riski.

## 🛰️ 使用代理

提供商流量通过你的代理池（或固定代理）传输。注册是一次短调用，所以出口只需承受一次往返；验证阶段是较长的路径，当某个出口失效时会自动重新选择另一个出口。

## 📄 文件

| 路径 | 内容 |
| --- | --- |
| `keys.txt` | 每行一个已验证密钥——已被 git 忽略，永不提交 |
| `accounts.json` | 每账户的邮箱 / 密码 / 用户 id / 密钥 / 验证记录 |
| [`models.json`](src/models.json) | 实时 134 模型目录 |
| `outputs/` | 验证扫描结果——已被 git 忽略 |

## 🔌 连接到 9Router

[9Router](https://9router.com) 是一个自托管、兼容 OpenAI 的路由器。为 Sideren 创建一个 `openai-compatible` 节点，每个密钥一个连接：

```bash
node src/connect-9router.js \
  --base http://localhost:20128 --password 123456 \
  --api-key <key>            # or env NINEROUTER_API_KEY
```

默认值：base `http://localhost:20128`，password `123456`，node `Sideren`，prefix `sideren`，upstream `https://api.sideren.io/v1`，默认模型 `@sdn/llama-3.3-70b`。使用 `--name "<label 2>"` 注册另一个生成的密钥——每个密钥都会成为 9Router 可负载均衡的另一个连接。模型随后以 `sideren/<model id>` 形式提供。

## 🔑 一个密钥能给你什么

| | |
| --- | --- |
| 🏢 提供商 | **Sideren** — [sideren.io](https://sideren.io) · API 文档见 [docs.layerx1.com](https://docs.layerx1.com) |
| 🎁 提供商提供什么 | 每账户免费 $2 额度——每个密钥两次 REST 调用，OpenAI + Anthropic 协议 |
| 🔑 一个密钥能给你什么 | 一个绑定到自身账户的 API 密钥：下方端点上的模型 id，受你计划的限制。配额绑定在 **账户** 上，这正是本工具为每个密钥创建一个账户的原因 |
| 🌐 API 形态 | 兼容 OpenAI：`POST https://api.sideren.io/v1/chat/completions` |
| 🔒 你的数据 | 仅联系 `data.sideren.io`（注册 + 密钥 RPC）和 `api.sideren.io`（推理）；密钥保留在你的机器上 |

## 🐞 问题反馈

如果 Sideren 更改其身份后端（注册设置、RPC 名称、密钥前缀），工具会在该步骤停止并说明原因。请 **[提交 issue](../../issues)**，附上你运行的命令和确切输出；欢迎 PR。

## 📄 许可证

MIT © 2026 — 见 [LICENSE](LICENSE)。

<div align="center">

**[MIT](LICENSE)** © 2026 sideren-bulk-apikey contributors

</div>