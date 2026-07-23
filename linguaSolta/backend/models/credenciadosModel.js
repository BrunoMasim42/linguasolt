const db = require('../config/db');

class CredenciadosModel {

    static async listar() {

        const [rows] = await db.query(`
            SELECT
                id,
                nome,
                cargo,
                historico,
                biografia,
                municipio,
                telefone,
                whatsapp,
                email,
                instagram,
                facebook,
                imagem,
                ordem,
                ativo,
                criado_em
            FROM credenciados
            WHERE ativo = 1
            ORDER BY ordem ASC, nome ASC
        `);

        return rows;

    }

    static async buscarPorId(id) {

        const [rows] = await db.query(
            `
            SELECT *
            FROM credenciados
            WHERE id = ?
            LIMIT 1
            `,
            [id]
        );

        return rows.length ? rows[0] : null;

    }

    static async criar(dados) {

        const sql = `
            INSERT INTO credenciados
            (
                nome,
                cargo,
                historico,
                biografia,
                municipio,
                telefone,
                whatsapp,
                email,
                instagram,
                facebook,
                imagem,
                ordem,
                ativo
            )
            VALUES
            (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const valores = [

            dados.nome,
            dados.cargo,
            dados.historico,
            dados.biografia,
            dados.municipio,
            dados.telefone,
            dados.whatsapp,
            dados.email,
            dados.instagram,
            dados.facebook,
            dados.imagem,
            dados.ordem || 0,
            dados.ativo ?? 1

        ];

        const [result] = await db.query(sql, valores);

        return result.insertId;

    }

    static async atualizar(id, dados) {

        const sql = `
            UPDATE credenciados
            SET
                nome = ?,
                cargo = ?,
                historico = ?,
                biografia = ?,
                municipio = ?,
                telefone = ?,
                whatsapp = ?,
                email = ?,
                instagram = ?,
                facebook = ?,
                imagem = ?,
                ordem = ?,
                ativo = ?
            WHERE id = ?
        `;

        const valores = [

            dados.nome,
            dados.cargo,
            dados.historico,
            dados.biografia,
            dados.municipio,
            dados.telefone,
            dados.whatsapp,
            dados.email,
            dados.instagram,
            dados.facebook,
            dados.imagem,
            dados.ordem || 0,
            dados.ativo ?? 1,
            id

        ];

        const [result] = await db.query(sql, valores);

        return result.affectedRows;

    }

    static async remover(id) {

        const [result] = await db.query(
            `DELETE FROM credenciados WHERE id = ?`,
            [id]
        );

        return result.affectedRows;

    }

}

module.exports = CredenciadosModel;