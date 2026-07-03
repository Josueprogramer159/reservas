export const buildAdminReservationsQuery = ({
  busqueda,
  fechaDesde,
  fechaHasta,
  usuarioId,
  espacioId,
  page = 1,
  limit = 10,
}) => {
  const safePage = Math.max(1, parseInt(page, 10) || 1);
  const safeLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
  const offset = (safePage - 1) * safeLimit;

  const params = [];
  const conditions = [];

  if (busqueda?.trim()) {
    const term = `%${busqueda.trim()}%`;
    params.push(term);
    conditions.push(`(u.nombre ILIKE $${params.length} OR u.email ILIKE $${params.length} OR e.nombre ILIKE $${params.length})`);
  }

  if (fechaDesde?.trim()) {
    params.push(fechaDesde.trim());
    conditions.push(`r.fecha >= $${params.length}`);
  }

  if (fechaHasta?.trim()) {
    params.push(fechaHasta.trim());
    conditions.push(`r.fecha <= $${params.length}`);
  }

  if (usuarioId) {
    params.push(parseInt(usuarioId, 10));
    conditions.push(`r.usuario_id = $${params.length}`);
  }

  if (espacioId) {
    params.push(parseInt(espacioId, 10));
    conditions.push(`r.espacio_id = $${params.length}`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : 'WHERE 1=1';

  const baseQuery = `
    SELECT r.id, r.fecha, r.horario, r.estado, r.fecha_creacion,
           u.id AS usuario_id, u.nombre AS usuario_nombre, u.email AS usuario_email,
           e.id AS espacio_id, e.nombre AS espacio_nombre, e.tipo AS espacio_tipo, e.ubicacion AS espacio_ubicacion
    FROM reservas r
    JOIN usuarios u ON u.id = r.usuario_id
    JOIN espacios e ON e.id = r.espacio_id
    ${whereClause}
    ORDER BY r.fecha DESC, r.horario ASC, r.id DESC
  `;

  const countQuery = `
    SELECT COUNT(*)::int AS total
    FROM reservas r
    JOIN usuarios u ON u.id = r.usuario_id
    JOIN espacios e ON e.id = r.espacio_id
    ${whereClause}
  `;

  const paginatedQuery = `${baseQuery} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;

  return {
    countQuery,
    query: paginatedQuery,
    params: [...params, safeLimit, offset],
    page: safePage,
    limit: safeLimit,
    offset,
  };
};
