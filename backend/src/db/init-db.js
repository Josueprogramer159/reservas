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

    // 4. Tabla Espacios
    console.log('Creando tabla de espacios...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS espacios (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(200) NOT NULL,
        tipo VARCHAR(50) NOT NULL,
        capacidad INTEGER NOT NULL,
        ubicacion VARCHAR(200) NOT NULL,
        descripcion TEXT,
        imagen VARCHAR(500),
        info_complementaria TEXT,
        activo BOOLEAN DEFAULT true,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 5. Tabla Reservas
    console.log('Creando tabla de reservas...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS reservas (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
        espacio_id INTEGER NOT NULL REFERENCES espacios(id) ON DELETE CASCADE,
        fecha DATE NOT NULL,
        horario VARCHAR(20) NOT NULL,
        estado VARCHAR(20) DEFAULT 'confirmado',
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    try {
      await pool.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS idx_reservas_espacio_fecha_horario_activa
        ON reservas (espacio_id, fecha, horario)
        WHERE estado = 'confirmado';
      `);
    } catch (e) {
      // Ignorar si el índice ya existe
    }

    // 6. Tabla Asistencias
    console.log('Creando tabla de asistencias...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS asistencias (
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
      );
    `);
    
    // Índices para asistencias
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_asistencias_usuario ON asistencias(usuario_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_asistencias_espacio ON asistencias(espacio_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_asistencias_fecha ON asistencias(fecha_asistencia);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_asistencias_reserva ON asistencias(reserva_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_asistencias_estado ON asistencias(estado);`);

    // 7. Tabla QR Codes
    console.log('Creando tabla de códigos QR...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS qr_codes (
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
      );
    `);
    
    // Índices para QR codes
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_qr_codes_reserva ON qr_codes(reserva_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_qr_codes_token ON qr_codes(token_unico);`);

    // 8. Añadir columna de notificaciones a usuarios
    console.log('Actualizando tabla de usuarios con preferencias de notificaciones...');
    await pool.query(`
      ALTER TABLE usuarios 
      ADD COLUMN IF NOT EXISTS notificaciones_activas BOOLEAN DEFAULT true;
    `);

    // 9. Tabla de códigos de verificación
    console.log('Creando tabla de códigos de verificación...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS verification_codes (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        code VARCHAR(10) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NOT NULL
      );
    `);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_verification_codes_email ON verification_codes(email);`);

    // 10. Tabla de suscripciones de notificaciones
    console.log('Creando tabla de suscripciones de notificaciones...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_push_subscriptions (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
        endpoint TEXT NOT NULL,
        p256dh TEXT NOT NULL,
        auth TEXT NOT NULL,
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(usuario_id, endpoint)
      );
    `);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user ON user_push_subscriptions(usuario_id);`);

    // 10. Tabla de favoritos de usuarios
    console.log('Creando tabla de favoritos...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS espacios_favoritos (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
        espacio_id INTEGER NOT NULL REFERENCES espacios(id) ON DELETE CASCADE,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(usuario_id, espacio_id)
      );
    `);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_espacios_favoritos_usuario ON espacios_favoritos(usuario_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_espacios_favoritos_espacio ON espacios_favoritos(espacio_id);`);

    // 11. Insertar espacios semilla
    console.log('Insertando espacios semilla...');
    const espaciosSemilla = [
      ['Laboratorio de Computación Avanzada B3', 'Laboratorios', 30, 'Bloque B, Segundo Piso', 'Equipado con 30 ordenadores de alto rendimiento e internet de fibra óptica.', 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=600', 'Incluye proyector, aire acondicionado y acceso WiFi de alta velocidad.'],
      ['Cancha de Fútbol Sintética Nº 1', 'Canchas', 22, 'Área Deportiva Principal', 'Cancha reglamentaria de césped sintético ideal para entrenamientos y partidos.', 'https://images.unsplash.com/photo-1544698310-74ea9d1c8258?auto=format&fit=crop&q=80&w=600', 'Incluye vestuarios, iluminación nocturna y graderías para 50 espectadores.'],
      ['Auditorio de Conferencias UTC', 'Salas', 120, 'Bloque Administrativo, PB', 'Sala magna equipada con sonido envolvente y proyector de alta definición.', 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=600', 'Ideal para eventos académicos, conferencias y presentaciones institucionales.'],
      ['Laboratorio de Robótica y Hardware', 'Laboratorios', 20, 'Bloque C, Primer Piso', 'Mesas de trabajo técnico equipadas con osciloscopios, cautines y kits Arduino.', 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&q=80&w=600', 'Requiere credencial de acceso. Uso exclusivo para proyectos académicos.'],
      ['Cancha de Baloncesto y Vóley Cubierta', 'Canchas', 40, 'Coliseo Universitario', 'Coliseo techado con tableros profesionales y gradas para espectadores.', 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&q=80&w=600', 'Disponible para torneos inter-facultades y entrenamientos deportivos.'],
      ['Sala de Estudio Grupal A2', 'Salas', 12, 'Bloque A, Primer Piso', 'Espacio silencioso equipado con pizarra acrílica y mesa redonda para trabajos colaborativos.', 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=600', 'Reserva máxima de 3 horas por sesión. Silencio obligatorio.']
    ];

    const espaciosCheck = await pool.query('SELECT COUNT(*) FROM espacios');
    if (parseInt(espaciosCheck.rows[0].count) === 0) {
      for (const esp of espaciosSemilla) {
        await pool.query(`
          INSERT INTO espacios (nombre, tipo, capacidad, ubicacion, descripcion, imagen, info_complementaria, activo)
          VALUES ($1, $2, $3, $4, $5, $6, $7, true)
        `, esp);
      }
      console.log(`${espaciosSemilla.length} espacios semilla insertados.`);
    } else {
      console.log('Los espacios semilla ya existen en la base de datos.');
    }

    // 7. Insertar datos semilla (Administrador por defecto)
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
