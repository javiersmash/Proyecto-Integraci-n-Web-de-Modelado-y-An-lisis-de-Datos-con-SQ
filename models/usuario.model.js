const pool = require('./env/mysqlConfig'); // O ajusta la ruta según donde tengas tu archivo de conexión a la base de datos
const bcrypt = require('bcrypt');

const UsuarioModel = {
    async crear({ nombre, correo_electronico, credencial }) {
        // Hasheamos la contraseña de forma segura con bcrypt
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(credencial, saltRounds);

        const [result] = await pool.query(
            'INSERT INTO `User` (first_name, email, password_hash) VALUES (?, ?, ?)',
            [nombre, correo_electronico, passwordHash]
        );
        return { id: result.insertId, nombre, correo_electronico };
    },

    async buscarPorCorreo(correo_electronico) {
        const [rows] = await pool.query(
            'SELECT user_id AS id, first_name AS nombre, email AS correo_electronico, password_hash AS credencial, is_admin FROM `User` WHERE email = ?',
            [correo_electronico]
        );
        return rows[0];
    },

    async obtenerTodos() {
        const [rows] = await pool.query('SELECT user_id AS id, first_name AS nombre, email AS correo_electronico, is_admin FROM `User`');
        return rows;
    }
};

module.exports = UsuarioModel;