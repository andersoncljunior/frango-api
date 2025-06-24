console.log("DATABASE_URL =", process.env.DATABASE_URL); // ← Diagnóstico
require("dotenv").config(); // ← Precisa vir antes de usar process.env

const express = require("express");
const cors = require("cors");
const db = require("./db");

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
      `INSERT INTO pedidos (codigo, nome, telefone, endereco, kit, pagamento, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [codigo, nome, telefone, endereco, kit, pagamento, "PENDENTE"]
    );
    res.status(201).json({ mensagem: "Pedido criado!", codigo });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao criar pedido" });
  }
});

// Rota para consultar pedido por código
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

// ✅ NOVAS ROTAS

// Listar todos os pedidos
app.get("/pedidos", async (req, res) => {
  try {
    const resultado = await db.query("SELECT * FROM pedidos ORDER BY id DESC");
    res.json(resultado.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao buscar pedidos" });
  }
});

// Atualizar status de um pedido
app.put("/pedido/:codigo", async (req, res) => {
  const { codigo } = req.params;
  const { status } = req.body;

  try {
    const resultado = await db.query(
      `UPDATE pedidos SET status = $1 WHERE codigo = $2 RETURNING *`,
      [status, codigo]
    );

    if (resultado.rowCount === 0) {
      return res.status(404).json({ mensagem: "Pedido não encontrado" });
    }

    res.json({ mensagem: "Status atualizado", pedido: resultado.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao atualizar pedido" });
  }
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
