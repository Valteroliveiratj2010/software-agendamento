const pool = require("../database");

// Listar todos os clientes
exports.listarClientes = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM clientes ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao listar clientes" });
  }
};

// Criar um novo cliente
exports.criarCliente = async (req, res) => {
  const {
    usuario_id,
    nome_cliente,
    telefone,
    valor_total,
    valor_pago,
    valor_em_aberto,
    status_pagamento,
    observacoes
  } = req.body;

  try {
    const query = `
      INSERT INTO clientes (
        usuario_id, nome_cliente, telefone,
        valor_total, valor_pago, valor_em_aberto,
        status_pagamento, observacoes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;

    const values = [
      usuario_id, nome_cliente, telefone,
      valor_total, valor_pago, valor_em_aberto,
      status_pagamento, observacoes
    ];

    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao criar cliente" });
  }
};

// Atualizar um cliente
exports.atualizarCliente = async (req, res) => {
  const { id } = req.params;
  const {
    nome_cliente,
    telefone,
    valor_total,
    valor_pago,
    valor_em_aberto,
    status_pagamento,
    observacoes
  } = req.body;

  try {
    const query = `
      UPDATE clientes
      SET nome_cliente = $1, telefone = $2, valor_total = $3,
          valor_pago = $4, valor_em_aberto = $5,
          status_pagamento = $6, observacoes = $7
      WHERE id = $8
      RETURNING *;
    `;

    const values = [
      nome_cliente,
      telefone,
      valor_total,
      valor_pago,
      valor_em_aberto,
      status_pagamento,
      observacoes,
      id
    ];

    const result = await pool.query(query, values);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao atualizar cliente" });
  }
};

// Deletar um cliente
exports.deletarCliente = async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query("DELETE FROM clientes WHERE id = $1", [id]);
    res.json({ mensagem: "Cliente excluído com sucesso" });
  } catch (err) {
    res.status(500).json({ erro: "Erro ao deletar cliente" });
  }
};
