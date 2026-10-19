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

**Otomatik oluşturulan API anahtarlarıyla toplu Sideren (sideren.io) hesapları açın — OpenAI uyumlu çıkarım + 9Router bağlayıcısı.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-134%20served-412991?style=for-the-badge)](https://docs.layerx1.com)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 Hızlı başlangıç](#-quick-start) · [🎁 Ücretsiz katman](#-free-tier--how-much-you-get) · [🤖 Modeller](#-models--all-134-of-them) · [🧪 API'yi kullanın](#-how-to-use-the-api) · [✅ Doğrulandı](#-verified-working--every-key-is-tested) · [🧭 Nasıl çalışır](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [⚙️ Seçenekler](#️-cli-options) · [🛰️ Proxy arkasında](#️-behind-a-proxy) · [🐞 Sorunlar](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ Bu neden var

Sideren (LayerX1) her hesaba **$2 ücretsiz kredi** ve hesabın kendi API anahtarını verir; ikisi de **hesapta** durur — yani kullanışlı birim *anahtar başına bir hesap*tır. `api.sideren.io/v1` adresindeki API, aynı anahtarla **her iki protokolü** de konuşur: OpenAI (`/v1/chat/completions`) ve Anthropic (`/v1/messages`). Bu araç hesapları ve anahtarları düz REST üzerinden üretir — tarayıcı yok, posta kutusu yok.

## 🎁 Ücretsiz katman — ne kadar alıyorsunuz

**Her yeni Sideren hesabı, kayıt sırasında sunucu tarafında tanımlanan bir kerelik $2 kredi alır — kart yok, posta kutusu yok.**

| Ne | Değer |
| --- | --- |
| Hoş geldin kredisi | hesap başına **$2,00** (`GET /v1/me` → `balance_usd: 2`, `plan: "free"`) — ölçüldü |
| Kart gerekli mi | **Hayır** |
| Hız limiti | ücretsiz plan: ilk 3 gün **15 istek/dk + 2 eşzamanlı**, sonrasında bir plan satın alınana kadar **4 istek/dk + 1 eşzamanlı** |
| Token sınırı | ayda 600k token, çağrı başına 50k girdi / 4k çıktı |
| Kayıt | REST: e-posta + parola (`POST /auth/v1/signup`) — e-posta kodu yok, tarayıcı yok |
| Ölçeklenen birim | **bir hesap = bir anahtar** → `--count N` aslında "N ücretsiz hesap" demektir |

**Daha fazlasını nasıl alırsınız:** kredi hesapta durur — anahtar başına bir hesap ve `--count N` N hesap üretir, her biri kendi $2'siyle. Üretilen bir anahtar `/v1/models`, `/v1/me` ve gerçek bir sohbet tamamlaması üzerinde `200` yanıtı verir, yani kredi hemen harcanabilir (`trial.ends_at`, oluşturmadan üç gün sonradır).

> 💡 Ücretsiz katman Sideren tarafından belirlenir ve değişebilir. Güncel rakamları [sideren.io](https://sideren.io) adresinden kontrol edin — ve kararı aracın kendi kontrolüne bırakın:

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 Modeller — 134'ünün tamamı

`GET /v1/models` **134 model** döndürür (bkz. [`models.json`](src/models.json)) ve her iki protokol de aynı anahtar tarafından sunulur. Öne çıkan kimlikler:

|Model|✓|
|---|---|
|`@sdn/deepseek-v4.1-flash`|✓|
|`@sdn/gpt-oss-120b`|✓|

Katalogda **134 kimlik** var; **Ücretsiz plan** bu iki modeli kapsar — diğer her şey `not in the Free plan` yanıtı verir (Starter/Pro gerekli).

Bir anahtarın canlı testi:

```bash
curl https://api.sideren.io/v1/chat/completions \
  -H "Authorization: Bearer lx1_…" -H "Content-Type: application/json" \
  -d '{"model":"sdn-glm-5.3","messages":[{"role":"user","content":"hi"}]}'
```

## 🧪 API nasıl kullanılır

Temel URL **`https://api.sideren.io/v1`**; aynı anahtar `/v1/messages` (`x-api-key`) adresindeki Anthropic protokolüne de yanıt verir.

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

**Özel temel URL destekleyen herhangi bir ajan / araç** (Cursor, OpenCode, Kilo Code, …): temel URL `https://api.sideren.io/v1`, bir anahtar yapıştırın, katalogdan herhangi bir model kimliği seçin.

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

Araçlar `proxies.txt` dosyasını **depo kökünden** okur ve `keys.txt`, `accounts.json` ile `outputs/` dosyalarını da oraya yazar. `keys.txt` (`%USERPROFILE%\sideren-keys.txt` konumuna da yansıtılır) **yalnızca** bir anahtar `GET /v1/models`, `GET /v1/me` ve gerçek bir sohbet tamamlamasına yanıt verdikten sonra yazılır.

### 🖱️ Başlatıcı

Başlatıcı proxy listesini ve sayıyı sorar, bunları `launcher.config.json` içinde hatırlar ve CLI'yi doğru bayraklarla çalıştırır; `node src/launcher.js --connect-9router` üretilen anahtarları yerel bir 9Router'a kaydeder.

## ✅ Çalıştığı doğrulandı — her anahtar test edilir

| Kontrol | Sonuç |
| --- | --- |
| `POST /auth/v1/signup` | **30/30 → 200**, erişim belirteciyle (oturum hemen kullanılabilir) |
| `POST /rest/v1/rpc/create_api_key` | **30/30 → 200**, bir `lx1_…` anahtarıyla |
| `GET /v1/models` + `GET /v1/me` | **30/30 → 200**, hesap başına `plan: "free"`, `balance_usd: 2` |
| `POST /v1/chat/completions` (OpenAI protokolü) | **200**, gerçek içerikle |
| `POST /v1/messages` (Anthropic protokolü, `x-api-key`) | **200**, `content: [{type:"text", text:"ok"}]`, `stop_reason: "end_turn"` |
| gönderilen listenin son bir taraması | **30/30 OK** |

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
| anahtar | `POST https://data.sideren.io/rest/v1/rpc/create_api_key {p_name}` (Bearer access token) | panelin çağırdığı RPC'nin aynısı; `lx1_…` döndürür (`sdn_…` takma adı) |
| kredi | kayıt sırasında sunucu tarafında tanımlanır | `GET https://api.sideren.io/v1/me` → `balance_usd: 2`, `plan: "free"` |
| doğrulama | `GET /v1/models`, `GET /v1/me`, `POST /v1/chat/completions` | bir anahtar `keys.txt` dosyasına ancak bu üçü de yanıt verdikten sonra yazılır |

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
| `PIN_PROXY` | — | her çağrı için tek bir çıkışı sabitleyin (ör. `socks5://127.0.0.1:40000`) |

Turbo önerilir (5); daha fazlası zayıf bilgisayarda yük/ban riski.

## 🛰️ Proxy arkasında

Sağlayıcı trafiği havuzunuzdan (veya sabitlenmiş bir proxy'den) geçer. Kayıt tek ve kısa bir çağrı olduğundan bir çıkışın yalnızca tek bir gidiş-dönüşü atlatması yeterlidir; doğrulama geçişi daha uzun yoldur ve bir çıkış öldüğünde basitçe başka bir çıkış seçer.

## 📄 Dosyalar

| Yol | İçerik |
| --- | --- |
| `keys.txt` | satır başına bir doğrulanmış anahtar — git tarafından yok sayılır, asla commit edilmez |
| `accounts.json` | hesap başına e-posta / parola / kullanıcı kimliği / anahtar / doğrulama kaydı |
| [`models.json`](src/models.json) | canlı 134 modellik katalog |
| `outputs/` | doğrulama taraması sonuçları — git tarafından yok sayılır |

## 🔌 9Router'a bağlan

[9Router](https://9router.com) kendi sunucunuzda barındırılan, OpenAI uyumlu bir yönlendiricidir. Sideren için bir `openai-compatible` düğümü, anahtar başına bir bağlantı:

```bash
node src/connect-9router.js \
  --base http://localhost:20128 --password 123456 \
  --api-key <key>            # or env NINEROUTER_API_KEY
```

Varsayılanlar: temel `http://localhost:20128`, parola `123456`, düğüm `Sideren`, ön ek `sideren`, üst kaynak `https://api.sideren.io/v1`, varsayılan model `@sdn/llama-3.3-70b`. Üretilen başka bir anahtarı `--name "<label 2>"` ile kaydedin — her anahtar, 9Router'ın yük dengelemesi yapabileceği bir bağlantı haline gelir. Modeller daha sonra `sideren/<model id>` olarak sunulur.

## 🔑 Bir anahtar size ne kazandırır

| | |
| --- | --- |
| 🏢 Sağlayıcı | **Sideren** — [sideren.io](https://sideren.io) · API dokümanları [docs.layerx1.com](https://docs.layerx1.com) adresinde |
| 🎁 Sağlayıcı ne veriyor | hesap başına ücretsiz $2 kredi — anahtar başına iki REST çağrısı, OpenAI + Anthropic protokolleri |
| 🔑 Bir anahtar size ne kazandırır | kendi hesabına bağlı bir API anahtarı: aşağıdaki uç noktadaki model kimlikleri, planınızın limitleri dahilinde. Kota **hesapta** durur; bu aracın anahtar başına bir hesap oluşturmasının nedeni tam olarak budur |
| 🌐 API biçimi | OpenAI uyumlu: `POST https://api.sideren.io/v1/chat/completions` |
| 🔒 Verileriniz | yalnızca `data.sideren.io` (kayıt + anahtar RPC) ve `api.sideren.io` (çıkarım) ile iletişim kurulur; anahtarlar makinenizde kalır |

## 🐞 Sorunlar

Sideren kimlik arka ucunu değiştirirse (kayıt ayarları, RPC adı, anahtar ön eki), araç o adımda durur ve bunu bildirir. Çalıştırdığınız komut ve tam çıktıyla birlikte **[bir sorun açın](../../issues)**; PR'lar memnuniyetle karşılanır.

## 📄 Lisans

MIT © 2026 — bkz. [LICENSE](LICENSE).

<div align="center">

**[MIT](LICENSE)** © 2026 sideren-bulk-apikey katkıda bulunanlar

</div>