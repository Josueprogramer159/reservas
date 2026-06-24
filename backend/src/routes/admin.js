import express from 'express';
import { login, logout, getProfile, getDashboardData } from '../controllers/adminController.js';

const router = express.Router();

router.post('/login', login);
router.post('/logout', logout);
router.get('/profile', getProfile);
router.get('/perfil', getProfile);
router.get('/dashboard-data', getDashboardData);

export default router;
