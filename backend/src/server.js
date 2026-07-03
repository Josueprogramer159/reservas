import express from 'express';
import session from 'express-session';
import pgSession from 'connect-pg-simple';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import pool from './db/database.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import espaciosRoutes from './routes/espacios.js';
import reservasRoutes from './routes/reservas.js';
import reportesRoutes from './routes/reportes.js';
import uploadsRoutes from './routes/uploads.js';
import asistenciasRoutes from './routes/asistencias.js';
import perfilRoutes from './routes/perfil.js';
import verificationRoutes from './routes/verification.js';
import { getDbErrorMessage } from './utils/dbError.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT || 3002; // Port changed for notifications

const PgSession = pgSession(session);

// Configurar CORS
app.use(cors({ 
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000', 
  credentials: true 
}));

// Middlewares para parsear cuerpo de peticiones
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configurar sesiones con almacenamiento en PostgreSQL
app.use(session({
  store: new PgSession({
    pool: pool,
    tableName: 'session'
  }),
  secret: process.env.SESSION_SECRET || 'supersecretkey_reserva_utc_2026',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false, // false porque es desarrollo en localhost sin HTTPS
    httpOnly: true, 
    maxAge: 24 * 60 * 60 * 1000 // 24 horas
  }
}));

// Servir imágenes subidas estáticamente
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Cargar rutas
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/espacios', espaciosRoutes);
app.use('/api/reservas', reservasRoutes);
app.use('/api/admin/reportes', reportesRoutes);
app.use('/api/asistencias', asistenciasRoutes);
app.use('/api/upload', uploadsRoutes);
app.use('/api/perfil', perfilRoutes);
app.use('/api/verification', verificationRoutes);

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ success: true, message: 'Servidor y base de datos operativos' });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: getDbErrorMessage(error)
    });
  }
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error no controlado en el servidor:', err);
  res.status(500).json({ success: false, message: 'Error interno del servidor' });
});

app.listen(port, async () => {
  console.log(`Servidor Express escuchando en el puerto ${port}`);
  try {
    await pool.query('SELECT 1');
    console.log('Conexión a PostgreSQL verificada correctamente.');
  } catch (error) {
    console.error('\n⚠ No se pudo conectar a PostgreSQL.');
    console.error('  Inicia el servicio: Start-Service postgresql-x64-17');
    console.error('  Luego ejecuta: npm run init-db\n');
    console.error('  Detalle:', error.message || error.code);
  }
});
