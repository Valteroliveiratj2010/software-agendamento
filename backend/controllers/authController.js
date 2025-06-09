const pool = require('../database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  const { nome, email, senha, role = 'vendedor' } = req.body; // Adicionado role com default

  // Validação de entrada
  if (!nome || nome.trim() === '') {
    return res.status(400).json({ erro: 'O nome é obrigatório.' });
  }
  if (!email || email.trim() === '') {
    return res.status(400).json({ erro: 'O email é obrigatório.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ erro: 'Formato de email inválido.' });
  }
  if (!senha || senha.length < 6) { // Exemplo: senha mínima de 6 caracteres
    return res.status(400).json({ erro: 'A senha é obrigatória e deve ter no mínimo 6 caracteres.' });
  }
  // Validação de role: permite apenas 'admin', 'gerente', 'vendedor'
  const rolesValidos = ['admin', 'gerente', 'vendedor'];
  if (!rolesValidos.includes(role)) {
    return res.status(400).json({ erro: 'Perfil de usuário inválido. Escolha entre: admin, gerente, vendedor.' });
  }

  try {
    // Verificar se o email já existe
    const emailCheck = await pool.query('SELECT id FROM usuarios WHERE email = $1', [email]);
    if (emailCheck.rowCount > 0) {
      return res.status(409).json({ erro: 'Este email já está cadastrado.' });
    }

    const hashedSenha = await bcrypt.hash(senha, 10);
    const result = await pool.query(
      'INSERT INTO usuarios (nome, email, senha_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, nome, email, role',
      [nome, email, hashedSenha, role]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    res.status(500).json({ erro: 'Erro interno do servidor ao registrar usuário.' });
  }
};

exports.login = async (req, res) => {
  const { email, senha } = req.body;

  // Validação de entrada
  if (!email || email.trim() === '' || !senha || senha.trim() === '') {
    return res.status(400).json({ erro: 'Email e senha são obrigatórios.' });
  }

  try {
    const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    const usuario = result.rows[0];

    if (!usuario) {
      return res.status(401).json({ erro: 'Credenciais inválidas.' }); // Mensagem genérica por segurança
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
    if (!senhaValida) {
      return res.status(401).json({ erro: 'Credenciais inválidas.' }); // Mensagem genérica por segurança
    }

    // Incluir o 'role' no token JWT e retornar no corpo da resposta
    const token = jwt.sign({ id: usuario.id, role: usuario.role }, process.env.JWT_SECRET, { expiresIn: '8h' });
    res.json({
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        role: usuario.role // Retorna o perfil do usuário
      }
    });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({ erro: 'Erro interno do servidor ao fazer login.' });
  }
};