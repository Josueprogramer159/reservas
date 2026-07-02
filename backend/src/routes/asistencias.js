import express from 'express';
import {
  obtenerCodigoQR,
  registrarAsistencia,
  obtenerHistorialAsistencias,
  obtenerEstadisticasAsistencia,
  cancelarAsistencia
} from '../controllers/asistenciaController.js';
import { requireUserAuth, requireAdminAuth } from '../middleware/requireAuth.js';

const router = express.Router();

// Rutas públicas (autenticado)
router.get('/:id/qr', requireUserAuth, obtenerCodigoQR);
router.post('/escanear', requireUserAuth, registrarAsistencia);

// Rutas admin
router.get('/historial/todas', requireAdminAuth, obtenerHistorialAsistencias);
router.get('/estadisticas/resumen', requireAdminAuth, obtenerEstadisticasAsistencia);
router.delete('/:id', requireAdminAuth, cancelarAsistencia);

export default router;
