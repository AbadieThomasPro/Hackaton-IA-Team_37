# DEV WEB — TechCorp Financial Assistant

Interface de chat pour interagir avec le modèle Phi-3.5-Financial déployé par
l'équipe INFRA via Ollama. Architecture : **API Express** (proxy de streaming
vers Ollama) + **front Angular** (servi par nginx), chacun dans son propre
conteneur Docker.

## Lancement (1 commande)

Prérequis : Docker + Docker Compose, et le serveur Ollama de l'équipe INFRA
joignable (en local ou sur le réseau).

```bash
docker compose up --build
```

- Front (interface de chat) : http://localhost:4200
- Back (API) : http://localhost:3000 (`/api/health`, `/api/chat`)

`docker-compose.yml` lit `OLLAMA_URL` / `OLLAMA_MODEL` depuis un fichier `.env`
placé à côté de lui (non versionné, voir `.env.example`). Un `.env` avec des
valeurs par défaut est déjà présent localement dans ce dossier — si vous
clonez le repo depuis zéro, créez-le d'abord :

```bash
cp .env.example .env
docker compose up --build
```

Par défaut : `OLLAMA_URL=http://host.docker.internal:11434` (fonctionne
nativement avec Docker Desktop, et grâce à l'entrée `extra_hosts` du
`docker-compose.yml` sous Linux). Pour pointer vers un autre serveur
(IP fournie par l'INFRA, nom de modèle différent), éditez simplement `.env`.

## Lancement en développement (sans Docker)

Dans deux terminaux, depuis `rendu/devweb/` :

```bash
# terminal 1 - back
cd server
npm install
cp .env.example .env   # ajuster OLLAMA_URL si besoin
npm run dev             # http://localhost:3000

# terminal 2 - front
cd client
npm install
npm start                # http://localhost:4200, proxy /api -> :3000 (proxy.conf.json)
```

## Architecture

```
rendu/devweb/
├── docker-compose.yml     # orchestre les 2 conteneurs (back + front)
├── .env.example           # OLLAMA_URL / OLLAMA_MODEL pour docker compose
├── .env                    # copie locale non versionnee de .env.example (a creer si absent)
├── mock-ollama.js          # faux serveur Ollama (dev/tests, port 11434)
├── mock-llm.md             # comment utiliser le mock (voir aussi "Notes techniques")
├── server/                 # API Express (conteneur "back", port 3000)
│   ├── Dockerfile
│   ├── .env.example         # config pour lancement local sans Docker
│   └── src/
│       ├── index.js
│       └── routes/
│           ├── chat.js      # POST /api/chat -> proxy streaming vers Ollama
│           └── health.js    # GET  /api/health -> statut de connexion Ollama
└── client/                  # App Angular (conteneur "front" nginx, port 4200)
    ├── Dockerfile
    ├── nginx.conf
    ├── proxy.conf.json       # dev only (`ng serve`)
    └── src/app/
        ├── chat/                       # ChatComponent (messages, saisie, historique)
        ├── services/chat.service.ts    # streaming fetch + parsing NDJSON
        ├── services/health.service.ts  # polling /api/health toutes les 5s
        └── models/message.model.ts
```

Le front (nginx, port 4200) et le back (Express, port 3000) sont deux conteneurs
indépendants : le navigateur appelle directement `http://localhost:3000/api/*`
depuis la page servie sur `http://localhost:4200` (CORS activé côté Express).

## Fonctionnalités

- Chat avec réponses en streaming token par token
- Historique de conversation affiché et persisté (`localStorage`), survit à un F5
- Badge de statut de connexion au serveur Ollama (connecté / déconnecté),
  rafraîchi toutes les 5 secondes
- Bouton pour effacer l'historique

## Variables d'environnement (back)

| Variable       | Défaut                              | Description                                   |
|----------------|--------------------------------------|------------------------------------------------|
| `OLLAMA_URL`   | `http://host.docker.internal:11434` | URL du serveur Ollama                          |
| `OLLAMA_MODEL` | `phi3.5-financial`                   | Nom du modèle créé par l'INFRA (`ollama create`) |
| `PORT`         | `3000`                               | Port d'écoute de l'API                         |

## Notes techniques

Testé de bout en bout avant chaque commit (health check, streaming, badge
connecté/déconnecté, persistance de l'historique) via un faux serveur Ollama
le temps que l'INFRA finalise son déploiement — voir [mock-llm.md](./mock-llm.md).

## Captures d'écran

⚠️ Captures réalisées avec le **mock Ollama** ([mock-llm.md](./mock-llm.md)),
en attendant le vrai serveur Phi-3.5-Financial de l'INFRA — d'où la réponse
générique de l'assistant ("Bonjour ! Je suis votre assistant financier.").

| Connecté + historique vide | Réponse en streaming |
|---|---|
| ![Badge connecté, historique vide](./screenshots/01-initial-connected.png) | ![Réponse assistant en streaming](./screenshots/02-chat-streamed-response.png) |

| Historique persisté après reload | Historique effacé | Badge déconnecté |
|---|---|---|
| ![Historique conservé après F5](./screenshots/03-history-persisted-after-reload.png) | ![Historique vidé](./screenshots/04-history-cleared.png) | ![Badge déconnecté](./screenshots/05-disconnected-badge.png) |
