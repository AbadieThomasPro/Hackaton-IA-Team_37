require("dotenv").config();

module.exports = {
  OLLAMA_URL: process.env.OLLAMA_URL || "http://localhost:11434",
  OLLAMA_MODEL: process.env.OLLAMA_MODEL || "phi3-financial",
  PORT: process.env.PORT || 3000,
};
