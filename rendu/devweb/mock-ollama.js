// Faux serveur Ollama pour tester le chat (front + back) sans attendre que
// l'INFRA ait fini de deployer le vrai serveur. Simule /api/tags (health) et
// /api/chat en streaming NDJSON, exactement le format attendu par le back.
//
// Usage : node mock-ollama.js   (ecoute sur :11434, comme le vrai Ollama)
const http = require("http");

const TOKENS = ["Bonjour", " !", " Je", " suis", " votre", " assistant", " financier", "."];
const TOKEN_DELAY_MS = 100;

const server = http.createServer((req, res) => {
  if (req.method === "GET" && req.url === "/api/tags") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ models: [{ name: "phi3-financial" }] }));
    return;
  }

  if (req.method === "POST" && req.url === "/api/chat") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      console.log("mock-ollama received:", body);
      res.writeHead(200, { "Content-Type": "application/x-ndjson" });

      let i = 0;
      const interval = setInterval(() => {
        if (i < TOKENS.length) {
          res.write(JSON.stringify({ message: { role: "assistant", content: TOKENS[i] }, done: false }) + "\n");
          i += 1;
        } else {
          res.write(JSON.stringify({ message: { role: "assistant", content: "" }, done: true }) + "\n");
          clearInterval(interval);
          res.end();
        }
      }, TOKEN_DELAY_MS);
    });
    return;
  }

  res.writeHead(404);
  res.end();
});

server.listen(11434, () => console.log("mock-ollama en ecoute sur http://localhost:11434"));
