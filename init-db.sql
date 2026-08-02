-- Crear tablas del sistema de reservas

CREATE TABLE administradores (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  rol VARCHAR(50) DEFAULT 'admin',
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  telefono VARCHAR(20),
  rol VARCHAR(50) DEFAULT 'usuario',
  activo BOOLEAN DEFAULT true,
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE espacios (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  tipo VARCHAR(50) NOT NULL,
  ubicacion VARCHAR(255),
  descripcion TEXT,
  capacidad INTEGER,
  imagen VARCHAR(255),
  horario VARCHAR(100),
  disponible BOOLEAN DEFAULT true,
  activo BOOLEAN DEFAULT true,
  info_uso VARCHAR(100),
  responsable_academico_nombre VARCHAR(255),
  responsable_academico_email VARCHAR(255),
  responsable_academico_telefono VARCHAR(20),
  responsable_administrativo_nombre VARCHAR(255),
  responsable_administrativo_email VARCHAR(255),
  responsable_administrativo_telefono VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reservas (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  espacio_id INTEGER NOT NULL REFERENCES espacios(id) ON DELETE CASCADE,
  email_solicitante VARCHAR(255),
  nombre_solicitante VARCHAR(255),
  fecha DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_finalizacion TIME NOT NULL,
  horario VARCHAR(50),
  carrera VARCHAR(100),
  ciclo VARCHAR(50),
  paralelo VARCHAR(10),
  total_asistentes INTEGER,
  tema VARCHAR(255),
  responsable_academico VARCHAR(255),
  responsable_administrativo VARCHAR(255),
  software VARCHAR(255),
  descripcion TEXT,
  tipo VARCHAR(50),
  estado VARCHAR(50) DEFAULT 'confirmado',
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE espacios_favoritos (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  espacio_id INTEGER NOT NULL REFERENCES espacios(id) ON DELETE CASCADE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(usuario_id, espacio_id)
);

CREATE TABLE asistencias (
  id SERIAL PRIMARY KEY,
  reserva_id INTEGER NOT NULL REFERENCES reservas(id) ON DELETE CASCADE,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  qr_code TEXT,
  estado VARCHAR(50) DEFAULT 'pendiente',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE qr_codes (
  id SERIAL PRIMARY KEY,
  reserva_id INTEGER NOT NULL REFERENCES reservas(id) ON DELETE CASCADE,
  qr_data TEXT,
  qr_base64 TEXT,
  codigo VARCHAR(255) UNIQUE,
  token_unico VARCHAR(255),
  url TEXT,
  activo BOOLEAN DEFAULT true,
  fecha_generacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_expiracion TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reservas_usuario ON reservas(usuario_id);
CREATE INDEX idx_reservas_espacio ON reservas(espacio_id);
CREATE INDEX idx_reservas_fecha ON reservas(fecha);
CREATE INDEX idx_favoritos_usuario ON espacios_favoritos(usuario_id);
CREATE INDEX idx_asistencias_reserva ON asistencias(reserva_id);

-- Tabla para sessions (express-session con connect-pg-simple)
CREATE TABLE session (
  sid VARCHAR NOT NULL COLLATE "default" PRIMARY KEY,
  sess JSON NOT NULL,
  expire TIMESTAMP(6) NOT NULL
);

CREATE INDEX IDX_session_expire ON session (expire);

-- Insertar admin inicial (email: admin@utc.edu.ec, password: admin123)
INSERT INTO administradores (nombre, email, password, rol, activo) VALUES (
  'Administrador',
  'admin@utc.edu.ec',
  '$2a$10$A6olT5Hfic25GOeZpgQXU.96X77uwyOdWfaUllOHBYO.kwKDOZA3y',
  'admin',
  true
) ON CONFLICT DO NOTHING;

-- Insertar usuario de prueba (email: usuario@utc.edu.ec, password: usuario123)
INSERT INTO usuarios (nombre, email, password, telefono, rol, activo) VALUES (
  'Usuario Prueba',
  'usuario@utc.edu.ec',
  '$2a$10$L6wK9lPwnWVOLYgXcBRvKOejTj3qm/NoBvSnRDJmAgVHw22v6FELC',
  '0987654321',
  'usuario',
  true
) ON CONFLICT DO NOTHING;
