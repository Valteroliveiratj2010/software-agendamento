// controllers/authController.js

const pool = require('../database'); // Importa a configuração da conexão do banco de dados
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * Registra um novo usuário no sistema.
 */
// controllers/authController.js

// --- FUNÇÃO DE REGISTRO DE NOVO USUÁRIO (VERSÃO ATUALIZADA) ---
const register = async (req, res) => {
    // 1. Obter nome, email, senha e role do corpo da requisição
    const { nome, email, password, role } = req.body;

    // 2. Validar se os dados essenciais foram enviados
    if (!email || !password) {
        return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
    }

    try {
        // 3. Verificar se o usuário já existe no banco de dados
        const userExists = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        if (userExists.rows.length > 0) {
            return res.status(409).json({ message: 'Este email já está em uso.' });
        }

        // 4. Criptografar a senha
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // 5. Inserir o novo usuário no banco com NOME, EMAIL, SENHA e ROLE
        //    (O valor de 'role' será o enviado ou o padrão 'vendedor' da tabela)
        const newUser = await pool.query(
            'INSERT INTO usuarios (nome, email, senha, role) VALUES ($1, $2, $3, $4) RETURNING id, email',
            [nome, email, passwordHash, role || 'vendedor'] // Usamos o role enviado ou 'vendedor' como padrão
        );

        // 6. Enviar resposta de sucesso
        res.status(201).json({
            message: 'Usuário criado com sucesso!',
            user: newUser.rows[0]
        });

    } catch (error) {
        console.error('Erro no registro:', error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
};

/**
 * Autentica um usuário e retorna um token JWT.
 */
// controllers/authController.js

// ... (a função register continua a mesma) ...

const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
    }

    try {
        const userResult = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        if (userResult.rows.length === 0) {
            return res.status(401).json({ message: 'Credenciais inválidas.' });
        }

        const user = userResult.rows[0];
        const isPasswordCorrect = await bcrypt.compare(password, user.senha);
        if (!isPasswordCorrect) {
            return res.status(401).json({ message: 'Credenciais inválidas.' });
        }

        // --- CORREÇÃO PRINCIPAL AQUI ---
        // Adicionando 'nome' e 'role' aos dados que vão dentro do token.
        const token = jwt.sign(
            { id: user.id, email: user.email, nome: user.nome, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({
            message: 'Login bem-sucedido!',
            token: token,
            user: { id: user.id, email: user.email, nome: user.nome, role: user.role }
        });

    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
};

module.exports = {
    // ... (sua função register)
    register, // não se esqueça de manter a função de registro aqui
    login
};

// // Exporta as funções para serem usadas nas rotas
// module.exports = {
//     register,
//     login,
// };