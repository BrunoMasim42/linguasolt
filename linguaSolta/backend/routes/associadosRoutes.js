const express = require("express");

const router = express.Router();

const associadosController = require("../controllers/associadosController");

/* ==========================================
   ROTAS
========================================== */

// Listar todos
router.get("/", associadosController.listar);

// Buscar por ID
router.get("/:id", associadosController.buscarPorId);

// Novo associado
router.post("/", associadosController.cadastrar);

module.exports = router;