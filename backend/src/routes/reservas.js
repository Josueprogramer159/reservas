import express from 'express';
import { crearReserva, misReservas, cancelarReserva, descargarICS, obtenerReservasEspacio } from '../controllers/reservasController.js';
import { requireUserAuth } from '../middleware/requireAuth.js';

const router = express.Router();

router.post('/', requireUserAuth, crearReserva);
router.get('/mis-reservas', requireUserAuth, misReservas);
router.get('/espacio/:espacioId', obtenerReservasEspacio);
router.get('/:id/ics', requireUserAuth, descargarICS);
router.delete('/:id', requireUserAuth, cancelarReserva);

export default router;
