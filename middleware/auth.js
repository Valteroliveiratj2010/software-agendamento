// middleware/auth.js

const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  // Pega o cabeçalho de autorização da requisição
  const authHeader = req.headers.authorization;

  // 1. Verifica se o cabeçalho existe
  if (!authHeader) {
    return res.status(401).json({ message: 'Acesso negado: Nenhum token fornecido.' });
  }

  // 2. Divide o cabeçalho para pegar apenas o token (formato "Bearer SEU_TOKEN")
  const parts = authHeader.split(' ');
  if (parts.length !== 2) {
    return res.status(401).json({ message: 'Erro no token: Formato inválido.' });
  }

  const [scheme, token] = parts;
  if (!/^Bearer$/i.test(scheme)) {
    return res.status(401).json({ message: 'Erro no token: Formato mal formatado.' });
  }

  // 3. Verifica se o token é válido
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Se for válido, adiciona os dados do usuário (id, role, etc.) na requisição
    req.user = decoded; 
    
    // Continua para a próxima função (o controller)
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido ou expirado.' });
  }
};
