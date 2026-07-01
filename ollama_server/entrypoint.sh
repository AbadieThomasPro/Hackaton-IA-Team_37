#!/bin/bash
set -e

ollama serve &
SERVER_PID=$!

trap 'kill -TERM $SERVER_PID 2>/dev/null; wait $SERVER_PID' TERM INT

until ollama list > /dev/null 2>&1; do
  echo "En attente du démarrage d'Ollama..."
  sleep 1
done

ollama pull phi3.5

ollama create phi3-financial -f /Modelfile

echo "Serveur pret. Modele 'phi3-financial' disponible sur le port 11434."

wait $SERVER_PID
