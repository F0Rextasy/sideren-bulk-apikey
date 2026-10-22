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

**자동 생성된 API 키로 Sideren(sideren.io) 계정을 대량 생성 — OpenAI 호환 추론 + 9Router 커넥터.**

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

## ✨ 이 도구가 존재하는 이유

Sideren(LayerX1)은 모든 계정에 **$2 무료 크레딧**과 해당 계정 전용 API 키를 지급하며, 둘 다 **계정**에 귀속됩니다 — 따라서 실질적인 단위는 *키 하나당 계정 하나*입니다. `api.sideren.io/v1`의 API는 동일한 키로 OpenAI(`/v1/chat/completions`)와 Anthropic(`/v1/messages`) **두 프로토콜을 모두** 지원합니다. 이 도구는 브라우저도, 메일함도 없이 순수 REST만으로 계정과 키를 생성합니다.

## 🎁 무료 티어 — 얼마나 받을 수 있나

**모든 신규 Sideren 계정은 가입 시 서버 측에서 일회성 $2 크레딧을 받습니다 — 카드도, 메일함도 필요 없습니다.**

| 항목 | 값 |
| --- | --- |
| 웰컴 크레딧 | 계정당 **$2.00** (`GET /v1/me` → `balance_usd: 2`, `plan: "free"`) — 실측 |
| 카드 필요 | **아니오** |
| 속도 제한 | 무료 플랜: 최초 3일은 **분당 15회 + 동시 2개**, 이후 플랜 구매 전까지 **분당 4회 + 동시 1개** |
| 토큰 한도 | 월 600k 토큰, 호출당 입력 50k / 출력 4k |
| 가입 | REST: 이메일 + 비밀번호 (`POST /auth/v1/signup`) — 이메일 인증 코드 없음, 브라우저 없음 |
| 확장 단위 | **계정 하나 = 키 하나** → `--count N`은 사실상 "무료 계정 N개" |

**더 얻는 방법:** 크레딧은 계정에 귀속됩니다 — 키 하나당 계정 하나이며, `--count N`은 각각 $2씩 가진 계정 N개를 생성합니다. 생성된 키는 `/v1/models`, `/v1/me` 및 실제 채팅 완료 요청에 `200`으로 응답하므로 크레딧은 즉시 사용할 수 있습니다 (`trial.ends_at`은 생성 후 3일).

> 💡 무료 티어는 Sideren이 정하며 변경될 수 있습니다. 실시간 수치는 [sideren.io](https://sideren.io)에서 확인하세요 — 그리고 도구 자체의 검증에 맡기세요:

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 모델 — 총 134개

`GET /v1/models`는 **134개 모델**을 반환하며([`models.json`](src/models.json) 참조), 두 프로토콜 모두 같은 키로 제공됩니다. 아래 5개 id는 2026-10-19에 실제 채팅 호출에 `200`으로 응답했습니다:

|모델|✓|
|---|---|
|`@sdn/deepseek-v4.1-flash`|✓|
|`@sdn/gpt-oss-120b`|✓|
|`@sdn/deepseek-v4.1-flash-1017`|✓|
|`@sdn/devstral-2-123b`|✓|
|`@sdn/kimi-k2.5`|✓|

카탈로그에는 **134개 id**가 있으며, **무료 플랜**은 이 다섯 모델만 지원합니다 — 나머지는 모두 `not in the Free plan`으로 응답합니다(Starter/Pro 필요).

키 하나에 대한 실시간 확인:

```bash
curl https://api.sideren.io/v1/chat/completions \
  -H "Authorization: Bearer lx1_…" -H "Content-Type: application/json" \
  -d '{"model":"sdn-glm-5.3","messages":[{"role":"user","content":"hi"}]}'
```

## 🧪 API 사용 방법

베이스 URL은 **`https://api.sideren.io/v1`**이며, 같은 키로 `/v1/messages`(`x-api-key`)의 Anthropic 프로토콜에도 응답합니다.

**OpenAI 프로토콜**

```python
from openai import OpenAI
client = OpenAI(base_url="https://api.sideren.io/v1", api_key="lx1_…")
print(client.chat.completions.create(model="sdn-glm-5.3",
      messages=[{"role": "user", "content": "hi"}]).choices[0].message.content)
```

**Anthropic 프로토콜** (`/v1/messages`, `x-api-key`):

```bash
curl https://api.sideren.io/v1/messages \
  -H "x-api-key: lx1_…" -H "anthropic-version: 2023-06-01" \
  -H "Content-Type: application/json" \
  -d '{"model":"sdn-glm-5.3","max_tokens":16,"messages":[{"role":"user","content":"hi"}]}'
```

**커스텀 베이스 URL을 지원하는 모든 에이전트 / 도구** (Cursor, OpenCode, Kilo Code, …): 베이스 URL `https://api.sideren.io/v1`, 키 붙여넣기, 카탈로그에서 원하는 모델 id 선택.

## 🛠 빠른 시작

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

도구들은 **저장소 루트**에서 `proxies.txt`를 읽고, 같은 위치에 `keys.txt`, `accounts.json`, `outputs/`를 씁니다. `keys.txt`(`%USERPROFILE%\sideren-keys.txt`에도 미러링됨)는 키가 `GET /v1/models`, `GET /v1/me` 및 실제 채팅 완료에 응답한 **뒤에만** 기록됩니다.

### 🖱️ 런처

런처는 프록시 목록과 개수를 물어보고 이를 `launcher.config.json`에 기억한 뒤, 올바른 플래그로 CLI를 실행합니다. `node src/launcher.js --connect-9router`는 생성된 키를 로컬 9Router에 등록합니다.

## ✅ 검증 완료 — 모든 키가 테스트됨

| 검사 | 결과 |
| --- | --- |
| `POST /auth/v1/signup` | **30/30 → 200**, 액세스 토큰 포함 (세션 즉시 사용 가능) |
| `POST /rest/v1/rpc/create_api_key` | **30/30 → 200**, `lx1_…` 키 반환 |
| `GET /v1/models` + `GET /v1/me` | **30/30 → 200**, 계정당 `plan: "free"`, `balance_usd: 2` |
| `POST /v1/chat/completions` (OpenAI 프로토콜) | **200**, 실제 콘텐츠 반환 |
| `POST /v1/messages` (Anthropic 프로토콜, `x-api-key`) | **200**, `content: [{type:"text", text:"ok"}]`, `stop_reason: "end_turn"` |
| 배포된 목록 최종 점검 | **30/30 OK** |

```bash
node src/cli.js --verify-only    # models + balance + a chat call for every key
```

## 🧭 작동 방식

```

inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: Sideren page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://api.sideren.io/v1/chat/completions → real content = the key is live
```

| 단계 | 호출 | 비고 |
| --- | --- | --- |
| 계정 | `POST https://data.sideren.io/auth/v1/signup {email,password}` | 아이덴티티 백엔드가 즉시 세션과 함께 응답 |
| 키 | `POST https://data.sideren.io/rest/v1/rpc/create_api_key {p_name}` (Bearer 액세스 토큰) | 패널이 호출하는 것과 동일한 RPC; `lx1_…` 반환 (별칭 `sdn_…`) |
| 크레딧 | 가입 시 서버 측에서 지급 | `GET https://api.sideren.io/v1/me` → `balance_usd: 2`, `plan: "free"` |
| 검증 | `GET /v1/models`, `GET /v1/me`, `POST /v1/chat/completions` | 세 가지 모두 응답한 뒤에만 키가 `keys.txt`에 기록됨 |

## ⚙️ CLI 옵션

```bash
node src/cli.js --count N        # mint N accounts (any N, default 30)
node src/cli.js --preset turbo   # run shape: turbo = 5 workers, balanced = 4, safe = 2
node src/cli.js --verify-only    # re-verify every key in keys.txt
node src/cli.js --help
```

| 환경 변수 | 기본값 | 의미 |
| --- | --- | --- |
| `SIDEREN_PROXIES` | `proxies.txt` | 프록시 풀 파일, 한 줄에 하나 |
| `PIN_PROXY` | — | 모든 호출에 단일 출구 고정 (예: `socks5://127.0.0.1:40000`) |

터보(5)를 권장합니다. 그 이상은 성능이 낮은 컴퓨터에서 부하/차단 위험이 있습니다.

## 🛰️ 프록시 뒤에서

제공자 트래픽은 사용자의 프록시 풀(또는 고정 프록시)을 통과합니다. 가입은 짧은 호출 하나이므로 출구가 왕복 한 번만 버티면 되고, 검증 단계는 더 긴 경로이므로 하나가 죽으면 그냥 다른 출구를 다시 고릅니다.

## 📄 파일

| 경로 | 내용 |
| --- | --- |
| `keys.txt` | 검증된 키가 한 줄에 하나씩 — git 무시 대상, 절대 커밋되지 않음 |
| `accounts.json` | 계정별 이메일 / 비밀번호 / 사용자 id / 키 / 검증 기록 |
| [`models.json`](src/models.json) | 실시간 134개 모델 카탈로그 |
| `outputs/` | 검증 점검 결과 — git 무시 대상 |

## 🔌 9Router 연결

[9Router](https://9router.com)는 자체 호스팅, OpenAI 호환 라우터입니다. Sideren용 `openai-compatible` 노드 하나에, 키마다 연결 하나:

```bash
node src/connect-9router.js \
  --base http://localhost:20128 --password 123456 \
  --api-key <key>            # or env NINEROUTER_API_KEY
```

기본값: base `http://localhost:20128`, password `123456`, node `Sideren`, prefix `sideren`, upstream `https://api.sideren.io/v1`, 기본 모델 `@sdn/llama-3.3-70b`. `--name "<label 2>"`로 생성된 다른 키를 등록하세요 — 키마다 9Router가 부하 분산할 수 있는 또 하나의 연결이 됩니다. 모델은 이후 `sideren/<model id>`로 제공됩니다.

## 🔑 키 하나로 얻는 것

| | |
| --- | --- |
| 🏢 제공자 | **Sideren** — [sideren.io](https://sideren.io) · API 문서: [docs.layerx1.com](https://docs.layerx1.com) |
| 🎁 제공자가 주는 것 | 계정당 $2 무료 크레딧 — 키당 REST 호출 두 번, OpenAI + Anthropic 프로토콜 |
| 🔑 키 하나로 얻는 것 | 자기 계정에 한정된 API 키 하나: 아래 엔드포인트의 모델 id들을 플랜 한도 내에서. 할당량은 **계정**에 있으므로, 이 도구가 키마다 계정 하나를 만드는 것입니다 |
| 🌐 API 형태 | OpenAI 호환: `POST https://api.sideren.io/v1/chat/completions` |
| 🔒 데이터 | `data.sideren.io`(가입 + 키 RPC)와 `api.sideren.io`(추론)에만 접속하며, 키는 사용자 컴퓨터에 남습니다 |

## 🐞 이슈

Sideren이 아이덴티티 백엔드(가입 설정, RPC 이름, 키 접두사)를 변경하면, 도구는 해당 단계에서 멈추고 그 사실을 알려줍니다. 실행한 명령과 정확한 출력을 포함해 **[이슈를 열어주세요](../../issues)**; PR도 환영합니다.

## 📄 라이선스

MIT © 2026 — [LICENSE](LICENSE) 참조.

<div align="center">

**[MIT](LICENSE)** © 2026 sideren-bulk-apikey 기여자

</div>