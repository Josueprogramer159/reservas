import express from 'express';
import requireAuth from '../middleware/requireAuth.js';
import notificationController from '../controllers/notificationController.js';

const router = express.Router();

// Proteger todas las rutas
router.use(requireAuth);

// Rutas de notificaciones
router.get('/', notificationController.getNotifications);
router.get('/:id', notificationController.getNotificationById);
router.put('/:id/read', notificationController.markAsRead);
router.delete('/:id', notificationController.deleteNotification);

export default router;
