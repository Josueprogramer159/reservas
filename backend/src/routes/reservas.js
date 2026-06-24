import express from 'express';
import { crearReserva, misReservas, cancelarReserva } from '../controllers/reservasController.js';
import { requireUserAuth } from '../middleware/requireAuth.js';

const router = express.Router();

router.post('/', requireUserAuth, crearReserva);
router.get('/mis-reservas', requireUserAuth, misReservas);
router.delete('/:id', requireUserAuth, cancelarReserva);

export default router;
