import express from 'express';
import {
  login, logout, getProfile, getDashboardData,
  getReservationSettings, updateReservationSettings,
  registrarAdmin, listarReservasAdmin, cancelarReservaAdmin
} from '../controllers/adminController.js';
import {
  listarUsuarios, cambiarRolUsuario,
  toggleEstadoUsuario, getAuditoriaUsuario
} from '../controllers/usuariosAdminController.js';
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

// HU10 - Gestión de usuarios
router.get('/usuarios',                      requireAdminAuth, listarUsuarios);
router.put('/usuarios/:id/rol',              requireAdminAuth, cambiarRolUsuario);
router.patch('/usuarios/:id/estado',         requireAdminAuth, toggleEstadoUsuario);
router.get('/usuarios/:id/auditoria',        requireAdminAuth, getAuditoriaUsuario);

export default router;
