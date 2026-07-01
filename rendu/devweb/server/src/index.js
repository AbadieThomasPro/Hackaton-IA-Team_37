const express = require("express");
const cors = require("cors");
const { PORT } = require("./config");
const healthRouter = require("./routes/health");
const chatRouter = require("./routes/chat");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", healthRouter);
app.use("/api", chatRouter);

app.listen(PORT, () => {
  console.log(`devweb-server en ecoute sur http://localhost:${PORT}`);
});
