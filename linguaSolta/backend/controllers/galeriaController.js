const pool = require('../config/db');

/* ==========================================
LISTAR
========================================== */

exports.listar = async (_req, res) => {

    try {

        const [rows] = await pool.query(
            'SELECT * FROM galeria ORDER BY ano DESC, ordem ASC, criado_em DESC'
        );

        res.json(rows);

    } catch (error) {

        res.status(500).json({
            erro: 'Erro ao listar galeria.',
            detalhe: error.message
        });

    }

};

/* ==========================================
CADASTRAR
========================================== */

exports.criar = async (req, res) => {

    try {

        const {
            titulo,
            ano,
            capa,
            descricao,
            ordem,
            ativo
        } = req.body;

        const anoFoto = Number(ano || new Date().getFullYear());
        const capaFoto = Number(capa || 0);

        const imagem = req.file
            ? `/uploads/${req.file.filename}`
            : null;

        // Se esta foto será a capa,
        // remove a capa das outras fotos do mesmo ano
        if (capaFoto === 1) {

            await pool.query(
                'UPDATE galeria SET capa = 0 WHERE ano = ?',
                [anoFoto]
            );

        }

        const [result] = await pool.query(

            `INSERT INTO galeria
            (
                titulo,
                ano,
                capa,
                imagem,
                descricao,
                ordem,
                ativo
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)`,

            [
                titulo || null,
                anoFoto,
                capaFoto,
                imagem,
                descricao || null,
                Number(ordem || 0),
                Number(ativo ?? 1)
            ]

        );

        res.status(201).json({

            id: result.insertId,
            mensagem: 'Foto cadastrada com sucesso.'

        });

    } catch (error) {

        res.status(500).json({

            erro: 'Erro ao cadastrar foto.',
            detalhe: error.message

        });

    }

};

/* ==========================================
ATUALIZAR
========================================== */

exports.atualizar = async (req, res) => {

    try {

        const {
            titulo,
            ano,
            capa,
            descricao,
            ordem,
            ativo
        } = req.body;

        const anoFoto = Number(ano || new Date().getFullYear());
        const capaFoto = Number(capa || 0);

        const [rows] = await pool.query(
            'SELECT imagem FROM galeria WHERE id = ?',
            [req.params.id]
        );

        if (!rows.length) {

            return res.status(404).json({

                erro: 'Foto não encontrada.'

            });

        }

        const imagem = req.file
            ? `/uploads/${req.file.filename}`
            : rows[0].imagem;

        // Se esta foto virou capa,
        // remove a capa das demais fotos do mesmo ano
        if (capaFoto === 1) {

            await pool.query(
                'UPDATE galeria SET capa = 0 WHERE ano = ?',
                [anoFoto]
            );

        }

        await pool.query(

            `UPDATE galeria
            SET
                titulo = ?,
                ano = ?,
                capa = ?,
                imagem = ?,
                descricao = ?,
                ordem = ?,
                ativo = ?
            WHERE id = ?`,

            [
                titulo || null,
                anoFoto,
                capaFoto,
                imagem,
                descricao || null,
                Number(ordem || 0),
                Number(ativo ?? 1),
                req.params.id
            ]

        );

        res.json({

            mensagem: 'Foto atualizada com sucesso.'

        });

    } catch (error) {

        res.status(500).json({

            erro: 'Erro ao atualizar foto.',
            detalhe: error.message

        });

    }

};

/* ==========================================
EXCLUIR
========================================== */

exports.excluir = async (req, res) => {

    try {

        await pool.query(
            'DELETE FROM galeria WHERE id = ?',
            [req.params.id]
        );

        res.json({

            mensagem: 'Foto excluída com sucesso.'

        });

    } catch (error) {

        res.status(500).json({

            erro: 'Erro ao excluir foto.',
            detalhe: error.message

        });

    }

};