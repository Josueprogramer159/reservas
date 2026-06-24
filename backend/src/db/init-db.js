import pg from 'pg';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

const { Client, Pool } = pg;

async function initDb() {
  const dbName = process.env.DB_DATABASE || 'reserva_espacios';
  
  // Establecer conexión al motor postgres (base de datos general)
  const client = new Client({
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: 'postgres'
  });
  
  try {
    await client.connect();
    // Verificar si la base de datos ya existe
    const result = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName]);
    
    if (result.rows.length === 0) {
      console.log(`La base de datos '${dbName}' no existe. Creándola...`);
      // Evitar caracteres extraños e inyecciones en el nombre usando un identificador limpio
      await client.query(`CREATE DATABASE "${dbName}"`);
      console.log(`Base de datos '${dbName}' creada con éxito.`);
    } else {
      console.log(`La base de datos '${dbName}' ya existe.`);
    }
  } catch (error) {
    console.error('Error al verificar/crear la base de datos principal:', error);
    process.exit(1);
  } finally {
    await client.end();
  }

  // Ahora nos conectamos a la base de datos específica para crear las tablas
  console.log(`Conectando a la base de datos '${dbName}' para inicializar las tablas...`);
  const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: dbName,
  });

  try {
    // 1. Tabla Usuarios
    console.log('Creando tabla de usuarios...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Tabla Administradores
    console.log('Creando tabla de administradores...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS administradores (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        rol VARCHAR(50) DEFAULT 'admin',
        activo BOOLEAN DEFAULT true,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. Tabla Session (para almacenar sesiones persistentemente usando connect-pg-simple)
    console.log('Creando tabla de sesiones...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "session" (
        "sid" varchar NOT NULL COLLATE "default",
        "sess" json NOT NULL,
        "expire" timestamp(6) NOT NULL
      )
      WITH (OIDS=FALSE);
    `);
    
    // Agregar clave primaria a la tabla session si no tiene una
    try {
      await pool.query(`
        ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid");
      `);
    } catch (e) {
      // Ignorar si la restricción ya existe
    }
    
    // Crear índice para la expiración de las sesiones
    try {
      await pool.query(`
        CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");
      `);
    } catch (e) {
      // Ignorar si el índice ya existe
    }

    // 4. Insertar datos semilla (Administrador por defecto)
    console.log('Insertando administrador semilla...');
    const adminEmail = 'admin@utc.edu';
    const adminPasswordRaw = 'admin12345';
    
    const adminCheck = await pool.query('SELECT 1 FROM administradores WHERE email = $1', [adminEmail]);
    if (adminCheck.rows.length === 0) {
      const hashedPassword = await bcrypt.hash(adminPasswordRaw, 10);
      await pool.query(`
        INSERT INTO administradores (nombre, email, password, rol, activo)
        VALUES ($1, $2, $3, $4, $5)
      `, ['Administrador UTC', adminEmail, hashedPassword, 'admin', true]);
      console.log(`¡Administrador semilla creado con éxito!`);
      console.log(`Email: '${adminEmail}' / Contraseña: '${adminPasswordRaw}'`);
    } else {
      console.log('El administrador semilla ya existe en la base de datos.');
    }

    console.log('¡Base de datos inicializada de forma exitosa!');
  } catch (error) {
    console.error('Error al inicializar las tablas de la base de datos:', error);
  } finally {
    await pool.end();
  }
}

initDb();
