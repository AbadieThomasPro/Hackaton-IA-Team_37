# Tester sans l'INFRA (mock Ollama)

`mock-ollama.js` simule le vrai serveur Ollama (`/api/tags` + `/api/chat` en
streaming NDJSON, port **11434**) pour pouvoir développer/tester le chat sans
attendre que l'équipe INFRA ait fini son déploiement.

## Sans Docker : aucun changement nécessaire

`server/src/config.js` a pour fallback `OLLAMA_URL=http://localhost:11434`,
exactement là où `mock-ollama.js` écoute. Il suffit de le lancer à la place
du vrai Ollama, rien à modifier.

## Avec Docker (standalone, depuis `rendu/devweb/`)

Depuis que l'INFRA a fini son déploiement, `OLLAMA_URL` pointe par défaut vers
`http://ollama:11434` (le nom du service Docker de l'INFRA, utilisé quand ce
`docker-compose.yml` est inclus depuis la racine du repo). En standalone, il
n'y a pas de service `ollama` dans ce projet Compose, donc pour tester avec le
mock il faut surcharger temporairement `.env` :

```
OLLAMA_URL=http://host.docker.internal:11434
```

⚠️ Un seul processus peut écouter sur le port 11434 à la fois : n'ayez pas le
vrai Ollama et `mock-ollama.js` lancés en même temps. Pensez à remettre
`OLLAMA_URL=http://ollama:11434` dans `.env` une fois le test terminé.

## Lancer le mock + l'app (PowerShell, 3 terminaux depuis `rendu\devweb`)

```powershell
# Terminal 1 — faux Ollama sur :11434
node mock-ollama.js

# Terminal 2 — back
cd server
npm install        # si pas deja fait
npm run dev          # http://localhost:3000

# Terminal 3 — front
cd client
npm install         # si pas deja fait
npm start            # http://localhost:4200
```

Ouvrir http://localhost:4200 : le badge doit afficher "Connecté ✅", et le
faux assistant répond "Bonjour ! Je suis votre assistant financier." token
par token.

## Lancer le mock avec Docker (standalone)

```powershell
# .env : OLLAMA_URL=http://host.docker.internal:11434 (voir plus haut)
node mock-ollama.js
docker compose up --build
```
