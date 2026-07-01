const express = require("express");
const cors = require("cors");
const path = require("path");
const { PORT } = require("./config");
const healthRouter = require("./routes/health");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", healthRouter);

// Sert le build Angular (genere par `ng build` dans client/dist) une fois pret.
const clientBuildPath = path.join(__dirname, "..", "public");
app.use(express.static(clientBuildPath));

app.listen(PORT, () => {
  console.log(`devweb-server en ecoute sur http://localhost:${PORT}`);
});
