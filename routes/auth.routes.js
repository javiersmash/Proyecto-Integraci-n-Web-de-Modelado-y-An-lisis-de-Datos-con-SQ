
const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../services/mysql.service");
const { sendError } = require("./route-utils");

const router = express.Router();

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     description: Valida las credenciales de un usuario registrado.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: usuario@correo.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: MiClave123
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso.
 *       400:
 *         description: Faltan el correo o la contraseña.
 *       401:
 *         description: Credenciales incorrectas.
 *       500:
 *         description: Error interno del servidor.
 */
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body || {};

        if (
            typeof email !== "string" ||
            !email.trim() ||
            typeof password !== "string" ||
            !password
        ) {
            return res.status(400).json({
                message: "El correo y la contraseña son obligatorios."
            });
        }

        const [users] = await db.query(
            `SELECT user_id, first_name, last_name, email,
                    password_hash, is_admin
             FROM \`User\`
             WHERE email = ?
             LIMIT 1`,
            [email.trim()]
        );

        if (users.length === 0) {
            return res.status(401).json({
                message: "Credenciales incorrectas."
            });
        }

        const user = users[0];

        const validPassword = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!validPassword) {
            return res.status(401).json({
                message: "Credenciales incorrectas."
            });
        }

        return res.status(200).json({
            message: "Inicio de sesión exitoso.",
            user: {
                user_id: user.user_id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                is_admin: Boolean(user.is_admin)
            }
        });
    } catch (error) {
        return sendError(res, error);
    }
});

module.exports = router;
