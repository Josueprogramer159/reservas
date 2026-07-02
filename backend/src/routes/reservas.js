import express from 'express';
import { crearReserva, misReservas, cancelarReserva, descargarICS } from '../controllers/reservasController.js';
import { requireUserAuth } from '../middleware/requireAuth.js';

const router = express.Router();

router.post('/', requireUserAuth, crearReserva);
router.get('/mis-reservas', requireUserAuth, misReservas);
router.get('/:id/ics', requireUserAuth, descargarICS);   // antes de /:id
router.delete('/:id', requireUserAuth, cancelarReserva);

export default router;
