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

const espacios = [
  {
    nombre: 'Laboratorio de Computación Avanzada B3',
    tipo: 'Laboratorios',
    capacidad: 30,
    ubicacion: 'Bloque B, Segundo Piso',
    descripcion: 'Equipado con 30 ordenadores de alto rendimiento e internet de fibra óptica.',
    imagen: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=600',
    info_complementaria: 'Incluye proyector, aire acondicionado y acceso WiFi de alta velocidad.'
  },
  {
    nombre: 'Laboratorio de Redes y Telecomunicaciones',
    tipo: 'Laboratorios',
    capacidad: 25,
    ubicacion: 'Bloque B, Tercer Piso',
    descripcion: 'Laboratorio especializado con equipos de networking, routers y switches profesionales.',
    imagen: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=600',
    info_complementaria: 'Requiere credencial de acceso. Disponible para prácticas de redes y ciberseguridad.'
  },
  {
    nombre: 'Laboratorio de Robótica y Hardware',
    tipo: 'Laboratorios',
    capacidad: 20,
    ubicacion: 'Bloque C, Primer Piso',
    descripcion: 'Mesas de trabajo técnico equipadas con osciloscopios, cautines y kits Arduino.',
    imagen: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&q=80&w=600',
    info_complementaria: 'Requiere credencial de acceso. Uso exclusivo para proyectos académicos.'
  },
  {
    nombre: 'Cancha de Fútbol Sintética Nº 1',
    tipo: 'Canchas',
    capacidad: 22,
    ubicacion: 'Área Deportiva Principal',
    descripcion: 'Cancha reglamentaria de césped sintético ideal para entrenamientos y partidos.',
    imagen: 'https://images.unsplash.com/photo-1544698310-74ea9d1c8258?auto=format&fit=crop&q=80&w=600',
    info_complementaria: 'Incluye vestuarios, iluminación nocturna y graderías para 50 espectadores.'
  },
  {
    nombre: 'Cancha de Baloncesto y Vóley Cubierta',
    tipo: 'Canchas',
    capacidad: 40,
    ubicacion: 'Coliseo Universitario',
    descripcion: 'Coliseo techado con tableros profesionales y gradas para espectadores.',
    imagen: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&q=80&w=600',
    info_complementaria: 'Disponible para torneos inter-facultades y entrenamientos deportivos.'
  },
  {
    nombre: 'Cancha de Tenis Nº 1',
    tipo: 'Canchas',
    capacidad: 4,
    ubicacion: 'Área Deportiva Sur',
    descripcion: 'Cancha de tenis con superficie dura y iluminación para partidos nocturnos.',
    imagen: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&q=80&w=600',
    info_complementaria: 'Reserva máxima de 2 horas. Trae tu propio equipo.'
  },
  {
    nombre: 'Auditorio de Conferencias UTC',
    tipo: 'Salas',
    capacidad: 120,
    ubicacion: 'Bloque Administrativo, PB',
    descripcion: 'Sala magna equipada con sonido envolvente y proyector de alta definición.',
    imagen: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=600',
    info_complementaria: 'Ideal para eventos académicos, conferencias y presentaciones institucionales.'
  },
  {
    nombre: 'Sala de Estudio Grupal A2',
    tipo: 'Salas',
    capacidad: 12,
    ubicacion: 'Bloque A, Primer Piso',
    descripcion: 'Espacio silencioso equipado con pizarra acrílica y mesa redonda para trabajos colaborativos.',
    imagen: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=600',
    info_complementaria: 'Reserva máxima de 3 horas por sesión. Silencio obligatorio.'
  },
  {
    nombre: 'Sala de Videoconferencias VIP',
    tipo: 'Salas',
    capacidad: 15,
    ubicacion: 'Bloque Administrativo, Segundo Piso',
    descripcion: 'Sala equipada con sistema de videoconferencia HD, ideal para reuniones y clases virtuales.',
    imagen: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&q=80&w=600',
    info_complementaria: 'Requiere reserva con al menos 24 horas de anticipación.'
  }
];

async function seedEspacios() {
  try {
    await pool.query('SELECT 1');
    console.log('Conexión exitosa a la base de datos reservas.');

    const check = await pool.query('SELECT COUNT(*) FROM espacios');
    const count = parseInt(check.rows[0].count);

    if (count > 0) {
      console.log(`Ya existen ${count} espacios en la base de datos.`);
      console.log('Eliminando espacios existentes para reinsertar...');
      await pool.query('DELETE FROM espacios');
      console.log('Espacios eliminados.');
    }

    for (const esp of espacios) {
      await pool.query(
        `INSERT INTO espacios (nombre, tipo, capacidad, ubicacion, descripcion, imagen, info_complementaria, activo)
         VALUES ($1, $2, $3, $4, $5, $6, $7, true)`,
        [esp.nombre, esp.tipo, esp.capacidad, esp.ubicacion, esp.descripcion, esp.imagen, esp.info_complementaria]
      );
      console.log(`  ✓ Insertado: ${esp.nombre}`);
    }

    console.log(`\n✅ ${espacios.length} espacios insertados correctamente.`);
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

seedEspacios();
