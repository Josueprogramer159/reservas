import express from 'express';
import session from 'express-session';
import pgSession from 'connect-pg-simple';
import cors from 'cors';
import 'dotenv/config';
import pool from './db/database.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';

const app = express();
const port = process.env.PORT || 3001;

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

// Cargar rutas
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error no controlado en el servidor:', err);
  res.status(500).json({ success: false, message: 'Error interno del servidor' });
});

app.listen(port, () => {
  console.log(`Servidor Express escuchando en el puerto ${port}`);
});
