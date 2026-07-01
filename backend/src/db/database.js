import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_DATABASE || 'reservas',
});

// Escuchar eventos de conexión
pool.on('connect', () => {
  console.log('Conexión establecida con la base de datos PostgreSQL.');
});

pool.on('error', (err) => {
  console.error('Error inesperado en el cliente de base de datos:', err);
  process.exit(-1);
});

export default pool;
