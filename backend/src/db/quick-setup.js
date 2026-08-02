import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

const { Client } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function setup() {
  const client = new Client({
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'root',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_DATABASE || 'reservas'
  });

  try {
    await client.connect();
    console.log('✓ Conectado a PostgreSQL');
    
    const sql = fs.readFileSync(path.join(__dirname, 'quick-init.sql'), 'utf8');
    
    // Ejecutar el SQL completo de una vez
    await client.query(sql);
    console.log('✓ Base de datos inicializada exitosamente');
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

setup();
