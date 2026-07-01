import express from 'express';
import {
  login,
  logout,
  getProfile,
  getDashboardData,
  getReservationSettings,
  updateReservationSettings,
  registrarAdmin,
  listarReservasAdmin,
  cancelarReservaAdmin
} from '../controllers/adminController.js';
import { requireAdminAuth } from '../middleware/requireAuth.js';

const router = express.Router();

router.post('/login', login);
router.post('/logout', logout);
router.post('/registro', registrarAdmin);
router.get('/profile', getProfile);
router.get('/perfil', getProfile);
router.get('/dashboard-data', getDashboardData);
router.get('/reservation-settings', getReservationSettings);
router.put('/reservation-settings', updateReservationSettings);
router.get('/reservas', requireAdminAuth, listarReservasAdmin);
router.delete('/reservas/:id', requireAdminAuth, cancelarReservaAdmin);

export default router;
