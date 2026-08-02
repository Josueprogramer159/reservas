import pool from '../db/database.js';
import { generarCodigoQR } from './asistenciaController.js';

export const crearReserva = async (req, res) => {
  try {
    const usuarioId = req.session.userId;
    const {
      espacio_id,
      email_solicitante,
      fecha,
      carrera,
      tipo,
      tema,
      responsable_academico,
      nombre_solicitante,
      hora_inicio,
      ciclo,
      total_asistentes,
      responsable_administrativo,
      hora_finalizacion,
      paralelo,
      software,
      descripcion
    } = req.body;

    // Validaciones
    const camposRequeridos = [
      'espacio_id', 'email_solicitante', 'fecha', 'carrera', 'tipo', 'tema',
      'responsable_academico', 'nombre_solicitante', 'hora_inicio', 'ciclo',
      'total_asistentes', 'responsable_administrativo', 'hora_finalizacion',
      'paralelo', 'software', 'descripcion'
    ];

    for (const campo of camposRequeridos) {
      if (!req.body[campo]) {
        return res.status(400).json({
          success: false,
          message: `Campo obligatorio faltante: ${campo}`
        });
      }
    }

    // Validar que la hora de inicio sea anterior a la de finalización
    if (hora_inicio >= hora_finalizacion) {
      return res.status(400).json({
        success: false,
        message: 'La hora de inicio debe ser anterior a la hora de finalización'
      });
    }

    // Verificar que no exista reserva con conflicto de horarios
    const conflicto = await pool.query(
      `SELECT id FROM reservas 
       WHERE espacio_id = $1 
       AND fecha = $2 
       AND estado = 'confirmado'
       AND (
         (hora_inicio <= $3 AND hora_finalizacion > $3) OR
         (hora_inicio < $4 AND hora_finalizacion >= $4) OR
         (hora_inicio >= $3 AND hora_finalizacion <= $4)
       )`,
      [espacio_id, fecha, hora_inicio, hora_finalizacion]
    );

    if (conflicto.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'El espacio ya tiene una reserva en ese horario. Elige otro horario o fecha'
      });
    }

    // Crear la reserva
    const result = await pool.query(
      `INSERT INTO reservas (
        usuario_id, espacio_id, email_solicitante, fecha, carrera, tipo, tema,
        responsable_academico, nombre_solicitante, hora_inicio, ciclo,
        total_asistentes, responsable_administrativo, hora_finalizacion,
        paralelo, software, descripcion, estado, fecha_creacion
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, 'confirmado', NOW())
      RETURNING *`,
      [
        usuarioId, espacio_id, email_solicitante, fecha, carrera, tipo, tema,
        responsable_academico, nombre_solicitante, hora_inicio, ciclo,
        total_asistentes, responsable_administrativo, hora_finalizacion,
        paralelo, software, descripcion
      ]
    );

    // Generar QR automáticamente después de crear la reserva
    try {
      await generarCodigoQR(result.rows[0].id, usuarioId, espacio_id, fecha);
    } catch (qrError) {
      console.warn('Error al generar QR:', qrError);
      // No fallar la reserva si el QR falla
    }

    res.status(201).json({
      success: true,
      message: 'Reserva creada exitosamente',
      reserva: result.rows[0]
    });
  } catch (error) {
    console.error('Error al crear reserva:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear la reserva'
    });
  }
};

export const misReservas = async (req, res) => {
  try {
    const usuarioId = req.session.userId;

    const result = await pool.query(
      `SELECT r.*, e.nombre as nombre_espacio, e.ubicacion
       FROM reservas r
       JOIN espacios e ON r.espacio_id = e.id
       WHERE r.usuario_id = $1 AND r.estado = 'confirmado'
       ORDER BY r.fecha DESC, r.hora_inicio DESC`,
      [usuarioId]
    );

    res.json({
      success: true,
      reservas: result.rows
    });
  } catch (error) {
    console.error('Error al obtener reservas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las reservas'
    });
  }
};

export const obtenerReservasEspacio = async (req, res) => {
  try {
    const { espacioId } = req.params;

    const result = await pool.query(
      `SELECT fecha FROM reservas 
       WHERE espacio_id = $1 AND estado = 'confirmado'
       GROUP BY fecha`,
      [espacioId]
    );

    res.json({
      success: true,
      reservas: result.rows
    });
  } catch (error) {
    console.error('Error al obtener reservas del espacio:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las reservas'
    });
  }
};

export const cancelarReserva = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.session.userId;

    const existe = await pool.query(
      'SELECT usuario_id FROM reservas WHERE id = $1',
      [id]
    );

    if (existe.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'La reserva no existe'
      });
    }

    if (existe.rows[0].usuario_id !== usuarioId) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para cancelar esta reserva'
      });
    }

    await pool.query(
      'UPDATE reservas SET estado = $1 WHERE id = $2',
      ['cancelado', id]
    );

    res.json({
      success: true,
      message: 'Reserva cancelada exitosamente'
    });
  } catch (error) {
    console.error('Error al cancelar reserva:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cancelar la reserva'
    });
  }
};

export const descargarICS = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.session.userId;

    const result = await pool.query(
      `SELECT r.*, e.nombre as nombre_espacio, e.ubicacion
       FROM reservas r
       JOIN espacios e ON r.espacio_id = e.id
       WHERE r.id = $1 AND r.usuario_id = $2`,
      [id, usuarioId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Reserva no encontrada'
      });
    }

    const reserva = result.rows[0];
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//UTC Reservas//EN
BEGIN:VEVENT
DTSTART:${reserva.fecha.toISOString().split('T')[0].replace(/-/g, '')}T${reserva.hora_inicio.replace(/:/g, '')}00Z
DTEND:${reserva.fecha.toISOString().split('T')[0].replace(/-/g, '')}T${reserva.hora_finalizacion.replace(/:/g, '')}00Z
SUMMARY:Reserva - ${reserva.nombre_espacio}
LOCATION:${reserva.ubicacion}
DESCRIPTION:${reserva.tema}
END:VEVENT
END:VCALENDAR`;

    res.setHeader('Content-Type', 'text/calendar');
    res.setHeader('Content-Disposition', `attachment; filename="reserva-${id}.ics"`);
    res.send(icsContent);
  } catch (error) {
    console.error('Error al descargar ICS:', error);
    res.status(500).json({
      success: false,
      message: 'Error al descargar el archivo'
    });
  }
};
