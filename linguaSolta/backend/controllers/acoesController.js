const pool = require('../config/db');
exports.listar = async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM acoes ORDER BY ordem ASC, criado_em DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao listar ações.', detalhe: error.message });
  }
};
exports.buscar = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM acoes WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ erro: 'Ação não encontrada.' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar ação.', detalhe: error.message });
  }
};
exports.criar = async (req, res) => {
  try {
    const { titulo, descricao, link, ordem, ativo } = req.body;
    const imagem = req.file ? `/uploads/${req.file.filename}` : null;
    const [result] = await pool.query(
      'INSERT INTO acoes (titulo, descricao, imagem, link, ordem, ativo) VALUES (?, ?, ?, ?, ?, ?)',
      [titulo, descricao || null, imagem, link || null, Number(ordem ?? 0), Number(ativo ?? 1)]
    );
    res.status(201).json({ id: result.insertId, mensagem: 'Ação criada com sucesso.' });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao criar ação.', detalhe: error.message });
  }
};
exports.atualizar = async (req, res) => {
  try {
    const { titulo, descricao, link, ordem, ativo } = req.body;
    const [rows] = await pool.query('SELECT imagem FROM acoes WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ erro: 'Ação não encontrada.' });
    const imagem = req.file ? `/uploads/${req.file.filename}` : rows[0].imagem;
    await pool.query(
      'UPDATE acoes SET titulo=?, descricao=?, imagem=?, link=?, ordem=?, ativo=? WHERE id=?',
      [titulo, descricao || null, imagem, link || null, Number(ordem ?? 0), Number(ativo ?? 1), req.params.id]
    );
    res.json({ mensagem: 'Ação atualizada com sucesso.' });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao atualizar ação.', detalhe: error.message });
  }
};
exports.excluir = async (req, res) => {
  try {
    await pool.query('DELETE FROM acoes WHERE id = ?', [req.params.id]);
    res.json({ mensagem: 'Ação excluída com sucesso.' });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao excluir ação.', detalhe: error.message });
  }
};
