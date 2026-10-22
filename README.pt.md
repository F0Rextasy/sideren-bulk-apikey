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

**Crie em massa contas Sideren (sideren.io) com chaves de API geradas automaticamente — inferência compatível com OpenAI + conector 9Router.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-134%20served-412991?style=for-the-badge)](https://docs.layerx1.com)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6?style=for-the-badge)](#-connect-to-omniroute)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 Início rápido](#-quick-start) · [🎁 Camada gratuita](#-free-tier--how-much-you-get) · [🤖 Modelos](#-models--all-134-of-them) · [🧪 Use a API](#-how-to-use-the-api) · [✅ Verificado](#-verified-working--every-key-is-tested) · [🧭 Como funciona](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [⚙️ Opções](#️-cli-options) · [🛰️ Proxies](#️-behind-a-proxy) · [🐞 Problemas](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ Por que isso existe

A Sideren (LayerX1) dá a cada conta **$2 de crédito gratuito** e uma chave de API própria, e ambas ficam na **conta** — então a unidade útil é *uma conta por chave*. A API em `api.sideren.io/v1` fala **os dois protocolos**, OpenAI (`/v1/chat/completions`) e Anthropic (`/v1/messages`), com a mesma chave. Esta ferramenta cria contas e chaves via REST puro — sem navegador, sem caixa de e-mail.

## 🎁 Camada gratuita — quanto você recebe

**Toda nova conta Sideren recebe um crédito único de $2, concedido no servidor no momento do cadastro — sem cartão, sem caixa de e-mail.**

| O quê | Valor |
| --- | --- |
| Crédito de boas-vindas | **$2,00** por conta (`GET /v1/me` → `balance_usd: 2`, `plan: "free"`) — medido |
| Cartão exigido | **Não** |
| Limite de taxa | plano gratuito: primeiros 3 dias **15 req/min + 2 concorrentes**, depois **4 req/min + 1 concorrente** até a compra de um plano |
| Limite de tokens | 600 mil tokens/mês, 50 mil de entrada / 4 mil de saída por chamada |
| Cadastro | REST: e-mail + senha (`POST /auth/v1/signup`) — sem código por e-mail, sem navegador |
| A unidade que escala | **uma conta = uma chave** → `--count N` significa, na prática, "N contas gratuitas" |

**Como conseguir mais:** o crédito fica na conta — uma conta por chave, e `--count N` cria N contas, cada uma com seus próprios $2. Uma chave criada responde `200` em `/v1/models`, `/v1/me` e numa conclusão de chat real, então o crédito é utilizável imediatamente (`trial.ends_at` é três dias após a criação).

> 💡 A camada gratuita é definida pela Sideren e pode mudar. Confira os números atuais em [sideren.io](https://sideren.io) — e deixe o próprio filtro da ferramenta decidir:

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 Modelos — todos os 134

`GET /v1/models` retorna **134 modelos** (veja [`models.json`](src/models.json)) e ambos os protocolos são servidos pela mesma chave; os 5 ids abaixo responderam a uma chamada de chat real com `200` em 2026-10-19:

|Modelo|✓|
|---|---|
|`@sdn/deepseek-v4.1-flash`|✓|
|`@sdn/gpt-oss-120b`|✓|
|`@sdn/deepseek-v4.1-flash-1017`|✓|
|`@sdn/devstral-2-123b`|✓|
|`@sdn/kimi-k2.5`|✓|

O catálogo contém **134 ids**; o **plano Free** cobre estes cinco modelos — todo o resto responde `not in the Free plan` (requer Starter/Pro).

Teste ao vivo de uma chave:

```bash
curl https://api.sideren.io/v1/chat/completions \
  -H "Authorization: Bearer lx1_…" -H "Content-Type: application/json" \
  -d '{"model":"sdn-glm-5.3","messages":[{"role":"user","content":"hi"}]}'
```

## 🧪 Como usar a API

A URL base é **`https://api.sideren.io/v1`**; a mesma chave também atende o protocolo Anthropic em `/v1/messages` (`x-api-key`).

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

**Qualquer agente / ferramenta com URL base personalizada** (Cursor, OpenCode, Kilo Code, …): URL base `https://api.sideren.io/v1`, cole uma chave, escolha qualquer id de modelo do catálogo.

## 🛠 Início rápido

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

As ferramentas leem `proxies.txt` da **raiz do repositório** e também gravam ali `keys.txt`, `accounts.json` e `outputs/`. O `keys.txt` (espelhado em `%USERPROFILE%\sideren-keys.txt`) é gravado **somente** depois que uma chave responde a `GET /v1/models`, `GET /v1/me` e a uma conclusão de chat real.

### 🖱️ O launcher

O launcher pede a lista de proxies e a quantidade, memoriza tudo em `launcher.config.json` e executa a CLI com as flags corretas; `node src/launcher.js --connect-9router` registra as chaves criadas num 9Router local.

## ✅ Verificado funcionando — toda chave é testada

| Verificação | Resultado |
| --- | --- |
| `POST /auth/v1/signup` | **30/30 → 200** com um token de acesso (sessão utilizável imediatamente) |
| `POST /rest/v1/rpc/create_api_key` | **30/30 → 200** com uma chave `lx1_…` |
| `GET /v1/models` + `GET /v1/me` | **30/30 → 200**, `plan: "free"`, `balance_usd: 2` por conta |
| `POST /v1/chat/completions` (protocolo OpenAI) | **200** com conteúdo real |
| `POST /v1/messages` (protocolo Anthropic, `x-api-key`) | **200**, `content: [{type:"text", text:"ok"}]`, `stop_reason: "end_turn"` |
| uma varredura final da lista entregue | **30/30 OK** |

```bash
node src/cli.js --verify-only    # models + balance + a chat call for every key
```

## 🧭 Como funciona

```

inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: Sideren page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://api.sideren.io/v1/chat/completions → real content = the key is live
```

| Etapa | Chamada | Observações |
| --- | --- | --- |
| conta | `POST https://data.sideren.io/auth/v1/signup {email,password}` | o backend de identidade responde com uma sessão imediatamente |
| chave | `POST https://data.sideren.io/rest/v1/rpc/create_api_key {p_name}` (Bearer access token) | o mesmo RPC que o painel chama; retorna `lx1_…` (alias `sdn_…`) |
| crédito | concedido no servidor no cadastro | `GET https://api.sideren.io/v1/me` → `balance_usd: 2`, `plan: "free"` |
| verificação | `GET /v1/models`, `GET /v1/me`, `POST /v1/chat/completions` | uma chave só é gravada em `keys.txt` depois que as três respondem |

## ⚙️ Opções da CLI

```bash
node src/cli.js --count N        # mint N accounts (any N, default 30)
node src/cli.js --preset turbo   # run shape: turbo = 5 workers, balanced = 4, safe = 2
node src/cli.js --verify-only    # re-verify every key in keys.txt
node src/cli.js --help
```

| Variável de ambiente | Padrão | Significado |
| --- | --- | --- |
| `SIDEREN_PROXIES` | `proxies.txt` | arquivo do pool, um proxy por linha |
| `PIN_PROXY` | — | fixa uma única saída para todas as chamadas (ex.: `socks5://127.0.0.1:40000`) |

O modo turbo é recomendado (5); mais do que isso é risco de carga/ban em computadores fracos.

## 🛰️ Atrás de um proxy

O tráfego ao provedor passa pelo seu pool (ou por um proxy fixado). O cadastro é uma única chamada curta, então uma saída só precisa sobreviver a um round-trip; a etapa de verificação é o caminho mais longo e simplesmente escolhe outra saída quando uma morre.

## 📄 Arquivos

| Caminho | Conteúdo |
| --- | --- |
| `keys.txt` | uma chave verificada por linha — ignorado pelo git, nunca commitado |
| `accounts.json` | e-mail / senha / id de usuário / chave / registro de verificação por conta |
| [`models.json`](src/models.json) | o catálogo ao vivo de 134 modelos |
| `outputs/` | resultados da varredura de verificação — ignorado pelo git |

## 🔌 Conectar ao 9Router

O [9Router](https://9router.com) é um roteador auto-hospedado e compatível com OpenAI. Um nó `openai-compatible` para a Sideren, uma conexão por chave:

```bash
node src/connect-9router.js \
  --base http://localhost:20128 --password 123456 \
  --api-key <key>            # or env NINEROUTER_API_KEY
```

Padrões: base `http://localhost:20128`, senha `123456`, nó `Sideren`, prefixo `sideren`, upstream `https://api.sideren.io/v1`, modelo padrão `@sdn/llama-3.3-70b`. Registre outra chave criada com `--name "<label 2>"` — cada chave vira mais uma conexão pela qual o 9Router pode balancear a carga. Os modelos passam a ser servidos como `sideren/<model id>`.

## 🔌 Conectar ao OmniRoute

O [OmniRoute](https://omniroute.online) é um roteador auto-hospedado e compatível com OpenAI. Um nó `openai-compatible` para a Sideren, uma conexão por chave:

```bash
node src/connect-omniroute.js \
  --base http://localhost:20128 --password 123456 \
  --api-key <key>            # or env NINEROUTER_API_KEY
```

Padrões: base `http://localhost:20128`, senha `123456`, nó `Sideren`, prefixo `sideren`, upstream `https://api.sideren.io/v1`, modelo padrão `@sdn/llama-3.3-70b`. Registre outra chave criada com `--name "<label 2>"` — cada chave vira mais uma conexão pela qual o OmniRoute pode balancear a carga. Os modelos passam a ser servidos como `sideren/<model id>`.
## 🔑 O que uma chave oferece

| | |
| --- | --- |
| 🏢 Provedor | **Sideren** — [sideren.io](https://sideren.io) · Documentação da API em [docs.layerx1.com](https://docs.layerx1.com) |
| 🎁 O que o provedor dá | $2 de crédito gratuito por conta — duas chamadas REST por chave, protocolos OpenAI + Anthropic |
| 🔑 O que uma chave oferece | uma chave de API vinculada à sua própria conta: os ids de modelo no endpoint abaixo, nos limites do seu plano. A cota fica na **conta**, e é exatamente por isso que esta ferramenta cria uma conta por chave |
| 🌐 Formato da API | compatível com OpenAI: `POST https://api.sideren.io/v1/chat/completions` |
| 🔒 Seus dados | apenas `data.sideren.io` (cadastro + RPC de chave) e `api.sideren.io` (inferência) são contatados; as chaves ficam na sua máquina |

## 🐞 Problemas

Se a Sideren mudar seu backend de identidade (configurações de cadastro, o nome do RPC, o prefixo da chave), a ferramenta para nessa etapa e avisa. **[Abra uma issue](../../issues)** com o comando que você executou e a saída exata; PRs são bem-vindos.

## 📄 Licença

MIT © 2026 — veja [LICENSE](LICENSE).

<div align="center">

**[MIT](LICENSE)** © 2026 sideren-bulk-apikey contributors

</div>