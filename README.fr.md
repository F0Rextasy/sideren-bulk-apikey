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

**Créez en masse des comptes Sideren (sideren.io) avec des clés API générées automatiquement — inférence compatible OpenAI + connecteur 9Router.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-134%20served-412991?style=for-the-badge)](https://docs.layerx1.com)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 Démarrage rapide](#-quick-start) · [🎁 Offre gratuite](#-free-tier--how-much-you-get) · [🤖 Modèles](#-models--all-134-of-them) · [🧪 Utiliser l'API](#-how-to-use-the-api) · [✅ Vérifié](#-verified-working--every-key-is-tested) · [🧭 Comment ça marche](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [⚙️ Options](#️-cli-options) · [🛰️ Proxys](#️-behind-a-proxy) · [🐞 Problèmes](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>


---

## ✨ Pourquoi cet outil existe

Sideren (LayerX1) offre à chaque compte **2 $ de crédit gratuit** et sa propre clé API, et les deux sont liés au **compte** — l'unité utile est donc *un compte par clé*. L'API à `api.sideren.io/v1` parle **les deux protocoles**, OpenAI (`/v1/chat/completions`) et Anthropic (`/v1/messages`), avec la même clé. Cet outil crée des comptes et des clés via du REST simple — sans navigateur, sans boîte mail.

## 🎁 Offre gratuite — ce que vous obtenez

**Chaque nouveau compte Sideren reçoit un crédit unique de 2 $, accordé côté serveur à l'inscription — sans carte, sans boîte mail.**

| Quoi | Valeur |
| --- | --- |
| Crédit de bienvenue | **2,00 $** par compte (`GET /v1/me` → `balance_usd: 2`, `plan: "free"`) — mesuré |
| Carte requise | **Non** |
| Limite de débit | offre gratuite : les 3 premiers jours **15 req/min + 2 en parallèle**, puis **4 req/min + 1 en parallèle** jusqu'à l'achat d'une offre |
| Plafond de tokens | 600k tokens/mois, 50k en entrée / 4k en sortie par appel |
| Inscription | REST : e-mail + mot de passe (`POST /auth/v1/signup`) — pas de code par e-mail, pas de navigateur |
| L'unité qui monte en échelle | **un compte = une clé** → `--count N` signifie en réalité « N comptes gratuits » |

**Comment en obtenir plus :** le crédit est lié au compte — un compte par clé, et `--count N` crée N comptes, chacun avec ses propres 2 $. Une clé créée répond `200` sur `/v1/models`, `/v1/me` et une vraie complétion de chat, donc le crédit est dépensable immédiatement (`trial.ends_at` correspond à trois jours après la création).

> 💡 L'offre gratuite est définie par Sideren et peut changer. Vérifiez les chiffres en direct sur [sideren.io](https://sideren.io) — et laissez le contrôle de l'outil décider :

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 Modèles — les 134

`GET /v1/models` renvoie **134 modèles** (voir [`models.json`](src/models.json)) et les deux protocoles sont servis par la même clé. Identifiants principaux :

|Modèle|✓|
|---|---|
|`sdn-llama-3.3-70b`|✓|

Test en direct d'une clé :

```bash
curl https://api.sideren.io/v1/chat/completions \
  -H "Authorization: Bearer lx1_…" -H "Content-Type: application/json" \
  -d '{"model":"sdn-glm-5.3","messages":[{"role":"user","content":"hi"}]}'
```

## 🧪 Comment utiliser l'API

L'URL de base est **`https://api.sideren.io/v1`** ; la même clé répond aussi au protocole Anthropic à `/v1/messages` (`x-api-key`).

**Protocole OpenAI**

```python
from openai import OpenAI
client = OpenAI(base_url="https://api.sideren.io/v1", api_key="lx1_…")
print(client.chat.completions.create(model="sdn-glm-5.3",
      messages=[{"role": "user", "content": "hi"}]).choices[0].message.content)
```

**Protocole Anthropic** (`/v1/messages`, `x-api-key`) :

```bash
curl https://api.sideren.io/v1/messages \
  -H "x-api-key: lx1_…" -H "anthropic-version: 2023-06-01" \
  -H "Content-Type: application/json" \
  -d '{"model":"sdn-glm-5.3","max_tokens":16,"messages":[{"role":"user","content":"hi"}]}'
```

**N'importe quel agent / outil avec une URL de base personnalisée** (Cursor, OpenCode, Kilo Code, …) : URL de base `https://api.sideren.io/v1`, collez une clé, choisissez n'importe quel identifiant de modèle du catalogue.

## 🛠 Démarrage rapide

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

Les outils lisent `proxies.txt` depuis la **racine du dépôt** et y écrivent aussi `keys.txt`, `accounts.json` et `outputs/`. `keys.txt` (dupliqué vers `%USERPROFILE%\sideren-keys.txt`) n'est écrit **qu'**après qu'une clé a répondu à `GET /v1/models`, `GET /v1/me` et une vraie complétion de chat.

### 🖱️ Le lanceur

Le lanceur demande la liste de proxys et le nombre, les mémorise dans `launcher.config.json`, et exécute la CLI avec les bons drapeaux ; `node src/launcher.js --connect-9router` enregistre les clés créées dans un 9Router local.

## ✅ Vérifié fonctionnel — chaque clé est testée

| Vérification | Résultat |
| --- | --- |
| `POST /auth/v1/signup` | **30/30 → 200** avec un jeton d'accès (session utilisable immédiatement) |
| `POST /rest/v1/rpc/create_api_key` | **30/30 → 200** avec une clé `lx1_…` |
| `GET /v1/models` + `GET /v1/me` | **30/30 → 200**, `plan: "free"`, `balance_usd: 2` par compte |
| `POST /v1/chat/completions` (protocole OpenAI) | **200** avec du contenu réel |
| `POST /v1/messages` (protocole Anthropic, `x-api-key`) | **200**, `content: [{type:"text", text:"ok"}]`, `stop_reason: "end_turn"` |
| un balayage final de la liste livrée | **30/30 OK** |

```bash
node src/cli.js --verify-only    # models + balance + a chat call for every key
```

## 🧭 Comment ça marche

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: Sideren page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://api.sideren.io/v1/chat/completions → real content = the key is live
```

| Étape | Appel | Notes |
| --- | --- | --- |
| compte | `POST https://data.sideren.io/auth/v1/signup {email,password}` | le backend d'identité répond avec une session immédiatement |
| clé | `POST https://data.sideren.io/rest/v1/rpc/create_api_key {p_name}` (Bearer access token) | la même RPC que celle appelée par le panneau ; renvoie `lx1_…` (alias `sdn_…`) |
| crédit | accordé côté serveur à l'inscription | `GET https://api.sideren.io/v1/me` → `balance_usd: 2`, `plan: "free"` |
| vérification | `GET /v1/models`, `GET /v1/me`, `POST /v1/chat/completions` | une clé n'est écrite dans `keys.txt` qu'après que les trois ont répondu |

## ⚙️ Options de la CLI

```bash
node src/cli.js --count N        # mint N accounts (any N, default 30)
node src/cli.js --preset turbo   # run shape: turbo = 5 workers, balanced = 4, safe = 2
node src/cli.js --verify-only    # re-verify every key in keys.txt
node src/cli.js --help
```

| Variable d'environnement | Défaut | Signification |
| --- | --- | --- |
| `SIDEREN_PROXIES` | `proxies.txt` | fichier de pool, un proxy par ligne |
| `PIN_PROXY` | — | fixe une seule sortie pour chaque appel (par ex. `socks5://127.0.0.1:40000`) |

Turbo önerilir (5); daha fazlası zayıf bilgisayarda yük/ban riski.

## 🛰️ Derrière un proxy

Le trafic vers le fournisseur passe par votre pool (ou un proxy fixé). L'inscription est un seul appel court, donc une sortie n'a qu'à survivre à un aller-retour ; la passe de vérification est le chemin le plus long et choisit simplement une autre sortie quand l'une meurt.

## 📄 Fichiers

| Chemin | Contenu |
| --- | --- |
| `keys.txt` | une clé vérifiée par ligne — ignoré par git, jamais commité |
| `accounts.json` | e-mail / mot de passe / id utilisateur / clé / enregistrement de vérification par compte |
| [`models.json`](src/models.json) | le catalogue en direct des 134 modèles |
| `outputs/` | résultats du balayage de vérification — ignoré par git |

## 🔌 Se connecter à 9Router

[9Router](https://9router.com) est un routeur auto-hébergé compatible OpenAI. Un nœud `openai-compatible` pour Sideren, une connexion par clé :

```bash
node src/connect-9router.js \
  --base http://localhost:20128 --password 123456 \
  --api-key <key>            # or env NINEROUTER_API_KEY
```

Défauts : base `http://localhost:20128`, mot de passe `123456`, nœud `Sideren`, préfixe `sideren`, amont `https://api.sideren.io/v1`, modèle par défaut `@sdn/llama-3.3-70b`. Enregistrez une autre clé créée avec `--name "<label 2>"` — chaque clé devient une connexion supplémentaire sur laquelle 9Router peut répartir la charge. Les modèles sont alors servis sous la forme `sideren/<model id>`.

## 🔑 Ce qu'une clé vous donne

| | |
| --- | --- |
| 🏢 Fournisseur | **Sideren** — [sideren.io](https://sideren.io) · Documentation de l'API sur [docs.layerx1.com](https://docs.layerx1.com) |
| 🎁 Ce que le fournisseur donne | 2 $ de crédit gratuit par compte — deux appels REST par clé, protocoles OpenAI + Anthropic |
| 🔑 Ce qu'une clé vous donne | une clé API limitée à son propre compte : les identifiants de modèles sur le point de terminaison ci-dessous, dans les limites de votre offre. Le quota est lié au **compte**, ce qui explique précisément pourquoi cet outil crée un compte par clé |
| 🌐 Forme de l'API | Compatible OpenAI : `POST https://api.sideren.io/v1/chat/completions` |
| 🔒 Vos données | seuls `data.sideren.io` (inscription + RPC de clé) et `api.sideren.io` (inférence) sont contactés ; les clés restent sur votre machine |

## 🐞 Problèmes

Si Sideren modifie son backend d'identité (paramètres d'inscription, nom de la RPC, préfixe de clé), l'outil s'arrête à cette étape et le signale. **[Ouvrez un ticket](../../issues)** avec la commande exécutée et la sortie exacte ; les PR sont bienvenues.

## 📄 Licence

MIT © 2026 — voir [LICENSE](LICENSE).

<div align="center">

**[MIT](LICENSE)** © 2026 sideren-bulk-apikey contributors

</div>