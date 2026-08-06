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
import {
  exportarUsuariosPDF, exportarReservasPDF, exportarEspaciosPDF,
  exportarUsuariosJSON, exportarReservasJSON, exportarEspaciosJSON,
  backupCompletoJSON, restaurarBackup
} from '../controllers/backupController.js';
import { requireAdminAuth } from '../middleware/requireAuth.js';
import multer from 'multer';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

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

// HU17 - Gestión de Backups y Exportación de Datos
router.get('/backup/usuarios/pdf',           requireAdminAuth, exportarUsuariosPDF);
router.get('/backup/reservas/pdf',           requireAdminAuth, exportarReservasPDF);
router.get('/backup/espacios/pdf',           requireAdminAuth, exportarEspaciosPDF);
router.get('/backup/usuarios/json',          requireAdminAuth, exportarUsuariosJSON);
router.get('/backup/reservas/json',          requireAdminAuth, exportarReservasJSON);
router.get('/backup/espacios/json',          requireAdminAuth, exportarEspaciosJSON);
router.get('/backup/completo/json',          requireAdminAuth, backupCompletoJSON);
router.post('/backup/restaurar',             requireAdminAuth, upload.single('archivo'), restaurarBackup);

export default router;
