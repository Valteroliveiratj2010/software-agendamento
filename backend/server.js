const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
// Servir arquivos estáticos do frontend (seu index.html, script.js, style.css)
app.use(express.static(path.join(__dirname, "..", "frontend")));

// Rotas da API
const clientesRoutes = require("./routes/clientesRoutes");
app.use("/api/clientes", clientesRoutes);

const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

// NOVA ROTA: Módulo de Vendas
const vendasRoutes = require("./routes/vendasRoutes");
app.use("/api/vendas", vendasRoutes);

// Rota principal para servir o index.html (se você não tiver outra rota de catch-all)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "index.html"));
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});