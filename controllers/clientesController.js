const pool = require("../database");

// Listar clientes do usuário autenticado (filtra por usuario_id e agora aceita termo de pesquisa)
exports.listarClientes = async (req, res) => {
  const usuario_id = req.usuario.id;
  const { termo, cpf_cnpj, email, telefone } = req.query; // Adicionados mais filtros

  let query = "SELECT * FROM clientes WHERE usuario_id = $1";
  const values = [usuario_id];
  let paramIndex = 2; // Começa em 2 porque $1 já foi usado para usuario_id

  if (termo && termo.trim() !== "") {
    // Busca por nome do cliente (case-insensitive, contém)
    query += ` AND nome_cliente ILIKE $${paramIndex++}`;
    values.push(`%${termo}%`);
  }
  if (cpf_cnpj && cpf_cnpj.trim() !== "") {
    // Busca por CPF/CNPJ exato
    query += ` AND cpf_cnpj = $${paramIndex++}`;
    values.push(cpf_cnpj.trim());
  }
  if (email && email.trim() !== "") {
    // Busca por email exato
    query += ` AND email ILIKE $${paramIndex++}`; // ILIKE para emails também
    values.push(`%${email.trim()}%`);
  }
  if (telefone && telefone.trim() !== "") {
    // Busca por telefone (pode ser LIKE se quiser busca parcial)
    query += ` AND telefone ILIKE $${paramIndex++}`;
    values.push(`%${telefone.trim()}%`);
  }

  query += " ORDER BY data_cadastro DESC"; // Ordena pelo mais recente

  try {
    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error("Erro ao listar/pesquisar clientes:", err);
    res.status(500).json({ erro: "Erro ao listar/pesquisar clientes" });
  }
};

// Criar cliente com validação aprimorada
exports.criarCliente = async (req, res) => {
  const usuario_id = req.usuario.id;
  const {
    nome_cliente,
    cpf_cnpj,
    telefone = null,
    email = null,
    endereco = null,
  } = req.body;

  // Validação de campos obrigatórios
  if (!nome_cliente || nome_cliente.trim() === "") {
    return res.status(400).json({ erro: "O nome do cliente é obrigatório." });
  }
  // Validação de CPF/CNPJ (básica, pode ser aprimorada)
  if (cpf_cnpj && !/^\d{11}(\d{3})?$/.test(cpf_cnpj.replace(/\D/g, ''))) { // Apenas números, 11 ou 14 dígitos
    return res.status(400).json({ erro: "Formato de CPF/CNPJ inválido (apenas números)." });
  }
  // Validação de email
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ erro: "Formato de email inválido." });
  }

  try {
    // Verificar se CPF/CNPJ já existe (se fornecido)
    if (cpf_cnpj) {
      const existingCpfCnpj = await pool.query(
        "SELECT id FROM clientes WHERE cpf_cnpj = $1 AND usuario_id = $2",
        [cpf_cnpj, usuario_id]
      );
      if (existingCpfCnpj.rowCount > 0) {
        return res.status(409).json({ erro: "CPF/CNPJ já cadastrado para este usuário." });
      }
    }

    const query = `
      INSERT INTO clientes (
        usuario_id, nome_cliente, cpf_cnpj, telefone, email, endereco
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const values = [
      usuario_id,
      nome_cliente,
      cpf_cnpj,
      telefone,
      email,
      endereco,
    ];
    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Erro ao criar cliente:", err);
    res.status(500).json({ erro: "Erro interno do servidor ao criar cliente." });
  }
};

// Atualizar cliente com validação aprimorada
exports.atualizarCliente = async (req, res) => {
  const usuario_id = req.usuario.id;
  const { id } = req.params; // ID do cliente a ser atualizado
  const {
    nome_cliente,
    cpf_cnpj,
    telefone,
    email,
    endereco,
  } = req.body;

  if (!nome_cliente || nome_cliente.trim() === "") {
    return res.status(400).json({ erro: "O nome do cliente é obrigatório." });
  }
  if (cpf_cnpj && !/^\d{11}(\d{3})?$/.test(cpf_cnpj.replace(/\D/g, ''))) {
    return res.status(400).json({ erro: "Formato de CPF/CNPJ inválido (apenas números)." });
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ erro: "Formato de email inválido." });
  }

  try {
    // Verificar se o cliente pertence ao usuário e se existe
    const clienteCheck = await pool.query(
      "SELECT id FROM clientes WHERE id = $1 AND usuario_id = $2",
      [id, usuario_id]
    );
    if (clienteCheck.rowCount === 0) {
      return res.status(404).json({ erro: "Cliente não encontrado ou você não tem permissão para acessá-lo." });
    }

    // Verificar se o novo CPF/CNPJ já existe para OUTRO cliente do mesmo usuário
    if (cpf_cnpj) {
      const existingCpfCnpj = await pool.query(
        "SELECT id FROM clientes WHERE cpf_cnpj = $1 AND usuario_id = $2 AND id <> $3",
        [cpf_cnpj, usuario_id, id]
      );
      if (existingCpfCnpj.rowCount > 0) {
        return res.status(409).json({ erro: "CPF/CNPJ já cadastrado para outro cliente deste usuário." });
      }
    }

    const query = `
      UPDATE clientes
      SET nome_cliente = $1, cpf_cnpj = $2, telefone = $3,
          email = $4, endereco = $5
      WHERE id = $6 AND usuario_id = $7
      RETURNING *;
    `;

    const values = [
      nome_cliente,
      cpf_cnpj,
      telefone,
      email,
      endereco,
      id,
      usuario_id,
    ];

    const result = await pool.query(query, values);
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Erro ao atualizar cliente:", err);
    res.status(500).json({ erro: "Erro interno do servidor ao atualizar cliente." });
  }
};

// Deletar cliente
exports.deletarCliente = async (req, res) => {
  const usuario_id = req.usuario.id;
  const { id } = req.params;

  try {
    // Verifica se o cliente pertence ao usuário antes de deletar
    const clienteCheck = await pool.query(
      "SELECT id FROM clientes WHERE id = $1 AND usuario_id = $2",
      [id, usuario_id]
    );
    if (clienteCheck.rowCount === 0) {
      return res.status(404).json({ erro: "Cliente não encontrado ou você não tem permissão para deletá-lo." });
    }

    await pool.query("DELETE FROM clientes WHERE id = $1 AND usuario_id = $2", [
      id,
      usuario_id,
    ]);
    res.json({ mensagem: "Cliente excluído com sucesso." });
  } catch (err) {
    console.error("Erro ao deletar cliente:", err);
    res.status(500).json({ erro: "Erro interno do servidor ao deletar cliente." });
  }
};