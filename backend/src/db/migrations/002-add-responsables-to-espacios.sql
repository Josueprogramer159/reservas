-- Agregar columnas de responsables a la tabla espacios si no existen
ALTER TABLE espacios
ADD COLUMN IF NOT EXISTS info_uso VARCHAR(100) DEFAULT 'Docencia e Investigación',
ADD COLUMN IF NOT EXISTS responsable_academico_nombre VARCHAR(100),
ADD COLUMN IF NOT EXISTS responsable_academico_email VARCHAR(100),
ADD COLUMN IF NOT EXISTS responsable_academico_telefono VARCHAR(20),
ADD COLUMN IF NOT EXISTS responsable_administrativo_nombre VARCHAR(100),
ADD COLUMN IF NOT EXISTS responsable_administrativo_email VARCHAR(100),
ADD COLUMN IF NOT EXISTS responsable_administrativo_telefono VARCHAR(20);
