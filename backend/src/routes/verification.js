import express from 'express';
import verificationController from '../controllers/verificationController.js';

const router = express.Router();

// Rutas de verificación
router.post('/verify-code', verificationController.verifyCode);
router.post('/resend-code', verificationController.resendCode);

export default router;
