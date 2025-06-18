// controllers/clientesController.js
const pool = require("../database");

const listarClientes = async (req, res) => {
    const usuario_id = req.user.id;
    const { termo } = req.query;
    let query = "SELECT * FROM clientes WHERE usuario_id = $1";
    const values = [usuario_id];
    if (termo) {
        query += ` AND nome_cliente ILIKE $2`;
        values.push(`%${termo}%`);
    }
    query += " ORDER BY nome_cliente ASC";
    try {
        const result = await pool.query(query, values);
        res.json(result.rows);
    } catch (err) {
        console.error("Erro ao listar clientes:", err);
        res.status(500).json({ erro: "Erro ao listar clientes" });
    }
};

const getClienteById = async (req, res) => {
    const usuario_id = req.user.id;
    const { id } = req.params;
    try {
        const result = await pool.query("SELECT * FROM clientes WHERE id = $1 AND usuario_id = $2", [id, usuario_id]);
        if (result.rowCount === 0) return res.status(404).json({ erro: "Cliente não encontrado." });
        res.json(result.rows[0]);
    } catch (err) {
        console.error("Erro ao buscar cliente por ID:", err);
        res.status(500).json({ erro: "Erro interno do servidor." });
    }
};

const criarCliente = async (req, res) => {
    const usuario_id = req.user.id;
    const { nome_cliente, cpf_cnpj, telefone, email, endereco } = req.body;
    if (!nome_cliente) return res.status(400).json({ erro: "O nome do cliente é obrigatório." });
    try {
        const result = await pool.query(
            `INSERT INTO clientes (usuario_id, nome_cliente, cpf_cnpj, telefone, email, endereco) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;`,
            [usuario_id, nome_cliente, cpf_cnpj, telefone, email, endereco]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        if (err.code === '23505') return res.status(409).json({ erro: "O CPF/CNPJ informado já está cadastrado." });
        console.error("Erro ao criar cliente:", err);
        res.status(500).json({ erro: "Erro interno do servidor ao criar cliente." });
    }
};

const atualizarCliente = async (req, res) => {
    const usuario_id = req.user.id;
    const { id } = req.params;
    const { nome_cliente, cpf_cnpj, telefone, email, endereco } = req.body;
    try {
        const result = await pool.query(
            `UPDATE clientes SET nome_cliente = $1, cpf_cnpj = $2, telefone = $3, email = $4, endereco = $5 WHERE id = $6 AND usuario_id = $7 RETURNING *;`,
            [nome_cliente, cpf_cnpj, telefone, email, endereco, id, usuario_id]
        );
        if (result.rowCount === 0) return res.status(404).json({ erro: "Cliente não encontrado ou você não tem permissão." });
        res.json(result.rows[0]);
    } catch (err) {
        if (err.code === '23505') return res.status(409).json({ erro: "O CPF/CNPJ informado já está cadastrado para outro cliente." });
        console.error("Erro ao atualizar cliente:", err);
        res.status(500).json({ erro: "Erro interno do servidor." });
    }
};

const deletarCliente = async (req, res) => {
    const usuario_id = req.user.id;
    const { id } = req.params;
    try {
        const result = await pool.query("DELETE FROM clientes WHERE id = $1 AND usuario_id = $2", [id, usuario_id]);
        if (result.rowCount === 0) return res.status(404).json({ erro: "Cliente não encontrado ou você não tem permissão." });
        res.status(204).send();
    } catch (err) {
        console.error("Erro ao deletar cliente:", err);
        res.status(500).json({ erro: "Erro interno do servidor." });
    }
};

module.exports = {
  listarClientes,
  getClienteById,
  criarCliente,
  atualizarCliente,
  deletarCliente,
};