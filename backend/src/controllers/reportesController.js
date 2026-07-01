import pool from '../db/database.js';

// Utilidad: fecha límite máxima 12 meses atrás
function fechaMinima() {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 1);
  return d.toISOString().split('T')[0];
}

export const getReporteUso = async (req, res) => {
  try {
    let { fecha_inicio, fecha_fin, espacio_id, tipo } = req.query;

    const hoy = new Date().toISOString().split('T')[0];
    const minFecha = fechaMinima();

    if (!fecha_inicio) fecha_inicio = minFecha;
    if (!fecha_fin)    fecha_fin    = hoy;

    if (fecha_inicio < minFecha) fecha_inicio = minFecha;
    if (fecha_fin > hoy)         fecha_fin    = hoy;
    if (fecha_inicio > fecha_fin) {
      return res.status(400).json({ success: false, message: 'La fecha de inicio no puede ser mayor a la fecha de fin' });
    }

    const filtrosBase = [`r.estado = 'confirmado'`, `r.fecha BETWEEN $1 AND $2`, `e.activo = true`];
    const params = [fecha_inicio, fecha_fin];

    if (espacio_id) {
      params.push(espacio_id);
      filtrosBase.push(`e.id = $${params.length}`);
    }
    if (tipo) {
      params.push(tipo);
      filtrosBase.push(`e.tipo = $${params.length}`);
    }

    const WHERE = filtrosBase.join(' AND ');

    // 1. Reservas por espacio (top ranking)
    const reservasPorEspacio = await pool.query(`
      SELECT e.id, e.nombre, e.tipo, e.ubicacion, COUNT(r.id)::int AS total_reservas
      FROM reservas r
      JOIN espacios e ON e.id = r.espacio_id
      WHERE ${WHERE}
      GROUP BY e.id, e.nombre, e.tipo, e.ubicacion
      ORDER BY total_reservas DESC
    `, params);

    // 2. Reservas por tipo de espacio
    const reservasPorTipo = await pool.query(`
      SELECT e.tipo, COUNT(r.id)::int AS total_reservas
      FROM reservas r
      JOIN espacios e ON e.id = r.espacio_id
      WHERE ${WHERE}
      GROUP BY e.tipo
      ORDER BY total_reservas DESC
    `, params);

    // 3. Horas pico (horario más reservado)
    const horasPico = await pool.query(`
      SELECT r.horario, COUNT(r.id)::int AS total_reservas
      FROM reservas r
      JOIN espacios e ON e.id = r.espacio_id
      WHERE ${WHERE}
      GROUP BY r.horario
      ORDER BY total_reservas DESC
    `, params);

    // 4. Reservas por día (tendencia temporal)
    const reservasPorDia = await pool.query(`
      SELECT r.fecha::text AS fecha, COUNT(r.id)::int AS total_reservas
      FROM reservas r
      JOIN espacios e ON e.id = r.espacio_id
      WHERE ${WHERE}
      GROUP BY r.fecha
      ORDER BY r.fecha ASC
    `, params);

    // 5. Total general
    const totales = await pool.query(`
      SELECT COUNT(r.id)::int AS total_reservas, COUNT(DISTINCT r.usuario_id)::int AS usuarios_unicos, COUNT(DISTINCT r.espacio_id)::int AS espacios_usados
      FROM reservas r
      JOIN espacios e ON e.id = r.espacio_id
      WHERE ${WHERE}
    `, params);

    res.json({
      success: true,
      filtros: { fecha_inicio, fecha_fin, espacio_id: espacio_id || null, tipo: tipo || null },
      totales: totales.rows[0],
      reservasPorEspacio: reservasPorEspacio.rows,
      reservasPorTipo: reservasPorTipo.rows,
      horasPico: horasPico.rows,
      reservasPorDia: reservasPorDia.rows
    });
  } catch (error) {
    console.error('Error al generar reporte:', error);
    res.status(500).json({ success: false, message: 'Error al generar el reporte' });
  }
};

export const getEspaciosParaFiltro = async (req, res) => {
  try {
    const result = await pool.query(`SELECT id, nombre, tipo FROM espacios WHERE activo = true ORDER BY tipo, nombre`);
    res.json({ success: true, espacios: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener espacios' });
  }
};
