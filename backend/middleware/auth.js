const jwt = require('jsonwebtoken');

function autenticarToken(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ erro: 'Token ausente' });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ erro: 'Token inválido' });
    req.usuarioId = decoded.id;
    next();
  });
}

module.exports = autenticarToken;
