-- Tabla para registrar asistencias con códigos QR
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

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_asistencias_usuario ON asistencias(usuario_id);
CREATE INDEX IF NOT EXISTS idx_asistencias_espacio ON asistencias(espacio_id);
CREATE INDEX IF NOT EXISTS idx_asistencias_fecha ON asistencias(fecha_asistencia);
CREATE INDEX IF NOT EXISTS idx_asistencias_reserva ON asistencias(reserva_id);
CREATE INDEX IF NOT EXISTS idx_asistencias_estado ON asistencias(estado);

-- Tabla para almacenar imágenes QR
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

CREATE INDEX IF NOT EXISTS idx_qr_codes_reserva ON qr_codes(reserva_id);
CREATE INDEX IF NOT EXISTS idx_qr_codes_token ON qr_codes(token_unico);
