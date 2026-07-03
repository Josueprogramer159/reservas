import pool from '../db/database.js';

const verificationController = {
  async verifyCode(req, res) {
    try {
      const { email, code } = req.body;

      if (!email || !code) {
        return res.status(400).json({ success: false, message: 'Email y código requeridos' });
      }

      const result = await pool.query(
        'SELECT * FROM verification_codes WHERE email = $1 AND code = $2 AND expires_at > NOW()',
        [email, code]
      );

      if (result.rows.length === 0) {
        return res.status(400).json({ success: false, message: 'Código inválido o expirado' });
      }

      // Marcar como verificado
      await pool.query(
        'DELETE FROM verification_codes WHERE email = $1',
        [email]
      );

      res.json({ success: true, message: 'Email verificado correctamente' });
    } catch (error) {
      console.error('Error al verificar código:', error);
      res.status(500).json({ success: false, message: 'Error al verificar código' });
    }
  },

  async resendCode(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ success: false, message: 'Email requerido' });
      }

      // Aquí iría la lógica de envío de email
      // Por ahora solo retorna éxito
      res.json({ success: true, message: 'Código reenviado' });
    } catch (error) {
      console.error('Error al reenviar código:', error);
      res.status(500).json({ success: false, message: 'Error al reenviar código' });
    }
  }
};

export default verificationController;
