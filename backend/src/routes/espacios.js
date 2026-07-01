import express from 'express';
import {
  listarEspacios,
  obtenerEspacio,
  crearEspacio,
  editarEspacio,
  eliminarEspacio,
  toggleActivoEspacio,
  listarEspaciosAdmin
} from '../controllers/espaciosController.js';
import { requireAdminAuth } from '../middleware/requireAuth.js';

const router = express.Router();

// Ruta admin: listar todos (activos e inactivos) — ANTES de /:id
router.get('/admin/todos', requireAdminAuth, listarEspaciosAdmin);

// Rutas públicas (usuarios e invitados)
router.get('/', listarEspacios);
router.get('/:id', obtenerEspacio);

// Rutas admin — CRUD completo
router.post('/', requireAdminAuth, crearEspacio);
router.put('/:id', requireAdminAuth, editarEspacio);
router.delete('/:id', requireAdminAuth, eliminarEspacio);
router.patch('/:id/toggle-activo', requireAdminAuth, toggleActivoEspacio);

export default router;
