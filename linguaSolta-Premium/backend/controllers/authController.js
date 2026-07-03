const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const hash = (value) => crypto.createHash('sha256').update(String(value)).digest('hex');

function getJwtSecret() {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  if (process.env.NODE_ENV === 'production') return null;
  return 'troque_esta_chave_dev';
}

exports.login = async (req, res) => {
  try {
    const secret = getJwtSecret();
    if (!secret) {
      return res.status(500).json({ erro: 'JWT_SECRET nao configurado no servidor.' });
    }

    const { email, senha } = req.body;
    if (!email || !senha) {
      return res.status(400).json({ erro: 'Informe e-mail e senha.' });
    }

    const [rows] = await pool.query('SELECT id, nome, email, senha, tipo FROM usuarios WHERE email = ?', [email]);
    if (!rows.length || rows[0].senha !== hash(senha)) {
      return res.status(401).json({ erro: 'Credenciais invalidas.' });
    }

    const usuario = rows[0];
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, tipo: usuario.tipo },
      secret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );

    res.json({
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        tipo: usuario.tipo
      }
    });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao fazer login.', detalhe: error.message });
  }
};
