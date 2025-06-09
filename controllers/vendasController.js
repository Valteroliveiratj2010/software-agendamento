const pool = require("../database");

// Criar uma nova venda para um cliente
exports.criarVenda = async (req, res) => {
  const usuario_id = req.usuario.id;
  const {
    cliente_id,
    valor_total,
    valor_pago = 0, // Assume 0 se não for especificado
    data_vencimento = null,
    forma_pagamento = 'Dinheiro',
    observacoes_venda = null,
  } = req.body;

  // Validação básica
  if (!cliente_id || typeof cliente_id !== 'number') {
    return res.status(400).json({ erro: "ID do cliente é obrigatório e deve ser um número." });
  }
  if (typeof valor_total !== 'number' || valor_total <= 0) {
    return res.status(400).json({ erro: "Valor total da venda é obrigatório e deve ser um número positivo." });
  }
  if (typeof valor_pago !== 'number' || valor_pago < 0) {
    return res.status(400).json({ erro: "Valor pago deve ser um número não negativo." });
  }
  if (valor_pago > valor_total) {
    return res.status(400).json({ erro: "Valor pago não pode ser maior que o valor total da venda." });
  }

  // Calcular valor_devido e definir status_venda
  const valor_devido = valor_total - valor_pago;
  let status_venda = 'Aberta';
  if (valor_pago === valor_total) {
    status_venda = 'Paga';
  } else if (valor_pago > 0) {
    status_venda = 'Parcialmente Paga';
  }

  try {
    // Opcional: Verificar se o cliente_id realmente existe e pertence ao usuario_id logado
    const clienteCheck = await pool.query(
      "SELECT id FROM clientes WHERE id = $1 AND usuario_id = $2",
      [cliente_id, usuario_id]
    );
    if (clienteCheck.rowCount === 0) {
      return res.status(404).json({ erro: "Cliente não encontrado ou você não tem permissão para acessá-lo." });
    }

    const query = `
      INSERT INTO vendas (
        cliente_id, usuario_id, valor_total, valor_pago,
        data_vencimento, forma_pagamento, status_venda, observacoes_venda
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;
    const values = [
      cliente_id,
      usuario_id,
      valor_total,
      valor_pago,
      data_vencimento,
      forma_pagamento,
      status_venda,
      observacoes_venda,
    ];
    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Erro ao criar venda:", err);
    res.status(500).json({ erro: "Erro interno do servidor ao criar venda." });
  }
};

// Listar todas as vendas (com filtros e pesquisa)
exports.listarVendas = async (req, res) => {
  const usuario_id = req.usuario.id;
  const { clienteId, status, dataInicio, dataFim, termoCliente } = req.query;

  let query = `
    SELECT v.*, c.nome_cliente, c.cpf_cnpj
    FROM vendas v
    JOIN clientes c ON v.cliente_id = c.id
    WHERE v.usuario_id = $1
  `;
  const values = [usuario_id];
  let paramIndex = 2;

  if (clienteId) {
    query += ` AND v.cliente_id = $${paramIndex++}`;
    values.push(clienteId);
  }
  if (status) {
    query += ` AND v.status_venda ILIKE $${paramIndex++}`;
    values.push(`%${status}%`);
  }
  if (dataInicio) {
    query += ` AND v.data_venda >= $${paramIndex++}`;
    values.push(dataInicio);
  }
  if (dataFim) {
    query += ` AND v.data_venda <= $${paramIndex++}`;
    values.push(dataFim);
  }
  if (termoCliente) {
    query += ` AND c.nome_cliente ILIKE $${paramIndex++}`;
    values.push(`%${termoCliente}%`);
  }

  query += " ORDER BY v.data_venda DESC";

  try {
    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error("Erro ao listar vendas:", err);
    res.status(500).json({ erro: "Erro ao listar vendas." });
  }
};

// Obter detalhes de uma venda específica
exports.getVendaById = async (req, res) => {
  const usuario_id = req.usuario.id;
  const { id } = req.params; // ID da venda

  try {
    const result = await pool.query(
      `SELECT v.*, c.nome_cliente, c.cpf_cnpj
       FROM vendas v
       JOIN clientes c ON v.cliente_id = c.id
       WHERE v.id = $1 AND v.usuario_id = $2`,
      [id, usuario_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ erro: "Venda não encontrada ou você não tem permissão para acessá-la." });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Erro ao buscar venda por ID:", err);
    res.status(500).json({ erro: "Erro interno do servidor ao buscar venda." });
  }
};

// Atualizar informações de uma venda
exports.atualizarVenda = async (req, res) => {
  const usuario_id = req.usuario.id;
  const { id } = req.params; // ID da venda
  const {
    cliente_id,
    valor_total,
    valor_pago, // Note: valor_devido é calculado, não atualizado diretamente
    data_vencimento,
    forma_pagamento,
    status_venda,
    observacoes_venda,
  } = req.body;

  // Validação básica (pode ser mais robusta)
  if (typeof valor_total !== 'number' || valor_total <= 0) {
    return res.status(400).json({ erro: "Valor total da venda é obrigatório e deve ser um número positivo." });
  }
  if (typeof valor_pago !== 'number' || valor_pago < 0) {
    return res.status(400).json({ erro: "Valor pago deve ser um número não negativo." });
  }
  if (valor_pago > valor_total) {
    return res.status(400).json({ erro: "Valor pago não pode ser maior que o valor total da venda." });
  }

  // Recalcular status_venda
  let novoStatus = status_venda; // Assume o status vindo do body, mas pode ser recalculado
  if (valor_pago === valor_total) {
    novoStatus = 'Paga';
  } else if (valor_pago > 0) {
    novoStatus = 'Parcialmente Paga';
  } else {
    novoStatus = 'Aberta'; // Se valor_pago for 0
  }
  // Se tiver data_vencimento e já passou, e não está paga, pode ser 'Vencida'
  if (novoStatus !== 'Paga' && data_vencimento && new Date(data_vencimento) < new Date()) {
      novoStatus = 'Vencida';
  }


  try {
    // Verifica se a venda pertence ao usuário
    const vendaCheck = await pool.query(
      "SELECT id FROM vendas WHERE id = $1 AND usuario_id = $2",
      [id, usuario_id]
    );
    if (vendaCheck.rowCount === 0) {
      return res.status(404).json({ erro: "Venda não encontrada ou você não tem permissão para acessá-la." });
    }

    const query = `
      UPDATE vendas
      SET
        cliente_id = $1,
        valor_total = $2,
        valor_pago = $3,
        data_vencimento = $4,
        forma_pagamento = $5,
        status_venda = $6,
        observacoes_venda = $7,
        data_atualizacao = CURRENT_TIMESTAMP
      WHERE id = $8 AND usuario_id = $9
      RETURNING *;
    `;
    const values = [
      cliente_id,
      valor_total,
      valor_pago,
      data_vencimento,
      forma_pagamento,
      novoStatus,
      observacoes_venda,
      id,
      usuario_id,
    ];

    const result = await pool.query(query, values);
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Erro ao atualizar venda:", err);
    res.status(500).json({ erro: "Erro interno do servidor ao atualizar venda." });
  }
};

// Registrar um pagamento para uma venda existente
exports.registrarPagamento = async (req, res) => {
  const usuario_id = req.usuario.id;
  const { id } = req.params; // ID da venda
  const { valor_pagamento, forma_pagamento_pagamento, observacoes_pagamento } = req.body;

  if (typeof valor_pagamento !== 'number' || valor_pagamento <= 0) {
    return res.status(400).json({ erro: "Valor do pagamento é obrigatório e deve ser um número positivo." });
  }

  try {
    // 1. Obter a venda e verificar permissão
    const resultVenda = await pool.query(
      "SELECT valor_total, valor_pago, status_venda FROM vendas WHERE id = $1 AND usuario_id = $2",
      [id, usuario_id]
    );
    const venda = resultVenda.rows[0];

    if (!venda) {
      return res.status(404).json({ erro: "Venda não encontrada ou você não tem permissão." });
    }
    if (venda.status_venda === 'Paga') {
        return res.status(400).json({ erro: "Esta venda já está completamente paga." });
    }

    const novoValorPago = parseFloat(venda.valor_pago) + valor_pagamento;
    const novoValorDevido = parseFloat(venda.valor_total) - novoValorPago;

    if (novoValorPago > venda.valor_total) {
        return res.status(400).json({ erro: "O pagamento excede o valor total da dívida." });
    }

    let novoStatus = 'Parcialmente Paga';
    if (novoValorDevido <= 0) {
      novoStatus = 'Paga';
    }

    // 2. Atualizar a venda
    const updateVendaQuery = `
      UPDATE vendas
      SET valor_pago = $1, status_venda = $2, data_atualizacao = CURRENT_TIMESTAMP
      WHERE id = $3 AND usuario_id = $4
      RETURNING *;
    `;
    const updateVendaValues = [novoValorPago, novoStatus, id, usuario_id];
    const updatedVendaResult = await pool.query(updateVendaQuery, updateVendaValues);

    // Opcional: 3. Registrar o pagamento na tabela 'pagamentos' se você tiver ela
    // if (novoValorPago > 0 && false /* remover false para habilitar*/) { // Habilite se usar a tabela pagamentos
    //   await pool.query(
    //     `INSERT INTO pagamentos (venda_id, valor_pago, forma_pagamento, observacoes)
    //      VALUES ($1, $2, $3, $4)`,
    //     [id, valor_pagamento, forma_pagamento_pagamento, observacoes_pagamento]
    //   );
    // }

    res.json(updatedVendaResult.rows[0]);
  } catch (err) {
    console.error("Erro ao registrar pagamento:", err);
    res.status(500).json({ erro: "Erro interno do servidor ao registrar pagamento." });
  }
};


// Deletar uma venda
exports.deletarVenda = async (req, res) => {
  const usuario_id = req.usuario.id;
  const { id } = req.params;

  try {
    // Verifica se a venda pertence ao usuário antes de deletar
    const vendaCheck = await pool.query(
      "SELECT id FROM vendas WHERE id = $1 AND usuario_id = $2",
      [id, usuario_id]
    );
    if (vendaCheck.rowCount === 0) {
      return res.status(404).json({ erro: "Venda não encontrada ou você não tem permissão para deletá-la." });
    }

    await pool.query("DELETE FROM vendas WHERE id = $1 AND usuario_id = $2", [
      id,
      usuario_id,
    ]);
    res.json({ mensagem: "Venda excluída com sucesso." });
  } catch (err) {
    console.error("Erro ao deletar venda:", err);
    res.status(500).json({ erro: "Erro interno do servidor ao deletar venda." });
  }
};

// Listar vendas de um cliente específico (rota para o extrato do cliente)
exports.listarVendasPorCliente = async (req, res) => {
    const usuario_id = req.usuario.id;
    const { clienteId } = req.params; // ID do cliente

    try {
        // Opcional: Verificar se o cliente pertence ao usuário logado
        const clienteCheck = await pool.query(
            "SELECT id FROM clientes WHERE id = $1 AND usuario_id = $2",
            [clienteId, usuario_id]
        );
        if (clienteCheck.rowCount === 0) {
            return res.status(404).json({ erro: "Cliente não encontrado ou você não tem permissão para acessá-lo." });
        }

        const result = await pool.query(
            `SELECT * FROM vendas
             WHERE cliente_id = $1 AND usuario_id = $2
             ORDER BY data_venda DESC`,
            [clienteId, usuario_id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error("Erro ao listar vendas por cliente:", err);
        res.status(500).json({ erro: "Erro interno do servidor ao listar vendas por cliente." });
    }
};