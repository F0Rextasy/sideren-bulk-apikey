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

**Sideren (sideren.io) アカウントを自動生成された API キー付きで一括作成 — OpenAI 互換推論 + 9Router コネクタ。**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-134%20served-412991?style=for-the-badge)](https://docs.layerx1.com)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 クイックスタート](#-quick-start) · [🎁 無料枠](#-free-tier--how-much-you-get) · [🤖 モデル](#-models--all-134-of-them) · [🧪 API を使う](#-how-to-use-the-api) · [✅ 検証済み](#-verified-working--every-key-is-tested) · [🧭 仕組み](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [⚙️ オプション](#️-cli-options) · [🛰️ プロキシ](#️-behind-a-proxy) · [🐞 問題報告](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ なぜこれがあるのか

Sideren (LayerX1) はすべてのアカウントに**$2 の無料クレジット**と専用の API キーを付与し、そのどちらもが**アカウント**に紐づきます — つまり実用的な単位は*キーごとに1アカウント*です。`api.sideren.io/v1` の API は**両方のプロトコル**、OpenAI (`/v1/chat/completions`) と Anthropic (`/v1/messages`) を同じキーで扱えます。このツールはプレーンな REST 経由でアカウントとキーを発行します — ブラウザもメールボックスも不要です。

## 🎁 無料枠 — どれだけ得られるか

**新しい Sideren アカウントには、サインアップ時にサーバー側で一度きりの $2 クレジットが付与されます — カード不要、メールボックス不要。**

| 内容 | 値 |
| --- | --- |
| ウェルカムクレジット | アカウントごとに **$2.00** (`GET /v1/me` → `balance_usd: 2`、`plan: "free"`) — 実測値 |
| カード必須 | **いいえ** |
| レート制限 | 無料プラン: 最初の3日間は **15 req/min + 同時2**、その後プラン購入までは **4 req/min + 同時1** |
| トークン上限 | 月 60万トークン、1回あたり入力 5万 / 出力 4千 |
| サインアップ | REST: メールアドレス + パスワード (`POST /auth/v1/signup`) — メール認証コードなし、ブラウザなし |
| スケールする単位 | **1アカウント = 1キー** → `--count N` は実質「N 個の無料アカウント」 |

**もっと得るには:** クレジットはアカウントに紐づきます — キーごとに1アカウントで、`--count N` は N 個のアカウントを作成し、それぞれが独自の $2 を持ちます。発行されたキーは `/v1/models`、`/v1/me`、そして実際のチャット補完に対して `200` を返すため、クレジットはすぐに使用できます (`trial.ends_at` は作成の3日後です)。

> 💡 無料枠は Sideren 側が設定しており、変更される可能性があります。最新の数値は [sideren.io](https://sideren.io) で確認してください — そしてツール自身のゲートに判断させてください:

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 モデル — 全134種類

`GET /v1/models` は **134 モデル**を返し ([`models.json`](src/models.json) を参照)、両方のプロトコルが同じキーで提供されます。以下の5つの ID は 2026-10-19 に実際のチャット呼び出しで `200` を返しました:

|モデル|✓|
|---|---|
|`@sdn/deepseek-v4.1-flash`|✓|
|`@sdn/gpt-oss-120b`|✓|
|`@sdn/deepseek-v4.1-flash-1017`|✓|
|`@sdn/devstral-2-123b`|✓|
|`@sdn/kimi-k2.5`|✓|

カタログには **134 個の ID** が含まれます。**無料プラン**でカバーされるのはこの5モデルで、それ以外はすべて `not in the Free plan` を返します (Starter/Pro が必要)。

1つのキーでのライブプローブ:

```bash
curl https://api.sideren.io/v1/chat/completions \
  -H "Authorization: Bearer lx1_…" -H "Content-Type: application/json" \
  -d '{"model":"sdn-glm-5.3","messages":[{"role":"user","content":"hi"}]}'
```

## 🧪 API の使い方

ベース URL は **`https://api.sideren.io/v1`** です。同じキーは Anthropic プロトコルの `/v1/messages` (`x-api-key`) にも応答します。

**OpenAI プロトコル**

```python
from openai import OpenAI
client = OpenAI(base_url="https://api.sideren.io/v1", api_key="lx1_…")
print(client.chat.completions.create(model="sdn-glm-5.3",
      messages=[{"role": "user", "content": "hi"}]).choices[0].message.content)
```

**Anthropic プロトコル** (`/v1/messages`、`x-api-key`):

```bash
curl https://api.sideren.io/v1/messages \
  -H "x-api-key: lx1_…" -H "anthropic-version: 2023-06-01" \
  -H "Content-Type: application/json" \
  -d '{"model":"sdn-glm-5.3","max_tokens":16,"messages":[{"role":"user","content":"hi"}]}'
```

**カスタムベース URL を使う任意のエージェント / ツール** (Cursor、OpenCode、Kilo Code など): ベース URL に `https://api.sideren.io/v1`、キーを貼り付け、カタログから任意のモデル ID を選択します。

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

ツールは**リポジトリのルート**から `proxies.txt` を読み込み、同じ場所に `keys.txt`、`accounts.json`、`outputs/` を書き出します。`keys.txt` (`%USERPROFILE%\sideren-keys.txt` にミラーリング) は、キーが `GET /v1/models`、`GET /v1/me`、そして実際のチャット補完に応答した**後でのみ**書き込まれます。

### 🖱️ ランチャー

ランチャーはプロキシリストと件数を尋ね、それらを `launcher.config.json` に記憶し、正しいフラグで CLI を実行します。`node src/launcher.js --connect-9router` は発行されたキーをローカルの 9Router に登録します。

## ✅ 動作確認済み — すべてのキーをテスト済み

| チェック | 結果 |
| --- | --- |
| `POST /auth/v1/signup` | アクセストークン付きで **30/30 → 200** (セッションは即座に使用可能) |
| `POST /rest/v1/rpc/create_api_key` | `lx1_…` キー付きで **30/30 → 200** |
| `GET /v1/models` + `GET /v1/me` | **30/30 → 200**、アカウントごとに `plan: "free"`、`balance_usd: 2` |
| `POST /v1/chat/completions` (OpenAI プロトコル) | 実際のコンテンツ付きで **200** |
| `POST /v1/messages` (Anthropic プロトコル、`x-api-key`) | **200**、`content: [{type:"text", text:"ok"}]`、`stop_reason: "end_turn"` |
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
| アカウント | `POST https://data.sideren.io/auth/v1/signup {email,password}` | アイデンティティバックエンドが即座にセッションを返します |
| キー | `POST https://data.sideren.io/rest/v1/rpc/create_api_key {p_name}` (Bearer アクセストークン) | パネルが呼ぶのと同じ RPC。`lx1_…` (別名 `sdn_…`) を返します |
| クレジット | サインアップ時にサーバー側で付与 | `GET https://api.sideren.io/v1/me` → `balance_usd: 2`、`plan: "free"` |
| 検証 | `GET /v1/models`、`GET /v1/me`、`POST /v1/chat/completions` | 3つすべてが応答した後にのみ、キーが `keys.txt` に書き込まれます |

## ⚙️ CLI オプション

```bash
node src/cli.js --count N        # mint N accounts (any N, default 30)
node src/cli.js --preset turbo   # run shape: turbo = 5 workers, balanced = 4, safe = 2
node src/cli.js --verify-only    # re-verify every key in keys.txt
node src/cli.js --help
```

| 環境変数 | デフォルト | 意味 |
| --- | --- | --- |
| `SIDEREN_PROXIES` | `proxies.txt` | プールファイル、1行につき1プロキシ |
| `PIN_PROXY` | — | すべての呼び出しで単一のイグレスを固定 (例: `socks5://127.0.0.1:40000`) |

Turbo (5) を推奨します。それ以上は非力なマシンでは負荷や BAN のリスクがあります。

## 🛰️ プロキシ経由で

プロバイダーへの通信はあなたのプール (または固定プロキシ) を通ります。サインアップは短い1回の呼び出しなので、イグレスは1往復を耐えれば十分です。検証パスはより長い経路であり、1つが落ちた場合は単に別のイグレスを選び直します。

## 📄 ファイル

| パス | 内容 |
| --- | --- |
| `keys.txt` | 検証済みキーを1行に1つ — git 管理外、コミットされません |
| `accounts.json` | アカウントごとのメール / パスワード / ユーザー ID / キー / 検証記録 |
| [`models.json`](src/models.json) | 最新の134モデルカタログ |
| `outputs/` | 検証スイープの結果 — git 管理外 |

## 🔌 9Router に接続

[9Router](https://9router.com) はセルフホスト型の OpenAI 互換ルーターです。Sideren 用に1つの `openai-compatible` ノード、キーごとに1つの接続:

```bash
node src/connect-9router.js \
  --base http://localhost:20128 --password 123456 \
  --api-key <key>            # or env NINEROUTER_API_KEY
```

デフォルト: ベース `http://localhost:20128`、パスワード `123456`、ノード `Sideren`、プレフィックス `sideren`、アップストリーム `https://api.sideren.io/v1`、デフォルトモデル `@sdn/llama-3.3-70b`。発行した別のキーは `--name "<label 2>"` で登録します — キーごとに別の接続となり、9Router はその間で負荷分散できます。モデルはその後 `sideren/<model id>` として提供されます。

## 🔑 1つのキーで得られるもの

| | |
| --- | --- |
| 🏢 プロバイダー | **Sideren** — [sideren.io](https://sideren.io) · API ドキュメントは [docs.layerx1.com](https://docs.layerx1.com) |
| 🎁 プロバイダーが提供するもの | アカウントごとに無料の $2 クレジット — キーごとに REST 呼び出し2回、OpenAI + Anthropic プロトコル |
| 🔑 1つのキーで得られるもの | 自身のアカウントにスコープされた1つの API キー: 下記エンドポイント上のモデル ID を、あなたのプランの制限内で利用できます。クォータは**アカウント**に紐づくため、このツールがキーごとに1アカウントを作成するのはまさにそのためです |
| 🌐 API の形式 | OpenAI 互換: `POST https://api.sideren.io/v1/chat/completions` |
| 🔒 あなたのデータ | 接続先は `data.sideren.io` (サインアップ + キー RPC) と `api.sideren.io` (推論) のみで、キーはあなたのマシン上に留まります |

## 🐞 問題報告

Sideren がアイデンティティバックエンド (サインアップ設定、RPC 名、キーのプレフィックス) を変更した場合、ツールはそのステップで停止し、その旨を報告します。実行したコマンドと正確な出力を添えて **[issue を作成してください](../../issues)**。PR も歓迎します。

## 📄 ライセンス

MIT © 2026 — [LICENSE](LICENSE) を参照してください。

<div align="center">

**[MIT](LICENSE)** © 2026 sideren-bulk-apikey コントリビューター

</div>