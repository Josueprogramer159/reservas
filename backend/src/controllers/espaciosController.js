import pool from '../db/database.js';
import { getReservationConfig } from '../utils/reservationConfig.js';

const TIPOS_VALIDOS = ['Laboratorios', 'Canchas', 'Salas'];

async function getHorariosOcupados(espacioId, fecha) {
  const result = await pool.query(
    `SELECT hora_inicio, hora_finalizacion FROM reservas
     WHERE espacio_id = $1 AND fecha = $2 AND estado = 'confirmado'`,
    [espacioId, fecha]
  );
  return result.rows.map(r => `${r.hora_inicio}-${r.hora_finalizacion}`);
}

function mapEspacio(row, horariosOcupados = [], configuracionReserva = null) {
  const estaReservadoEnLaFecha = horariosOcupados.length > 0;
  const horarioConfigurado = configuracionReserva?.horario;
  const horariosLibres = !row.activo || !horarioConfigurado || estaReservadoEnLaFecha
    ? []
    : [horarioConfigurado];
  return {
    id: row.id,
    nombre: row.nombre,
    tipo: row.tipo,
    capacidad: row.capacidad,
    ubicacion: row.ubicacion,
    descripcion: row.descripcion,
    imagen: row.imagen,
    horario: row.horario,
    activo: row.activo,
    horarios_ocupados: horariosOcupados,
    horarios_libres: horariosLibres,
    disponible: row.activo && !!horarioConfigurado && !estaReservadoEnLaFecha
  };
}

export const listarEspacios = async (req, res) => {
  try {
    const configuracionReserva = await getReservationConfig();
    const fechaConsulta = configuracionReserva?.fecha || new Date().toISOString().split('T')[0];
    const usuarioId = req.session?.userId;

    // Admin ve todos (activos e inactivos), usuarios solo ven activos
    const esAdmin = req.session?.role === 'admin';
    const query = esAdmin
      ? `SELECT * FROM espacios ORDER BY tipo, nombre`
      : `SELECT * FROM espacios WHERE activo = true ORDER BY tipo, nombre`;

    const result = await pool.query(query);

    if (result.rows.length === 0) {
      return res.json({
        success: true,
        espacios: [],
        message: 'No existen espacios disponibles en el sistema'
      });
    }

    // Si hay usuario autenticado, obtener sus favoritos
    let favoritosSet = new Set();
    if (usuarioId) {
      const favoritosResult = await pool.query(
        'SELECT espacio_id FROM espacios_favoritos WHERE usuario_id = $1',
        [usuarioId]
      );
      favoritosSet = new Set(favoritosResult.rows.map(row => row.espacio_id));
    }

    const espacios = await Promise.all(
      result.rows.map(async (row) => {
        const ocupados = await getHorariosOcupados(row.id, fechaConsulta);
        const espacioMapeado = mapEspacio(row, ocupados, configuracionReserva);
        
        // Agregar información de favorito
        espacioMapeado.es_favorito = favoritosSet.has(row.id);
        
        return espacioMapeado;
      })
    );

    res.json({ 
      success: true, 
      espacios, 
      fecha: fechaConsulta, 
      configuracionReserva,
      usuario_autenticado: !!usuarioId
    });
  } catch (error) {
    console.error('Error al listar espacios:', error);
    res.status(500).json({ success: false, message: 'Error al consultar los espacios' });
  }
};

export const obtenerEspacio = async (req, res) => {
  try {
    const { id } = req.params;
    const configuracionReserva = await getReservationConfig();
    const fechaConsulta = configuracionReserva?.fecha || new Date().toISOString().split('T')[0];
    const usuarioId = req.session?.userId;

    const result = await pool.query('SELECT * FROM espacios WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'El espacio solicitado no existe' });
    }

    const row = result.rows[0];

    if (!row.activo) {
      return res.status(403).json({
        success: false,
        message: 'Este espacio se encuentra inactivo y no está disponible para reservas',
        espacio: { id: row.id, nombre: row.nombre, activo: false }
      });
    }

    const ocupados = await getHorariosOcupados(row.id, fechaConsulta);
    const espacio = mapEspacio(row, ocupados, configuracionReserva);

    // Agregar información detallada del espacio para HU004
    espacio.info_uso = row.info_uso || 'Docencia e Investigación';
    espacio.responsable_academico = {
      nombre: row.responsable_academico_nombre || 'No especificado',
      email: row.responsable_academico_email || 'No disponible',
      telefono: row.responsable_academico_telefono || 'No disponible'
    };
    espacio.responsable_administrativo = {
      nombre: row.responsable_administrativo_nombre || 'No especificado',
      email: row.responsable_administrativo_email || 'No disponible',
      telefono: row.responsable_administrativo_telefono || 'No disponible'
    };

    // Verificar si es favorito del usuario autenticado
    if (usuarioId) {
      const favoritoResult = await pool.query(
        'SELECT id FROM espacios_favoritos WHERE usuario_id = $1 AND espacio_id = $2',
        [usuarioId, row.id]
      );
      espacio.es_favorito = favoritoResult.rows.length > 0;
    } else {
      espacio.es_favorito = false;
    }

    res.json({
      success: true,
      espacio,
      fecha: fechaConsulta,
      configuracionReserva,
      usuario_autenticado: !!usuarioId
    });
  } catch (error) {
    console.error('Error al obtener espacio:', error);
    res.status(500).json({ success: false, message: 'Error al consultar el espacio' });
  }
};

export const crearEspacio = async (req, res) => {
  try {
    const { nombre, tipo, capacidad, ubicacion, descripcion, imagen, horario, info_uso, responsable_academico, responsable_administrativo } = req.body;

    const faltantes = [];
    if (!nombre?.trim()) faltantes.push('nombre');
    if (!tipo?.trim()) faltantes.push('tipo');
    if (!capacidad) faltantes.push('capacidad');
    if (!ubicacion?.trim()) faltantes.push('ubicacion');
    if (!horario?.trim()) faltantes.push('horario');

    if (faltantes.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Campos obligatorios faltantes: ${faltantes.join(', ')}`
      });
    }

    if (!TIPOS_VALIDOS.includes(tipo)) {
      return res.status(400).json({
        success: false,
        message: `El tipo debe ser uno de: ${TIPOS_VALIDOS.join(', ')}`
      });
    }

    const cap = parseInt(capacidad);
    if (isNaN(cap) || cap <= 0) {
      return res.status(400).json({ success: false, message: 'La capacidad debe ser un número entero positivo' });
    }

    // Validar formato básico del horario
    const horarioPattern = /^\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2}$/;
    if (!horarioPattern.test(horario.trim())) {
      return res.status(400).json({ 
        success: false, 
        message: 'El formato del horario debe ser HH:MM - HH:MM (ej: 08:00 - 10:00)' 
      });
    }

    // Validar responsables
    if (!responsable_academico?.nombre || !responsable_academico?.email || !responsable_academico?.telefono) {
      return res.status(400).json({ success: false, message: 'Responsable académico incompleto (nombre, email y teléfono requeridos)' });
    }

    if (!responsable_administrativo?.nombre || !responsable_administrativo?.email || !responsable_administrativo?.telefono) {
      return res.status(400).json({ success: false, message: 'Responsable administrativo incompleto (nombre, email y teléfono requeridos)' });
    }

    // Crear el espacio
    const result = await pool.query(
      `INSERT INTO espacios (nombre, tipo, capacidad, ubicacion, descripcion, imagen, horario, info_uso, 
        responsable_academico_nombre, responsable_academico_email, responsable_academico_telefono,
        responsable_administrativo_nombre, responsable_administrativo_email, responsable_administrativo_telefono, activo)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, true)
       RETURNING *`,
      [
        nombre.trim(), tipo, cap, ubicacion.trim(), descripcion?.trim() || null, imagen?.trim() || null, horario.trim(), 
        info_uso?.trim() || 'Docencia e Investigación',
        responsable_academico.nombre, responsable_academico.email, responsable_academico.telefono,
        responsable_administrativo.nombre, responsable_administrativo.email, responsable_administrativo.telefono
      ]
    );

    res.status(201).json({ success: true, message: 'Espacio creado correctamente', espacio: result.rows[0] });
  } catch (error) {
    console.error('Error al crear espacio:', error);
    res.status(500).json({ success: false, message: 'Error al crear el espacio' });
  }
};

export const editarEspacio = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, tipo, capacidad, ubicacion, descripcion, imagen, horario, info_uso, responsable_academico, responsable_administrativo } = req.body;

    const faltantes = [];
    if (!nombre?.trim()) faltantes.push('nombre');
    if (!tipo?.trim()) faltantes.push('tipo');
    if (!capacidad) faltantes.push('capacidad');
    if (!ubicacion?.trim()) faltantes.push('ubicacion');
    if (!horario?.trim()) faltantes.push('horario');

    if (faltantes.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Campos obligatorios faltantes: ${faltantes.join(', ')}`
      });
    }

    if (!TIPOS_VALIDOS.includes(tipo)) {
      return res.status(400).json({
        success: false,
        message: `El tipo debe ser uno de: ${TIPOS_VALIDOS.join(', ')}`
      });
    }

    const cap = parseInt(capacidad);
    if (isNaN(cap) || cap <= 0) {
      return res.status(400).json({ success: false, message: 'La capacidad debe ser un número entero positivo' });
    }

    // Validar formato básico del horario
    const horarioPattern = /^\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2}$/;
    if (!horarioPattern.test(horario.trim())) {
      return res.status(400).json({ 
        success: false, 
        message: 'El formato del horario debe ser HH:MM - HH:MM (ej: 08:00 - 10:00)' 
      });
    }

    const existe = await pool.query('SELECT id FROM espacios WHERE id = $1', [id]);
    if (existe.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'El espacio no existe' });
    }

    // Validar responsables si se proporcionan
    let raAcademico = { nombre: null, email: null, telefono: null };
    let raAdministrativo = { nombre: null, email: null, telefono: null };

    if (responsable_academico) {
      if (!responsable_academico.nombre || !responsable_academico.email || !responsable_academico.telefono) {
        return res.status(400).json({ success: false, message: 'Responsable académico incompleto' });
      }
      raAcademico = responsable_academico;
    }

    if (responsable_administrativo) {
      if (!responsable_administrativo.nombre || !responsable_administrativo.email || !responsable_administrativo.telefono) {
        return res.status(400).json({ success: false, message: 'Responsable administrativo incompleto' });
      }
      raAdministrativo = responsable_administrativo;
    }

    const result = await pool.query(
      `UPDATE espacios SET nombre=$1, tipo=$2, capacidad=$3, ubicacion=$4, descripcion=$5, imagen=$6, horario=$7, info_uso=$8,
        responsable_academico_nombre=$9, responsable_academico_email=$10, responsable_academico_telefono=$11,
        responsable_administrativo_nombre=$12, responsable_administrativo_email=$13, responsable_administrativo_telefono=$14
       WHERE id=$15 RETURNING *`,
      [
        nombre.trim(), tipo, cap, ubicacion.trim(), descripcion?.trim() || null, imagen?.trim() || null, horario.trim(), 
        info_uso?.trim() || 'Docencia e Investigación',
        raAcademico.nombre, raAcademico.email, raAcademico.telefono,
        raAdministrativo.nombre, raAdministrativo.email, raAdministrativo.telefono,
        id
      ]
    );

    res.json({ success: true, message: 'Espacio actualizado correctamente', espacio: result.rows[0] });
  } catch (error) {
    console.error('Error al editar espacio:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar el espacio' });
  }
};

export const eliminarEspacio = async (req, res) => {
  try {
    const { id } = req.params;

    const existe = await pool.query('SELECT id FROM espacios WHERE id = $1', [id]);
    if (existe.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'El espacio no existe' });
    }

    const reservasActivas = await pool.query(
      `SELECT COUNT(*) FROM reservas WHERE espacio_id = $1 AND estado = 'confirmado'`,
      [id]
    );

    if (parseInt(reservasActivas.rows[0].count) > 0) {
      return res.status(409).json({
        success: false,
        message: 'No se puede eliminar este espacio porque tiene reservas activas vigentes'
      });
    }

    await pool.query('DELETE FROM espacios WHERE id = $1', [id]);
    res.json({ success: true, message: 'Espacio eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar espacio:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar el espacio' });
  }
};

export const toggleActivoEspacio = async (req, res) => {
  try {
    const { id } = req.params;

    const existe = await pool.query('SELECT id, activo FROM espacios WHERE id = $1', [id]);
    if (existe.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'El espacio no existe' });
    }

    const nuevoEstado = !existe.rows[0].activo;
    const result = await pool.query(
      'UPDATE espacios SET activo = $1 WHERE id = $2 RETURNING id, nombre, activo',
      [nuevoEstado, id]
    );

    res.json({
      success: true,
      message: `Espacio ${nuevoEstado ? 'activado' : 'desactivado'} correctamente`,
      espacio: result.rows[0]
    });
  } catch (error) {
    console.error('Error al cambiar estado del espacio:', error);
    res.status(500).json({ success: false, message: 'Error al cambiar el estado del espacio' });
  }
};

export const listarEspaciosAdmin = async (req, res) => {
  try {
    const configuracionReserva = await getReservationConfig();
    const fechaConsulta = configuracionReserva?.fecha || new Date().toISOString().split('T')[0];

    const result = await pool.query('SELECT * FROM espacios ORDER BY tipo, nombre');

    const espacios = await Promise.all(
      result.rows.map(async (row) => {
        const ocupados = await getHorariosOcupados(row.id, fechaConsulta);
        return mapEspacio(row, ocupados, configuracionReserva);
      })
    );

    res.json({ success: true, espacios, fecha: fechaConsulta, configuracionReserva });
  } catch (error) {
    console.error('Error al listar espacios (admin):', error);
    res.status(500).json({ success: false, message: 'Error al consultar los espacios' });
  }
};

export const buscarEspacios = async (req, res) => {
  try {
    const { nombre, tipo, capacidad_min, capacidad_max } = req.query;
    const configuracionReserva = await getReservationConfig();
    const fechaConsulta = configuracionReserva?.fecha || new Date().toISOString().split('T')[0];

    // Construir query dinámica
    let query = 'SELECT * FROM espacios WHERE activo = true';
    const params = [];
    let paramIndex = 1;

    // Filtro por nombre (insensible a mayúsculas)
    if (nombre && nombre.trim()) {
      query += ` AND LOWER(nombre) LIKE LOWER($${paramIndex})`;
      params.push(`%${nombre.trim()}%`);
      paramIndex++;
    }

    // Filtro por tipo
    if (tipo && tipo.trim()) {
      query += ` AND tipo = $${paramIndex}`;
      params.push(tipo.trim());
      paramIndex++;
    }

    // Filtro por capacidad mínima
    if (capacidad_min) {
      const min = parseInt(capacidad_min);
      if (!isNaN(min)) {
        query += ` AND capacidad >= $${paramIndex}`;
        params.push(min);
        paramIndex++;
      }
    }

    // Filtro por capacidad máxima
    if (capacidad_max) {
      const max = parseInt(capacidad_max);
      if (!isNaN(max)) {
        query += ` AND capacidad <= $${paramIndex}`;
        params.push(max);
        paramIndex++;
      }
    }

    query += ' ORDER BY tipo, nombre';

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.json({
        success: true,
        espacios: [],
        message: 'No se encontraron espacios que coincidan con los filtros aplicados'
      });
    }

    const espacios = await Promise.all(
      result.rows.map(async (row) => {
        const ocupados = await getHorariosOcupados(row.id, fechaConsulta);
        return mapEspacio(row, ocupados, configuracionReserva);
      })
    );

    res.json({
      success: true,
      espacios,
      fecha: fechaConsulta,
      configuracionReserva,
      filtros_aplicados: {
        nombre: nombre || null,
        tipo: tipo || null,
        capacidad_min: capacidad_min ? parseInt(capacidad_min) : null,
        capacidad_max: capacidad_max ? parseInt(capacidad_max) : null
      }
    });
  } catch (error) {
    console.error('Error al buscar espacios:', error);
    res.status(500).json({ success: false, message: 'Error al buscar espacios' });
  }
};

// HU003: Obtener espacios agrupados por categoría con contadores
export const obtenerEspaciosPorCategoria = async (req, res) => {
  try {
    const { categoria } = req.params;
    const configuracionReserva = await getReservationConfig();
    const fechaConsulta = configuracionReserva?.fecha || new Date().toISOString().split('T')[0];
    const usuarioId = req.session?.userId;

    // Validar que la categoría sea válida
    if (!TIPOS_VALIDOS.includes(categoria)) {
      return res.status(400).json({
        success: false,
        message: `Categoría inválida. Las categorías disponibles son: ${TIPOS_VALIDOS.join(', ')}`
      });
    }

    // Obtener todos los espacios de la categoría (solo activos para usuarios no admin)
    const esAdmin = req.session?.role === 'admin';
    const query = esAdmin
      ? `SELECT * FROM espacios WHERE tipo = $1 ORDER BY nombre`
      : `SELECT * FROM espacios WHERE tipo = $1 AND activo = true ORDER BY nombre`;

    const result = await pool.query(query, [categoria]);

    if (result.rows.length === 0) {
      return res.json({
        success: true,
        categoria,
        espacios: [],
        total: 0,
        disponibles: 0,
        message: `No hay espacios disponibles en la categoría ${categoria}`
      });
    }

    // Obtener favoritos si el usuario está autenticado
    let favoritosSet = new Set();
    if (usuarioId) {
      const favoritosResult = await pool.query(
        'SELECT espacio_id FROM espacios_favoritos WHERE usuario_id = $1',
        [usuarioId]
      );
      favoritosSet = new Set(favoritosResult.rows.map(row => row.espacio_id));
    }

    // Mapear espacios con información de horarios ocupados
    const espacios = await Promise.all(
      result.rows.map(async (row) => {
        const ocupados = await getHorariosOcupados(row.id, fechaConsulta);
        const espacioMapeado = mapEspacio(row, ocupados, configuracionReserva);
        espacioMapeado.es_favorito = favoritosSet.has(row.id);
        return espacioMapeado;
      })
    );

    // Contar espacios disponibles (activos y sin reservas en la fecha)
    const disponibles = espacios.filter(e => e.disponible).length;

    res.json({
      success: true,
      categoria,
      espacios,
      total: espacios.length,
      disponibles,
      fecha: fechaConsulta,
      configuracionReserva,
      usuario_autenticado: !!usuarioId
    });
  } catch (error) {
    console.error('Error al obtener espacios por categoría:', error);
    res.status(500).json({ success: false, message: 'Error al consultar espacios por categoría' });
  }
};

// HU003: Obtener resumen de categorías con contadores
export const obtenerResumenCategorias = async (req, res) => {
  try {
    const configuracionReserva = await getReservationConfig();
    const fechaConsulta = configuracionReserva?.fecha || new Date().toISOString().split('T')[0];
    const usuarioId = req.session?.userId;
    const esAdmin = req.session?.role === 'admin';

    // Obtener espacios según rol
    const query = esAdmin
      ? `SELECT tipo FROM espacios ORDER BY tipo`
      : `SELECT tipo FROM espacios WHERE activo = true ORDER BY tipo`;

    const result = await pool.query(query);
    const espacios = result.rows;

    // Agrupar y contar por categoría
    const categorias = {};
    for (const tipo of TIPOS_VALIDOS) {
      categorias[tipo] = {
        total: 0,
        disponibles: 0
      };
    }

    // Procesar cada espacio
    for (const row of espacios) {
      const ocupados = await getHorariosOcupados(row.id, fechaConsulta);
      const espacioMapeado = mapEspacio(
        { ...row, activo: true },
        ocupados,
        configuracionReserva
      );

      if (categorias[row.tipo]) {
        categorias[row.tipo].total++;
        if (espacioMapeado.disponible) {
          categorias[row.tipo].disponibles++;
        }
      }
    }

    res.json({
      success: true,
      categorias,
      categoriasDisponibles: TIPOS_VALIDOS,
      fecha: fechaConsulta,
      usuario_autenticado: !!usuarioId
    });
  } catch (error) {
    console.error('Error al obtener resumen de categorías:', error);
    res.status(500).json({ success: false, message: 'Error al obtener resumen de categorías' });
  }
};
