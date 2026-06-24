import bcrypt from 'bcryptjs';
import pool from '../db/database.js';

export const registro = async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    // Validar campos requeridos en el backend
    if (!nombre || !email || !password) {
      return res.status(400).json({ success: false, message: 'Todos los campos son requeridos' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'La contraseña debe tener al menos 6 caracteres' });
    }
    
    // Validar email único
    const emailCheck = await pool.query('SELECT email FROM usuarios WHERE email = $1', [email]);
    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'El email ya está registrado' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insertar usuario
    const result = await pool.query(
      'INSERT INTO usuarios (nombre, email, password) VALUES ($1, $2, $3) RETURNING id, nombre, email',
      [nombre, email, hashedPassword]
    );
    
    // Crear sesión
    req.session.userId = result.rows[0].id;
    req.session.userEmail = email;
    req.session.userName = result.rows[0].nombre;
    req.session.role = 'user';
    
    res.json({ 
      success: true, 
      message: 'Registro exitoso',
      user: result.rows[0]
    });
    
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email y contraseña son requeridos' });
    }

    // Buscar usuario
    const result = await pool.query(
      'SELECT id, nombre, email, password FROM usuarios WHERE email = $1',
      [email]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Credenciales incorrectas' });
    }
    
    const user = result.rows[0];
    
    // Verificar password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: 'Credenciales incorrectas' });
    }
    
    // Crear sesión
    req.session.userId = user.id;
    req.session.userEmail = user.email;
    req.session.userName = user.nombre;
    req.session.role = 'user';
    
    res.json({ 
      success: true, 
      message: 'Login exitoso',
      user: { id: user.id, nombre: user.nombre, email: user.email }
    });
    
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
};

export const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'No se pudo cerrar la sesión' });
    }
    res.clearCookie('connect.sid'); // Limpiar cookie
    res.json({ success: true, message: 'Sesión cerrada' });
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
