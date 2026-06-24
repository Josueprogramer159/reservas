import bcrypt from 'bcryptjs';
import pool from '../db/database.js';
import { getDbErrorMessage } from '../utils/dbError.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const registro = async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    const camposFaltantes = [];
    if (!nombre?.trim()) camposFaltantes.push('nombre');
    if (!email?.trim()) camposFaltantes.push('correo electrónico');
    if (!password) camposFaltantes.push('contraseña');

    if (camposFaltantes.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Campos obligatorios faltantes: ${camposFaltantes.join(', ')}`
      });
    }

    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ success: false, message: 'El correo electrónico no es válido' });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe tener al menos 8 caracteres'
      });
    }

    const emailCheck = await pool.query('SELECT email FROM usuarios WHERE email = $1', [email]);
    if (emailCheck.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'El correo ya se encuentra registrado'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      'INSERT INTO usuarios (nombre, email, password) VALUES ($1, $2, $3) RETURNING id, nombre, email',
      [nombre.trim(), email.trim(), hashedPassword]
    );

    req.session.userId = result.rows[0].id;
    req.session.userEmail = email.trim();
    req.session.userName = result.rows[0].nombre;
    req.session.role = 'user';

    res.json({
      success: true,
      message: 'Registro exitoso. Tu cuenta ha sido creada correctamente.',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ success: false, message: getDbErrorMessage(error) });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
      return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios' });
    }

    const result = await pool.query(
      'SELECT id, nombre, email, password FROM usuarios WHERE email = $1',
      [email.trim()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'La cuenta no existe. Verifica tu correo o regístrate.'
      });
    }

    const user = result.rows[0];

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: 'Contraseña incorrecta' });
    }

    req.session.userId = user.id;
    req.session.userEmail = user.email;
    req.session.userName = user.nombre;
    req.session.role = 'user';

    res.json({
      success: true,
      message: 'Inicio de sesión exitoso',
      user: { id: user.id, nombre: user.nombre, email: user.email }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ success: false, message: getDbErrorMessage(error) });
  }
};

export const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'No se pudo cerrar la sesión' });
    }
    res.clearCookie('connect.sid');
    res.json({ success: true, message: 'Sesión cerrada correctamente' });
  });
};

export const getProfile = (req, res) => {
  if (!req.session.userId || req.session.role !== 'user') {
    return res.status(401).json({ success: false, message: 'No autenticado' });
  }

  res.json({
    success: true,
    user: {
      id: req.session.userId,
      email: req.session.userEmail,
      nombre: req.session.userName
    }
  });
};
