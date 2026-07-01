const express = require("express");
const { Readable } = require("stream");
const { OLLAMA_URL, OLLAMA_MODEL } = require("../config");

const router = express.Router();

// Delai max d'attente du premier octet de reponse d'Ollama. Sans ca, une
// requete vers un Ollama injoignable reste bloquee indefiniment (observe en
// test : une connexion vers un port ferme ne renvoie pas toujours un
// ECONNREFUSED immediat sur Windows). Valeur assez large car le tout premier
// appel a un modele reel declenche son chargement en memoire (observe : un
// cold start peut largement depasser 15s ; les appels suivants sont rapides
// tant qu'Ollama garde le modele charge).
const CONNECT_TIMEOUT_MS = 60000;

router.post("/chat", async (req, res) => {
  const { messages } = req.body || {};

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "Le champ 'messages' (array) est requis" });
  }

  const controller = new AbortController();
  let timedOut = false;
  const timeout = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, CONNECT_TIMEOUT_MS);
  // res.on("close") (et non req.on("close")) : req.close se declenche des que
  // le body de la requete est entierement lu, bien avant toute deconnexion
  // reelle du client, ce qui abortait le fetch a tort.
  res.on("close", () => controller.abort());

  try {
    const upstream = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: OLLAMA_MODEL, messages, stream: true }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!upstream.ok || !upstream.body) {
      const detail = await upstream.text().catch(() => "");
      return res.status(502).json({ error: "Ollama a renvoye une erreur", detail });
    }

    // On repipe tel quel le flux NDJSON d'Ollama : le client parse le meme
    // format que celui documente par l'API Ollama (une ligne JSON par chunk).
    res.setHeader("Content-Type", "application/x-ndjson");
    Readable.fromWeb(upstream.body).on("error", () => {}).pipe(res);
  } catch (error) {
    clearTimeout(timeout);
    if (res.headersSent || res.writableEnded) return;
    if (timedOut) {
      return res.status(504).json({ error: "Ollama n'a pas repondu a temps" });
    }
    if (controller.signal.aborted) return; // client a ferme la connexion
    res.status(502).json({ error: "Impossible de contacter Ollama", detail: error.message });
  }
});

module.exports = router;
