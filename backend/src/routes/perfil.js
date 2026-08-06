import express from 'express';
import perfilController from '../controllers/perfilController.js';

const router = express.Router();

// Rutas de perfil (sin middleware, validación interna en el controlador)
router.get('/', perfilController.getPerfil);
router.put('/', perfilController.updatePerfil);

export default router;
