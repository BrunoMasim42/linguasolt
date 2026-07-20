const db = require("../config/db");

/* ==========================================
   LISTAR TODOS
========================================== */

async function listar() {

    const [rows] = await db.query(`
        SELECT *
        FROM associados
        ORDER BY created_at DESC
    `);

    return rows;

}

/* ==========================================
   BUSCAR POR ID
========================================== */

async function buscarPorId(id) {

    const [rows] = await db.query(`
        SELECT *
        FROM associados
        WHERE id = ?
    `, [id]);

    return rows[0];

}

/* ==========================================
   CADASTRAR
========================================== */

async function cadastrar(dados) {

    const sql = `
        INSERT INTO associados (

            nome,
            cpf,
            rg,
            nascimento,
            sexo,
            email,
            telefone,
            cep,
            endereco,
            numero,
            complemento,
            bairro,
            cidade,
            estado,
            profissao,
            escolaridade,
            local_atuacao,
            comunidade,
            descricao,
            funcao,
            funcao_outro,
            editais,
            historico

        )

        VALUES (

            ?,?,?,?,?,?,
            ?,?,?,?,?,?,
            ?,?,?,?,?,?,
            ?,?,?,?,?,?

        )
    `;

    const valores = [

        dados.nome,
        dados.cpf,
        dados.rg,
        dados.nascimento,
        dados.sexo,
        dados.email,
        dados.telefone,
        dados.cep,
        dados.endereco,
        dados.numero,
        dados.complemento,
        dados.bairro,
        dados.cidade,
        dados.estado,
        dados.profissao,
        dados.escolaridade,
        dados.local_atuacao,
        dados.comunidade,
        dados.descricao,
        dados.funcao,
        dados.funcao_outro,
        dados.editais,
        dados.historico

    ];

    const [result] = await db.execute(sql, valores);

    return result.insertId;

}

/* ==========================================
   EXPORTS
========================================== */

module.exports = {

    listar,
    buscarPorId,
    cadastrar

};