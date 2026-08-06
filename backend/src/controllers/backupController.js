import pool from '../db/database.js';
import PDFDocument from 'pdfkit';

// Función auxiliar para obtener todos los datos de la BD
const obtenerTodosDatos = async () => {
  try {
    const usuarios = await pool.query('SELECT * FROM usuarios ORDER BY id');
    const espacios = await pool.query('SELECT * FROM espacios ORDER BY id');
    const reservas = await pool.query('SELECT * FROM reservas ORDER BY id');
    const favoritos = await pool.query('SELECT * FROM espacios_favoritos ORDER BY id');
    const administradores = await pool.query('SELECT id, nombre, email, rol, activo, fecha_creacion FROM administradores ORDER BY id');

    return {
      usuarios: usuarios.rows,
      espacios: espacios.rows,
      reservas: reservas.rows,
      favoritos: favoritos.rows,
      administradores: administradores.rows
    };
  } catch (error) {
    throw new Error(`Error al obtener datos de la BD: ${error.message}`);
  }
};

// Función auxiliar para generar PDF con datos
const generarPDF = (titulo, columnas, datos) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 40,
        bufferPages: true
      });

      let buffer = [];
      doc.on('data', (chunk) => buffer.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffer)));
      doc.on('error', reject);

      // Encabezado
      doc.fontSize(20).font('Helvetica-Bold').text(titulo, { align: 'center' });
      doc.fontSize(10).fillColor('#666666').text(
        `Generado: ${new Date().toLocaleString('es-ES')}`,
        { align: 'center' }
      );
      doc.moveDown();

      // Tabla
      const pageWidth = doc.page.width - 80;
      const rowHeight = 25;
      const colWidth = pageWidth / columnas.length;

      // Encabezados de tabla
      doc.fontSize(9).font('Helvetica-Bold').fillColor('#FFFFFF');
      const headerY = doc.y;
      
      columnas.forEach((col, i) => {
        doc.rect(40 + i * colWidth, headerY, colWidth, rowHeight).fill('#003087');
      });

      doc.fillColor('#FFFFFF').fontSize(9);
      columnas.forEach((col, i) => {
        doc.text(col, 45 + i * colWidth, headerY + 5, {
          width: colWidth - 10,
          align: 'left',
          ellipsis: true
        });
      });

      // Datos
      doc.fillColor('#000000');
      let yPosition = headerY + rowHeight;

      datos.forEach((row, rowIndex) => {
        // Verificar si necesitamos nueva página
        if (yPosition > doc.page.height - 80) {
          doc.addPage();
          yPosition = 40;
        }

        const bgColor = rowIndex % 2 === 0 ? '#F5F5F5' : '#FFFFFF';
        doc.rect(40, yPosition, pageWidth, rowHeight).fill(bgColor);

        // Obtener valores de la fila en el orden de las columnas
        Object.values(row).slice(0, columnas.length).forEach((value, i) => {
          const text = String(value || '').substring(0, 30);
          doc.fillColor('#000000').fontSize(8).text(text, 45 + i * colWidth, yPosition + 5, {
            width: colWidth - 10,
            align: 'left',
            ellipsis: true
          });
        });

        yPosition += rowHeight;
      });

      // Pie de página
      doc.fontSize(8).fillColor('#999999').text(
        'Sistema de Gestión de Reservas de Espacios UTC',
        { align: 'center', y: doc.page.height - 30 }
      );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

// ============ EXPORTACIONES PDF ============

export const exportarUsuariosPDF = async (req, res) => {
  try {
    const usuarios = await pool.query(
      'SELECT id, nombre, email, rol, activo, fecha_registro FROM usuarios ORDER BY id'
    );

    if (usuarios.rows.length === 0) {
      return res.status(400).json({ success: false, message: 'No hay usuarios para exportar' });
    }

    const pdf = await generarPDF(
      'Listado de Usuarios',
      ['ID', 'Nombre', 'Email', 'Rol', 'Estado', 'Fecha Registro'],
      usuarios.rows
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="usuarios_${Date.now()}.pdf"`);
    res.send(pdf);
  } catch (error) {
    console.error('Error exportando usuarios PDF:', error);
    res.status(500).json({ success: false, message: 'Error al exportar usuarios' });
  }
};

export const exportarReservasPDF = async (req, res) => {
  try {
    const reservas = await pool.query(`
      SELECT 
        r.id, r.fecha, r.hora_inicio, r.hora_finalizacion,
        u.nombre as usuario, e.nombre as espacio, r.estado
      FROM reservas r
      JOIN usuarios u ON r.usuario_id = u.id
      JOIN espacios e ON r.espacio_id = e.id
      ORDER BY r.id
    `);

    if (reservas.rows.length === 0) {
      return res.status(400).json({ success: false, message: 'No hay reservas para exportar' });
    }

    const pdf = await generarPDF(
      'Listado de Reservas',
      ['ID', 'Usuario', 'Espacio', 'Fecha', 'Hora Inicio', 'Hora Fin', 'Estado'],
      reservas.rows
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="reservas_${Date.now()}.pdf"`);
    res.send(pdf);
  } catch (error) {
    console.error('Error exportando reservas PDF:', error);
    res.status(500).json({ success: false, message: 'Error al exportar reservas' });
  }
};

export const exportarEspaciosPDF = async (req, res) => {
  try {
    const espacios = await pool.query(
      'SELECT id, nombre, tipo, capacidad, ubicacion, horario, activo FROM espacios ORDER BY id'
    );

    if (espacios.rows.length === 0) {
      return res.status(400).json({ success: false, message: 'No hay espacios para exportar' });
    }

    const pdf = await generarPDF(
      'Listado de Espacios',
      ['ID', 'Nombre', 'Tipo', 'Capacidad', 'Ubicación', 'Horario', 'Estado'],
      espacios.rows
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="espacios_${Date.now()}.pdf"`);
    res.send(pdf);
  } catch (error) {
    console.error('Error exportando espacios PDF:', error);
    res.status(500).json({ success: false, message: 'Error al exportar espacios' });
  }
};

// ============ EXPORTACIONES JSON ============

export const exportarUsuariosJSON = async (req, res) => {
  try {
    const usuarios = await pool.query('SELECT * FROM usuarios ORDER BY id');

    const json = {
      metadatos: {
        tipo: 'usuarios',
        fechaExportacion: new Date().toISOString(),
        versionSistema: '1.0.0',
        totalRegistros: usuarios.rows.length
      },
      datos: usuarios.rows
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="usuarios_${Date.now()}.json"`);
    res.json(json);
  } catch (error) {
    console.error('Error exportando usuarios JSON:', error);
    res.status(500).json({ success: false, message: 'Error al exportar usuarios' });
  }
};

export const exportarReservasJSON = async (req, res) => {
  try {
    const reservas = await pool.query('SELECT * FROM reservas ORDER BY id');

    const json = {
      metadatos: {
        tipo: 'reservas',
        fechaExportacion: new Date().toISOString(),
        versionSistema: '1.0.0',
        totalRegistros: reservas.rows.length
      },
      datos: reservas.rows
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="reservas_${Date.now()}.json"`);
    res.json(json);
  } catch (error) {
    console.error('Error exportando reservas JSON:', error);
    res.status(500).json({ success: false, message: 'Error al exportar reservas' });
  }
};

export const exportarEspaciosJSON = async (req, res) => {
  try {
    const espacios = await pool.query('SELECT * FROM espacios ORDER BY id');

    const json = {
      metadatos: {
        tipo: 'espacios',
        fechaExportacion: new Date().toISOString(),
        versionSistema: '1.0.0',
        totalRegistros: espacios.rows.length
      },
      datos: espacios.rows
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="espacios_${Date.now()}.json"`);
    res.json(json);
  } catch (error) {
    console.error('Error exportando espacios JSON:', error);
    res.status(500).json({ success: false, message: 'Error al exportar espacios' });
  }
};

// ============ BACKUP COMPLETO JSON ============

export const backupCompletoJSON = async (req, res) => {
  try {
    const datos = await obtenerTodosDatos();

    const backup = {
      metadatos: {
        tipo: 'backup_completo',
        fechaExportacion: new Date().toISOString(),
        versionSistema: '1.0.0',
        totalUsuarios: datos.usuarios.length,
        totalEspacios: datos.espacios.length,
        totalReservas: datos.reservas.length,
        totalFavoritos: datos.favoritos.length,
        totalAdministradores: datos.administradores.length
      },
      datos: datos
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="backup_completo_${Date.now()}.json"`);
    res.json(backup);
  } catch (error) {
    console.error('Error en backup completo JSON:', error);
    res.status(500).json({ success: false, message: 'Error al generar backup completo' });
  }
};

// ============ RESTAURACIÓN DE DATOS ============

export const restaurarBackup = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No se proporcionó archivo' });
    }

    const contenido = JSON.parse(req.file.buffer.toString('utf8'));

    // Validar estructura
    if (!contenido.metadatos || !contenido.datos) {
      return res.status(400).json({ 
        success: false, 
        message: 'Estructura de archivo JSON inválida. Debe contener "metadatos" y "datos"' 
      });
    }

    const { tipo } = contenido.metadatos;
    const { datos } = contenido;

    let totalRestaurados = 0;

    // Restaurar según el tipo
    if (tipo === 'backup_completo') {
      // Backup completo: restaurar todo
      if (datos.usuarios && Array.isArray(datos.usuarios)) {
        for (const usuario of datos.usuarios) {
          try {
            await pool.query(
              'INSERT INTO usuarios (id, nombre, email, password, telefono, rol, activo, fecha_registro, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT (id) DO NOTHING',
              [usuario.id, usuario.nombre, usuario.email, usuario.password, usuario.telefono, usuario.rol, usuario.activo, usuario.fecha_registro, usuario.created_at]
            );
            totalRestaurados++;
          } catch (e) {
            console.warn(`No se pudo restaurar usuario ${usuario.id}:`, e.message);
          }
        }
      }

      if (datos.espacios && Array.isArray(datos.espacios)) {
        for (const espacio of datos.espacios) {
          try {
            await pool.query(
              'INSERT INTO espacios (id, nombre, tipo, ubicacion, descripcion, capacidad, imagen, horario, disponible, activo, info_uso, responsable_academico_nombre, responsable_academico_email, responsable_academico_telefono, responsable_administrativo_nombre, responsable_administrativo_email, responsable_administrativo_telefono, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18) ON CONFLICT (id) DO NOTHING',
              [espacio.id, espacio.nombre, espacio.tipo, espacio.ubicacion, espacio.descripcion, espacio.capacidad, espacio.imagen, espacio.horario, espacio.disponible, espacio.activo, espacio.info_uso, espacio.responsable_academico_nombre, espacio.responsable_academico_email, espacio.responsable_academico_telefono, espacio.responsable_administrativo_nombre, espacio.responsable_administrativo_email, espacio.responsable_administrativo_telefono, espacio.created_at]
            );
            totalRestaurados++;
          } catch (e) {
            console.warn(`No se pudo restaurar espacio ${espacio.id}:`, e.message);
          }
        }
      }

      if (datos.reservas && Array.isArray(datos.reservas)) {
        for (const reserva of datos.reservas) {
          try {
            await pool.query(
              'INSERT INTO reservas (id, usuario_id, espacio_id, email_solicitante, nombre_solicitante, fecha, hora_inicio, hora_finalizacion, horario, carrera, ciclo, paralelo, total_asistentes, tema, responsable_academico, responsable_administrativo, software, descripcion, tipo, estado, fecha_creacion, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22) ON CONFLICT (id) DO NOTHING',
              [reserva.id, reserva.usuario_id, reserva.espacio_id, reserva.email_solicitante, reserva.nombre_solicitante, reserva.fecha, reserva.hora_inicio, reserva.hora_finalizacion, reserva.horario, reserva.carrera, reserva.ciclo, reserva.paralelo, reserva.total_asistentes, reserva.tema, reserva.responsable_academico, reserva.responsable_administrativo, reserva.software, reserva.descripcion, reserva.tipo, reserva.estado, reserva.fecha_creacion, reserva.created_at]
            );
            totalRestaurados++;
          } catch (e) {
            console.warn(`No se pudo restaurar reserva ${reserva.id}:`, e.message);
          }
        }
      }
    } else if (tipo === 'usuarios' && datos.datos) {
      // Restaurar solo usuarios
      for (const usuario of datos.datos) {
        try {
          await pool.query(
            'INSERT INTO usuarios (id, nombre, email, password, telefono, rol, activo, fecha_registro, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT (id) DO NOTHING',
            [usuario.id, usuario.nombre, usuario.email, usuario.password, usuario.telefono, usuario.rol, usuario.activo, usuario.fecha_registro, usuario.created_at]
          );
          totalRestaurados++;
        } catch (e) {
          console.warn(`No se pudo restaurar usuario ${usuario.id}:`, e.message);
        }
      }
    } else if (tipo === 'espacios' && datos.datos) {
      // Restaurar solo espacios
      for (const espacio of datos.datos) {
        try {
          await pool.query(
            'INSERT INTO espacios (id, nombre, tipo, ubicacion, descripcion, capacidad, imagen, horario, disponible, activo, info_uso, responsable_academico_nombre, responsable_academico_email, responsable_academico_telefono, responsable_administrativo_nombre, responsable_administrativo_email, responsable_administrativo_telefono, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18) ON CONFLICT (id) DO NOTHING',
            [espacio.id, espacio.nombre, espacio.tipo, espacio.ubicacion, espacio.descripcion, espacio.capacidad, espacio.imagen, espacio.horario, espacio.disponible, espacio.activo, espacio.info_uso, espacio.responsable_academico_nombre, espacio.responsable_academico_email, espacio.responsable_academico_telefono, espacio.responsable_administrativo_nombre, espacio.responsable_administrativo_email, espacio.responsable_administrativo_telefono, espacio.created_at]
            );
          totalRestaurados++;
        } catch (e) {
          console.warn(`No se pudo restaurar espacio ${espacio.id}:`, e.message);
        }
      }
    } else if (tipo === 'reservas' && datos.datos) {
      // Restaurar solo reservas
      for (const reserva of datos.datos) {
        try {
          await pool.query(
            'INSERT INTO reservas (id, usuario_id, espacio_id, email_solicitante, nombre_solicitante, fecha, hora_inicio, hora_finalizacion, horario, carrera, ciclo, paralelo, total_asistentes, tema, responsable_academico, responsable_administrativo, software, descripcion, tipo, estado, fecha_creacion, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22) ON CONFLICT (id) DO NOTHING',
            [reserva.id, reserva.usuario_id, reserva.espacio_id, reserva.email_solicitante, reserva.nombre_solicitante, reserva.fecha, reserva.hora_inicio, reserva.hora_finalizacion, reserva.horario, reserva.carrera, reserva.ciclo, reserva.paralelo, reserva.total_asistentes, reserva.tema, reserva.responsable_academico, reserva.responsable_administrativo, reserva.software, reserva.descripcion, reserva.tipo, reserva.estado, reserva.fecha_creacion, reserva.created_at]
          );
          totalRestaurados++;
        } catch (e) {
          console.warn(`No se pudo restaurar reserva ${reserva.id}:`, e.message);
        }
      }
    }

    res.json({
      success: true,
      message: `Backup restaurado exitosamente. ${totalRestaurados} registros importados.`,
      totalRestaurados
    });
  } catch (error) {
    console.error('Error restaurando backup:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Error al restaurar backup' 
    });
  }
};

export default {
  exportarUsuariosPDF,
  exportarReservasPDF,
  exportarEspaciosPDF,
  exportarUsuariosJSON,
  exportarReservasJSON,
  exportarEspaciosJSON,
  backupCompletoJSON,
  restaurarBackup
};
