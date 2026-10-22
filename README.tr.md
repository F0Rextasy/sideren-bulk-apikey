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

**Otomatik oluşturulan API anahtarlarıyla toplu Sideren (sideren.io) hesabı oluşturun — OpenAI uyumlu çıkarım + 9Router bağlayıcısı.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-134%20served-412991?style=for-the-badge)](https://docs.layerx1.com)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6?style=for-the-badge)](#-connect-to-omniroute)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 Hızlı başlangıç](#-quick-start) · [🎁 Ücretsiz katman](#-free-tier--how-much-you-get) · [🤖 Modeller](#-models--all-134-of-them) · [🧪 API'yi kullanma](#-how-to-use-the-api) · [✅ Doğrulandı](#-verified-working--every-key-is-tested) · [🧭 Nasıl çalışır](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [⚙️ Seçenekler](#️-cli-options) · [🛰️ Proxies](#️-behind-a-proxy) · [🐞 Sorunlar](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ Neden var

Sideren (LayerX1) her hesaba **$2 ücretsiz kredi** ve kendi API anahtarını verir; ikisi de **hesapta** yaşar — yani kullanışlı birim *anahtar başına bir hesaptır*. `api.sideren.io/v1` adresindeki API, aynı anahtarla **her iki protokolü** de konuşur: OpenAI (`/v1/chat/completions`) ve Anthropic (`/v1/messages`). Bu araç, düz REST üzerinden hesap ve anahtar üretir — tarayıcı yok, posta kutusu yok.

## 🎁 Ücretsiz katman — ne kadar alırsınız

**Her yeni Sideren hesabı, kayıt sırasında sunucu tarafında verilen tek seferlik $2 kredi alır — kart yok, posta kutusu yok.**

| Ne | Değer |
| --- | --- |
| Hoş geldin kredisi | Hesap başına **$2.00** (`GET /v1/me` → `balance_usd: 2`, `plan: "free"`) — ölçüldü |
| Kart gerekli | **Hayır** |
| Hız sınırı | ücretsiz plan: ilk 3 gün **15 istek/dk + 2 eşzamanlı**, ardından bir plan satın alınana kadar **4 istek/dk + 1 eşzamanlı** |
| Token duvarı | ayda 600k token, çağrı başına 50k girdi / 4k çıktı |
| Kayıt | REST: e-posta + parola (`POST /auth/v1/signup`) — e-posta kodu yok, tarayıcı yok |
| Ölçeklenen birim | **bir hesap = bir anahtar** → `--count N` aslında "N ücretsiz hesap" demektir |

**Daha fazlası nasıl alınır:** kredi hesapta yaşar — anahtar başına bir hesap ve `--count N`, her biri kendi $2'sine sahip N hesap üretir. Üretilen bir anahtar `/v1/models`, `/v1/me` ve gerçek bir sohbet tamamlamada `200` yanıtı verir, böylece kredi hemen harcanabilir (`trial.ends_at`, oluşturmadan üç gün sonradır).

> 💡 Ücretsiz katman Sideren tarafından belirlenir ve değişebilir. Güncel sayıları [sideren.io](https://sideren.io) adresinde kontrol edin — ve kararı aracın kendi doğrulama kapısına bırakın:

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 Modeller — 134'ünün tamamı

`GET /v1/models` **134 model** döndürür (bkz. [`models.json`](src/models.json)) ve her iki protokol de aynı anahtar tarafından sunulur; aşağıdaki 5 kimlik, 2026-10-19 tarihinde canlı bir sohbet çağrısına `200` ile yanıt verdi:

|Model|✓|
|---|---|
|`@sdn/deepseek-v4.1-flash`|✓|
|`@sdn/gpt-oss-120b`|✓|
|`@sdn/deepseek-v4.1-flash-1017`|✓|
|`@sdn/devstral-2-123b`|✓|
|`@sdn/kimi-k2.5`|✓|

Katalogda **134 kimlik** var; **Ücretsiz plan** bu beş modeli kapsar — geri kalan her şey `not in the Free plan` yanıtı verir (Starter/Pro gerekir).

Tek bir anahtarın canlı denemesi:

```bash
curl https://api.sideren.io/v1/chat/completions \
  -H "Authorization: Bearer lx1_…" -H "Content-Type: application/json" \
  -d '{"model":"sdn-glm-5.3","messages":[{"role":"user","content":"hi"}]}'
```

## 🧪 API nasıl kullanılır

Temel URL **`https://api.sideren.io/v1`**; aynı anahtar, `/v1/messages` adresinde Anthropic protokolüne de (`x-api-key`) yanıt verir.

**OpenAI protokolü**

```python
from openai import OpenAI
client = OpenAI(base_url="https://api.sideren.io/v1", api_key="lx1_…")
print(client.chat.completions.create(model="sdn-glm-5.3",
      messages=[{"role": "user", "content": "hi"}]).choices[0].message.content)
```

**Anthropic protokolü** (`/v1/messages`, `x-api-key`):

```bash
curl https://api.sideren.io/v1/messages \
  -H "x-api-key: lx1_…" -H "anthropic-version: 2023-06-01" \
  -H "Content-Type: application/json" \
  -d '{"model":"sdn-glm-5.3","max_tokens":16,"messages":[{"role":"user","content":"hi"}]}'
```

**Özel temel URL kullanan herhangi bir ajan / araç** (Cursor, OpenCode, Kilo Code, …): temel URL `https://api.sideren.io/v1`, bir anahtar yapıştırın, katalogdan herhangi bir model kimliği seçin.

## 🛠 Hızlı başlangıç

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

Araçlar `proxies.txt` dosyasını **depo kökünden** okur ve `keys.txt`, `accounts.json` ile `outputs/` dizinini de oraya yazar. `keys.txt` (`%USERPROFILE%\sideren-keys.txt` konumuna yansıtılır) **yalnızca** bir anahtar `GET /v1/models`, `GET /v1/me` ve gerçek bir sohbet tamamlamaya yanıt verdikten sonra yazılır.

### 🖱️ Başlatıcı

Başlatıcı, proxy listesini ve sayıyı sorar, bunları `launcher.config.json` içinde hatırlar ve CLI'yi doğru bayraklarla çalıştırır; `node src/launcher.js --connect-9router` üretilen anahtarları yerel bir 9Router'a kaydeder.

## ✅ Çalıştığı doğrulandı — her anahtar test edilir

| Kontrol | Sonuç |
| --- | --- |
| `POST /auth/v1/signup` | **30/30 → 200**, erişim belirteciyle (oturum hemen kullanılabilir) |
| `POST /rest/v1/rpc/create_api_key` | **30/30 → 200**, bir `lx1_…` anahtarıyla |
| `GET /v1/models` + `GET /v1/me` | **30/30 → 200**, hesap başına `plan: "free"`, `balance_usd: 2` |
| `POST /v1/chat/completions` (OpenAI protokolü) | **200**, gerçek içerikle |
| `POST /v1/messages` (Anthropic protokolü, `x-api-key`) | **200**, `content: [{type:"text", text:"ok"}]`, `stop_reason: "end_turn"` |
| teslim edilen listenin son taraması | **30/30 OK** |

```bash
node src/cli.js --verify-only    # models + balance + a chat call for every key
```

## 🧭 Nasıl çalışır

```

inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: Sideren page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://api.sideren.io/v1/chat/completions → real content = the key is live
```

| Adım | Çağrı | Notlar |
| --- | --- | --- |
| hesap | `POST https://data.sideren.io/auth/v1/signup {email,password}` | kimlik arka ucu hemen bir oturumla yanıt verir |
| anahtar | `POST https://data.sideren.io/rest/v1/rpc/create_api_key {p_name}` (Bearer access token) | panelin çağırdığı aynı RPC; `lx1_…` döndürür (`sdn_…` takma adı) |
| kredi | kayıt sırasında sunucu tarafında verilir | `GET https://api.sideren.io/v1/me` → `balance_usd: 2`, `plan: "free"` |
| doğrula | `GET /v1/models`, `GET /v1/me`, `POST /v1/chat/completions` | bir anahtar `keys.txt` dosyasına ancak üçü de yanıt verdikten sonra yazılır |

## ⚙️ CLI seçenekleri

```bash
node src/cli.js --count N        # mint N accounts (any N, default 30)
node src/cli.js --preset turbo   # run shape: turbo = 5 workers, balanced = 4, safe = 2
node src/cli.js --verify-only    # re-verify every key in keys.txt
node src/cli.js --help
```

| Ortam değişkeni | Varsayılan | Anlamı |
| --- | --- | --- |
| `SIDEREN_PROXIES` | `proxies.txt` | havuz dosyası, satır başına bir proxy |
| `PIN_PROXY` | — | her çağrı için tek bir çıkışı sabitle (ör. `socks5://127.0.0.1:40000`) |

Turbo önerilir (5); daha fazlası zayıf bilgisayarda yük/ban riski.

## 🛰️ Proxy arkasında

Sağlayıcı trafiği havuzunuzdan (veya sabitlenmiş bir proxy'den) geçer. Kayıt tek ve kısa bir çağrıdır, bu yüzden bir çıkışın yalnızca bir gidiş-dönüşü atlatması yeterlidir; doğrulama geçişi daha uzun yoldur ve bir çıkış öldüğünde basitçe başka bir çıkışı yeniden seçer.

## 📄 Dosyalar

| Yol | İçerik |
| --- | --- |
| `keys.txt` | satır başına bir doğrulanmış anahtar — git tarafından yok sayılır, asla işlenmez |
| `accounts.json` | hesap başına e-posta / parola / kullanıcı kimliği / anahtar / doğrulama kaydı |
| [`models.json`](src/models.json) | canlı 134 modellik katalog |
| `outputs/` | doğrulama taraması sonuçları — git tarafından yok sayılır |

## 🔌 9Router'a bağlan

[9Router](https://9router.com), kendi sunucunuzda barındırılan, OpenAI uyumlu bir yönlendiricidir. Sideren için bir `openai-compatible` düğümü, anahtar başına bir bağlantı:

```bash
node src/connect-9router.js \
  --base http://localhost:20128 --password 123456 \
  --api-key <key>            # or env NINEROUTER_API_KEY
```

Varsayılanlar: base `http://localhost:20128`, parola `123456`, düğüm `Sideren`, önek `sideren`, upstream `https://api.sideren.io/v1`, varsayılan model `@sdn/llama-3.3-70b`. Üretilen başka bir anahtarı `--name "<label 2>"` ile kaydedin — her anahtar, 9Router'ın yük dengeleyebileceği başka bir bağlantı olur. Modeller daha sonra `sideren/<model id>` olarak sunulur.

## 🔌 OmniRoute'a bağlan

[OmniRoute](https://omniroute.online), kendi sunucunuzda barındırılan, OpenAI uyumlu bir yönlendiricidir. Sideren için bir `openai-compatible` düğümü, anahtar başına bir bağlantı:

```bash
node src/connect-omniroute.js \
  --base http://localhost:20128 --password 123456 \
  --api-key <key>            # or env NINEROUTER_API_KEY
```

Varsayılanlar: base `http://localhost:20128`, parola `123456`, düğüm `Sideren`, önek `sideren`, upstream `https://api.sideren.io/v1`, varsayılan model `@sdn/llama-3.3-70b`. Üretilen başka bir anahtarı `--name "<label 2>"` ile kaydedin — her anahtar, OmniRoute'ın yük dengeleyebileceği başka bir bağlantı olur. Modeller daha sonra `sideren/<model id>` olarak sunulur.
## 🔑 Bir anahtar size ne kazandırır

| | |
| --- | --- |
| 🏢 Sağlayıcı | **Sideren** — [sideren.io](https://sideren.io) · API belgeleri: [docs.layerx1.com](https://docs.layerx1.com) |
| 🎁 Sağlayıcının verdikleri | hesap başına ücretsiz $2 kredi — anahtar başına iki REST çağrısı, OpenAI + Anthropic protokolleri |
| 🔑 Bir anahtar size ne kazandırır | kendi hesabına kapsamlı bir API anahtarı: aşağıdaki uç noktadaki model kimlikleri, planınızın sınırlarında. Kota **hesapta** yaşar; bu aracın anahtar başına bir hesap oluşturmasının nedeni tam olarak budur |
| 🌐 API biçimi | OpenAI uyumlu: `POST https://api.sideren.io/v1/chat/completions` |
| 🔒 Verileriniz | yalnızca `data.sideren.io` (kayıt + anahtar RPC) ve `api.sideren.io` (çıkarım) ile iletişime geçilir; anahtarlar makinenizde kalır |

## 🐞 Sorunlar

Sideren kimlik arka ucunu değiştirirse (kayıt ayarları, RPC adı, anahtar öneki), araç o adımda durur ve bunu bildirir. Çalıştırdığınız komut ve tam çıktıyla birlikte **[bir sorun açın](../../issues)**; PR'lar memnuniyetle karşılanır.

## 📄 Lisans

MIT © 2026 — bkz. [LICENSE](LICENSE).

<div align="center">

**[MIT](LICENSE)** © 2026 sideren-bulk-apikey katkıda bulunanlar

</div>