// controllers/vendasController.js
const pool = require("../database");

const criarVenda = async (req, res) => {
  const usuario_id = req.user.id;
  const { cliente_id, valor_total, valor_pago = 0, data_vencimento = null, forma_pagamento, observacoes_venda } = req.body;
  if (!cliente_id || !valor_total) return res.status(400).json({ erro: "ID do cliente e valor total são obrigatórios." });
  const status_venda = (valor_pago >= valor_total) ? 'Paga' : (valor_pago > 0 ? 'Parcialmente Paga' : 'Aberta');
  try {
    const result = await pool.query(
        `INSERT INTO vendas (cliente_id, usuario_id, valor_total, valor_pago, data_vencimento, forma_pagamento, status_venda, observacoes_venda) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *;`,
        [cliente_id, usuario_id, valor_total, valor_pago, data_vencimento, forma_pagamento, status_venda, observacoes_venda]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Erro ao criar venda:", err);
    res.status(500).json({ erro: "Erro interno do servidor." });
  }
};

const listarVendas = async (req, res) => {
  const usuario_id = req.user.id;
  let query = `SELECT v.*, c.nome_cliente, (v.valor_total - v.valor_pago) AS valor_devido FROM vendas v LEFT JOIN clientes c ON v.cliente_id = c.id WHERE v.usuario_id = $1 ORDER BY v.data_venda DESC`;
  try {
    const { rows } = await pool.query(query, [usuario_id]);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Erro ao listar vendas:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

const getVendaById = async (req, res) => {
  const usuario_id = req.user.id;
  const { id } = req.params;
  const query = `SELECT v.*, c.nome_cliente, (v.valor_total - v.valor_pago) AS valor_devido FROM vendas v LEFT JOIN clientes c ON v.cliente_id = c.id WHERE v.id = $1 AND v.usuario_id = $2`;
  try {
    const result = await pool.query(query, [id, usuario_id]);
    if (result.rowCount === 0) return res.status(404).json({ erro: "Venda não encontrada." });
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Erro ao buscar venda por ID:", err);
    res.status(500).json({ erro: "Erro interno do servidor." });
  }
};

// Crie as outras funções (atualizarVenda, etc.) aqui quando precisar

module.exports = {
  criarVenda,
  listarVendas,
  getVendaById,
  // Adicione aqui as outras funções quando as criar
};