const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../services/mysql.service");
const { isValidId, sendError } = require("./route-utils");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Users
 *     description: Gestión de usuarios de SoundNest
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Obtener todos los usuarios
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Lista de usuarios obtenida correctamente
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Obtener un usuario por ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Identificador del usuario
 *     responses:
 *       200:
 *         description: Usuario encontrado
 *       400:
 *         description: Identificador inválido
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error interno del servidor
 */

router.post("/", async (req, res) => {
    try {
        const {
            first_name,
            last_name,
            email,
            password,
            birth_date
        } = req.body || {};

        if (
            typeof first_name !== "string" ||
            !first_name.trim() ||
            typeof email !== "string" ||
            !email.trim() ||
            typeof password !== "string" ||
            password.length < 8
        ) {
            return res.status(400).json({
                message: "Nombre, correo y contraseña de al menos 8 caracteres son obligatorios."
            });
        }

        const password_hash = await bcrypt.hash(password, 12);

        const [result] = await db.query(
            `INSERT INTO \`User\`
                (first_name, last_name, email, password_hash, birth_date)
             VALUES (?, ?, ?, ?, ?)`,
            [
                first_name.trim(),
                last_name?.trim() || null,
                email.trim(),
                password_hash,
                birth_date || null
            ]
        );

        // El trigger de MySQL crea automáticamente la lista Liked Songs.
        return res.status(201).json({
            message: "Usuario creado correctamente.",
            user_id: result.insertId
        });
    } catch (error) {
        return sendError(res, error);
    }
});

router.get("/", async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT user_id, first_name, last_name, email,
                    birth_date, is_admin, created_at
             FROM \`User\`
             ORDER BY user_id DESC`
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
            `SELECT user_id, first_name, last_name, email,
                    birth_date, is_admin, created_at
             FROM \`User\`
             WHERE user_id = ?`,
            [req.params.id]
        );

        if (!rows.length) {
            return res.status(404).json({
                message: "Usuario no encontrado."
            });
        }

        return res.status(200).json(rows[0]);
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
            "first_name",
            "last_name",
            "email",
            "birth_date"
        ];

        const body = req.body || {};
        const fields = allowed.filter(
            key => Object.prototype.hasOwnProperty.call(body, key)
        );

        if (!fields.length) {
            return res.status(400).json({
                message: "No se enviaron campos válidos para actualizar."
            });
        }

        for (const key of fields) {
            if (
                key !== "birth_date" &&
                body[key] !== null &&
                typeof body[key] !== "string"
            ) {
                return res.status(400).json({
                    message: `El campo ${key} debe ser texto.`
                });
            }
        }

        if (
            Object.prototype.hasOwnProperty.call(body, "first_name") &&
            !String(body.first_name || "").trim()
        ) {
            return res.status(400).json({
                message: "El nombre no puede estar vacío."
            });
        }

        if (
            Object.prototype.hasOwnProperty.call(body, "email") &&
            !String(body.email || "").trim()
        ) {
            return res.status(400).json({
                message: "El correo no puede estar vacío."
            });
        }

        const values = fields.map(key =>
            typeof body[key] === "string" ? body[key].trim() : body[key]
        );

        const [result] = await db.query(
            `UPDATE \`User\`
             SET ${fields.map(key => `\`${key}\` = ?`).join(", ")}
             WHERE user_id = ?`,
            [...values, req.params.id]
        );

        if (!result.affectedRows) {
            return res.status(404).json({
                message: "Usuario no encontrado."
            });
        }

        return res.status(200).json({
            message: "Usuario actualizado correctamente."
        });
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
            "DELETE FROM `User` WHERE user_id = ?",
            [req.params.id]
        );

        if (!result.affectedRows) {
            return res.status(404).json({
                message: "Usuario no encontrado."
            });
        }

        return res.status(200).json({
            message: "Usuario eliminado correctamente."
        });
    } catch (error) {
        return sendError(res, error);
    }
});



module.exports = router;