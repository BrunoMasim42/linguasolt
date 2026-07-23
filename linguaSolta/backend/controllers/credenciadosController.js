const CredenciadosModel = require("../models/credenciadosModel");

class CredenciadosController {

    // ===============================
    // GET /api/credenciados
    // ===============================
    static async listar(req, res) {

        try {

            const credenciados = await CredenciadosModel.listar();

            return res.status(200).json(credenciados);

        } catch (error) {

            console.error("Erro ao listar credenciados:", error);

            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro interno do servidor."
            });

        }

    }

    // ===============================
    // GET /api/credenciados/:id
    // ===============================
    static async buscarPorId(req, res) {

        try {

            const { id } = req.params;

            const credenciado = await CredenciadosModel.buscarPorId(id);

            if (!credenciado) {

                return res.status(404).json({
                    sucesso: false,
                    mensagem: "Credenciado não encontrado."
                });

            }

            return res.status(200).json(credenciado);

        } catch (error) {

            console.error("Erro ao buscar credenciado:", error);

            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro interno do servidor."
            });

        }

    }

    // ===============================
    // POST /api/credenciados
    // ===============================
    static async criar(req, res) {

        try {

            const dados = {

                nome: req.body.nome,
                cargo: req.body.cargo,
                historico: req.body.historico,
                biografia: req.body.biografia,
                municipio: req.body.municipio,
                telefone: req.body.telefone,
                whatsapp: req.body.whatsapp,
                email: req.body.email,
                instagram: req.body.instagram,
                facebook: req.body.facebook,
                imagem: req.body.imagem,
                ordem: req.body.ordem,
                ativo: req.body.ativo

            };

            const id = await CredenciadosModel.criar(dados);

            return res.status(201).json({

                sucesso: true,
                mensagem: "Credenciado cadastrado com sucesso.",
                id

            });

        } catch (error) {

            console.error("Erro ao cadastrar credenciado:", error);

            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro interno do servidor."
            });

        }

    }

    // ===============================
    // PUT /api/credenciados/:id
    // ===============================
    static async atualizar(req, res) {

        try {

            const { id } = req.params;

            const dados = {

                nome: req.body.nome,
                cargo: req.body.cargo,
                historico: req.body.historico,
                biografia: req.body.biografia,
                municipio: req.body.municipio,
                telefone: req.body.telefone,
                whatsapp: req.body.whatsapp,
                email: req.body.email,
                instagram: req.body.instagram,
                facebook: req.body.facebook,
                imagem: req.body.imagem,
                ordem_exibicao: req.body.ordem_exibicao,
                ativo: req.body.ativo

            };

            const atualizado = await CredenciadosModel.atualizar(id, dados);

            if (!atualizado) {

                return res.status(404).json({
                    sucesso: false,
                    mensagem: "Credenciado não encontrado."
                });

            }

            return res.status(200).json({

                sucesso: true,
                mensagem: "Credenciado atualizado com sucesso."

            });

        } catch (error) {

            console.error("Erro ao atualizar credenciado:", error);

            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro interno do servidor."
            });

        }

    }

    // ===============================
    // DELETE /api/credenciados/:id
    // ===============================
    static async remover(req, res) {

        try {

            const { id } = req.params;

            const removido = await CredenciadosModel.remover(id);

            if (!removido) {

                return res.status(404).json({

                    sucesso: false,
                    mensagem: "Credenciado não encontrado."

                });

            }

            return res.status(200).json({

                sucesso: true,
                mensagem: "Credenciado removido com sucesso."

            });

        } catch (error) {

            console.error("Erro ao remover credenciado:", error);

            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro interno do servidor."
            });

        }

    }

}

module.exports = CredenciadosController;