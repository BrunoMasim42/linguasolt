
const express = require("express");
const router = express.Router();

const CredenciadosController = require("../controllers/credenciadosController");

// ======================================================
// LISTAR TODOS OS CREDENCIADOS
// GET /api/credenciados
// ======================================================

router.get(
    "/",
    CredenciadosController.listar
);

// ======================================================
// BUSCAR CREDENCIADO POR ID
// GET /api/credenciados/:id
// ======================================================

router.get(
    "/:id",
    CredenciadosController.buscarPorId
);

// ======================================================
// CADASTRAR NOVO CREDENCIADO
// POST /api/credenciados
// ======================================================

router.post(
    "/",
    CredenciadosController.criar
);

// ======================================================
// ATUALIZAR CREDENCIADO
// PUT /api/credenciados/:id
// ======================================================

router.put(
    "/:id",
    CredenciadosController.atualizar
);

// ======================================================
// EXCLUIR CREDENCIADO
// DELETE /api/credenciados/:id
// ======================================================

router.delete(
    "/:id",
    CredenciadosController.remover
);

module.exports = router;