const express = require("express");
const { OLLAMA_URL } = require("../config");

const router = express.Router();

const HEALTH_TIMEOUT_MS = 3000;

router.get("/health", async (req, res) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), HEALTH_TIMEOUT_MS);

  try {
    const response = await fetch(`${OLLAMA_URL}/api/tags`, {
      signal: controller.signal,
    });
    res.json({ connected: response.ok });
  } catch (error) {
    res.json({ connected: false });
  } finally {
    clearTimeout(timeout);
  }
});

module.exports = router;
