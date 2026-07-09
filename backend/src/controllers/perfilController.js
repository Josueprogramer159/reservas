import pool from '../db/database.js';

function getUsuarioId(req) {
  return req.session?.userId || req.session?.usuario?.id || null;
}

const perfilController = {
  async getPerfil(req, res) {
    try {
      const usuarioId = getUsuarioId(req);
      if (!usuarioId) {
        return res.status(401).json({ success: false, message: 'Debes iniciar sesión para ver tu perfil' });
      }

      const result = await pool.query(
        'SELECT id, nombre, email, fecha_registro AS created_at FROM usuarios WHERE id = $1',
        [usuarioId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
      }

      const usuario = {
        ...result.rows[0],
        apellido: null,
        telefono: null,
        rol: 'user'
      };

      res.json({ success: true, usuario });
    } catch (error) {
      console.error('Error al obtener perfil:', error);
      res.status(500).json({ success: false, message: 'Error al obtener perfil' });
    }
  },

  async updatePerfil(req, res) {
    try {
      const usuarioId = getUsuarioId(req);
      if (!usuarioId) {
        return res.status(401).json({ success: false, message: 'Debes iniciar sesión para actualizar tu perfil' });
      }

      const { nombre, apellido, telefono } = req.body;

      if (!nombre?.trim()) {
        return res.status(400).json({ success: false, message: 'El nombre es requerido' });
      }

      const result = await pool.query(
        'UPDATE usuarios SET nombre = $1 WHERE id = $2 RETURNING id, nombre, email, fecha_registro AS created_at',
        [nombre.trim(), usuarioId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
      }

      const usuario = {
        ...result.rows[0],
        apellido: apellido || null,
        telefono: telefono || null,
        rol: 'user'
      };

      res.json({ success: true, usuario });
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      res.status(500).json({ success: false, message: 'Error al actualizar perfil' });
    }
  }
};

export default perfilController;
