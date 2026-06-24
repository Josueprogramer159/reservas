import express from 'express';
import { registro, login, logout, getProfile } from '../controllers/authController.js';

const router = express.Router();

router.post('/registro', registro);
router.post('/login', login);
router.post('/logout', logout);
router.get('/profile', getProfile);
router.get('/perfil', getProfile); // Soporte para ambos nombres de endpoint

export default router;
