import pool from '../db/database.js';
import { getReservationConfig } from '../utils/reservationConfig.js';
import { generarCodigoQR } from './asistenciaController.js';
import { sendNotificationToUser } from './notificationController.js';

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
    const reservaId = result.rows[0].id;

    // Generar código QR automáticamente
    let qrData = null;
    try {
      qrData = await generarCodigoQR(reservaId, usuarioId, espacio_id, fecha);
      console.log('✅ QR generado automáticamente para la reserva');
    } catch (qrError) {
      console.error('⚠️ Error al generar QR (pero la reserva fue creada):', qrError.message);
    }

    // Enviar notificación de reserva confirmada
    try {
      await sendNotificationToUser(usuarioId, {
        title: '✅ Reserva Confirmada',
        body: `Tu reserva para ${espacio.nombre} ha sido confirmada.`,
        data: { url: '/dashboard' }
      });
    } catch (notifError) {
      console.error('⚠️ Error al enviar notificación:', notifError.message);
    }

    res.status(201).json({
      success: true,
      message: 'Reserva Exitosa',
      reserva: {
        ...result.rows[0],
        espacio_nombre: espacio.nombre,
        espacio_tipo: espacio.tipo,
        qr_generado: qrData ? true : false
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

    // Obtener nombre del espacio para la notificación
    const espacio = await pool.query('SELECT nombre FROM espacios WHERE id = $1', [reservaCheck.rows[0].espacio_id]);
    const espacioNombre = espacio.rows[0]?.nombre || 'tu espacio';

    // Enviar notificación de cancelación
    try {
      await sendNotificationToUser(usuarioId, {
        title: '❌ Reserva Cancelada',
        body: `Tu reserva para ${espacioNombre} ha sido cancelada.`,
        data: { url: '/dashboard' }
      });
    } catch (notifError) {
      console.error('⚠️ Error al enviar notificación de cancelación:', notifError.message);
    }

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

export const descargarICS = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.session.userId;

    const result = await pool.query(
      `SELECT r.id, r.fecha, r.horario, r.estado, r.fecha_creacion,
              e.nombre AS espacio_nombre, e.ubicacion AS espacio_ubicacion,
              e.descripcion AS espacio_descripcion, e.tipo AS espacio_tipo
       FROM reservas r
       JOIN espacios e ON e.id = r.espacio_id
       WHERE r.id = $1 AND r.usuario_id = $2`,
      [id, usuarioId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Reserva no encontrada' });
    }

    const reserva = result.rows[0];

    if (reserva.estado !== 'confirmado') {
      return res.status(400).json({ success: false, message: 'Solo las reservas confirmadas pueden sincronizarse con el calendario' });
    }

    // Parsear fecha y horario
    const [horaInicio, horaFin] = reserva.horario.split(' - ').map(h => h.trim());
    const fechaStr = reserva.fecha.toISOString ? reserva.fecha.toISOString().split('T')[0] : String(reserva.fecha).split('T')[0];
    const [anio, mes, dia] = fechaStr.split('-');

    const formatHora = (h) => h.replace(':', '') + '00';
    const dtStart = `${anio}${mes}${dia}T${formatHora(horaInicio)}`;
    const dtEnd   = `${anio}${mes}${dia}T${formatHora(horaFin)}`;
    const ahora   = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const uid     = `reserva-${reserva.id}-${Date.now()}@utc.edu`;

    const descripcion = [
      `Espacio: ${reserva.espacio_nombre}`,
      `Tipo: ${reserva.espacio_tipo}`,
      `Ubicación: ${reserva.espacio_ubicacion}`,
      `Estado: ${reserva.estado}`,
      `Reservado el: ${new Date(reserva.fecha_creacion).toLocaleDateString('es-ES')}`
    ].join('\\n');

    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//ReservaUTC//Sistema de Reservas UTC//ES',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${ahora}`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `SUMMARY:Reserva - ${reserva.espacio_nombre}`,
      `LOCATION:${reserva.espacio_ubicacion}`,
      `DESCRIPTION:${descripcion}`,
      'STATUS:CONFIRMED',
      'BEGIN:VALARM',
      'TRIGGER:-PT30M',
      'ACTION:DISPLAY',
      `DESCRIPTION:Recordatorio: Reserva en ${reserva.espacio_nombre} en 30 minutos`,
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const filename = `reserva_${reserva.id}_${fechaStr}.ics`;
    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(ics);

  } catch (error) {
    console.error('Error al generar ICS:', error);
    res.status(500).json({ success: false, message: 'Error al generar el archivo de calendario' });
  }
};
