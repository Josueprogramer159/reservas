import pool from '../db/database.js';

const perfilController = {
  async getPerfil(req, res) {
    try {
      const usuarioId = req.session?.userId;
      
      if (!usuarioId) {
        console.log('❌ No hay userId en sesión. Session:', req.session);
        return res.status(401).json({ success: false, message: 'No autenticado' });
      }

      console.log('✅ userId encontrado:', usuarioId);

      // Query simple para obtener usuario
      const userResult = await pool.query(
        'SELECT id, nombre, email FROM usuarios WHERE id = $1',
        [usuarioId]
      );

      if (userResult.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
      }

      const usuario = userResult.rows[0];
      console.log('✅ Usuario obtenido:', usuario);

      res.json({ success: true, usuario });
    } catch (error) {
      console.error('❌ Error en getPerfil:', error.message);
      res.status(500).json({ success: false, message: 'Error al obtener perfil' });
    }
  },

  async updatePerfil(req, res) {
    try {
      const usuarioId = req.session?.userId;
      
      if (!usuarioId) {
        return res.status(401).json({ success: false, message: 'No autenticado' });
      }

      const { nombre } = req.body;

      if (!nombre?.trim()) {
        return res.status(400).json({ success: false, message: 'El nombre es requerido' });
      }

      const result = await pool.query(
        'UPDATE usuarios SET nombre = $1 WHERE id = $2 RETURNING id, nombre, email',
        [nombre.trim(), usuarioId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
      }

      res.json({ success: true, usuario: result.rows[0] });
    } catch (error) {
      console.error('❌ Error en updatePerfil:', error.message);
      res.status(500).json({ success: false, message: 'Error al actualizar perfil' });
    }
  }
};

export default perfilController;
