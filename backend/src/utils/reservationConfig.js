import pool from '../db/database.js';
import { HORARIOS_DISPONIBLES } from '../constants/horarios.js';

const DEFAULT_CONFIG_ID = 1;

export async function ensureReservationConfigTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS configuracion_reservas (
      id INTEGER PRIMARY KEY,
      fecha DATE NOT NULL,
      horario VARCHAR(20) NOT NULL,
      fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

export async function getReservationConfig() {
  await ensureReservationConfigTable();
  const result = await pool.query(
    `SELECT id, fecha, horario, fecha_actualizacion
     FROM configuracion_reservas
     WHERE id = $1`,
    [DEFAULT_CONFIG_ID]
  );

  if (result.rows[0]) {
    return result.rows[0];
  }

  const fechaPorDefecto = new Date().toISOString().split('T')[0];
  const horarioPorDefecto = HORARIOS_DISPONIBLES[0];

  return saveReservationConfig(fechaPorDefecto, horarioPorDefecto);
}

export async function saveReservationConfig(fecha, horario) {
  await ensureReservationConfigTable();
  const result = await pool.query(
    `INSERT INTO configuracion_reservas (id, fecha, horario, fecha_actualizacion)
     VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
     ON CONFLICT (id)
     DO UPDATE SET
       fecha = EXCLUDED.fecha,
       horario = EXCLUDED.horario,
       fecha_actualizacion = CURRENT_TIMESTAMP
     RETURNING id, fecha, horario, fecha_actualizacion`,
    [DEFAULT_CONFIG_ID, fecha, horario]
  );

  return result.rows[0];
}
