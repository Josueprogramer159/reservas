import express from 'express';
import { registro, login, logout, getProfile, verificarCorreo, restablecerPassword } from '../controllers/authController.js';
import { requireUserAuth } from '../middleware/requireAuth.js';

const router = express.Router();

router.post('/registro', registro);
router.post('/login', login);
router.post('/logout', logout);
router.get('/profile', requireUserAuth, getProfile);
router.get('/perfil', requireUserAuth, getProfile);
router.post('/verificar-correo', verificarCorreo);
router.post('/restablecer-password', restablecerPassword);

export default router;

// RELOADED: Frontend authentication middleware added - 2026-08-06
