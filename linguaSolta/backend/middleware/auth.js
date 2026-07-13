const jwt = require('jsonwebtoken');

function getJwtSecret() {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  if (process.env.NODE_ENV === 'production') return null;
  return 'troque_esta_chave_dev';
}

module.exports = (req, res, next) => {
  const secret = getJwtSecret();
  if (!secret) {
    return res.status(500).json({ erro: 'JWT_SECRET nao configurado no servidor.' });
  }

  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;

  if (!token) {
    return res.status(401).json({ erro: 'Token nao informado.' });
  }

  try {
    req.usuario = jwt.verify(token, secret);
    next();
  } catch {
    res.status(401).json({ erro: 'Token invalido ou expirado.' });
  }
};
