const express = require("express");
const cors = require("cors");
const db = require("./db");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// Rota de teste
app.get("/", (req, res) => {
  res.send("🍗 API Frango do Nem funcionando!");
});

// Rota para criar pedido
app.post("/pedido", async (req, res) => {
  const { nome, telefone, endereco, kit, pagamento } = req.body;
  const codigo = "PED" + Math.floor(100 + Math.random() * 900);
  try {
    await db.query(
      `INSERT INTO pedidos (codigo, nome, telefone, endereco, kit, pagamento)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [codigo, nome, telefone, endereco, kit, pagamento]
    );
    res.status(201).json({ mensagem: "Pedido criado!", codigo });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao criar pedido" });
  }
});

// Rota para consultar status por código
app.get("/pedido/:codigo", async (req, res) => {
  const { codigo } = req.params;
  try {
    const resultado = await db.query(
      `SELECT * FROM pedidos WHERE codigo = $1`,
      [codigo]
    );
    if (resultado.rows.length === 0) {
      return res.status(404).json({ mensagem: "Pedido não encontrado" });
    }
    res.json(resultado.rows[0]);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao buscar pedido" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
