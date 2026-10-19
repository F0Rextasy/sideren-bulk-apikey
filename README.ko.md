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

**자동 생성 API 키로 Sideren(sideren.io) 계정을 대량 생성 — OpenAI 호환 추론 + 9Router 커넥터.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-134%20served-412991?style=for-the-badge)](https://docs.layerx1.com)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 빠른 시작](#-quick-start) · [🎁 무료 티어](#-free-tier--how-much-you-get) · [🤖 모델](#-models--all-134-of-them) · [🧪 API 사용](#-how-to-use-the-api) · [✅ 검증됨](#-verified-working--every-key-is-tested) · [🧭 작동 방식](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [⚙️ 옵션](#️-cli-options) · [🛰️ 프록시](#️-behind-a-proxy) · [🐞 이슈](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ 이 도구가 필요한 이유

Sideren(LayerX1)은 모든 계정에 **$2 무료 크레딧**과 자체 API 키를 제공하며, 둘 다 **계정**에 존재합니다 — 따라서 유용한 단위는 *키당 계정 하나*입니다. `api.sideren.io/v1`의 API는 동일한 키로 OpenAI(`/v1/chat/completions`)와 Anthropic(`/v1/messages`) **두 프로토콜 모두**를 지원합니다. 이 도구는 일반 REST를 통해 계정과 키를 생성합니다 — 브라우저도, 메일함도 필요 없습니다.

## 🎁 무료 티어 — 얼마나 받을 수 있나

**모든 새 Sideren 계정은 가입 시 서버 측에서 지급되는 1회성 $2 크레딧을 받습니다 — 카드도, 메일함도 필요 없습니다.**

| 항목 | 값 |
| --- | --- |
| 웰컴 크레딧 | 계정당 **$2.00** (`GET /v1/me` → `balance_usd: 2`, `plan: "free"`) — 측정됨 |
| 카드 필요 | **아니요** |
| 속도 제한 | 무료 플랜: 처음 3일은 **15 요청/분 + 동시 2개**, 이후 플랜 구매 전까지 **4 요청/분 + 동시 1개** |
| 토큰 한도 | 월 600k 토큰, 호출당 입력 50k / 출력 4k |
| 가입 | REST: 이메일 + 비밀번호 (`POST /auth/v1/signup`) — 이메일 코드 없음, 브라우저 없음 |
| 확장 단위 | **계정 하나 = 키 하나** → `--count N`은 사실상 "무료 계정 N개" |

**더 얻는 방법:** 크레딧은 계정에 있습니다 — 키당 계정 하나이며, `--count N`은 각각 자체 $2를 가진 N개 계정을 생성합니다. 발급된 키는 `/v1/models`, `/v1/me` 및 실제 채팅 완료에서 `200`으로 응답하므로 크레딧은 즉시 사용 가능합니다(`trial.ends_at`은 생성 후 3일입니다).

> 💡 무료 티어는 Sideren이 정하며 변경될 수 있습니다. 실시간 수치는 [sideren.io](https://sideren.io)에서 확인하세요 — 그리고 도구 자체의 게이트가 판단하게 하세요:

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 모델 — 전체 134개

`GET /v1/models`는 **134개 모델**을 반환하며([`models.json`](src/models.json) 참조), 두 프로토콜 모두 동일한 키로 제공됩니다. 대표 ID:

|모델|✓|
|---|---|
|`@sdn/deepseek-v4.1-flash`|✓|
|`@sdn/gpt-oss-120b`|✓|

카탈로그에는 **134개 ID**가 있으며, **무료 플랜**은 이 두 모델을 포함합니다 — 나머지는 모두 `not in the Free plan`으로 응답합니다(Starter/Pro 필요).

키 하나의 실시간 점검:

```bash
curl https://api.sideren.io/v1/chat/completions \
  -H "Authorization: Bearer lx1_…" -H "Content-Type: application/json" \
  -d '{"model":"sdn-glm-5.3","messages":[{"role":"user","content":"hi"}]}'
```

## 🧪 API 사용 방법

기본 URL은 **`https://api.sideren.io/v1`**이며, 동일한 키가 `/v1/messages`(`x-api-key`)의 Anthropic 프로토콜에도 응답합니다.

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

**사용자 지정 기본 URL을 쓰는 모든 에이전트/도구** (Cursor, OpenCode, Kilo Code, …): 기본 URL `https://api.sideren.io/v1`, 키 붙여넣기, 카탈로그에서 아무 모델 ID나 선택.

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

도구는 **저장소 루트**에서 `proxies.txt`를 읽고 `keys.txt`, `accounts.json` 및 `outputs/`도 그곳에 씁니다. `keys.txt`(`%USERPROFILE%\sideren-keys.txt`로 미러링됨)는 키가 `GET /v1/models`, `GET /v1/me` 및 실제 채팅 완료에 응답한 뒤에만 기록됩니다.

### 🖱️ 런처

런처는 프록시 목록과 개수를 묻고, 이를 `launcher.config.json`에 기억한 뒤 올바른 플래그로 CLI를 실행합니다. `node src/launcher.js --connect-9router`는 발급된 키를 로컬 9Router에 등록합니다.

## ✅ 작동 검증됨 — 모든 키가 테스트됩니다

| 확인 | 결과 |
| --- | --- |
| `POST /auth/v1/signup` | 액세스 토큰 포함 **30/30 → 200**(세션 즉시 사용 가능) |
| `POST /rest/v1/rpc/create_api_key` | `lx1_…` 키 포함 **30/30 → 200** |
| `GET /v1/models` + `GET /v1/me` | **30/30 → 200**, 계정당 `plan: "free"`, `balance_usd: 2` |
| `POST /v1/chat/completions` (OpenAI 프로토콜) | 실제 콘텐츠 포함 **200** |
| `POST /v1/messages` (Anthropic 프로토콜, `x-api-key`) | **200**, `content: [{type:"text", text:"ok"}]`, `stop_reason: "end_turn"` |
| 배포 목록 최종 점검 | **30/30 OK** |

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
| 계정 | `POST https://data.sideren.io/auth/v1/signup {email,password}` | 인증 백엔드가 즉시 세션으로 응답 |
| 키 | `POST https://data.sideren.io/rest/v1/rpc/create_api_key {p_name}` (Bearer 액세스 토큰) | 패널이 호출하는 것과 동일한 RPC; `lx1_…` 반환(별칭 `sdn_…`) |
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
| `SIDEREN_PROXIES` | `proxies.txt` | 풀 파일, 한 줄에 프록시 하나 |
| `PIN_PROXY` | — | 모든 호출에 단일 이그레스 고정(예: `socks5://127.0.0.1:40000`) |

터보(5)를 권장합니다. 더 많이 설정하면 약한 컴퓨터에서 부하/차단 위험이 있습니다.

## 🛰️ 프록시 뒤에서

제공자 트래픽은 사용자의 풀(또는 고정 프록시)을 통과합니다. 가입은 짧은 호출 하나이므로 출구는 왕복 한 번만 버티면 됩니다. 검증 단계는 더 긴 경로이며, 하나가 죽으면 단순히 다른 출구를 다시 선택합니다.

## 📄 파일

| 경로 | 내용 |
| --- | --- |
| `keys.txt` | 한 줄에 검증된 키 하나 — git에서 무시됨, 절대 커밋되지 않음 |
| `accounts.json` | 계정별 이메일 / 비밀번호 / 사용자 ID / 키 / 검증 기록 |
| [`models.json`](src/models.json) | 실시간 134개 모델 카탈로그 |
| `outputs/` | 검증 점검 결과 — git에서 무시됨 |

## 🔌 9Router에 연결

[9Router](https://9router.com)는 자체 호스팅되는 OpenAI 호환 라우터입니다. Sideren용 `openai-compatible` 노드 하나, 키당 연결 하나:

```bash
node src/connect-9router.js \
  --base http://localhost:20128 --password 123456 \
  --api-key <key>            # or env NINEROUTER_API_KEY
```

기본값: base `http://localhost:20128`, password `123456`, node `Sideren`, prefix `sideren`, upstream `https://api.sideren.io/v1`, 기본 모델 `@sdn/llama-3.3-70b`. `--name "<label 2>"`로 다른 발급 키를 등록하세요 — 모든 키가 9Router가 로드 밸런싱할 수 있는 또 하나의 연결이 됩니다. 모델은 그러면 `sideren/<model id>`로 제공됩니다.

## 🔑 키 하나로 얻는 것

| | |
| --- | --- |
| 🏢 제공자 | **Sideren** — [sideren.io](https://sideren.io) · API 문서: [docs.layerx1.com](https://docs.layerx1.com) |
| 🎁 제공자가 주는 것 | 계정당 무료 $2 크레딧 — 키당 REST 호출 두 번, OpenAI + Anthropic 프로토콜 |
| 🔑 키 하나로 얻는 것 | 자체 계정에 범위가 지정된 API 키 하나: 아래 엔드포인트의 모델 ID를 플랜 한도 내에서 사용. 할당량은 **계정**에 있으므로, 이 도구가 키마다 계정 하나를 만드는 이유가 바로 여기에 있습니다 |
| 🌐 API 형태 | OpenAI 호환: `POST https://api.sideren.io/v1/chat/completions` |
| 🔒 데이터 | `data.sideren.io`(가입 + 키 RPC)와 `api.sideren.io`(추론)만 접속되며, 키는 사용자 컴퓨터에 남습니다 |

## 🐞 이슈

Sideren이 인증 백엔드(가입 설정, RPC 이름, 키 접두사)를 변경하면 도구는 해당 단계에서 멈추고 그 사실을 알립니다. 실행한 명령과 정확한 출력을 포함해 **[이슈 열기](../../issues)**; PR을 환영합니다.

## 📄 라이선스

MIT © 2026 — [LICENSE](LICENSE) 참조.

<div align="center">

**[MIT](LICENSE)** © 2026 sideren-bulk-apikey 기여자

</div>