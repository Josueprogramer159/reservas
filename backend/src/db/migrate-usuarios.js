import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;
const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  database: process.env.DB_DATABASE,
});

async function migrate() {
  try {
    // Agregar columna rol si no existe
    await pool.query(`
      ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS rol VARCHAR(20) DEFAULT 'usuario' NOT NULL;
    `);
    console.log('✓ Columna rol agregada (o ya existía)');

    // Agregar columna activo si no existe
    await pool.query(`
      ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT true NOT NULL;
    `);
    console.log('✓ Columna activo agregada (o ya existía)');

    // Tabla de auditoría
    await pool.query(`
      CREATE TABLE IF NOT EXISTS auditoria_usuarios (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER NOT NULL,
        admin_id INTEGER NOT NULL,
        accion VARCHAR(50) NOT NULL,
        detalle TEXT,
        fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Tabla auditoria_usuarios creada (o ya existía)');

    console.log('\n✅ Migración completada.');
  } catch (err) {
    console.error('❌ Error en migración:', err.message);
  } finally {
    await pool.end();
  }
}

migrate();
