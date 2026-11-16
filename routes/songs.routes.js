const express = require("express");
const db = require("../services/mysql.service");
const { isValidId, sendError } = require("./route-utils");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Songs
 *     description: Consulta y gestión de canciones
 */

/**
 * @swagger
 * /songs:
 *   get:
 *     summary: Obtener todas las canciones
 *     tags: [Songs]
 *     responses:
 *       200:
 *         description: Lista de canciones obtenida correctamente
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /songs/{id}:
 *   get:
 *     summary: Obtener una canción por ID
 *     tags: [Songs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Identificador de la canción
 *     responses:
 *       200:
 *         description: Canción encontrada
 *       400:
 *         description: Identificador inválido
 *       404:
 *         description: Canción no encontrada
 *       500:
 *         description: Error interno del servidor
 */

router.get("/", async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT s.song_id, s.title, s.album_id,
                    ar.stage_name AS artist, al.title AS album,
                    s.duration_seconds, s.genre, s.audio_url,
                    s.cover_url, s.created_at
             FROM Song s
             INNER JOIN Album al ON al.album_id = s.album_id
             INNER JOIN Artist ar ON ar.artist_id = al.artist_id
             ORDER BY s.song_id DESC`
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
            "SELECT * FROM Song WHERE song_id = ?",
            [req.params.id]
        );

        if (!rows.length) {
            return res.status(404).json({ message: "Canción no encontrada." });
        }

        return res.status(200).json(rows[0]);
    } catch (error) {
        return sendError(res, error);
    }
});

router.post("/", async (req, res) => {
    try {
        const {
            album_id, title, duration_seconds, genre, audio_url, cover_url
        } = req.body || {};

        if (
            !isValidId(album_id) ||
            typeof title !== "string" ||
            !title.trim() ||
            !Number.isInteger(duration_seconds) ||
            duration_seconds <= 0
        ) {
            return res.status(400).json({
                message: "album_id, title y duration_seconds positivo son obligatorios."
            });
        }

        const [result] = await db.query(
            `INSERT INTO Song
                (album_id, title, duration_seconds, genre, audio_url, cover_url)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                album_id, title.trim(), duration_seconds,
                genre || null, audio_url || null, cover_url || null
            ]
        );

        return res.status(201).json({
            message: "Canción creada correctamente.",
            song_id: result.insertId
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

        const allowed = [
            "album_id", "title", "duration_seconds",
            "genre", "audio_url", "cover_url"
        ];
        const body = req.body || {};
        const fields = allowed.filter(key =>
            Object.prototype.hasOwnProperty.call(body, key)
        );

        if (!fields.length) {
            return res.status(400).json({ message: "No hay campos para actualizar." });
        }

        if (body.album_id !== undefined && !isValidId(body.album_id)) {
            return res.status(400).json({ message: "album_id inválido." });
        }

        if (body.title !== undefined &&
            (typeof body.title !== "string" || !body.title.trim())) {
            return res.status(400).json({ message: "title no puede estar vacío." });
        }

        if (body.duration_seconds !== undefined &&
            (!Number.isInteger(body.duration_seconds) || body.duration_seconds <= 0)) {
            return res.status(400).json({
                message: "duration_seconds debe ser un entero positivo."
            });
        }

        const [result] = await db.query(
            `UPDATE Song SET ${fields.map(key => `\`${key}\` = ?`).join(", ")}
             WHERE song_id = ?`,
            [...fields.map(key => body[key]), req.params.id]
        );

        if (!result.affectedRows) {
            const [rows] = await db.query(
                "SELECT song_id FROM Song WHERE song_id = ?",
                [req.params.id]
            );
            if (!rows.length) {
                return res.status(404).json({ message: "Canción no encontrada." });
            }
        }

        return res.status(200).json({ message: "Canción actualizada correctamente." });
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
            "DELETE FROM Song WHERE song_id = ?",
            [req.params.id]
        );

        if (!result.affectedRows) {
            return res.status(404).json({ message: "Canción no encontrada." });
        }

        return res.status(200).json({ message: "Canción eliminada correctamente." });
    } catch (error) {
        return sendError(res, error);
    }
});

module.exports = router;