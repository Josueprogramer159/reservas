import pool from '../db/database.js';

const FAVORITOS_TABLE = 'espacios_favoritos';

async function ensureFavoritosTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ${FAVORITOS_TABLE} (
      id SERIAL PRIMARY KEY,
      usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
      espacio_id INTEGER NOT NULL REFERENCES espacios(id) ON DELETE CASCADE,
      fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(usuario_id, espacio_id)
    );
  `);
}

function getUsuarioId(req) {
  return req.session?.userId || req.session?.usuario?.id || null;
}

const favoritosController = {
  async getFavoritos(req, res) {
    try {
      const usuarioId = getUsuarioId(req);
      if (!usuarioId) {
        return res.status(401).json({ success: false, message: 'Debes iniciar sesión para ver tus favoritos' });
      }

      await ensureFavoritosTable();

      const result = await pool.query(
        `SELECT e.* FROM espacios e
         INNER JOIN ${FAVORITOS_TABLE} f ON e.id = f.espacio_id
         WHERE f.usuario_id = $1`,
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
      const usuarioId = getUsuarioId(req);
      if (!usuarioId) {
        return res.status(401).json({ success: false, message: 'Debes iniciar sesión para agregar favoritos' });
      }

      const { espacioId } = req.params;
      await ensureFavoritosTable();

      const existing = await pool.query(
        `SELECT 1 FROM ${FAVORITOS_TABLE} WHERE usuario_id = $1 AND espacio_id = $2`,
        [usuarioId, espacioId]
      );

      if (existing.rows.length > 0) {
        return res.status(400).json({ success: false, message: 'Ya está en favoritos' });
      }

      await pool.query(
        `INSERT INTO ${FAVORITOS_TABLE} (usuario_id, espacio_id) VALUES ($1, $2)`,
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
      const usuarioId = getUsuarioId(req);
      if (!usuarioId) {
        return res.status(401).json({ success: false, message: 'Debes iniciar sesión para quitar favoritos' });
      }

      const { espacioId } = req.params;
      await ensureFavoritosTable();

      await pool.query(
        `DELETE FROM ${FAVORITOS_TABLE} WHERE usuario_id = $1 AND espacio_id = $2`,
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
