const pool = require('../database');

exports.cadastrarCliente = async (req, res) => {
  const { nome_cliente, telefone, valor_total, valor_pago, observacoes } = req.body;
  const usuario_id = req.usuarioId;
  const valor_em_aberto = valor_total - valor_pago;
  const status_pagamento = valor_em_aberto <= 0 ? 'Pago' : 'Pendente';

  try {
    const result = await pool.query(
      `INSERT INTO clientes 
       (usuario_id, nome_cliente, telefone, valor_total, valor_pago, valor_em_aberto, status_pagamento, observacoes) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [usuario_id, nome_cliente, telefone, valor_total, valor_pago, valor_em_aberto, status_pagamento, observacoes]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao cadastrar cliente' });
  }
};

exports.listarClientes = async (req, res) => {
  const usuario_id = req.usuarioId;
  try {
    const result = await pool.query(
      'SELECT * FROM clientes WHERE usuario_id = $1 ORDER BY data_cadastro DESC',
      [usuario_id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao buscar clientes' });
  }
};
