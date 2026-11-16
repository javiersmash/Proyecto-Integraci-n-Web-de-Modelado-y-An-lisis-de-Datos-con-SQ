const express = require("express");
const db = require("../services/mysql.service");
const { isValidId, sendError } = require("./route-utils");

const router = express.Router();
/**
 * @swagger
 * tags:
 *   - name: Albums
 *     description: Consulta y gestión de álbumes musicales
 */

/**
 * @swagger
 * /albums:
 *   get:
 *     summary: Obtener todos los álbumes
 *     tags: [Albums]
 *     responses:
 *       200:
 *         description: Lista de álbumes obtenida correctamente
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /albums/{id}:
 *   get:
 *     summary: Obtener un álbum por ID
 *     tags: [Albums]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Identificador del álbum
 *     responses:
 *       200:
 *         description: Álbum encontrado
 *       400:
 *         description: Identificador inválido
 *       404:
 *         description: Álbum no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get("/", async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT al.album_id, al.title, al.artist_id,
                    ar.stage_name AS artist, al.release_date, al.cover_url
             FROM Album al
             INNER JOIN Artist ar ON ar.artist_id = al.artist_id
             ORDER BY al.album_id DESC`
        );
        return res.status(200).json(rows);
    } catch (error) {
        return sendError(res, error);
    }
});

router.get("/:id", async (req, res) => {
    try {
        if (!isValidId(req.params.id)) {
            return res.status(400).json({ message: "ID inválido." });
        }

        const [rows] = await db.query(
            "SELECT * FROM Album WHERE album_id = ?",
            [req.params.id]
        );

        if (!rows.length) {
            return res.status(404).json({ message: "Álbum no encontrado." });
        }

        return res.status(200).json(rows[0]);
    } catch (error) {
        return sendError(res, error);
    }
});

router.post("/", async (req, res) => {
    try {
        const { artist_id, title, release_date, cover_url } = req.body || {};

        if (!isValidId(artist_id) || typeof title !== "string" || !title.trim()) {
            return res.status(400).json({
                message: "artist_id y title son obligatorios."
            });
        }

        const [result] = await db.query(
            `INSERT INTO Album (artist_id, title, release_date, cover_url)
             VALUES (?, ?, ?, ?)`,
            [artist_id, title.trim(), release_date || null, cover_url || null]
        );

        return res.status(201).json({
            message: "Álbum creado correctamente.",
            album_id: result.insertId
        });
    } catch (error) {
        return sendError(res, error);
    }
});

router.put("/:id", async (req, res) => {
    try {
        if (!isValidId(req.params.id)) {
            return res.status(400).json({ message: "ID inválido." });
        }

        const allowed = ["artist_id", "title", "release_date", "cover_url"];
        const body = req.body || {};
        const fields = allowed.filter(key =>
            Object.prototype.hasOwnProperty.call(body, key)
        );

        if (!fields.length) {
            return res.status(400).json({ message: "No hay campos para actualizar." });
        }

        if (body.artist_id !== undefined && !isValidId(body.artist_id)) {
            return res.status(400).json({ message: "artist_id inválido." });
        }

        if (body.title !== undefined &&
            (typeof body.title !== "string" || !body.title.trim())) {
            return res.status(400).json({ message: "title no puede estar vacío." });
        }

        const [result] = await db.query(
            `UPDATE Album SET ${fields.map(key => `\`${key}\` = ?`).join(", ")}
             WHERE album_id = ?`,
            [...fields.map(key => body[key]), req.params.id]
        );

        if (!result.affectedRows) {
            const [rows] = await db.query(
                "SELECT album_id FROM Album WHERE album_id = ?",
                [req.params.id]
            );
            if (!rows.length) {
                return res.status(404).json({ message: "Álbum no encontrado." });
            }
        }

        return res.status(200).json({ message: "Álbum actualizado correctamente." });
    } catch (error) {
        return sendError(res, error);
    }
});

router.delete("/:id", async (req, res) => {
    try {
        if (!isValidId(req.params.id)) {
            return res.status(400).json({ message: "ID inválido." });
        }

        const [result] = await db.query(
            "DELETE FROM Album WHERE album_id = ?",
            [req.params.id]
        );

        if (!result.affectedRows) {
            return res.status(404).json({ message: "Álbum no encontrado." });
        }

        return res.status(200).json({ message: "Álbum eliminado correctamente." });
    } catch (error) {
        return sendError(res, error);
    }
});

module.exports = router;