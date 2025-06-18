// routes/authRoutes.js

const express = require('express');
const router = express.Router();

// Importa as funções do controller de autenticação
const { register, login } = require('../controllers/authController');

// Rota para registrar um novo usuário
// Ex: POST /api/auth/register
router.post('/register', register);

// Rota para fazer login
// Ex: POST /api/auth/login
router.post('/login', login);

// Exporta o router para ser usado no arquivo principal (server.js)
module.exports = router;
