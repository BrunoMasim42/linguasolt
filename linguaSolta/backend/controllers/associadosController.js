const associadosModel = require("../models/associadosModel");

/* ==========================================
   LISTAR
========================================== */

async function listar(req, res) {

    try {

        const associados = await associadosModel.listar();

        res.json(associados);

    } catch (erro) {

        console.error(erro);

        res.status(500).json({
            erro: "Erro ao listar associados."
        });

    }

}

/* ==========================================
   BUSCAR POR ID
========================================== */

async function buscarPorId(req, res) {

    try {

        const associado = await associadosModel.buscarPorId(req.params.id);

        if (!associado) {

            return res.status(404).json({
                erro: "Associado não encontrado."
            });

        }

        res.json(associado);

    } catch (erro) {

        console.error(erro);

        res.status(500).json({
            erro: "Erro ao buscar associado."
        });

    }

}

/* ==========================================
   CADASTRAR
========================================== */

async function cadastrar(req, res) {

    try {

        const id = await associadosModel.cadastrar(req.body);

        res.status(201).json({

            sucesso: true,
            id

        });

    } catch (erro) {

        console.error(erro);

        res.status(500).json({

            erro: "Erro ao cadastrar associado."

        });

    }

}

/* ==========================================
   EXPORTS
========================================== */

module.exports = {

    listar,
    buscarPorId,
    cadastrar

};