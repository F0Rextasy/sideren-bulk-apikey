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

**Sideren-Konten (sideren.io) massenhaft erstellen mit automatisch generierten API-Schlüsseln — OpenAI-kompatible Inferenz + 9Router-Connector.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-134%20served-412991?style=for-the-badge)](https://docs.layerx1.com)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 Schnellstart](#-quick-start) · [🎁 Free-Tier](#-free-tier--how-much-you-get) · [🤖 Modelle](#-models--all-134-of-them) · [🧪 API verwenden](#-how-to-use-the-api) · [✅ Verifiziert](#-verified-working--every-key-is-tested) · [🧭 So funktioniert es](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [⚙️ Optionen](#️-cli-options) · [🛰️ Proxys](#️-behind-a-proxy) · [🐞 Probleme](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ Warum es das gibt

Sideren (LayerX1) gibt jedem Konto **$2 kostenloses Guthaben** und einen eigenen API-Schlüssel, und beides liegt beim **Konto** — die nützliche Einheit ist also *ein Konto pro Schlüssel*. Die API unter `api.sideren.io/v1` spricht **beide Protokolle**, OpenAI (`/v1/chat/completions`) und Anthropic (`/v1/messages`), mit demselben Schlüssel. Dieses Tool erzeugt Konten und Schlüssel über einfaches REST — kein Browser, kein Postfach.

## 🎁 Free-Tier — wie viel du bekommst

**Jedes neue Sideren-Konto erhält ein einmaliges Guthaben von $2, serverseitig bei der Registrierung gewährt — keine Karte, kein Postfach.**

| Was | Wert |
| --- | --- |
| Willkommensguthaben | **$2.00** pro Konto (`GET /v1/me` → `balance_usd: 2`, `plan: "free"`) — gemessen |
| Karte erforderlich | **Nein** |
| Ratenlimit | Free-Plan: erste 3 Tage **15 Anfragen/min + 2 parallel**, dann **4 Anfragen/min + 1 parallel**, bis ein Plan gekauft wird |
| Token-Grenze | 600k Tokens/Monat, 50k Eingabe / 4k Ausgabe pro Aufruf |
| Registrierung | REST: E-Mail + Passwort (`POST /auth/v1/signup`) — kein E-Mail-Code, kein Browser |
| Die skalierende Einheit | **ein Konto = ein Schlüssel** → `--count N` bedeutet eigentlich „N kostenlose Konten“ |

**So bekommst du mehr:** Das Guthaben liegt beim Konto — ein Konto pro Schlüssel, und `--count N` erzeugt N Konten, jedes mit eigenen $2. Ein erzeugter Schlüssel antwortet mit `200` auf `/v1/models`, `/v1/me` und eine echte Chat-Vervollständigung, sodass das Guthaben sofort ausgegeben werden kann (`trial.ends_at` liegt drei Tage nach der Erstellung).

> 💡 Der Free-Tier wird von Sideren festgelegt und kann sich ändern. Prüfe die aktuellen Zahlen auf [sideren.io](https://sideren.io) — und lass das Gate des Tools entscheiden:

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 Modelle — alle 134 davon

`GET /v1/models` gibt **134 Modelle** zurück (siehe [`models.json`](src/models.json)), und beide Protokolle werden vom selben Schlüssel bedient. Wichtigste IDs:

|Modell|✓|
|---|---|
|`@sdn/deepseek-v4.1-flash`|✓|
|`@sdn/gpt-oss-120b`|✓|

Der Katalog enthält **134 IDs**; der **Free-Plan** deckt diese beiden Modelle ab — alles andere antwortet mit `not in the Free plan` (Starter/Pro erforderlich).

Live-Test eines Schlüssels:

```bash
curl https://api.sideren.io/v1/chat/completions \
  -H "Authorization: Bearer lx1_…" -H "Content-Type: application/json" \
  -d '{"model":"sdn-glm-5.3","messages":[{"role":"user","content":"hi"}]}'
```

## 🧪 So verwendest du die API

Die Basis-URL ist **`https://api.sideren.io/v1`**; derselbe Schlüssel beantwortet auch das Anthropic-Protokoll unter `/v1/messages` (`x-api-key`).

**OpenAI-Protokoll**

```python
from openai import OpenAI
client = OpenAI(base_url="https://api.sideren.io/v1", api_key="lx1_…")
print(client.chat.completions.create(model="sdn-glm-5.3",
      messages=[{"role": "user", "content": "hi"}]).choices[0].message.content)
```

**Anthropic-Protokoll** (`/v1/messages`, `x-api-key`):

```bash
curl https://api.sideren.io/v1/messages \
  -H "x-api-key: lx1_…" -H "anthropic-version: 2023-06-01" \
  -H "Content-Type: application/json" \
  -d '{"model":"sdn-glm-5.3","max_tokens":16,"messages":[{"role":"user","content":"hi"}]}'
```

**Jeder Agent / jedes Tool mit eigener Basis-URL** (Cursor, OpenCode, Kilo Code, …): Basis-URL `https://api.sideren.io/v1`, Schlüssel einfügen, eine beliebige Modell-ID aus dem Katalog wählen.

## 🛠 Schnellstart

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

Die Tools lesen `proxies.txt` aus dem **Repository-Stammverzeichnis** und schreiben `keys.txt`, `accounts.json` und `outputs/` ebenfalls dorthin. `keys.txt` (gespiegelt nach `%USERPROFILE%\sideren-keys.txt`) wird **erst** geschrieben, nachdem ein Schlüssel `GET /v1/models`, `GET /v1/me` und eine echte Chat-Vervollständigung beantwortet hat.

### 🖱️ Der Launcher

Der Launcher fragt nach der Proxy-Liste und der Anzahl, merkt sie sich in `launcher.config.json` und führt die CLI mit den richtigen Flags aus; `node src/launcher.js --connect-9router` registriert die erzeugten Schlüssel in einem lokalen 9Router.

## ✅ Verifiziert funktionierend — jeder Schlüssel wird getestet

| Prüfung | Ergebnis |
| --- | --- |
| `POST /auth/v1/signup` | **30/30 → 200** mit einem Zugriffstoken (Sitzung sofort nutzbar) |
| `POST /rest/v1/rpc/create_api_key` | **30/30 → 200** mit einem `lx1_…`-Schlüssel |
| `GET /v1/models` + `GET /v1/me` | **30/30 → 200**, `plan: "free"`, `balance_usd: 2` pro Konto |
| `POST /v1/chat/completions` (OpenAI-Protokoll) | **200** mit echtem Inhalt |
| `POST /v1/messages` (Anthropic-Protokoll, `x-api-key`) | **200**, `content: [{type:"text", text:"ok"}]`, `stop_reason: "end_turn"` |
| ein abschließender Durchlauf der ausgelieferten Liste | **30/30 OK** |

```bash
node src/cli.js --verify-only    # models + balance + a chat call for every key
```

## 🧭 So funktioniert es

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: Sideren page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://api.sideren.io/v1/chat/completions → real content = the key is live
```

| Schritt | Aufruf | Hinweise |
| --- | --- | --- |
| Konto | `POST https://data.sideren.io/auth/v1/signup {email,password}` | das Identitäts-Backend antwortet sofort mit einer Sitzung |
| Schlüssel | `POST https://data.sideren.io/rest/v1/rpc/create_api_key {p_name}` (Bearer access token) | derselbe RPC, den das Panel aufruft; liefert `lx1_…` (Alias `sdn_…`) |
| Guthaben | serverseitig bei der Registrierung gewährt | `GET https://api.sideren.io/v1/me` → `balance_usd: 2`, `plan: "free"` |
| Prüfen | `GET /v1/models`, `GET /v1/me`, `POST /v1/chat/completions` | ein Schlüssel wird erst in `keys.txt` geschrieben, nachdem alle drei geantwortet haben |

## ⚙️ CLI-Optionen

```bash
node src/cli.js --count N        # mint N accounts (any N, default 30)
node src/cli.js --preset turbo   # run shape: turbo = 5 workers, balanced = 4, safe = 2
node src/cli.js --verify-only    # re-verify every key in keys.txt
node src/cli.js --help
```

| Umgebungsvariable | Standard | Bedeutung |
| --- | --- | --- |
| `SIDEREN_PROXIES` | `proxies.txt` | Pool-Datei, ein Proxy pro Zeile |
| `PIN_PROXY` | — | einen einzelnen Egress für jeden Aufruf festlegen (z. B. `socks5://127.0.0.1:40000`) |

Turbo wird empfohlen (5); mehr riskiert Last-/Ban-Risiko auf schwachen Rechnern.

## 🛰️ Hinter einem Proxy

Der Provider-Verkehr läuft über deinen Pool (oder einen festgelegten Proxy). Die Registrierung ist ein einzelner kurzer Aufruf, daher muss ein Exit nur einen Round-Trip überstehen; der Verifizierungsdurchlauf ist der längere Pfad und wählt einfach einen anderen Exit, wenn einer ausfällt.

## 📄 Dateien

| Pfad | Inhalt |
| --- | --- |
| `keys.txt` | ein verifizierter Schlüssel pro Zeile — von Git ignoriert, nie committet |
| `accounts.json` | E-Mail / Passwort / Benutzer-ID / Schlüssel / Verifizierungsdatensatz pro Konto |
| [`models.json`](src/models.json) | der aktuelle Katalog mit 134 Modellen |
| `outputs/` | Ergebnisse des Verifizierungsdurchlaufs — von Git ignoriert |

## 🔌 Verbindung zu 9Router

[9Router](https://9router.com) ist ein selbst gehosteter, OpenAI-kompatibler Router. Ein `openai-compatible`-Knoten für Sideren, eine Verbindung pro Schlüssel:

```bash
node src/connect-9router.js \
  --base http://localhost:20128 --password 123456 \
  --api-key <key>            # or env NINEROUTER_API_KEY
```

Standardwerte: Basis `http://localhost:20128`, Passwort `123456`, Knoten `Sideren`, Präfix `sideren`, Upstream `https://api.sideren.io/v1`, Standardmodell `@sdn/llama-3.3-70b`. Registriere einen weiteren erzeugten Schlüssel mit `--name "<label 2>"` — jeder Schlüssel wird eine weitere Verbindung, über die 9Router lastverteilen kann. Modelle werden dann als `sideren/<model id>` bereitgestellt.

## 🔑 Was ein Schlüssel dir bringt

| | |
| --- | --- |
| 🏢 Anbieter | **Sideren** — [sideren.io](https://sideren.io) · API-Dokumentation unter [docs.layerx1.com](https://docs.layerx1.com) |
| 🎁 Was der Anbieter bietet | $2 kostenloses Guthaben pro Konto — zwei REST-Aufrufe pro Schlüssel, OpenAI- + Anthropic-Protokolle |
| 🔑 Was ein Schlüssel dir bringt | ein API-Schlüssel, beschränkt auf sein eigenes Konto: die Modell-IDs am unten genannten Endpunkt, im Rahmen der Limits deines Plans. Das Kontingent liegt beim **Konto**, genau deshalb erstellt dieses Tool ein Konto pro Schlüssel |
| 🌐 API-Form | OpenAI-kompatibel: `POST https://api.sideren.io/v1/chat/completions` |
| 🔒 Deine Daten | Es werden nur `data.sideren.io` (Registrierung + Schlüssel-RPC) und `api.sideren.io` (Inferenz) kontaktiert; Schlüssel bleiben auf deinem Rechner |

## 🐞 Probleme

Wenn Sideren sein Identitäts-Backend ändert (Registrierungseinstellungen, RPC-Name, Schlüsselpräfix), stoppt das Tool an diesem Schritt und sagt es. **[Ein Issue öffnen](../../issues)** mit dem ausgeführten Befehl und der exakten Ausgabe; PRs sind willkommen.

## 📄 Lizenz

MIT © 2026 — siehe [LICENSE](LICENSE).

<div align="center">

**[MIT](LICENSE)** © 2026 Mitwirkende von sideren-bulk-apikey

</div>