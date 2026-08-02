import pg from 'pg';
import 'dotenv/config';

const { Client } = pg;

async function resetDb() {
  const dbName = process.env.DB_DATABASE || 'reservas';
  
  const client = new Client({
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'root',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: 'postgres'
  });
  
  try {
    await client.connect();
    
    // Terminar todas las conexiones a la base de datos
    await client.query(`
      SELECT pg_terminate_backend(pg_stat_activity.pid)
      FROM pg_stat_activity
      WHERE pg_stat_activity.datname = $1
      AND pid <> pg_backend_pid()
    `, [dbName]);
    
    // Eliminar la base de datos
    await client.query(`DROP DATABASE IF EXISTS "${dbName}"`);
    console.log(`Base de datos '${dbName}' eliminada`);
    
    // Crear nueva base de datos
    await client.query(`CREATE DATABASE "${dbName}"`);
    console.log(`Base de datos '${dbName}' recreada`);
  } catch (error) {
    console.error('Error al resetear la base de datos:', error.message);
  } finally {
    await client.end();
  }
}

resetDb();
