<div align="center">

```
███████╗██╗██████╗ ███████╗██████╗ ███████╗███╗   ██╗
██╔════╝██║██╔══██╗██╔════╝██╔══██╗██╔════╝████╗  ██║
███████╗██║██║  ██║█████╗  ██████╔╝█████╗  ██╔██╗ ██║
╚════██║██║██║  ██║██╔══╝  ██╔══██╗██╔══╝  ██║╚██╗██║
███████║██║██████╔╝███████╗██║  ██║███████╗██║ ╚████║
╚══════╝╚═╝╚═════╝ ╚══════╝╚══╝  ╚═╝╚══════╝╚═╝  ╚═══╝
```

# sideren-bulk-apikey

**Massenhaft Sideren (sideren.io) Konten mit automatisch generierten API‑Schlüsseln erstellen — OpenAI‑kompatible Inferenz + 9Router‑Connector.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-134%20served-412991?style=for-the-badge)](https://docs.layerx1.com)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 Schnellstart](#-quick-start) · [🎁 Gratis‑Stufe](#-free-tier--how-much-you-get) · [🤖 Modelle](#-models--all-134-of-them) · [🧪 API verwenden](#-how-to-use-the-api) · [✅ Verifiziert](#-verified-working--every-key-is-tested) · [🧭 Wie es funktioniert](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [⚙️ Optionen](#️-cli-options) · [🛰️ Hinter einem Proxy](#️-behind-a-proxy) · [🐞 Probleme](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ Warum das existiert

Sideren (LayerX1) gibt jedem Konto **2 $ Guthaben** und einen eigenen API‑Schlüssel, und beides liegt im **Konto** — die nützliche Einheit ist also *ein Konto pro Schlüssel*. Die API unter `api.sideren.io/v1` unterstützt **beide Protokolle**, OpenAI (`/v1/chat/completions`) und Anthropic (`/v1/messages`), mit demselben Schlüssel. Dieses Werkzeug erzeugt Konten und Schlüssel über reines REST — kein Browser, kein Postfach.

## 🎁 Gratis‑Stufe — was Sie erhalten

**Jedes neue Sideren‑Konto erhält ein einmaliges Guthaben von 2 $, das serverseitig bei der Registrierung gutgeschrieben wird — keine Karte, kein Postfach.**

| Was | Wert |
| --- | --- |
| Willkommensguthaben | **2,00 $** pro Konto (`GET /v1/me` → `balance_usd: 2`, `plan: "free"`) — gemessen |
| Karte erforderlich | **Nein** |
| Ratenbegrenzung | Gratis‑Plan: in den ersten 3 Tagen **15 Anfragen/Min + 2 parallel**, danach **4 Anfragen/Min + 1 parallel**, bis ein kostenpflichtiger Plan gewählt wird |
| Token‑Limit | 600 k Token/Monat, 50 k Eingabe / 4 k Ausgabe pro Aufruf |
| Registrierung | REST: E‑Mail + Passwort (`POST /auth/v1/signup`) — kein E‑Mail‑Code, kein Browser |
| Die skalierbare Einheit | **ein Konto = ein Schlüssel** → `--count N` bedeutet tatsächlich „N Gratis‑Konten“ |

**Wie Sie mehr erhalten:** Das Guthaben liegt beim Konto — ein Konto pro Schlüssel, und `--count N` erzeugt N Konten, jedes mit eigenen 2 $. Ein erzeugter Schlüssel liefert `200` bei `/v1/models`, `/v1/me` und einer echten Chat‑Antwort, sodass das Guthaben sofort nutzbar ist (`trial.ends_at` ist drei Tage nach Erstellung).

> 💡 Die Gratis‑Stufe wird von Sideren festgelegt und kann sich ändern. Prüfen Sie die aktuellen Zahlen auf [sideren.io](https://sideren.io) — und lassen Sie das integrierte Gate des Werkzeugs entscheiden:

```bash
node src/cli.js --verify-only     # jeder Schlüssel in keys.txt wird mit einem echten Chat‑Aufruf erneut getestet
```

## 🤖 Modelle — alle 134 davon

`GET /v1/models` liefert **134 Modelle** (siehe [`models.json`](src/models.json)) und beide Protokolle werden vom selben Schlüssel bedient; die 5 IDs unten beantworteten am 19.10.2026 einen Live‑Chat‑Aufruf mit `200`:

| Modell | ✓ |
|---|---|
|`@sdn/deepseek-v4.1-flash`|✓|
|`@sdn/gpt-oss-120b`|✓|
|`@sdn/deepseek-v4.1-flash-1017`|✓|
|`@sdn/devstral-2-123b`|✓|
|`@sdn/kimi-k2.5`|✓|

Der Katalog enthält **134 IDs**; der **Gratis‑Plan** deckt diese fünf Modelle ab — alles andere liefert `not in the Free plan` (Starter/Pro erforderlich).

Live‑Probe eines Schlüssels:

```bash
curl https://api.sideren.io/v1/chat/completions \
  -H "Authorization: Bearer lx1_…" -H "Content-Type: application/json" \
  -d '{"model":"sdn-glm-5.3","messages":[{"role":"user","content":"hi"}]}'
```

## 🧪 API verwenden

Die Basis‑URL ist **`https://api.sideren.io/v1`**; derselbe Schlüssel beantwortet auch das Anthropic‑Protokoll unter `/v1/messages` (`x-api-key`).

**OpenAI‑Protokoll**

```python
from openai import OpenAI
client = OpenAI(base_url="https://api.sideren.io/v1", api_key="lx1_…")
print(client.chat.completions.create(model="sdn-glm-5.3",
      messages=[{"role": "user", "content": "hi"}]).choices[0].message.content)
```

**Anthropic‑Protokoll** (`/v1/messages`, `x-api-key`):

```bash
curl https://api.sideren.io/v1/messages \
  -H "x-api-key: lx1_…" -H "anthropic-version: 2023-06-01" \
  -H "Content-Type: application/json" \
  -d '{"model":"sdn-glm-5.3","max_tokens":16,"messages":[{"role":"user","content":"hi"}]}'
```

**Jeder Agent / jedes Tool mit einer benutzerdefinierten Basis‑URL** (Cursor, OpenCode, Kilo Code, …): Basis‑URL `https://api.sideren.io/v1`, Schlüssel einfügen, beliebige Modell‑ID aus dem Katalog auswählen.

## 🛠 Schnellstart

```bash
git clone https://github.com/F0Rextasy/sideren-bulk-apikey.git
cd sideren-bulk-apikey

# 1) Ihre Proxy‑Liste, eine pro Zeile (http://, socks5://, socks4:// oder host:port)
printf 'socks5://127.0.0.1:1080\n' > proxies.txt

# 2) los
node src/launcher.js            # interaktiv: mint / verify / settings / help
# oder direkt:
node src/cli.js --count 30      # beliebiges N — 30 ist nur das Standard‑Beispiel
```

Die Werkzeuge lesen `proxies.txt` aus dem **Repository‑Root** und schreiben dort auch `keys.txt`, `accounts.json` und `outputs/`. `keys.txt` (gespiegelt nach `%USERPROFILE%\sideren-keys.txt`) wird **nur** geschrieben, nachdem ein Schlüssel `GET /v1/models`, `GET /v1/me` und eine echte Chat‑Antwort erfolgreich beantwortet hat.

### 🖱️ Der Launcher

Der Launcher fragt nach der Proxy‑Liste und der Anzahl, speichert sie in `launcher.config.json` und startet die CLI mit den richtigen Flags; `node src/launcher.js --connect-9router` registriert die erzeugten Schlüssel in einem lokalen 9Router.

## ✅ Verifiziert – jeder Schlüssel wird getestet

| Prüfung | Ergebnis |
| --- | --- |
| `POST /auth/v1/signup` | **30/30 → 200** mit einem Zugriffstoken (Sitzung sofort nutzbar) |
| `POST /rest/v1/rpc/create_api_key` | **30/30 → 200** mit einem `lx1_…`‑Schlüssel |
| `GET /v1/models` + `GET /v1/me` | **30/30 → 200**, `plan: "free"`, `balance_usd: 2` pro Konto |
| `POST /v1/chat/completions` (OpenAI‑Protokoll) | **200** mit echtem Inhalt |
| `POST /v1/messages` (Anthropic‑Protokoll, `x-api-key`) | **200**, `content: [{type:"text", text:"ok"}]`, `stop_reason: "end_turn"` |
| ein abschließender Durchlauf der mitgelieferten Liste | **30/30 OK** |

```bash
node src/cli.js --verify-only    # Modelle + Guthaben + ein Chat‑Aufruf für jeden Schlüssel
```

## 🧭 Wie es funktioniert

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
| Konto | `POST https://data.sideren.io/auth/v1/signup {email,password}` | Das Identitäts‑Backend liefert sofort eine Sitzung zurück |
| Schlüssel | `POST https://data.sideren.io/rest/v1/rpc/create_api_key {p_name}` (Bearer‑Zugriffstoken) | Der gleiche RPC, den das Panel aufruft; gibt `lx1_…` (Alias `sdn_…`) zurück |
| Guthaben |  | serverseitig bei der Registrierung gutgeschrieben → `GET https://api.sideren.io/v1/me` → `balance_usd: 2`, `plan: "free"` |
| Verifizieren | `GET /v1/models`, `GET /v1/me`, `POST /v1/chat/completions` | Ein Schlüssel wird erst in `keys.txt` geschrieben, wenn alle drei Aufrufe erfolgreich waren |

## ⚙️ CLI‑Optionen

```bash
node src/cli.js --count N        # N Konten erzeugen (beliebiges N, Standard 30)
node src/cli.js --preset turbo   # Ausführungsmodus: turbo = 5 Worker, balanced = 4, safe = 2
node src/cli.js --verify-only    # alle Schlüssel in keys.txt erneut verifizieren
node src/cli.js --help
```

| Umgebungsvariable | Standardwert | Bedeutung |
| --- | --- | --- |
| `SIDEREN_PROXIES` | `proxies.txt` | Datei mit Proxy‑Liste, ein Proxy pro Zeile |
| `PIN_PROXY` | — | Einen einzelnen Ausgangs‑Proxy für alle Aufrufe festlegen (z. B. `socks5://127.0.0.1:40000`) |

Turbo wird empfohlen (5); mehr erhöht das Risiko von Belastung/Blockierung auf schwachen Rechnern.

## 🛰️ Hinter einem Proxy

Der Datenverkehr des Anbieters läuft über Ihren Pool (oder einen festgelegten Proxy). Die Registrierung ist ein kurzer einzelner Aufruf, sodass ein Exit nur einen Round‑Trip überstehen muss; der Verifizierungslauf ist länger und wählt einfach einen anderen Exit, wenn einer ausfällt.

## 📄 Dateien

| Pfad | Inhalt |
| --- | --- |
| `keys.txt` | ein verifizierter Schlüssel pro Zeile — git‑ignoriert, nie committet |
| `accounts.json` | E‑Mail / Passwort / Benutzer‑ID / Schlüssel / Verifizierungs‑Record pro Konto |
| [`models.json`](src/models.json) | der aktuelle 134‑Modell‑Katalog |
| `outputs/` | Ergebnisse des Verifizierungs‑Durchlaufs — git‑ignoriert |

## 🔌 Verbindung zu 9Router

[9Router](https://9router.com) ist ein selbstgehosteter, OpenAI‑kompatibler Router. Ein `openai‑compatible`‑Knoten für Sideren, eine Verbindung pro Schlüssel:

```bash
node src/connect-9router.js \
  --base http://localhost:20128 --password 123456 \
  --api-key <key>            # oder env NINEROUTER_API_KEY
```

Standardwerte: Basis `http://localhost:20128`, Passwort `123456`, Knoten `Sideren`, Präfix `sideren`, Upstream `https://api.sideren.io/v1`, Standardmodell `@sdn/llama-3.3-70b`. Registrieren Sie einen weiteren erzeugten Schlüssel mit `--name "<label 2>"` — jeder Schlüssel wird zu einer weiteren Verbindung, die 9Router load‑balancen kann. Modelle werden dann als `sideren/<model id>` bereitgestellt.

## 🔑 Was ein Schlüssel Ihnen gibt

| | |
| --- | --- |
| 🏢 Anbieter | **Sideren** — [sideren.io](https://sideren.io) · API‑Dokumentation unter [docs.layerx1.com](https://docs.layerx1.com) |
| 🎁 Was der Anbieter gibt | kostenloses Guthaben von 2 $ pro Konto — zwei REST‑Aufrufe pro Schlüssel, OpenAI + Anthropic‑Protokolle |
| 🔑 Was ein Schlüssel Ihnen gibt | ein API‑Schlüssel, der nur zu seinem eigenen Konto gehört: die Modell‑IDs am unten genannten Endpunkt, zu den Limits Ihres Plans. Das Kontingent liegt beim **Konto**, weshalb dieses Tool ein Konto pro Schlüssel erzeugt |
| 🌐 API‑Form | OpenAI‑kompatibel: `POST https://api.sideren.io/v1/chat/completions` |
| 🔒 Ihre Daten | Es werden nur `data.sideren.io` (Registrierung + Schlüssel‑RPC) und `api.sideren.io` (Inference) kontaktiert; Schlüssel bleiben auf Ihrem Rechner |

## 🐞 Probleme

Wenn Sideren sein Identitäts‑Backend ändert (Registrierungs‑Einstellungen, RPC‑Name, Schlüssel‑Präfix), stoppt das Werkzeug an diesem Schritt und meldet es. **[Ein Issue öffnen](../../issues)** mit dem ausgeführten Befehl und der genauen Ausgabe; Pull‑Requests sind willkommen.

## 📄 Lizenz

MIT © 2026 — siehe [LICENSE](LICENSE).

<div align="center">

**[MIT](LICENSE)** © 2026 sideren-bulk-apikey Mitwirkende

</div>