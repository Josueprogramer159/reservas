import bcrypt from 'bcryptjs';
import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'root',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_DATABASE || 'reservas',
});

async function crearAdmin() {
  const nombre = 'Josue';
  const email = 'josue@gmail.com';
  const passwordRaw = '12345678';

  try {
    const existe = await pool.query('SELECT id FROM administradores WHERE email = $1', [email]);
    if (existe.rows.length > 0) {
      console.log(`Ya existe un administrador con el email: ${email}`);
      await pool.end();
      return;
    }

    const hash = await bcrypt.hash(passwordRaw, 10);
    const result = await pool.query(
      `INSERT INTO administradores (nombre, email, password, rol, activo)
       VALUES ($1, $2, $3, 'admin', true) RETURNING id, nombre, email`,
      [nombre, email, hash]
    );

    console.log('✅ Administrador creado:');
    console.log(`   ID:    ${result.rows[0].id}`);
    console.log(`   Nombre: ${result.rows[0].nombre}`);
    console.log(`   Email:  ${result.rows[0].email}`);
    console.log(`   Contraseña: ${passwordRaw}`);
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await pool.end();
  }
}

crearAdmin();
