import express from 'express';
import {
  login,
  logout,
  getProfile,
  getDashboardData,
  getReservationSettings,
  updateReservationSettings
} from '../controllers/adminController.js';

const router = express.Router();

router.post('/login', login);
router.post('/logout', logout);
router.get('/profile', getProfile);
router.get('/perfil', getProfile);
router.get('/dashboard-data', getDashboardData);
router.get('/reservation-settings', getReservationSettings);
router.put('/reservation-settings', updateReservationSettings);

export default router;
