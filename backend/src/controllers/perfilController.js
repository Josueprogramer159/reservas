import pool from '../db/database.js';

const perfilController = {
  async getPerfil(req, res) {
    try {
      const usuarioId = req.session.usuario.id;

      const result = await pool.query(
        'SELECT id, nombre, apellido, email, telefono, rol, created_at FROM usuarios WHERE id = $1',
        [usuarioId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
      }

      res.json({ success: true, usuario: result.rows[0] });
    } catch (error) {
      console.error('Error al obtener perfil:', error);
      res.status(500).json({ success: false, message: 'Error al obtener perfil' });
    }
  },

  async updatePerfil(req, res) {
    try {
      const usuarioId = req.session.usuario.id;
      const { nombre, apellido, telefono } = req.body;

      if (!nombre || !apellido) {
        return res.status(400).json({ success: false, message: 'Nombre y apellido requeridos' });
      }

      const result = await pool.query(
        'UPDATE usuarios SET nombre = $1, apellido = $2, telefono = $3 WHERE id = $4 RETURNING id, nombre, apellido, email, telefono, rol',
        [nombre, apellido, telefono || null, usuarioId]
      );

      res.json({ success: true, usuario: result.rows[0] });
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      res.status(500).json({ success: false, message: 'Error al actualizar perfil' });
    }
  }
};

export default perfilController;
