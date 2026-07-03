import express from 'express';
import requireAuth from '../middleware/requireAuth.js';
import perfilController from '../controllers/perfilController.js';

const router = express.Router();

// Proteger todas las rutas
router.use(requireAuth);

// Rutas de perfil
router.get('/', perfilController.getPerfil);
router.put('/', perfilController.updatePerfil);

export default router;
