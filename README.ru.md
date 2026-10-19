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

**Массовое создание аккаунтов Sideren (sideren.io) с автоматически сгенерированными API-ключами — OpenAI-совместимый инференс + коннектор 9Router.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Зависимости](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![Лицензия](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Модели](https://img.shields.io/badge/models-134%20served-412991?style=for-the-badge)](https://docs.layerx1.com)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 Быстрый старт](#-quick-start) · [🎁 Бесплатный тариф](#-free-tier--how-much-you-get) · [🤖 Модели](#-models--all-134-of-them) · [🧪 Использование API](#-how-to-use-the-api) · [✅ Проверено](#-verified-working--every-key-is-tested) · [🧭 Как это работает](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [⚙️ Параметры](#️-cli-options) · [🛰️ Прокси](#️-behind-a-proxy) · [🐞 Проблемы](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ Зачем это нужно

Sideren (LayerX1) выдаёт каждому аккаунту **$2 бесплатного кредита** и собственный API-ключ, и то и другое привязано к **аккаунту** — поэтому полезная единица — *один аккаунт на ключ*. API по адресу `api.sideren.io/v1` поддерживает **оба протокола**, OpenAI (`/v1/chat/completions`) и Anthropic (`/v1/messages`), с одним и тем же ключом. Этот инструмент создаёт аккаунты и ключи через обычный REST — без браузера и без почтового ящика.

## 🎁 Бесплатный тариф — сколько вы получаете

**Каждый новый аккаунт Sideren получает разовый кредит $2, начисляемый на стороне сервера при регистрации — без карты и без почтового ящика.**

| Что | Значение |
| --- | --- |
| Приветственный кредит | **$2.00** на аккаунт (`GET /v1/me` → `balance_usd: 2`, `plan: "free"`) — измерено |
| Требуется карта | **Нет** |
| Ограничение частоты | бесплатный тариф: первые 3 дня **15 запросов/мин + 2 одновременно**, затем **4 запроса/мин + 1 одновременно**, пока не куплен тариф |
| Лимит токенов | 600 тыс. токенов/месяц, 50 тыс. входных / 4 тыс. выходных на вызов |
| Регистрация | REST: e-mail + пароль (`POST /auth/v1/signup`) — без кода на e-mail, без браузера |
| Единица масштабирования | **один аккаунт = один ключ** → `--count N` — это фактически "N бесплатных аккаунтов" |

**Как получить больше:** кредит привязан к аккаунту — один аккаунт на ключ, а `--count N` создаёт N аккаунтов, каждый со своими $2. Созданный ключ отвечает `200` на `/v1/models`, `/v1/me` и на реальный запрос чата, поэтому кредит можно тратить сразу (`trial.ends_at` — через три дня после создания).

> 💡 Бесплатный тариф устанавливается Sideren и может измениться. Проверяйте актуальные цифры на [sideren.io](https://sideren.io) — и пусть решение принимает собственная проверка инструмента:

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 Модели — все 134

`GET /v1/models` возвращает **134 модели** (см. [`models.json`](src/models.json)), и оба протокола обслуживаются одним и тем же ключом; 5 идентификаторов ниже ответили `200` на реальный запрос чата 2026-10-19:

|Модель|✓|
|---|---|
|`@sdn/deepseek-v4.1-flash`|✓|
|`@sdn/gpt-oss-120b`|✓|
|`@sdn/deepseek-v4.1-flash-1017`|✓|
|`@sdn/devstral-2-123b`|✓|
|`@sdn/kimi-k2.5`|✓|

Каталог содержит **134 идентификатора**; **Бесплатный тариф** покрывает эти пять моделей — всё остальное отвечает `not in the Free plan` (требуется Starter/Pro).

Живая проверка одного ключа:

```bash
curl https://api.sideren.io/v1/chat/completions \
  -H "Authorization: Bearer lx1_…" -H "Content-Type: application/json" \
  -d '{"model":"sdn-glm-5.3","messages":[{"role":"user","content":"hi"}]}'
```

## 🧪 Как использовать API

Базовый URL — **`https://api.sideren.io/v1`**; тот же ключ также отвечает по протоколу Anthropic на `/v1/messages` (`x-api-key`).

**Протокол OpenAI**

```python
from openai import OpenAI
client = OpenAI(base_url="https://api.sideren.io/v1", api_key="lx1_…")
print(client.chat.completions.create(model="sdn-glm-5.3",
      messages=[{"role": "user", "content": "hi"}]).choices[0].message.content)
```

**Протокол Anthropic** (`/v1/messages`, `x-api-key`):

```bash
curl https://api.sideren.io/v1/messages \
  -H "x-api-key: lx1_…" -H "anthropic-version: 2023-06-01" \
  -H "Content-Type: application/json" \
  -d '{"model":"sdn-glm-5.3","max_tokens":16,"messages":[{"role":"user","content":"hi"}]}'
```

**Любой агент / инструмент с настраиваемым базовым URL** (Cursor, OpenCode, Kilo Code, …): базовый URL `https://api.sideren.io/v1`, вставьте ключ, выберите любой id модели из каталога.

## 🛠 Быстрый старт

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

Инструменты читают `proxies.txt` из **корня репозитория** и также записывают туда `keys.txt`, `accounts.json` и `outputs/`. `keys.txt` (дублируется в `%USERPROFILE%\sideren-keys.txt`) записывается **только** после того, как ключ отвечает на `GET /v1/models`, `GET /v1/me` и реальный запрос чата.

### 🖱️ Лаунчер

Лаунчер запрашивает список прокси и количество, запоминает их в `launcher.config.json` и запускает CLI с нужными флагами; `node src/launcher.js --connect-9router` регистрирует созданные ключи в локальном 9Router.

## ✅ Проверено — каждый ключ протестирован

| Проверка | Результат |
| --- | --- |
| `POST /auth/v1/signup` | **30/30 → 200** с токеном доступа (сессия сразу пригодна к использованию) |
| `POST /rest/v1/rpc/create_api_key` | **30/30 → 200** с ключом `lx1_…` |
| `GET /v1/models` + `GET /v1/me` | **30/30 → 200**, `plan: "free"`, `balance_usd: 2` на аккаунт |
| `POST /v1/chat/completions` (протокол OpenAI) | **200** с реальным содержимым |
| `POST /v1/messages` (протокол Anthropic, `x-api-key`) | **200**, `content: [{type:"text", text:"ok"}]`, `stop_reason: "end_turn"` |
| финальная проверка отправленного списка | **30/30 OK** |

```bash
node src/cli.js --verify-only    # models + balance + a chat call for every key
```

## 🧭 Как это работает

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: Sideren page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://api.sideren.io/v1/chat/completions → real content = the key is live
```

| Шаг | Вызов | Примечания |
| --- | --- | --- |
| аккаунт | `POST https://data.sideren.io/auth/v1/signup {email,password}` | бэкенд идентификации сразу отвечает сессией |
| ключ | `POST https://data.sideren.io/rest/v1/rpc/create_api_key {p_name}` (Bearer токен доступа) | тот же RPC, который вызывает панель; возвращает `lx1_…` (алиас `sdn_…`) |
| кредит | начисляется на стороне сервера при регистрации | `GET https://api.sideren.io/v1/me` → `balance_usd: 2`, `plan: "free"` |
| проверка | `GET /v1/models`, `GET /v1/me`, `POST /v1/chat/completions` | ключ записывается в `keys.txt` только после ответа всех трёх |

## ⚙️ Параметры CLI

```bash
node src/cli.js --count N        # mint N accounts (any N, default 30)
node src/cli.js --preset turbo   # run shape: turbo = 5 workers, balanced = 4, safe = 2
node src/cli.js --verify-only    # re-verify every key in keys.txt
node src/cli.js --help
```

| Переменная окружения | По умолчанию | Значение |
| --- | --- | --- |
| `SIDEREN_PROXIES` | `proxies.txt` | файл пула, один прокси на строку |
| `PIN_PROXY` | — | закрепить один выход для каждого вызова (например, `socks5://127.0.0.1:40000`) |

Рекомендуется Turbo (5); больше — риск нагрузки/бана на слабом компьютере.

## 🛰️ Через прокси

Трафик к провайдеру идёт через ваш пул (или закреплённый прокси). Регистрация — один короткий вызов, поэтому выходу достаточно пережить один обмен; проверка — более длинный путь, и при отказе одного выхода просто выбирается другой.

## 📄 Файлы

| Путь | Содержимое |
| --- | --- |
| `keys.txt` | один проверенный ключ на строку — игнорируется git, никогда не коммитится |
| `accounts.json` | e-mail / пароль / user id / ключ / запись проверки для каждого аккаунта |
| [`models.json`](src/models.json) | актуальный каталог из 134 моделей |
| `outputs/` | результаты проверочного прогона — игнорируется git |

## 🔌 Подключение к 9Router

[9Router](https://9router.com) — это self-hosted роутер, совместимый с OpenAI. Один узел `openai-compatible` для Sideren, одно подключение на ключ:

```bash
node src/connect-9router.js \
  --base http://localhost:20128 --password 123456 \
  --api-key <key>            # or env NINEROUTER_API_KEY
```

По умолчанию: base `http://localhost:20128`, пароль `123456`, узел `Sideren`, префикс `sideren`, upstream `https://api.sideren.io/v1`, модель по умолчанию `@sdn/llama-3.3-70b`. Зарегистрируйте ещё один созданный ключ с помощью `--name "<label 2>"` — каждый ключ становится отдельным подключением, между которыми 9Router может балансировать нагрузку. Модели затем обслуживаются как `sideren/<model id>`.

## 🔑 Что даёт один ключ

| | |
| --- | --- |
| 🏢 Провайдер | **Sideren** — [sideren.io](https://sideren.io) · документация API на [docs.layerx1.com](https://docs.layerx1.com) |
| 🎁 Что даёт провайдер | бесплатный кредит $2 на аккаунт — два REST-вызова на ключ, протоколы OpenAI + Anthropic |
| 🔑 Что даёт один ключ | один API-ключ, привязанный к собственному аккаунту: идентификаторы моделей на указанном ниже эндпоинте, в пределах лимитов вашего тарифа. Квота привязана к **аккаунту**, именно поэтому этот инструмент создаёт один аккаунт на ключ |
| 🌐 Формат API | совместим с OpenAI: `POST https://api.sideren.io/v1/chat/completions` |
| 🔒 Ваши данные | запросы идут только к `data.sideren.io` (регистрация + RPC для ключей) и `api.sideren.io` (инференс); ключи остаются на вашей машине |

## 🐞 Проблемы

Если Sideren изменит бэкенд идентификации (настройки регистрации, имя RPC, префикс ключа), инструмент остановится на этом шаге и сообщит об этом. **[Откройте issue](../../issues)** с командой, которую вы запускали, и точным выводом; PR приветствуются.

## 📄 Лицензия

MIT © 2026 — см. [LICENSE](LICENSE).

<div align="center">

**[MIT](LICENSE)** © 2026 участники sideren-bulk-apikey

</div>