# Tester sans l'INFRA (mock Ollama)

`mock-ollama.js` simule le vrai serveur Ollama (`/api/tags` + `/api/chat` en
streaming NDJSON, port **11434**) pour pouvoir développer/tester le chat sans
attendre que l'équipe INFRA ait fini son déploiement.

## Aucun changement de code nécessaire

Le projet pointe **par défaut vers le port 11434**, exactement là où le vrai
Ollama de l'INFRA est censé écouter (voir `CONSIGNES.md`) :

- Sans Docker : `server/src/config.js` a pour fallback `OLLAMA_URL=http://localhost:11434`.
- Avec Docker : `.env.example` (à copier en `.env`) vaut `OLLAMA_URL=http://host.docker.internal:11434`,
  qui pointe vers le port 11434 de la machine hôte depuis le conteneur.

`mock-ollama.js` écoute **aussi** sur le port 11434 (en local, sur l'hôte).
Il suffit donc de le lancer à la place du vrai Ollama — **rien à modifier**
dans `.env`, `.env.example` ou le code : le back s'y connectera automatiquement,
que ce soit lancé en Docker ou en dev local.

⚠️ Un seul processus peut écouter sur le port 11434 à la fois : n'ayez pas le
vrai Ollama et `mock-ollama.js` lancés en même temps. Une fois le vrai serveur
de l'INFRA disponible, arrêtez simplement `mock-ollama.js` (Ctrl+C) — aucune
autre action n'est nécessaire.

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

## Avec Docker

```powershell
node mock-ollama.js
docker compose up --build
```

Le conteneur `back` joint le mock sur l'hôte via `host.docker.internal:11434`
(déjà la valeur par défaut de `.env`), sans rien changer non plus.
