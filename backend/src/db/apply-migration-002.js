import pool from './database.js';
import fs from 'fs';
import path from 'path';

const __dirname = path.resolve();

async function applyMigration() {
  try {
    console.log('Aplicando migración 002: Agregar responsables a espacios...');
    
    const migrationSql = fs.readFileSync(
      path.join(__dirname, 'src/db/migrations/002-add-responsables-to-espacios.sql'),
      'utf8'
    );

    await pool.query(migrationSql);
    console.log('✓ Migración 002 aplicada exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('Error al aplicar migración:', error);
    process.exit(1);
  }
}

applyMigration();
