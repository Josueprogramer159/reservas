import pool from '../db/database.js';

const ROLES_VALIDOS = ['usuario', 'admin', 'invitado'];

// Registrar en auditoría
async function registrarAuditoria(usuario_id, admin_id, accion, detalle) {
  try {
    await pool.query(
      `INSERT INTO auditoria_usuarios (usuario_id, admin_id, accion, detalle) VALUES ($1, $2, $3, $4)`,
      [usuario_id, admin_id, accion, detalle]
    );
  } catch (e) {
    console.error('Error al registrar auditoría:', e.message);
  }
}

// GET /api/admin/usuarios
export const listarUsuarios = async (req, res) => {
  try {
    const { busqueda, rol, estado } = req.query;

    let query = `SELECT id, nombre, email, rol, activo, fecha_registro FROM usuarios WHERE 1=1`;
    const params = [];

    if (busqueda?.trim()) {
      params.push(`%${busqueda.trim()}%`);
      query += ` AND (nombre ILIKE $${params.length} OR email ILIKE $${params.length})`;
    }
    if (rol?.trim()) {
      params.push(rol.trim());
      query += ` AND rol = $${params.length}`;
    }
    if (estado === 'activo')   query += ` AND activo = true`;
    if (estado === 'inactivo') query += ` AND activo = false`;

    query += ` ORDER BY fecha_registro DESC`;

    const result = await pool.query(query, params);
    res.json({ success: true, usuarios: result.rows, total: result.rows.length });
  } catch (error) {
    console.error('Error al listar usuarios:', error);
    res.status(500).json({ success: false, message: 'Error al obtener los usuarios' });
  }
};

// PUT /api/admin/usuarios/:id/rol
export const cambiarRolUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { rol } = req.body;
    const adminId = req.session.adminId;

    if (!rol || !ROLES_VALIDOS.includes(rol)) {
      return res.status(400).json({ success: false, message: `Rol inválido. Roles permitidos: ${ROLES_VALIDOS.join(', ')}` });
    }

    const existe = await pool.query('SELECT id, nombre, rol FROM usuarios WHERE id = $1', [id]);
    if (existe.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'El usuario no existe' });
    }

    const rolAnterior = existe.rows[0].rol;
    await pool.query('UPDATE usuarios SET rol = $1 WHERE id = $2', [rol, id]);

    await registrarAuditoria(
      id, adminId, 'CAMBIO_ROL',
      `Rol cambiado de '${rolAnterior}' a '${rol}' por admin ID ${adminId}`
    );

    res.json({
      success: true,
      message: `Rol actualizado a '${rol}' para ${existe.rows[0].nombre}`,
      usuario: { id: parseInt(id), rol }
    });
  } catch (error) {
    console.error('Error al cambiar rol:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar el rol' });
  }
};

// PATCH /api/admin/usuarios/:id/estado
export const toggleEstadoUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.session.adminId;

    // Validar que no sea el propio admin (comparando por email)
    const adminData = await pool.query('SELECT email FROM administradores WHERE id = $1', [adminId]);
    const usuarioData = await pool.query('SELECT id, nombre, email, activo FROM usuarios WHERE id = $1', [id]);

    if (usuarioData.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'El usuario no existe' });
    }

    const usuario = usuarioData.rows[0];

    // Protección: si el usuario tiene el mismo email que el admin logueado
    if (adminData.rows.length > 0 && adminData.rows[0].email === usuario.email) {
      return res.status(403).json({ success: false, message: 'No puedes modificar el estado de tu propia cuenta' });
    }

    const nuevoEstado = !usuario.activo;
    await pool.query('UPDATE usuarios SET activo = $1 WHERE id = $2', [nuevoEstado, id]);

    await registrarAuditoria(
      id, adminId,
      nuevoEstado ? 'ACTIVACION' : 'DESACTIVACION',
      `Usuario ${nuevoEstado ? 'activado' : 'desactivado'} por admin ID ${adminId}. Reservas anteriores conservadas.`
    );

    res.json({
      success: true,
      message: `Usuario ${nuevoEstado ? 'activado' : 'desactivado'} correctamente`,
      usuario: { id: parseInt(id), activo: nuevoEstado }
    });
  } catch (error) {
    console.error('Error al cambiar estado del usuario:', error);
    res.status(500).json({ success: false, message: 'Error al cambiar el estado del usuario' });
  }
};

// GET /api/admin/usuarios/:id/auditoria
export const getAuditoriaUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT a.id, a.accion, a.detalle, a.fecha, adm.nombre AS admin_nombre
       FROM auditoria_usuarios a
       JOIN administradores adm ON adm.id = a.admin_id
       WHERE a.usuario_id = $1
       ORDER BY a.fecha DESC`,
      [id]
    );
    res.json({ success: true, auditoria: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener auditoría' });
  }
};
