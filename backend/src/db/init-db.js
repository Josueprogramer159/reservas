import pg from 'pg';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

const { Pool } = pg;

async function initDb() {
  const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'root',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_DATABASE || 'reservas'
  });

  try {
    console.log('Eliminando tablas existentes...');
    
    // Drop tables in order
    const tables = [
      'espacios_favoritos',
      'user_push_subscriptions',
      'verification_codes',
      'qr_codes',
      'asistencias',
      'reservas',
      'espacios',
      '"session"',
      'administradores',
      'usuarios'
    ];
    
    for (const table of tables) {
      try {
        await pool.query(`DROP TABLE IF EXISTS ${table} CASCADE`);
      } catch (e) {}
    }
    
    console.log('✓ Tablas eliminadas');

    console.log('Creando tablas...');
    
    // Usuarios
    await pool.query(`
      CREATE TABLE usuarios (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        rol VARCHAR(20) DEFAULT 'usuario',
        activo BOOLEAN DEFAULT true,
        notificaciones_activas BOOLEAN DEFAULT true,
        fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Administradores
    await pool.query(`
      CREATE TABLE administradores (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        rol VARCHAR(50) DEFAULT 'admin',
        activo BOOLEAN DEFAULT true,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Session
    await pool.query(`
      CREATE TABLE "session" (
        "sid" varchar NOT NULL,
        "sess" json NOT NULL,
        "expire" timestamp(6) NOT NULL,
        PRIMARY KEY ("sid")
      )
    `);

    // Espacios
    await pool.query(`
      CREATE TABLE espacios (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(200) NOT NULL,
        tipo VARCHAR(50) NOT NULL,
        capacidad INTEGER NOT NULL,
        ubicacion VARCHAR(200) NOT NULL,
        descripcion TEXT,
        imagen VARCHAR(500),
        info_complementaria TEXT,
        horario VARCHAR(20),
        activo BOOLEAN DEFAULT true,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Reservas
    await pool.query(`
      CREATE TABLE reservas (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
        espacio_id INTEGER NOT NULL REFERENCES espacios(id) ON DELETE CASCADE,
        email_solicitante VARCHAR(100) NOT NULL,
        fecha DATE NOT NULL,
        carrera VARCHAR(100) NOT NULL,
        tipo VARCHAR(100) NOT NULL,
        tema VARCHAR(200) NOT NULL,
        responsable_academico VARCHAR(200) NOT NULL,
        nombre_solicitante VARCHAR(200) NOT NULL,
        hora_inicio TIME NOT NULL,
        ciclo VARCHAR(50) NOT NULL,
        total_asistentes INTEGER NOT NULL,
        responsable_administrativo VARCHAR(200) NOT NULL,
        hora_finalizacion TIME NOT NULL,
        paralelo VARCHAR(10) NOT NULL,
        software VARCHAR(200) NOT NULL,
        descripcion TEXT NOT NULL,
        estado VARCHAR(20) DEFAULT 'confirmado',
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Asistencias
    await pool.query(`
      CREATE TABLE asistencias (
        id SERIAL PRIMARY KEY,
        reserva_id INTEGER NOT NULL UNIQUE REFERENCES reservas(id) ON DELETE CASCADE,
        usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
        espacio_id INTEGER NOT NULL REFERENCES espacios(id) ON DELETE CASCADE,
        fecha_asistencia TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        hora_escaneado TIME,
        codigo_qr TEXT,
        dispositivo_escaneo VARCHAR(255),
        ubicacion_ip VARCHAR(50),
        estado VARCHAR(50) DEFAULT 'registrado',
        notas TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // QR Codes
    await pool.query(`
      CREATE TABLE qr_codes (
        id SERIAL PRIMARY KEY,
        reserva_id INTEGER NOT NULL UNIQUE REFERENCES reservas(id) ON DELETE CASCADE,
        qr_data TEXT NOT NULL,
        qr_image BYTEA,
        qr_base64 TEXT,
        token_unico VARCHAR(255) UNIQUE NOT NULL,
        fecha_generacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_expiracion TIMESTAMP,
        activo BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Verification codes
    await pool.query(`
      CREATE TABLE verification_codes (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        code VARCHAR(10) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NOT NULL
      )
    `);

    // Push subscriptions
    await pool.query(`
      CREATE TABLE user_push_subscriptions (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
        endpoint TEXT NOT NULL,
        p256dh TEXT NOT NULL,
        auth TEXT NOT NULL,
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(usuario_id, endpoint)
      )
    `);

    // Favoritos
    await pool.query(`
      CREATE TABLE espacios_favoritos (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
        espacio_id INTEGER NOT NULL REFERENCES espacios(id) ON DELETE CASCADE,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(usuario_id, espacio_id)
      )
    `);

    console.log('✓ Tablas creadas');

    // Insertar espacios
    const espacios = [
      ['Laboratorio de Computación Avanzada B3', 'Laboratorios', 30, 'Bloque B, Segundo Piso', 'Equipado con 30 ordenadores.', 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=600', 'WiFi de alta velocidad.'],
      ['Cancha de Fútbol Sintética Nº 1', 'Canchas', 22, 'Área Deportiva Principal', 'Cancha reglamentaria.', 'https://images.unsplash.com/photo-1544698310-74ea9d1c8258?auto=format&fit=crop&q=80&w=600', 'Iluminación nocturna.'],
      ['Auditorio de Conferencias UTC', 'Salas', 120, 'Bloque Administrativo', 'Sala magna.', 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=600', 'Sonido envolvente.'],
      ['Laboratorio de Robótica', 'Laboratorios', 20, 'Bloque C', 'Con Arduino.', 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&q=80&w=600', 'Acceso restringido.'],
      ['Cancha de Baloncesto', 'Canchas', 40, 'Coliseo', 'Profesional.', 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&q=80&w=600', 'Tableros reglamentarios.'],
      ['Sala de Estudio A2', 'Salas', 12, 'Bloque A', 'Estudio grupal.', 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=600', 'Silencio obligatorio.']
    ];

    for (const esp of espacios) {
      await pool.query(`
        INSERT INTO espacios (nombre, tipo, capacidad, ubicacion, descripcion, imagen, info_complementaria, activo)
        VALUES ($1, $2, $3, $4, $5, $6, $7, true)
      `, esp);
    }

    // Insertar admin
    const hashedPassword = await bcrypt.hash('admin12345', 10);
    await pool.query(`
      INSERT INTO administradores (nombre, email, password, rol, activo)
      VALUES ($1, $2, $3, $4, $5)
    `, ['Admin UTC', 'admin@utc.edu', hashedPassword, 'admin', true]);

    console.log(`✓ ${espacios.length} espacios insertados`);
    console.log('✓ Admin: admin@utc.edu / admin12345');
    console.log('\n✅ Base de datos lista!');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

initDb();
