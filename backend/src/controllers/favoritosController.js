import pool from '../db/database.js';

const favoritosController = {
  async getFavoritos(req, res) {
    try {
      const usuarioId = req.session.usuario.id;

      const result = await pool.query(
        'SELECT e.* FROM espacios e INNER JOIN favoritos f ON e.id = f.espacio_id WHERE f.usuario_id = $1',
        [usuarioId]
      );

      res.json({ success: true, favoritos: result.rows });
    } catch (error) {
      console.error('Error al obtener favoritos:', error);
      res.status(500).json({ success: false, message: 'Error al obtener favoritos' });
    }
  },

  async addFavorito(req, res) {
    try {
      const usuarioId = req.session.usuario.id;
      const { espacioId } = req.params;

      // Verificar si ya existe
      const existing = await pool.query(
        'SELECT * FROM favoritos WHERE usuario_id = $1 AND espacio_id = $2',
        [usuarioId, espacioId]
      );

      if (existing.rows.length > 0) {
        return res.status(400).json({ success: false, message: 'Ya está en favoritos' });
      }

      await pool.query(
        'INSERT INTO favoritos (usuario_id, espacio_id) VALUES ($1, $2)',
        [usuarioId, espacioId]
      );

      res.json({ success: true, message: 'Agregado a favoritos' });
    } catch (error) {
      console.error('Error al agregar favorito:', error);
      res.status(500).json({ success: false, message: 'Error al agregar favorito' });
    }
  },

  async removeFavorito(req, res) {
    try {
      const usuarioId = req.session.usuario.id;
      const { espacioId } = req.params;

      await pool.query(
        'DELETE FROM favoritos WHERE usuario_id = $1 AND espacio_id = $2',
        [usuarioId, espacioId]
      );

      res.json({ success: true, message: 'Removido de favoritos' });
    } catch (error) {
      console.error('Error al remover favorito:', error);
      res.status(500).json({ success: false, message: 'Error al remover favorito' });
    }
  }
};

export default favoritosController;
