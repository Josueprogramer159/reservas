import bcrypt from 'bcryptjs';
import pool from '../db/database.js';
import { HORARIOS_DISPONIBLES } from '../constants/horarios.js';
import { getReservationConfig, saveReservationConfig } from '../utils/reservationConfig.js';

export const registrarAdmin = async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    const faltantes = [];
    if (!nombre?.trim()) faltantes.push('nombre');
    if (!email?.trim()) faltantes.push('correo');
    if (!password) faltantes.push('contraseña');

    if (faltantes.length > 0) {
      return res.status(400).json({ success: false, message: `Campos obligatorios faltantes: ${faltantes.join(', ')}` });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'El correo no es válido' });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'La contraseña debe tener al menos 8 caracteres' });
    }

    const existe = await pool.query('SELECT id FROM administradores WHERE email = $1', [email.trim()]);
    if (existe.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'Ya existe un administrador con ese correo' });
    }

    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO administradores (nombre, email, password, rol, activo) VALUES ($1, $2, $3, 'admin', true) RETURNING id, nombre, email`,
      [nombre.trim(), email.trim(), hash]
    );

    res.status(201).json({ success: true, message: 'Administrador registrado correctamente', admin: result.rows[0] });
  } catch (error) {
    console.error('Error al registrar admin:', error);
    res.status(500).json({ success: false, message: 'Error al registrar el administrador' });
  }
};

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
    const reservasRes = await pool.query(`SELECT COUNT(*) FROM reservas WHERE estado = 'confirmado'`);
    const configuracionReserva = await getReservationConfig();

    res.json({
      success: true,
      usuarios: usuariosRes.rows,
      administradores: adminsRes.rows,
      reservasActivas: parseInt(reservasRes.rows[0].count),
      configuracionReserva
    });
  } catch (error) {
    console.error('Error al obtener datos del panel de administrador:', error);
    res.status(500).json({ success: false, message: 'Error al obtener datos del servidor' });
  }
};

export const getReservationSettings = async (req, res) => {
  if (!req.session.adminId || req.session.role !== 'admin') {
    return res.status(401).json({ success: false, message: 'No autorizado' });
  }

  try {
    const configuracionReserva = await getReservationConfig();
    res.json({ success: true, configuracionReserva });
  } catch (error) {
    console.error('Error al obtener configuración de reserva:', error);
    res.status(500).json({ success: false, message: 'Error al obtener la configuración de reservas' });
  }
};

export const updateReservationSettings = async (req, res) => {
  if (!req.session.adminId || req.session.role !== 'admin') {
    return res.status(401).json({ success: false, message: 'No autorizado' });
  }

  try {
    const { fecha, horario } = req.body;

    if (!fecha || !horario) {
      return res.status(400).json({ success: false, message: 'La fecha y el horario son obligatorios' });
    }

    if (!HORARIOS_DISPONIBLES.includes(horario)) {
      return res.status(400).json({ success: false, message: 'El horario seleccionado no es válido' });
    }

    const configuracionReserva = await saveReservationConfig(fecha, horario);

    res.json({
      success: true,
      message: 'Configuración de reservas actualizada correctamente',
      configuracionReserva
    });
  } catch (error) {
    console.error('Error al actualizar configuración de reserva:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar la configuración de reservas' });
  }
};

export const listarReservasAdmin = async (req, res) => {
  try {
    // Parámetros de filtrado y paginación
    const { busqueda, fechaInicio, fechaFin, espacioId, usuarioId, estado, pagina = 1, porPagina = 10 } = req.query;
    
    const pageNum = Math.max(1, parseInt(pagina) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(porPagina) || 10)); // Max 100 items por página
    const offset = (pageNum - 1) * limit;

    let baseQuery = `
      SELECT r.id, r.fecha, r.horario, r.estado, r.fecha_creacion,
             u.id AS usuario_id, u.nombre AS usuario_nombre, u.email AS usuario_email,
             e.id AS espacio_id, e.nombre AS espacio_nombre, e.tipo AS espacio_tipo, e.ubicacion AS espacio_ubicacion,
             e.capacidad
      FROM reservas r
      JOIN usuarios u ON u.id = r.usuario_id
      JOIN espacios e ON e.id = r.espacio_id
      WHERE 1=1
    `;
    const params = [];
    let countQuery = `SELECT COUNT(*) as total FROM reservas r JOIN usuarios u ON u.id = r.usuario_id JOIN espacios e ON e.id = r.espacio_id WHERE 1=1`;
    let countParams = [];

    // Filtro: búsqueda (usuario, email, espacio)
    if (busqueda?.trim()) {
      params.push(`%${busqueda.trim()}%`);
      countParams.push(`%${busqueda.trim()}%`);
      const searchCondition = ` AND (u.nombre ILIKE $${params.length} OR u.email ILIKE $${params.length} OR e.nombre ILIKE $${params.length})`;
      baseQuery += searchCondition;
      countQuery += searchCondition;
    }

    // Filtro: rango de fechas
    if (fechaInicio?.trim()) {
      params.push(fechaInicio.trim());
      countParams.push(fechaInicio.trim());
      baseQuery += ` AND r.fecha >= $${params.length}`;
      countQuery += ` AND r.fecha >= $${countParams.length}`;
    }

    if (fechaFin?.trim()) {
      params.push(fechaFin.trim());
      countParams.push(fechaFin.trim());
      baseQuery += ` AND r.fecha <= $${params.length}`;
      countQuery += ` AND r.fecha <= $${countParams.length}`;
    }

    // Filtro: espacio específico
    if (espacioId?.trim()) {
      params.push(parseInt(espacioId));
      countParams.push(parseInt(espacioId));
      baseQuery += ` AND e.id = $${params.length}`;
      countQuery += ` AND e.id = $${countParams.length}`;
    }

    // Filtro: usuario específico
    if (usuarioId?.trim()) {
      params.push(parseInt(usuarioId));
      countParams.push(parseInt(usuarioId));
      baseQuery += ` AND u.id = $${params.length}`;
      countQuery += ` AND u.id = $${countParams.length}`;
    }

    // Filtro: estado (confirmado, cancelado, completado)
    if (estado?.trim()) {
      const estadoValues = estado.split(',').map(s => s.trim()).filter(s => ['confirmado', 'cancelado', 'completado'].includes(s));
      if (estadoValues.length > 0) {
        const placeholders = estadoValues.map((_, i) => `$${params.length + i + 1}`).join(',');
        params.push(...estadoValues);
        countParams.push(...estadoValues);
        baseQuery += ` AND r.estado IN (${placeholders})`;
        countQuery += ` AND r.estado IN (${placeholders})`;
      }
    }

    // Obtener total de registros
    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);

    // Ordenar y paginar
    const query = baseQuery + ` ORDER BY r.fecha DESC, r.horario ASC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    res.json({ 
      success: true, 
      reservas: result.rows, 
      total: total,
      pagina: pageNum,
      porPagina: limit,
      totalPaginas: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error al listar reservas (admin):', error);
    res.status(500).json({ success: false, message: 'Error al consultar las reservas' });
  }
};

export const cancelarReservaAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const check = await pool.query('SELECT id, estado, espacio_id FROM reservas WHERE id = $1', [id]);

    if (check.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'La reserva no existe' });
    }

    if (check.rows[0].estado === 'cancelado') {
      return res.status(409).json({ success: false, message: 'Esta reserva ya fue cancelada previamente' });
    }

    await pool.query(`UPDATE reservas SET estado = 'cancelado' WHERE id = $1`, [id]);

    res.json({
      success: true,
      message: 'Reserva cancelada correctamente. El espacio vuelve a estar disponible.',
      espacio_id: check.rows[0].espacio_id
    });
  } catch (error) {
    console.error('Error al cancelar reserva (admin):', error);
    res.status(500).json({ success: false, message: 'Error al cancelar la reserva' });
  }
};
