const jwt = require('jsonwebtoken');

function autenticarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ erro: "Token não fornecido." });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, usuario) => {
    if (err) {
      // Diferenciar token expirado para frontend poder solicitar refresh ou novo login
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ erro: "Token expirado. Por favor, faça login novamente." });
      }
      return res.status(403).json({ erro: "Token inválido." });
    }

    // req.usuario agora contém { id: usuario.id, role: usuario.role }
    req.usuario = usuario;
    next();
  });
}

/**
 * Middleware para verificar se o usuário autenticado possui um dos papéis permitidos.
 * @param {Array<string>} rolesPermitidos - Array de strings com os papéis que têm permissão (ex: ['admin', 'gerente'])
 */
function autorizarPapeis(rolesPermitidos) {
  return (req, res, next) => {
    // Verificar se req.usuario foi definido pelo autenticarToken
    if (!req.usuario || !req.usuario.role) {
      console.warn('Tentativa de acesso sem role definido para o usuário:', req.usuario);
      return res.status(403).json({ erro: "Acesso negado: Perfil de usuário não encontrado ou inválido." });
    }

    // Verificar se o papel do usuário está na lista de papéis permitidos
    if (!rolesPermitidos.includes(req.usuario.role)) {
      console.warn(`Acesso negado para usuário ${req.usuario.id} com role '${req.usuario.role}' na rota ${req.method} ${req.originalUrl}. Roles permitidos: ${rolesPermitidos.join(', ')}`);
      return res.status(403).json({ erro: "Acesso negado: Você não tem permissão para esta ação." });
    }

    next(); // Se o papel for permitido, continua para a próxima função middleware/controller
  };
}

module.exports = { autenticarToken, autorizarPapeis };