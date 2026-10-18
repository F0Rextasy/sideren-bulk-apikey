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

**Crea cuentas de Sideren (sideren.io) en masa con claves API autogeneradas — inferencia compatible con OpenAI + conector 9Router.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-134%20served-412991?style=for-the-badge)](https://docs.layerx1.com)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 Inicio rápido](#-quick-start) · [🎁 Nivel gratuito](#-free-tier--how-much-you-get) · [🤖 Modelos](#-models--all-134-of-them) · [🧪 Usa la API](#-how-to-use-the-api) · [✅ Verificado](#-verified-working--every-key-is-tested) · [🧭 Cómo funciona](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [⚙️ Opciones](#️-cli-options) · [🛰️ Proxies](#️-behind-a-proxy) · [🐞 Problemas](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>


---

## ✨ Por qué existe esto

Sideren (LayerX1) entrega a cada cuenta **$2 de crédito gratis** y su propia clave API, y ambas viven en la **cuenta** — así que la unidad útil es *una cuenta por clave*. La API en `api.sideren.io/v1` habla **ambos protocolos**, OpenAI (`/v1/chat/completions`) y Anthropic (`/v1/messages`), con la misma clave. Esta herramienta crea cuentas y claves mediante REST simple — sin navegador, sin buzón de correo.

## 🎁 Nivel gratuito — cuánto obtienes

**Cada cuenta nueva de Sideren recibe un crédito único de $2, otorgado del lado del servidor al registrarse — sin tarjeta, sin buzón de correo.**

| Qué | Valor |
| --- | --- |
| Crédito de bienvenida | **$2.00** por cuenta (`GET /v1/me` → `balance_usd: 2`, `plan: "free"`) — medido |
| Tarjeta requerida | **No** |
| Límite de velocidad | plan gratuito: primeros 3 días **15 req/min + 2 concurrentes**, luego **4 req/min + 1 concurrente** hasta comprar un plan |
| Límite de tokens | 600k tokens/mes, 50k de entrada / 4k de salida por llamada |
| Registro | REST: correo electrónico + contraseña (`POST /auth/v1/signup`) — sin código por correo, sin navegador |
| La unidad que escala | **una cuenta = una clave** → `--count N` en realidad significa "N cuentas gratuitas" |

**Cómo obtener más:** el crédito vive en la cuenta — una cuenta por clave, y `--count N` crea N cuentas, cada una con sus propios $2. Una clave creada responde `200` en `/v1/models`, `/v1/me` y una finalización de chat real, así que el crédito es gastable de inmediato (`trial.ends_at` es tres días después de la creación).

> 💡 El nivel gratuito lo define Sideren y puede cambiar. Consulta los números en vivo en [sideren.io](https://sideren.io) — y deja que la propia verificación de la herramienta decida:

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 Modelos — los 134

`GET /v1/models` devuelve **134 modelos** (ver [`models.json`](src/models.json)) y ambos protocolos son servidos por la misma clave. Ids destacados:

|Modelo|✓|
|---|---|
|`sdn-llama-3.3-70b`|✓|

Prueba en vivo de una clave:

```bash
curl https://api.sideren.io/v1/chat/completions \
  -H "Authorization: Bearer lx1_…" -H "Content-Type: application/json" \
  -d '{"model":"sdn-glm-5.3","messages":[{"role":"user","content":"hi"}]}'
```

## 🧪 Cómo usar la API

La URL base es **`https://api.sideren.io/v1`**; la misma clave también responde el protocolo Anthropic en `/v1/messages` (`x-api-key`).

**Protocolo OpenAI**

```python
from openai import OpenAI
client = OpenAI(base_url="https://api.sideren.io/v1", api_key="lx1_…")
print(client.chat.completions.create(model="sdn-glm-5.3",
      messages=[{"role": "user", "content": "hi"}]).choices[0].message.content)
```

**Protocolo Anthropic** (`/v1/messages`, `x-api-key`):

```bash
curl https://api.sideren.io/v1/messages \
  -H "x-api-key: lx1_…" -H "anthropic-version: 2023-06-01" \
  -H "Content-Type: application/json" \
  -d '{"model":"sdn-glm-5.3","max_tokens":16,"messages":[{"role":"user","content":"hi"}]}'
```

**Cualquier agente / herramienta con URL base personalizada** (Cursor, OpenCode, Kilo Code, …): URL base `https://api.sideren.io/v1`, pega una clave, elige cualquier id de modelo del catálogo.

## 🛠 Inicio rápido

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

Las herramientas leen `proxies.txt` desde la **raíz del repositorio** y también escriben `keys.txt`, `accounts.json` y `outputs/` allí. `keys.txt` (replicado en `%USERPROFILE%\sideren-keys.txt`) se escribe **solo** después de que una clave responde `GET /v1/models`, `GET /v1/me` y una finalización de chat real.

### 🖱️ El lanzador

El lanzador pide la lista de proxies y la cantidad, las recuerda en `launcher.config.json` y ejecuta el CLI con los flags correctos; `node src/launcher.js --connect-9router` registra las claves creadas en un 9Router local.

## ✅ Verificado y funcionando — cada clave es probada

| Comprobación | Resultado |
| --- | --- |
| `POST /auth/v1/signup` | **30/30 → 200** con un token de acceso (sesión usable de inmediato) |
| `POST /rest/v1/rpc/create_api_key` | **30/30 → 200** con una clave `lx1_…` |
| `GET /v1/models` + `GET /v1/me` | **30/30 → 200**, `plan: "free"`, `balance_usd: 2` por cuenta |
| `POST /v1/chat/completions` (protocolo OpenAI) | **200** con contenido real |
| `POST /v1/messages` (protocolo Anthropic, `x-api-key`) | **200**, `content: [{type:"text", text:"ok"}]`, `stop_reason: "end_turn"` |
| un barrido final de la lista entregada | **30/30 OK** |

```bash
node src/cli.js --verify-only    # models + balance + a chat call for every key
```

## 🧭 Cómo funciona

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: Sideren page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://api.sideren.io/v1/chat/completions → real content = the key is live
```

| Paso | Llamada | Notas |
| --- | --- | --- |
| cuenta | `POST https://data.sideren.io/auth/v1/signup {email,password}` | el backend de identidad responde con una sesión de inmediato |
| clave | `POST https://data.sideren.io/rest/v1/rpc/create_api_key {p_name}` (Bearer access token) | la misma RPC que llama el panel; devuelve `lx1_…` (alias `sdn_…`) |
| crédito | otorgado del lado del servidor al registrarse | `GET https://api.sideren.io/v1/me` → `balance_usd: 2`, `plan: "free"` |
| verificar | `GET /v1/models`, `GET /v1/me`, `POST /v1/chat/completions` | una clave se escribe en `keys.txt` solo después de que las tres responden |

## ⚙️ Opciones del CLI

```bash
node src/cli.js --count N        # mint N accounts (any N, default 30)
node src/cli.js --preset turbo   # run shape: turbo = 5 workers, balanced = 4, safe = 2
node src/cli.js --verify-only    # re-verify every key in keys.txt
node src/cli.js --help
```

| Variable de entorno | Predeterminado | Significado |
| --- | --- | --- |
| `SIDEREN_PROXIES` | `proxies.txt` | archivo del pool, un proxy por línea |
| `PIN_PROXY` | — | fija una única salida para cada llamada (p. ej. `socks5://127.0.0.1:40000`) |

Turbo önerilir (5); daha fazlası zayıf bilgisayarda yük/ban riski.

## 🛰️ Detrás de un proxy

El tráfico del proveedor pasa por tu pool (o un proxy fijado). El registro es una única llamada corta, así que una salida solo tiene que sobrevivir un ida y vuelta; la pasada de verificación es la ruta más larga y simplemente vuelve a elegir otra salida cuando una muere.

## 📄 Archivos

| Ruta | Contenido |
| --- | --- |
| `keys.txt` | una clave verificada por línea — ignorada por git, nunca comprometida |
| `accounts.json` | correo electrónico / contraseña / id de usuario / clave / registro de verificación por cuenta |
| [`models.json`](src/models.json) | el catálogo en vivo de 134 modelos |
| `outputs/` | resultados del barrido de verificación — ignorado por git |

## 🔌 Conectar con 9Router

[9Router](https://9router.com) es un router autoalojado y compatible con OpenAI. Un nodo `openai-compatible` para Sideren, una conexión por clave:

```bash
node src/connect-9router.js \
  --base http://localhost:20128 --password 123456 \
  --api-key <key>            # or env NINEROUTER_API_KEY
```

Predeterminados: base `http://localhost:20128`, contraseña `123456`, nodo `Sideren`, prefijo `sideren`, upstream `https://api.sideren.io/v1`, modelo predeterminado `@sdn/llama-3.3-70b`. Registra otra clave creada con `--name "<label 2>"` — cada clave se convierte en otra conexión sobre la que 9Router puede balancear la carga. Los modelos se sirven entonces como `sideren/<model id>`.

## 🔑 Qué te da una clave

| | |
| --- | --- |
| 🏢 Proveedor | **Sideren** — [sideren.io](https://sideren.io) · documentación de la API en [docs.layerx1.com](https://docs.layerx1.com) |
| 🎁 Qué da el proveedor | $2 de crédito gratis por cuenta — dos llamadas REST por clave, protocolos OpenAI + Anthropic |
| 🔑 Qué te da una clave | una clave API limitada a su propia cuenta: los ids de modelo del endpoint de abajo, con los límites de tu plan. La cuota vive en la **cuenta**, que es exactamente por lo que esta herramienta crea una cuenta por clave |
| 🌐 Forma de la API | Compatible con OpenAI: `POST https://api.sideren.io/v1/chat/completions` |
| 🔒 Tus datos | solo se contacta `data.sideren.io` (registro + RPC de clave) y `api.sideren.io` (inferencia); las claves permanecen en tu máquina |

## 🐞 Problemas

Si Sideren cambia su backend de identidad (configuración de registro, el nombre de la RPC, el prefijo de la clave), la herramienta se detiene en ese paso y lo indica. **[Abre un issue](../../issues)** con el comando que ejecutaste y la salida exacta; los PRs son bienvenidos.

## 📄 Licencia

MIT © 2026 — ver [LICENSE](LICENSE).

<div align="center">

**[MIT](LICENSE)** © 2026 sideren-bulk-apikey contributors

</div>