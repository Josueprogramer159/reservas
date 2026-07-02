import pool from '../db/database.js';
import QRCode from 'qrcode';
import crypto from 'crypto';

/**
 * Generar código QR único para una reserva
 * Se llama automáticamente cuando se confirma una reserva
 */
export const generarCodigoQR = async (reservaId, usuarioId, espacioId, fecha) => {
  try {
    // Generar token único
    const tokenUnico = crypto.randomBytes(32).toString('hex');
    
    // Datos a incluir en el QR
    const qrData = `RESERVA|${reservaId}|${usuarioId}|${espacioId}|${fecha}|${tokenUnico}`;
    
    // Generar imagen QR en Base64
    const qrBase64 = await QRCode.toDataURL(qrData, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 300,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    // Guardar QR en base de datos
    const fechaExpiracion = new Date(fecha);
    fechaExpiracion.setHours(fechaExpiracion.getHours() + 24);

    const result = await pool.query(
      `INSERT INTO qr_codes (reserva_id, qr_data, qr_base64, token_unico, fecha_expiracion, activo)
       VALUES ($1, $2, $3, $4, $5, true)
       RETURNING id, qr_base64, token_unico`,
      [reservaId, qrData, qrBase64, tokenUnico, fechaExpiracion]
    );

    console.log(`✅ QR generado para reserva ${reservaId}`);
    return result.rows[0];
  } catch (error) {
    console.error('Error al generar QR:', error);
    throw error;
  }
};

/**
 * Obtener código QR de una reserva
 * Si no existe, lo genera automáticamente
 */
export const obtenerCodigoQR = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.session.userId;

    // Verificar que la reserva pertenece al usuario y obtener datos
    const reservaCheck = await pool.query(
      `SELECT r.id, r.espacio_id, r.fecha FROM reservas r
       WHERE r.id = $1 AND r.usuario_id = $2`,
      [id, usuarioId]
    );

    if (reservaCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Reserva no encontrada' });
    }

    const reserva = reservaCheck.rows[0];

    let qrResult = await pool.query(
      `SELECT id, qr_base64, token_unico, fecha_generacion, fecha_expiracion, activo
       FROM qr_codes
       WHERE reserva_id = $1`,
      [id]
    );

    // Si no existe el QR, generarlo ahora
    if (qrResult.rows.length === 0) {
      console.log(`📱 QR no encontrado para reserva ${id}, generando uno nuevo...`);
      const nuevoQR = await generarCodigoQR(reserva.id, usuarioId, reserva.espacio_id, reserva.fecha);
      qrResult = { rows: [nuevoQR] };
    }

    res.json({
      success: true,
      qr: qrResult.rows[0]
    });
  } catch (error) {
    console.error('Error al obtener QR:', error);
    res.status(500).json({ success: false, message: 'Error al obtener el código QR' });
  }
};

/**
 * Registrar asistencia escaneando el código QR
 */
export const registrarAsistencia = async (req, res) => {
  try {
    const { qrData } = req.body;
    const usuarioId = req.session.userId;

    if (!qrData) {
      return res.status(400).json({ success: false, message: 'Código QR inválido' });
    }

    // Decodificar datos del QR
    const partes = qrData.split('|');
    if (partes.length < 5) {
      return res.status(400).json({ success: false, message: 'Formato de QR inválido' });
    }

    const [tipo, reservaId, qrUsuarioId, espacioId, fecha, tokenUnico] = partes;

    if (tipo !== 'RESERVA') {
      return res.status(400).json({ success: false, message: 'Tipo de QR no válido' });
    }

    // Validación 1: Verificar que el QR pertenece al usuario autenticado
    if (parseInt(qrUsuarioId) !== usuarioId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Este código QR no pertenece a tu usuario' 
      });
    }

    // Validación 2: Verificar que la reserva existe y está confirmada
    const reservaCheck = await pool.query(
      `SELECT r.id, r.fecha, r.horario, r.estado, r.espacio_id,
              e.nombre as espacio_nombre
       FROM reservas r
       JOIN espacios e ON e.id = r.espacio_id
       WHERE r.id = $1 AND r.usuario_id = $2`,
      [reservaId, usuarioId]
    );

    if (reservaCheck.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Reserva no encontrada' 
      });
    }

    const reserva = reservaCheck.rows[0];

    if (reserva.estado !== 'confirmado') {
      return res.status(403).json({ 
        success: false, 
        message: 'La reserva no está confirmada' 
      });
    }

    // Validación 3: Verificar que la fecha y hora sean válidas
    const ahora = new Date();
    const fechaReserva = new Date(reserva.fecha);
    
    // Permitir escaneo desde 30 minutos antes de la reserva
    const inicioValido = new Date(fechaReserva.getTime() - 30 * 60000);
    
    // Permitir escaneo hasta 24 horas después de la reserva
    const finValido = new Date(fechaReserva.getTime() + 24 * 60 * 60000);

    if (ahora < inicioValido) {
      return res.status(403).json({ 
        success: false, 
        message: 'El código QR aún no es válido. Puedes escanear 30 minutos antes de la reserva.' 
      });
    }

    if (ahora > finValido) {
      return res.status(403).json({ 
        success: false, 
        message: 'El código QR ya ha expirado. La fecha de la reserva fue hace más de 24 horas.' 
      });
    }

    // Validación 4: Verificar que la asistencia aún no ha sido registrada
    const asistenciaExistente = await pool.query(
      `SELECT id FROM asistencias WHERE reserva_id = $1`,
      [reservaId]
    );

    if (asistenciaExistente.rows.length > 0) {
      return res.status(409).json({ 
        success: false, 
        message: 'La asistencia para esta reserva ya fue registrada previamente' 
      });
    }

    // Validación 5: Verificar el token único en la BD
    const qrCodeCheck = await pool.query(
      `SELECT id, activo FROM qr_codes 
       WHERE reserva_id = $1 AND token_unico = $2`,
      [reservaId, tokenUnico]
    );

    if (qrCodeCheck.rows.length === 0 || !qrCodeCheck.rows[0].activo) {
      return res.status(401).json({ 
        success: false, 
        message: 'Código QR inválido o revocado' 
      });
    }

    // Registrar asistencia
    const horaActual = new Date();
    const horaEscaneado = horaActual.toTimeString().split(' ')[0];

    const asistenciaResult = await pool.query(
      `INSERT INTO asistencias (
        reserva_id, usuario_id, espacio_id, 
        hora_escaneado, codigo_qr, dispositivo_escaneo, 
        ubicacion_ip, estado
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'registrado')
      RETURNING id, fecha_asistencia, hora_escaneado`,
      [
        reservaId, 
        usuarioId, 
        espacioId,
        horaEscaneado,
        qrData,
        req.headers['user-agent'] || 'Desconocido',
        req.ip || req.connection.remoteAddress || 'Desconocida'
      ]
    );

    // Desactivar el QR para prevenir reusos
    await pool.query(
      `UPDATE qr_codes SET activo = false WHERE id = $1`,
      [qrCodeCheck.rows[0].id]
    );

    res.status(201).json({
      success: true,
      message: `✅ Asistencia registrada correctamente para ${reserva.espacio_nombre}`,
      asistencia: {
        id: asistenciaResult.rows[0].id,
        reserva_id: reservaId,
        espacio_nombre: reserva.espacio_nombre,
        fecha_asistencia: asistenciaResult.rows[0].fecha_asistencia,
        hora_escaneado: asistenciaResult.rows[0].hora_escaneado
      }
    });

  } catch (error) {
    console.error('Error al registrar asistencia:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al registrar la asistencia' 
    });
  }
};

/**
 * Obtener historial de asistencias (Admin)
 */
export const obtenerHistorialAsistencias = async (req, res) => {
  try {
    const { usuario_id, espacio_id, fecha_inicio, fecha_fin, estado } = req.query;

    let query = `
      SELECT 
        a.id,
        a.reserva_id,
        u.nombre as usuario_nombre,
        u.email as usuario_email,
        e.nombre as espacio_nombre,
        e.tipo as espacio_tipo,
        r.fecha as fecha_reserva,
        r.horario,
        a.fecha_asistencia,
        a.hora_escaneado,
        a.estado,
        a.dispositivo_escaneo,
        a.ubicacion_ip
      FROM asistencias a
      JOIN usuarios u ON u.id = a.usuario_id
      JOIN espacios e ON e.id = a.espacio_id
      JOIN reservas r ON r.id = a.reserva_id
      WHERE 1=1
    `;

    const params = [];
    let paramIndex = 1;

    // Filtro por usuario
    if (usuario_id) {
      query += ` AND a.usuario_id = $${paramIndex}`;
      params.push(usuario_id);
      paramIndex++;
    }

    // Filtro por espacio
    if (espacio_id) {
      query += ` AND a.espacio_id = $${paramIndex}`;
      params.push(espacio_id);
      paramIndex++;
    }

    // Filtro por fecha inicio
    if (fecha_inicio) {
      query += ` AND DATE(a.fecha_asistencia) >= DATE($${paramIndex})`;
      params.push(fecha_inicio);
      paramIndex++;
    }

    // Filtro por fecha fin
    if (fecha_fin) {
      query += ` AND DATE(a.fecha_asistencia) <= DATE($${paramIndex})`;
      params.push(fecha_fin);
      paramIndex++;
    }

    // Filtro por estado
    if (estado) {
      query += ` AND a.estado = $${paramIndex}`;
      params.push(estado);
      paramIndex++;
    }

    query += ` ORDER BY a.fecha_asistencia DESC LIMIT 500`;

    const result = await pool.query(query, params);

    // Contar totales
    const countResult = await pool.query(`SELECT COUNT(*) FROM asistencias`);

    res.json({
      success: true,
      total_registros: parseInt(countResult.rows[0].count),
      registros_mostrados: result.rows.length,
      asistencias: result.rows
    });

  } catch (error) {
    console.error('Error al obtener historial:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener el historial de asistencias' 
    });
  }
};

/**
 * Obtener estadísticas de asistencia (Admin)
 */
export const obtenerEstadisticasAsistencia = async (req, res) => {
  try {
    // Total de asistencias registradas
    const totalAsistencias = await pool.query(`
      SELECT COUNT(*) as total FROM asistencias
    `);

    // Asistencias por espacio
    const asistenciasPorEspacio = await pool.query(`
      SELECT 
        e.nombre,
        COUNT(*) as total,
        ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM asistencias), 2) as porcentaje
      FROM asistencias a
      JOIN espacios e ON e.id = a.espacio_id
      GROUP BY e.id, e.nombre
      ORDER BY total DESC
    `);

    // Asistencias por usuario (más activos)
    const usuariosMasActivos = await pool.query(`
      SELECT 
        u.nombre,
        COUNT(*) as total_asistencias
      FROM asistencias a
      JOIN usuarios u ON u.id = a.usuario_id
      GROUP BY u.id, u.nombre
      ORDER BY total_asistencias DESC
      LIMIT 10
    `);

    // Asistencias últimos 7 días
    const ultimosSieteDias = await pool.query(`
      SELECT 
        DATE(a.fecha_asistencia) as fecha,
        COUNT(*) as total
      FROM asistencias a
      WHERE a.fecha_asistencia >= NOW() - INTERVAL '7 days'
      GROUP BY DATE(a.fecha_asistencia)
      ORDER BY fecha ASC
    `);

    // Tasa de asistencia por espacio (% de reservas con asistencia)
    const tasaAsistencia = await pool.query(`
      SELECT 
        e.nombre,
        COUNT(DISTINCT r.id) as total_reservas,
        COUNT(DISTINCT a.id) as asistencias,
        ROUND(100.0 * COUNT(DISTINCT a.id) / COUNT(DISTINCT r.id), 2) as tasa_porcentaje
      FROM espacios e
      LEFT JOIN reservas r ON r.espacio_id = e.id AND r.estado = 'confirmado'
      LEFT JOIN asistencias a ON a.reserva_id = r.id
      GROUP BY e.id, e.nombre
      ORDER BY tasa_porcentaje DESC
    `);

    res.json({
      success: true,
      estadisticas: {
        total_asistencias: parseInt(totalAsistencias.rows[0].total),
        asistencias_por_espacio: asistenciasPorEspacio.rows,
        usuarios_mas_activos: usuariosMasActivos.rows,
        ultimos_7_dias: ultimosSieteDias.rows,
        tasa_asistencia: tasaAsistencia.rows
      }
    });

  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener las estadísticas de asistencia' 
    });
  }
};

/**
 * Cancelar asistencia registrada (Admin)
 */
export const cancelarAsistencia = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE asistencias SET estado = 'cancelada' WHERE id = $1 RETURNING id, reserva_id`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Asistencia no encontrada' 
      });
    }

    // Reactivar el QR para permitir nuevo escaneo
    await pool.query(
      `UPDATE qr_codes SET activo = true WHERE reserva_id = $1`,
      [result.rows[0].reserva_id]
    );

    res.json({
      success: true,
      message: 'Asistencia cancelada correctamente'
    });

  } catch (error) {
    console.error('Error al cancelar asistencia:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al cancelar la asistencia' 
    });
  }
};
