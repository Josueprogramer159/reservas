import express from 'express';
import {
  subscribe,
  unsubscribe,
  getPreferences,
  updatePreferences
} from '../controllers/notificationController.js';

const router = express.Router();

router.post('/subscribe', subscribe);
router.post('/unsubscribe', unsubscribe);
router.get('/preferences', getPreferences);
router.put('/preferences', updatePreferences);

export default router;
