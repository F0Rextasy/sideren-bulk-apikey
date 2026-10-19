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

**Sideren（sideren.io）アカウントを自動生成APIキー付きで一括作成 — OpenAI互換推論 + 9Routerコネクタ。**

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

## ✨ なぜこれがあるのか

Sideren（LayerX1）はすべてのアカウントに **$2の無料クレジット** と独自のAPIキーを付与し、その両方が **アカウント** に紐づきます — つまり有用な単位は *キーごとに1アカウント* です。`api.sideren.io/v1` のAPIは、同じキーで **両方のプロトコル**、OpenAI（`/v1/chat/completions`）とAnthropic（`/v1/messages`）に対応しています。このツールはプレーンなRESTでアカウントとキーを作成します — ブラウザ不要、メールボックス不要。

## 🎁 無料枠 — どれだけ得られるか

**新しいSiderenアカウントには、登録時にサーバー側で1回限りの$2クレジットが付与されます — カード不要、メールボックス不要。**

| 項目 | 値 |
| --- | --- |
| ウェルカムクレジット | アカウントごとに **$2.00**（`GET /v1/me` → `balance_usd: 2`、`plan: "free"`）— 実測 |
| カード要否 | **不要** |
| レート制限 | 無料プラン: 最初の3日間は **15 req/min + 2 同時接続**、その後はプランを購入するまで **4 req/min + 1 同時接続** |
| トークン上限 | 月60万トークン、1回あたり入力5万 / 出力4千トークン |
| 登録 | REST: メールアドレス + パスワード（`POST /auth/v1/signup`）— メールコード不要、ブラウザ不要 |
| スケールする単位 | **1アカウント = 1キー** → `--count N` は実質「N個の無料アカウント」 |

**さらに増やすには:** クレジットはアカウントに紐づきます — キーごとに1アカウントで、`--count N` はN個のアカウントを作成し、それぞれに独自の$2が付きます。作成されたキーは `/v1/models`、`/v1/me`、実際のチャット補完で `200` を返すため、クレジットはすぐに使用できます（`trial.ends_at` は作成から3日後）。

> 💡 無料枠はSiderenによって設定されており、変更される可能性があります。最新の数値は [sideren.io](https://sideren.io) で確認してください — そしてツール自身のゲートに判断させてください:

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 モデル — 全134種類

`GET /v1/models` は **134モデル** を返し（[`models.json`](src/models.json) を参照）、両プロトコルは同じキーで提供されます。代表的なID:

|モデル|✓|
|---|---|
|`@sdn/deepseek-v4.1-flash`|✓|
|`@sdn/gpt-oss-120b`|✓|

カタログには **134個のID** があり、**無料プラン**で利用できるのはこれら2モデルです — それ以外は `not in the Free plan` と返ります（Starter/Pro が必要）。

1つのキーでの実際の疎通確認:

```bash
curl https://api.sideren.io/v1/chat/completions \
  -H "Authorization: Bearer lx1_…" -H "Content-Type: application/json" \
  -d '{"model":"sdn-glm-5.3","messages":[{"role":"user","content":"hi"}]}'
```

## 🧪 APIの使い方

ベースURLは **`https://api.sideren.io/v1`** です。同じキーで `/v1/messages`（`x-api-key`）のAnthropicプロトコルにも応答します。

**OpenAIプロトコル**

```python
from openai import OpenAI
client = OpenAI(base_url="https://api.sideren.io/v1", api_key="lx1_…")
print(client.chat.completions.create(model="sdn-glm-5.3",
      messages=[{"role": "user", "content": "hi"}]).choices[0].message.content)
```

**Anthropicプロトコル**（`/v1/messages`、`x-api-key`）:

```bash
curl https://api.sideren.io/v1/messages \
  -H "x-api-key: lx1_…" -H "anthropic-version: 2023-06-01" \
  -H "Content-Type: application/json" \
  -d '{"model":"sdn-glm-5.3","max_tokens":16,"messages":[{"role":"user","content":"hi"}]}'
```

**カスタムベースURLを設定できる任意のエージェント / ツール**（Cursor、OpenCode、Kilo Code など）: ベースURL `https://api.sideren.io/v1`、キーを貼り付け、カタログから任意のモデルIDを選択。

## 🛠 クイックスタート

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

ツールは **リポジトリルート** の `proxies.txt` を読み、`keys.txt`、`accounts.json`、`outputs/` もそこに書き込みます。`keys.txt`（`%USERPROFILE%\sideren-keys.txt` にミラーリング）は、キーが `GET /v1/models`、`GET /v1/me`、実際のチャット補完に応答した後に**のみ**書き込まれます。

### 🖱️ ランチャー

ランチャーはプロキシリストと件数を尋ね、`launcher.config.json` に記憶し、適切なフラグでCLIを実行します。`node src/launcher.js --connect-9router` は作成されたキーをローカルの9Routerに登録します。

## ✅ 動作確認済み — すべてのキーをテスト済み

| チェック | 結果 |
| --- | --- |
| `POST /auth/v1/signup` | **30/30 → 200**、アクセストークン付き（セッションは即座に利用可能） |
| `POST /rest/v1/rpc/create_api_key` | **30/30 → 200**、`lx1_…` キー付き |
| `GET /v1/models` + `GET /v1/me` | **30/30 → 200**、アカウントごとに `plan: "free"`、`balance_usd: 2` |
| `POST /v1/chat/completions`（OpenAIプロトコル） | **200**、実際のコンテンツ付き |
| `POST /v1/messages`（Anthropicプロトコル、`x-api-key`） | **200**、`content: [{type:"text", text:"ok"}]`、`stop_reason: "end_turn"` |
| 同梱リストの最終スイープ | **30/30 OK** |

```bash
node src/cli.js --verify-only    # models + balance + a chat call for every key
```

## 🧭 仕組み

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: Sideren page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://api.sideren.io/v1/chat/completions → real content = the key is live
```

| ステップ | 呼び出し | 備考 |
| --- | --- | --- |
| アカウント | `POST https://data.sideren.io/auth/v1/signup {email,password}` | アイデンティティバックエンドが即座にセッションを返す |
| キー | `POST https://data.sideren.io/rest/v1/rpc/create_api_key {p_name}`（Bearerアクセストークン） | パネルが呼び出すのと同じRPC。`lx1_…`（別名 `sdn_…`）を返す |
| クレジット | 登録時にサーバー側で付与 | `GET https://api.sideren.io/v1/me` → `balance_usd: 2`、`plan: "free"` |
| 検証 | `GET /v1/models`、`GET /v1/me`、`POST /v1/chat/completions` | 3つすべてが応答した後にのみ、キーは `keys.txt` に書き込まれる |

## ⚙️ CLIオプション

```bash
node src/cli.js --count N        # mint N accounts (any N, default 30)
node src/cli.js --preset turbo   # run shape: turbo = 5 workers, balanced = 4, safe = 2
node src/cli.js --verify-only    # re-verify every key in keys.txt
node src/cli.js --help
```

| 環境変数 | デフォルト | 意味 |
| --- | --- | --- |
| `SIDEREN_PROXIES` | `proxies.txt` | プールファイル、1行につき1プロキシ |
| `PIN_PROXY` | — | すべての呼び出しで単一の出口を固定（例: `socks5://127.0.0.1:40000`） |

Turboを推奨（5）。それ以上は非力なコンピューターでは負荷/banのリスクがあります。

## 🛰️ プロキシ経由

プロバイダーへの通信はあなたのプール（または固定プロキシ）を経由します。登録は短い1回の呼び出しなので、出口は1回のラウンドトリップを生き延びればよいだけです。検証パスはより長い経路で、1つが死ぬと単に別の出口を選び直します。

## 📄 ファイル

| パス | 内容 |
| --- | --- |
| `keys.txt` | 1行につき検証済みキー1つ — git無視、コミットされない |
| `accounts.json` | アカウントごとのメール / パスワード / ユーザーID / キー / 検証記録 |
| [`models.json`](src/models.json) | 最新の134モデルカタログ |
| `outputs/` | 検証スイープ結果 — git無視 |

## 🔌 9Routerに接続

[9Router](https://9router.com) はセルフホスト型のOpenAI互換ルーターです。Sideren用に `openai-compatible` ノードを1つ用意し、キーごとに1接続:

```bash
node src/connect-9router.js \
  --base http://localhost:20128 --password 123456 \
  --api-key <key>            # or env NINEROUTER_API_KEY
```

デフォルト: ベース `http://localhost:20128`、パスワード `123456`、ノード `Sideren`、プレフィックス `sideren`、上流 `https://api.sideren.io/v1`、デフォルトモデル `@sdn/llama-3.3-70b`。別の作成済みキーは `--name "<label 2>"` で登録します — 各キーは9Routerが負荷分散できる別の接続になります。モデルはその後 `sideren/<model id>` として提供されます。

## 🔑 1つのキーで得られるもの

| | |
| --- | --- |
| 🏢 プロバイダー | **Sideren** — [sideren.io](https://sideren.io) · APIドキュメントは [docs.layerx1.com](https://docs.layerx1.com) |
| 🎁 プロバイダーが提供するもの | アカウントごとに無料の$2クレジット — キーごとに2回のREST呼び出し、OpenAI + Anthropicプロトコル |
| 🔑 1つのキーで得られるもの | それぞれのアカウントにスコープされた1つのAPIキー: 下のエンドポイントにあるモデルIDを、プランの制限内で利用できます。クォータは**アカウント**に紐づくため、このツールがキーごとに1アカウントを作成するのはまさにそのためです |
| 🌐 APIの形式 | OpenAI互換: `POST https://api.sideren.io/v1/chat/completions` |
| 🔒 あなたのデータ | 接続先は `data.sideren.io`（登録 + キーRPC）と `api.sideren.io`（推論）のみ。キーはあなたのマシンに留まります |

## 🐞 問題

Sideren がアイデンティティバックエンド（登録設定、RPC名、キープレフィックス）を変更した場合、ツールはそのステップで停止し、その旨を表示します。実行したコマンドと正確な出力を添えて **[issue を作成](../../issues)** してください。PRも歓迎です。

## 📄 ライセンス

MIT © 2026 — [LICENSE](LICENSE) を参照してください。

<div align="center">

**[MIT](LICENSE)** © 2026 sideren-bulk-apikey コントリビューター

</div>