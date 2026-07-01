import express from 'express';
import { getReporteUso, getEspaciosParaFiltro } from '../controllers/reportesController.js';
import { requireAdminAuth } from '../middleware/requireAuth.js';

const router = express.Router();

router.get('/uso',      requireAdminAuth, getReporteUso);
router.get('/espacios', requireAdminAuth, getEspaciosParaFiltro);

export default router;
