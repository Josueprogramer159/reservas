import pool from '../db/database.js';
import { getReservationConfig } from '../utils/reservationConfig.js';

export const crearReserva = async (req, res) => {
  try {
    const { espacio_id } = req.body;
    const usuarioId = req.session.userId;

    if (!espacio_id) {
      return res.status(400).json({
        success: false,
        message: 'El espacio es obligatorio'
      });
    }

    const configuracionReserva = await getReservationConfig();
    if (!configuracionReserva) {
      return res.status(400).json({
        success: false,
        message: 'El administrador aún no ha definido la fecha y horario de reservas'
      });
    }

    const { fecha, horario } = configuracionReserva;

    const espacioCheck = await pool.query('SELECT id, nombre, tipo, activo FROM espacios WHERE id = $1', [espacio_id]);
    if (espacioCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'El espacio no existe' });
    }

    if (!espacioCheck.rows[0].activo) {
      return res.status(403).json({ success: false, message: 'Este espacio no está disponible para reservas' });
    }

    const conflicto = await pool.query(
      `SELECT id FROM reservas
       WHERE espacio_id = $1 AND fecha = $2 AND estado = 'confirmado'`,
      [espacio_id, fecha]
    );

    if (conflicto.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Este espacio ya está reservado para la fecha seleccionada'
      });
    }

    const result = await pool.query(
      `INSERT INTO reservas (usuario_id, espacio_id, fecha, horario, estado)
       VALUES ($1, $2, $3, $4, 'confirmado')
       RETURNING id, espacio_id, fecha, horario, estado, fecha_creacion`,
      [usuarioId, espacio_id, fecha, horario]
    );

    const espacio = espacioCheck.rows[0];

    res.status(201).json({
      success: true,
      message: 'Reserva confirmada exitosamente',
      reserva: {
        ...result.rows[0],
        espacio_nombre: espacio.nombre,
        espacio_tipo: espacio.tipo
      },
      configuracionReserva
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'Este espacio ya está reservado para la fecha seleccionada'
      });
    }
    console.error('Error al crear reserva:', error);
    res.status(500).json({ success: false, message: 'Error al procesar la reserva' });
  }
};

export const misReservas = async (req, res) => {
  try {
    const usuarioId = req.session.userId;

    const result = await pool.query(
      `SELECT r.id, r.fecha, r.horario, r.estado, r.fecha_creacion,
              e.nombre AS espacio_nombre, e.tipo AS espacio_tipo, e.id AS espacio_id
       FROM reservas r
       JOIN espacios e ON e.id = r.espacio_id
       WHERE r.usuario_id = $1 AND r.estado = 'confirmado'
       ORDER BY r.fecha DESC, r.horario ASC`,
      [usuarioId]
    );

    res.json({ success: true, reservas: result.rows });
  } catch (error) {
    console.error('Error al obtener reservas:', error);
    res.status(500).json({ success: false, message: 'Error al consultar tus reservas' });
  }
};

export const cancelarReserva = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.session.userId;

    const reservaCheck = await pool.query(
      'SELECT id, espacio_id FROM reservas WHERE id = $1 AND usuario_id = $2 AND estado = $3',
      [id, usuarioId, 'confirmado']
    );

    if (reservaCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Reserva no encontrada o ya cancelada' });
    }

    await pool.query(
      `UPDATE reservas SET estado = 'cancelado' WHERE id = $1`,
      [id]
    );

    res.json({
      success: true,
      message: 'Reserva cancelada. El espacio vuelve a estar disponible.',
      espacio_id: reservaCheck.rows[0].espacio_id
    });
  } catch (error) {
    console.error('Error al cancelar reserva:', error);
    res.status(500).json({ success: false, message: 'Error al cancelar la reserva' });
  }
};

export const contarReservasActivas = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT COUNT(*) FROM reservas WHERE estado = 'confirmado'`
    );
    res.json({ success: true, total: parseInt(result.rows[0].count) });
  } catch (error) {
    console.error('Error al contar reservas:', error);
    res.status(500).json({ success: false, message: 'Error al consultar reservas activas' });
  }
};
