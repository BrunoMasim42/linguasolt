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

        ) VALUES (

            ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?

        )
    `;

    const valores = [

        dados.nome || null,
        dados.cpf || null,
        dados.rg || null,
        dados.nascimento || null,
        dados.sexo || null,
        dados.email || null,
        dados.telefone || null,
        dados.cep || null,
        dados.endereco || null,
        dados.numero || null,
        dados.complemento || null,
        dados.bairro || null,
        dados.cidade || null,
        dados.estado || null,
        dados.profissao || null,
        dados.escolaridade || null,
        dados.local_atuacao || null,
        dados.comunidade || null,
        dados.descricao || null,
        dados.funcao || null,
        dados.funcao_outro || null,
        dados.editais || null,
        dados.historico || null

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