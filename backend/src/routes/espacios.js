import express from 'express';
import { listarEspacios, obtenerEspacio } from '../controllers/espaciosController.js';
import { requireUserAuth } from '../middleware/requireAuth.js';

const router = express.Router();

router.get('/', requireUserAuth, listarEspacios);
router.get('/:id', requireUserAuth, obtenerEspacio);

export default router;
