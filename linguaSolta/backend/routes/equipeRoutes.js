const express = require("express");
const router = express.Router();
const db = require("../config/db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

/* ======================================================
   CONFIGURAÇÃO DE UPLOAD
====================================================== */

const uploadDir = path.join(__dirname, "../uploads");

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({

    destination(req, file, cb) {
        cb(null, uploadDir);
    },

    filename(req, file, cb) {

        const nome =
            Date.now() +
            "-" +
            Math.random().toString(16).substring(2) +
            path.extname(file.originalname);

        cb(null, nome);

    }

});

const upload = multer({ storage });


/* ======================================================
   LISTAR MEMBROS
====================================================== */

router.get("/", (req, res) => {

    db.query(
        "SELECT * FROM equipe ORDER BY ordem ASC, id DESC",
        (err, rows) => {

            if (err) {
                console.error(err);
                return res.status(500).json(err);
            }

            res.json(rows);

        }
    );

});


/* ======================================================
   CADASTRAR MEMBRO
====================================================== */

router.post("/", upload.single("foto"), (req, res) => {

    const {
        nome,
        cargo,
        biografia,
        facebook,
        instagram,
        whatsapp,
        ordem,
        ativo
    } = req.body;

    const foto = req.file
        ? "/uploads/" + req.file.filename
        : null;

    db.query(

        `INSERT INTO equipe
        (
            nome,
            cargo,
            biografia,
            foto,
            facebook,
            instagram,
            whatsapp,
            ordem,
            ativo
        )
        VALUES (?,?,?,?,?,?,?,?,?)`,

        [

            nome,
            cargo,
            biografia,
            foto,
            facebook,
            instagram,
            whatsapp,
            ordem || 0,
            ativo || 1

        ],

        (err) => {

            if (err) {
                console.error(err);
                return res.status(500).json(err);
            }

            res.json({
                success: true,
                message: "Membro cadastrado com sucesso."
            });

        }

    );

});


/* ======================================================
   ALTERAR MEMBRO
====================================================== */

router.put("/:id", upload.single("foto"), (req, res) => {

    const id = req.params.id;

    const {
        nome,
        cargo,
        biografia,
        facebook,
        instagram,
        whatsapp,
        ordem,
        ativo
    } = req.body;

    if (req.file) {

        db.query(

            `UPDATE equipe SET

                nome=?,
                cargo=?,
                biografia=?,
                foto=?,
                facebook=?,
                instagram=?,
                whatsapp=?,
                ordem=?,
                ativo=?

            WHERE id=?`,

            [

                nome,
                cargo,
                biografia,
                "/uploads/" + req.file.filename,
                facebook,
                instagram,
                whatsapp,
                ordem,
                ativo,
                id

            ],

            (err) => {

                if (err) return res.status(500).json(err);

                res.json({
                    success: true,
                    message: "Registro atualizado."
                });

            }

        );

    } else {

        db.query(

            `UPDATE equipe SET

                nome=?,
                cargo=?,
                biografia=?,
                facebook=?,
                instagram=?,
                whatsapp=?,
                ordem=?,
                ativo=?

            WHERE id=?`,

            [

                nome,
                cargo,
                biografia,
                facebook,
                instagram,
                whatsapp,
                ordem,
                ativo,
                id

            ],

            (err) => {

                if (err) return res.status(500).json(err);

                res.json({
                    success: true,
                    message: "Registro atualizado."
                });

            }

        );

    }

});


/* ======================================================
   EXCLUIR MEMBRO
====================================================== */

router.delete("/:id", (req, res) => {

    db.query(

        "DELETE FROM equipe WHERE id=?",

        [req.params.id],

        (err) => {

            if (err) {
                return res.status(500).json(err);
            }

            res.json({
                success: true,
                message: "Registro removido."
            });

        }

    );

});


module.exports = router;