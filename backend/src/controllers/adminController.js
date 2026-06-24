import bcrypt from 'bcryptjs';
import pool from '../db/database.js';

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email y contraseña son requeridos' });
    }

    // Buscar administrador
    const result = await pool.query(
      'SELECT id, nombre, email, password, rol, activo FROM administradores WHERE email = $1',
      [email]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Credenciales incorrectas' });
    }
    
    const admin = result.rows[0];

    // Verificar si está activo
    if (!admin.activo) {
      return res.status(403).json({ success: false, message: 'Cuenta de administrador inactiva' });
    }
    
    // Verificar password
    const passwordMatch = await bcrypt.compare(password, admin.password);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: 'Credenciales incorrectas' });
    }
    
    // Crear sesión de administrador
    req.session.adminId = admin.id;
    req.session.adminEmail = admin.email;
    req.session.adminName = admin.nombre;
    req.session.role = 'admin';
    
    res.json({ 
      success: true, 
      message: 'Login de administrador exitoso',
      admin: { id: admin.id, nombre: admin.nombre, email: admin.email, rol: admin.rol }
    });
    
  } catch (error) {
    console.error('Error en login de administrador:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
};

export const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'No se pudo cerrar la sesión' });
    }
    res.clearCookie('connect.sid'); // Limpiar la cookie de sesión
    res.json({ success: true, message: 'Sesión de administrador cerrada' });
  });
};

export const getProfile = (req, res) => {
  if (!req.session.adminId || req.session.role !== 'admin') {
    return res.status(401).json({ success: false, message: 'No autenticado como administrador' });
  }
  
  res.json({ 
    success: true, 
    admin: { 
      id: req.session.adminId, 
      email: req.session.adminEmail,
      nombre: req.session.adminName,
      rol: 'admin'
    }
  });
};

// Obtener datos del panel de administración (lista de usuarios y administradores)
export const getDashboardData = async (req, res) => {
  if (!req.session.adminId || req.session.role !== 'admin') {
    return res.status(401).json({ success: false, message: 'No autorizado' });
  }

  try {
    const usuariosRes = await pool.query('SELECT id, nombre, email, fecha_registro FROM usuarios ORDER BY id DESC');
    const adminsRes = await pool.query('SELECT id, nombre, email, rol, activo, fecha_creacion FROM administradores ORDER BY id DESC');

    res.json({
      success: true,
      usuarios: usuariosRes.rows,
      administradores: adminsRes.rows
    });
  } catch (error) {
    console.error('Error al obtener datos del panel de administrador:', error);
    res.status(500).json({ success: false, message: 'Error al obtener datos del servidor' });
  }
};
