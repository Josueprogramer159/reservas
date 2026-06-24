import pool from '../db/database.js';
import { getReservationConfig } from '../utils/reservationConfig.js';

async function getHorariosOcupados(espacioId, fecha) {
  const result = await pool.query(
    `SELECT horario FROM reservas
     WHERE espacio_id = $1 AND fecha = $2 AND estado = 'confirmado'`,
    [espacioId, fecha]
  );
  return result.rows.map(r => r.horario);
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
    info_complementaria: row.info_complementaria,
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

    const result = await pool.query(
      `SELECT * FROM espacios WHERE activo = true ORDER BY tipo, nombre`
    );

    if (result.rows.length === 0) {
      return res.json({
        success: true,
        espacios: [],
        message: 'No existen espacios disponibles en el sistema'
      });
    }

    const espacios = await Promise.all(
      result.rows.map(async (row) => {
        const ocupados = await getHorariosOcupados(row.id, fechaConsulta);
        return mapEspacio(row, ocupados, configuracionReserva);
      })
    );

    res.json({ success: true, espacios, fecha: fechaConsulta, configuracionReserva });
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
    res.json({
      success: true,
      espacio: mapEspacio(row, ocupados, configuracionReserva),
      fecha: fechaConsulta,
      configuracionReserva
    });
  } catch (error) {
    console.error('Error al obtener espacio:', error);
    res.status(500).json({ success: false, message: 'Error al consultar el espacio' });
  }
};
