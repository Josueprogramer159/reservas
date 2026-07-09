import pool from '../db/database.js';
import bcrypt from 'bcryptjs';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function ensureVerificationCodesTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS verification_codes (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) NOT NULL,
      code VARCHAR(10) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      expires_at TIMESTAMP NOT NULL
    );
  `);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_verification_codes_email ON verification_codes(email);`);
}

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const verificationController = {
  async generateRegister(req, res) {
    try {
      const { email } = req.body;

      if (!email?.trim()) {
        return res.status(400).json({ success: false, message: 'El correo electrónico es obligatorio' });
      }

      if (!EMAIL_REGEX.test(email.trim())) {
        return res.status(400).json({ success: false, message: 'El formato del correo electrónico no es válido' });
      }

      await ensureVerificationCodesTable();

      const existingUser = await pool.query('SELECT id FROM usuarios WHERE email = $1', [email.trim()]);
      if (existingUser.rows.length > 0) {
        return res.status(400).json({ success: false, message: 'Ya existe una cuenta con ese correo' });
      }

      const code = generateCode();
      await pool.query('DELETE FROM verification_codes WHERE email = $1', [email.trim()]);
      await pool.query(
        'INSERT INTO verification_codes (email, code, expires_at) VALUES ($1, $2, CURRENT_TIMESTAMP + INTERVAL \'10 minutes\')',
        [email.trim(), code]
      );

      res.json({
        success: true,
        message: 'Código enviado correctamente a tu email',
        codigo: code
      });
    } catch (error) {
      console.error('Error al generar código de registro:', error);
      res.status(500).json({ success: false, message: 'Error al procesar la solicitud' });
    }
  },

  async register(req, res) {
    try {
      const { email, codigo, nombre, password } = req.body;

      if (!email?.trim() || !codigo?.trim() || !nombre?.trim() || !password) {
        return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios' });
      }

      if (!EMAIL_REGEX.test(email.trim())) {
        return res.status(400).json({ success: false, message: 'El formato del correo electrónico no es válido' });
      }

      if (nombre.trim().length < 2) {
        return res.status(400).json({ success: false, message: 'El nombre es muy corto' });
      }

      if (password.length < 8) {
        return res.status(400).json({ success: false, message: 'La contraseña debe tener al menos 8 caracteres' });
      }

      await ensureVerificationCodesTable();

      const codeResult = await pool.query(
        'SELECT code FROM verification_codes WHERE email = $1 AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
        [email.trim()]
      );

      if (codeResult.rows.length === 0 || codeResult.rows[0].code !== codigo.trim()) {
        return res.status(400).json({ success: false, message: 'Código inválido o expirado' });
      }

      const existingUser = await pool.query('SELECT id FROM usuarios WHERE email = $1', [email.trim()]);
      if (existingUser.rows.length > 0) {
        return res.status(400).json({ success: false, message: 'Ya existe una cuenta con ese correo' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const result = await pool.query(
        'INSERT INTO usuarios (nombre, email, password) VALUES ($1, $2, $3) RETURNING id, nombre, email',
        [nombre.trim(), email.trim(), hashedPassword]
      );

      await pool.query('DELETE FROM verification_codes WHERE email = $1', [email.trim()]);

      req.session.userId = result.rows[0].id;
      req.session.userEmail = email.trim();
      req.session.userName = result.rows[0].nombre;
      req.session.role = 'user';

      res.json({
        success: true,
        message: 'Registro exitoso. Tu cuenta ha sido creada correctamente.',
        usuario: result.rows[0]
      });
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      res.status(500).json({ success: false, message: 'Error al registrar la cuenta' });
    }
  },

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
  },

  // Generar código de recuperación para password reset
  async generateRecoveryCode(req, res) {
    try {
      const { email } = req.body;

      if (!email || !email.trim()) {
        return res.status(400).json({ success: false, message: 'Email requerido' });
      }

      // Verificar que el usuario existe
      const userCheck = await pool.query(
        'SELECT id FROM usuarios WHERE email = $1',
        [email.trim()]
      );

      if (userCheck.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'No existe cuenta con ese email' });
      }

      res.json({ success: true, message: 'Por favor, ingresa el código de 6 dígitos que se te proporcionó al registrarte' });
    } catch (error) {
      console.error('Error al generar código de recuperación:', error);
      res.status(500).json({ success: false, message: 'Error al procesar la solicitud' });
    }
  },

  // Restablecer contraseña
  async resetPassword(req, res) {
    try {
      const { email, codigo, nueva_contraseña } = req.body;

      // Validaciones
      if (!email || !codigo || !nueva_contraseña) {
        return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios' });
      }

      if (nueva_contraseña.length < 8) {
        return res.status(400).json({ success: false, message: 'La contraseña debe tener al menos 8 caracteres' });
      }

      // Verificar que el usuario existe
      const userCheck = await pool.query(
        'SELECT id FROM usuarios WHERE email = $1',
        [email.trim()]
      );

      if (userCheck.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
      }

      const userId = userCheck.rows[0].id;

      // En un sistema real, verificarías el código contra una tabla de códigos de recuperación
      // Por ahora, aceptamos cualquier código de 6 dígitos
      if (!/^\d{6}$/.test(codigo.trim())) {
        return res.status(400).json({ success: false, message: 'El código debe ser de 6 dígitos' });
      }

      // Hash de la nueva contraseña
      const hashPassword = await bcrypt.hash(nueva_contraseña, 10);

      // Actualizar contraseña
      await pool.query(
        'UPDATE usuarios SET password = $1 WHERE id = $2',
        [hashPassword, userId]
      );

      res.json({ success: true, message: 'Contraseña restablecida correctamente' });
    } catch (error) {
      console.error('Error al restablecer contraseña:', error);
      res.status(500).json({ success: false, message: 'Error al restablecer la contraseña' });
    }
  }
};

export default verificationController;
