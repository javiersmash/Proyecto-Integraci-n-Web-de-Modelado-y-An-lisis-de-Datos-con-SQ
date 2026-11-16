
const express = require("express");
const db = require("../services/mysql.service");
const { isValidId, sendError } = require("./route-utils");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Playlists
 *     description: Gestión de listas de reproducción de SoundNest
 */

/**
 * @swagger
 * /playlists:
 *   get:
 *     summary: Obtener todas las listas de reproducción
 *     tags: [Playlists]
 *     responses:
 *       200:
 *         description: Listas obtenidas correctamente
 *       500:
 *         description: Error interno del servidor
 */
router.get("/", async (req, res) => {
    try {
        const [playlists] = await db.query(
            "SELECT * FROM Playlist"
        );

        return res.status(200).json(playlists);
    } catch (error) {
        return sendError(res, error);
    }
});

/**
 * @swagger
 * /playlists/{id}:
 *   get:
 *     summary: Obtener una lista por ID
 *     tags: [Playlists]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la lista de reproducción
 *     responses:
 *       200:
 *         description: Lista encontrada
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Lista no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidId(id)) {
            return res.status(400).json({
                message: "El ID debe ser un número positivo."
            });
        }

        const [playlists] = await db.query(
            "SELECT * FROM Playlist WHERE playlist_id = ?",
            [id]
        );

        if (playlists.length === 0) {
            return res.status(404).json({
                message: "Lista de reproducción no encontrada."
            });
        }

        return res.status(200).json(playlists[0]);
    } catch (error) {
        return sendError(res, error);
    }
});

/**
 * @swagger
 * /playlists:
 *   post:
 *     summary: Crear una lista de reproducción
 *     tags: [Playlists]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - user_id
 *             properties:
 *               name:
 *                 type: string
 *                 example: Mis canciones favoritas
 *               user_id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Lista creada correctamente
 *       400:
 *         description: Datos inválidos o incompletos
 *       409:
 *         description: Conflicto con los datos relacionados
 *       500:
 *         description: Error interno del servidor
 */
router.post("/", async (req, res) => {
    try {
        const { name, user_id } = req.body || {};

        if (
            typeof name !== "string" ||
            !name.trim() ||
            !isValidId(user_id)
        ) {
            return res.status(400).json({
                message: "El nombre y un user_id válido son obligatorios."
            });
        }

        const [result] = await db.query(
            "INSERT INTO Playlist (name, user_id) VALUES (?, ?)",
            [name.trim(), Number(user_id)]
        );

        return res.status(201).json({
            message: "Lista de reproducción creada correctamente.",
            playlist_id: result.insertId
        });
    } catch (error) {
        return sendError(res, error);
    }
});

/**
 * @swagger
 * /playlists/{id}:
 *   put:
 *     summary: Actualizar una lista de reproducción
 *     tags: [Playlists]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la lista que se actualizará
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Mi playlist actualizada
 *     responses:
 *       200:
 *         description: Lista actualizada correctamente
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Lista no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body || {};

        if (!isValidId(id) || typeof name !== "string" || !name.trim()) {
            return res.status(400).json({
                message: "Se requiere un ID válido y un nombre."
            });
        }

        const [result] = await db.query(
            "UPDATE Playlist SET name = ? WHERE playlist_id = ?",
            [name.trim(), id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Lista de reproducción no encontrada."
            });
        }

        return res.status(200).json({
            message: "Lista de reproducción actualizada correctamente."
        });
    } catch (error) {
        return sendError(res, error);
    }
});

/**
 * @swagger
 * /playlists/{id}:
 *   delete:
 *     summary: Eliminar una lista de reproducción
 *     tags: [Playlists]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la lista que se eliminará
 *     responses:
 *       200:
 *         description: Lista eliminada correctamente
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Lista no encontrada
 *       409:
 *         description: La lista tiene registros relacionados
 *       500:
 *         description: Error interno del servidor
 */
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidId(id)) {
            return res.status(400).json({
                message: "El ID debe ser un número positivo."
            });
        }

        const [result] = await db.query(
            "DELETE FROM Playlist WHERE playlist_id = ?",
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Lista de reproducción no encontrada."
            });
        }

        return res.status(200).json({
            message: "Lista de reproducción eliminada correctamente."
        });
    } catch (error) {
        return sendError(res, error);
    }
});

module.exports = router;
