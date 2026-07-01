import express from 'express';
import { registro, login, logout, getProfile, verificarCorreo, restablecerPassword } from '../controllers/authController.js';

const router = express.Router();

router.post('/registro', registro);
router.post('/login', login);
router.post('/logout', logout);
router.get('/profile', getProfile);
router.get('/perfil', getProfile);
router.post('/verificar-correo', verificarCorreo);
router.post('/restablecer-password', restablecerPassword);

export default router;
