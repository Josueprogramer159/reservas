export function getDbErrorMessage(error) {
  if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
    return 'No se pudo conectar a la base de datos. Verifica que PostgreSQL esté en ejecución.';
  }
  if (error.code === '3D000') {
    return 'La base de datos no existe. Ejecuta: npm run init-db';
  }
  return 'Error en el servidor';
}
