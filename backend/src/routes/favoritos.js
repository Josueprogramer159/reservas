import express from 'express';
import requireAuth from '../middleware/requireAuth.js';
import favoritosController from '../controllers/favoritosController.js';

const router = express.Router();

// Proteger todas las rutas
router.use(requireAuth);

// Rutas de favoritos
router.get('/', favoritosController.getFavoritos);
router.post('/:espacioId', favoritosController.addFavorito);
router.delete('/:espacioId', favoritosController.removeFavorito);

export default router;
