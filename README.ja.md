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

**Sideren (sideren.io) アカウントを自動生成された API キーとともに一括作成 — OpenAI 互換推論 + 9Router コネクタ。**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-134%20served-412991?style=for-the-badge)](https://docs.layerx1.com)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 クイックスタート](#-quick-start) · [🎁 無料枠](#-free-tier--how-much-you-get) · [🤖 モデル](#-models--all-134-of-them) · [🧪 API の使い方](#-how-to-use-the-api) · [✅ 検証済み](#-verified-working--every-key-is-tested) · [🧭 仕組み](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [⚙️ オプション](#️-cli-options) · [🛰️ プロキシ](#️-behind-a-proxy) · [🐞 問題報告](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>


---

## ✨ なぜこれが存在するのか

Sideren (LayerX1) はすべてのアカウントに **$2 の無料クレジット** と専用の API キーを付与し、その両方が **アカウント** に紐づきます — つまり有用な単位は *1 アカウントにつき 1 キー* です。`api.sideren.io/v1` の API は **両方のプロトコル**、OpenAI (`/v1/chat/completions`) と Anthropic (`/v1/messages`) を同じキーで扱えます。このツールはプレーンな REST 経由でアカウントとキーを生成します — ブラウザもメールボックスも不要です。

## 🎁 無料枠 — どれだけ得られるか

**新しい Sideren アカウントには、サインアップ時にサーバー側で付与される一度限りの $2 クレジットが付きます — カード不要、メールボックス不要。**

| 項目 | 値 |
| --- | --- |
| ウェルカムクレジット | アカウントあたり **$2.00** (`GET /v1/me` → `balance_usd: 2`、`plan: "free"`) — 実測値 |
| カード必須 | **いいえ** |
| レート制限 | 無料プラン: 最初の 3 日間は **15 req/min + 同時 2**、その後プラン購入まで **4 req/min + 同時 1** |
| トークン上限 | 月 600k トークン、1 回の呼び出しあたり入力 50k / 出力 4k |
| サインアップ | REST: メール + パスワード (`POST /auth/v1/signup`) — メールコード不要、ブラウザ不要 |
| スケールする単位 | **1 アカウント = 1 キー** → `--count N` は実質「N 個の無料アカウント」 |

**もっと得るには:** クレジットはアカウントに紐づきます — 1 アカウントにつき 1 キーで、`--count N` は N 個のアカウントを生成し、それぞれが独自の $2 を持ちます。生成されたキーは `/v1/models`、`/v1/me`、そして実際のチャット補完で `200` を返すので、クレジットはすぐに使えます (`trial.ends_at` は作成の 3 日後です)。

> 💡 無料枠は Sideren が設定するもので、変更される可能性があります。最新の数値は [sideren.io](https://sideren.io) で確認してください — そしてツール自身のゲートに判断させましょう:

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 モデル — そのすべて 134 種

`GET /v1/models` は **134 モデル** を返し ([`models.json`](src/models.json) 参照)、両方のプロトコルが同じキーで提供されます。主要な id:

|Model|✓|
|---|---|
|`sdn-llama-3.3-70b`|✓|

1 つのキーのライブプローブ:

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

**カスタムベース URL を持つ任意のエージェント / ツール** (Cursor、OpenCode、Kilo Code など): ベース URL `https://api.sideren.io/v1`、キーを貼り付け、カタログから任意のモデル id を選択。

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

ツールは **リポジトリのルート** から `proxies.txt` を読み込み、`keys.txt`、`accounts.json`、`outputs/` もそこに書き込みます。`keys.txt` (`%USERPROFILE%\sideren-keys.txt` にミラーリング) は、キーが `GET /v1/models`、`GET /v1/me`、そして実際のチャット補完に応答した **後にのみ** 書き込まれます。

### 🖱️ ランチャー

ランチャーはプロキシリストと件数を尋ね、それらを `launcher.config.json` に記憶し、適切なフラグで CLI を実行します。`node src/launcher.js --connect-9router` は生成されたキーをローカルの 9Router に登録します。

## ✅ 動作検証済み — すべてのキーがテストされています

| チェック | 結果 |
| --- | --- |
| `POST /auth/v1/signup` | アクセストークン付きで **30/30 → 200** (セッションは即座に使用可能) |
| `POST /rest/v1/rpc/create_api_key` | `lx1_…` キー付きで **30/30 → 200** |
| `GET /v1/models` + `GET /v1/me` | **30/30 → 200**、アカウントあたり `plan: "free"`、`balance_usd: 2` |
| `POST /v1/chat/completions` (OpenAI プロトコル) | 実際のコンテンツ付きで **200** |
| `POST /v1/messages` (Anthropic プロトコル、`x-api-key`) | **200**、`content: [{type:"text", text:"ok"}]`、`stop_reason: "end_turn"` |
| 出荷リストの最終スイープ | **30/30 OK** |

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
| キー | `POST https://data.sideren.io/rest/v1/rpc/create_api_key {p_name}` (Bearer アクセストークン) | パネルが呼び出すのと同じ RPC。`lx1_…` (別名 `sdn_…`) を返す |
| クレジット | サインアップ時にサーバー側で付与 | `GET https://api.sideren.io/v1/me` → `balance_usd: 2`、`plan: "free"` |
| 検証 | `GET /v1/models`、`GET /v1/me`、`POST /v1/chat/completions` | 3 つすべてが応答した後にのみキーが `keys.txt` に書き込まれる |

## ⚙️ CLI オプション

```bash
node src/cli.js --count N        # mint N accounts (any N, default 30)
node src/cli.js --preset turbo   # run shape: turbo = 5 workers, balanced = 4, safe = 2
node src/cli.js --verify-only    # re-verify every key in keys.txt
node src/cli.js --help
```

| 環境変数 | デフォルト | 意味 |
| --- | --- | --- |
| `SIDEREN_PROXIES` | `proxies.txt` | プールファイル、1 行につき 1 プロキシ |
| `PIN_PROXY` | — | すべての呼び出しで単一の出口を固定 (例: `socks5://127.0.0.1:40000`) |

Turbo önerilir (5); daha fazlası zayıf bilgisayarda yük/ban riski.

## 🛰️ プロキシの背後で

プロバイダーのトラフィックはあなたのプール (または固定プロキシ) を経由します。サインアップは短い 1 回の呼び出しなので、出口は 1 往復を生き延びれば十分です。検証パスはより長い経路で、1 つが死ぬと単に別の出口を選び直します。

## 📄 ファイル

| パス | 内容 |
| --- | --- |
| `keys.txt` | 検証済みキーを 1 行に 1 つ — git 管理外、コミットされない |
| `accounts.json` | アカウントごとのメール / パスワード / ユーザー id / キー / 検証記録 |
| [`models.json`](src/models.json) | ライブの 134 モデルカタログ |
| `outputs/` | 検証スイープの結果 — git 管理外 |

## 🔌 9Router に接続

[9Router](https://9router.com) はセルフホスト型の OpenAI 互換ルーターです。Sideren 用に 1 つの `openai-compatible` ノード、キーごとに 1 つの接続:

```bash
node src/connect-9router.js \
  --base http://localhost:20128 --password 123456 \
  --api-key <key>            # or env NINEROUTER_API_KEY
```

デフォルト: base `http://localhost:20128`、password `123456`、node `Sideren`、prefix `sideren`、upstream `https://api.sideren.io/v1`、default model `@sdn/llama-3.3-70b`。別の生成済みキーを `--name "<label 2>"` で登録します — すべてのキーが 9Router で負荷分散できる別の接続になります。モデルは `sideren/<model id>` として提供されます。

## 🔑 1 つのキーで得られるもの

| | |
| --- | --- |
| 🏢 プロバイダー | **Sideren** — [sideren.io](https://sideren.io) · API ドキュメントは [docs.layerx1.com](https://docs.layerx1.com) |
| 🎁 プロバイダーが提供するもの | アカウントあたり無料 $2 クレジット — キーごとに 2 回の REST 呼び出し、OpenAI + Anthropic プロトコル |
| 🔑 1 つのキーで得られるもの | 独自のアカウントにスコープされた 1 つの API キー: 下記エンドポイントのモデル id を、あなたのプランの制限で。クォータは **アカウント** に紐づくため、このツールがキーごとに 1 アカウントを作成するのです |
| 🌐 API の形 | OpenAI 互換: `POST https://api.sideren.io/v1/chat/completions` |
| 🔒 あなたのデータ | 接続されるのは `data.sideren.io` (サインアップ + キー RPC) と `api.sideren.io` (推論) のみ。キーはあなたのマシンに留まります |

## 🐞 問題報告

Sideren がアイデンティティバックエンド (サインアップ設定、RPC 名、キープレフィックス) を変更した場合、ツールはそのステップで停止し、その旨を報告します。実行したコマンドと正確な出力を添えて **[issue を作成してください](../../issues)**。PR も歓迎します。

## 📄 ライセンス

MIT © 2026 — [LICENSE](LICENSE) を参照。

<div align="center">

**[MIT](LICENSE)** © 2026 sideren-bulk-apikey contributors

</div>