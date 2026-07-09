import express from 'express';
import verificationController from '../controllers/verificationController.js';

const router = express.Router();

// Rutas de verificación
router.post('/generate-register', verificationController.generateRegister);
router.post('/register', verificationController.register);
router.post('/verify-code', verificationController.verifyCode);
router.post('/resend-code', verificationController.resendCode);
router.post('/generate-recovery', verificationController.generateRecoveryCode);
router.post('/reset-password', verificationController.resetPassword);

export default router;
