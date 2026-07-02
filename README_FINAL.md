# 🎓 Sistema de Reserva de Espacios Universitarios UTC

> **Plataforma integral para la gestión de reservas de espacios académicos, deportivos y administrativos**

---

## 📊 Información del Proyecto

| Elemento | Detalle |
|----------|---------|
| **Proyecto** | Sistema de Reserva de Espacios - UTC |
| **Estado** | ✅ Sprint 2 Completado |
| **Última Actualización** | 2 de Julio de 2026 |
| **Versión** | 1.0.0 (Beta) |
| **Licencia** | Privada |
| **Desarrollador** | Equipo UTC |

---

## 🚀 Inicio Rápido

### Requisitos Previos
```bash
Node.js v18+
PostgreSQL 12+
npm v9+
```

### Instalación Backend
```bash
cd backend
npm install
# Configurar .env (referencia: .env.example)
npm run init-db    # Crear tablas
npm run dev        # Ejecutar en desarrollo
```

### Instalación Frontend
```bash
cd frontend
npm install
npm run dev        # Ejecutar en desarrollo (puerto 5173)
```

### URL de Acceso
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3001
- **Admin Login:** /admin-login

---

## 🎯 Características Principales

### Para Usuarios
✅ **Búsqueda Avanzada**
- Búsqueda por nombre (case-insensitive)
- Filtros por tipo (Laboratorios, Canchas, Salas)
- Filtros por capacidad (mín/máx)
- Resultados en tiempo real

✅ **Reserva de Espacios**
- Interfaz intuitiva
- Visualización de disponibilidad
- Confirmación automática
- Notificaciones de reserva

✅ **Calendario Integrado**
- Vista mensual de reservas
- Eventos interactivos
- Sincronización Google Calendar
- Descarga .ics

✅ **Registro de Asistencia**
- Generación automática de QR
- Escaneo desde cámara web
- Validación temporal
- Historial de asistencias

### Para Administradores
✅ **Gestión de Espacios**
- CRUD completo
- Control de disponibilidad
- Imágenes y descripcionesdetalladas
- Activación/Desactivación

✅ **Gestión de Usuarios**
- Listado completo
- Asignación de roles
- Edición de permisos
- Auditoría de cambios

✅ **Reportes y Estadísticas**
- Gráficos interactivos
- Exportación PDF/Excel
- Análisis de uso
- Tasa de ocupación

✅ **Historial de Asistencias**
- Registro de escaneos QR
- Filtros avanzados
- Estadísticas por espacio
- Identificación de usuarios

---

## 📁 Estructura de Directorios

```
proyectoreservas/
│
├── backend/
│   ├── src/
│   │   ├── controllers/        # Lógica de negocio
│   │   │   ├── espaciosController.js
│   │   │   ├── reservasController.js
│   │   │   ├── asistenciaController.js
│   │   │   ├── authController.js
│   │   │   ├── adminController.js
│   │   │   ├── reportesController.js
│   │   │   └── usuariosAdminController.js
│   │   │
│   │   ├── routes/             # Endpoints API
│   │   │   ├── espacios.js
│   │   │   ├── reservas.js
│   │   │   ├── asistencias.js
│   │   │   ├── auth.js
│   │   │   ├── admin.js
│   │   │   ├── reportes.js
│   │   │   └── uploads.js
│   │   │
│   │   ├── db/                 # Base de datos
│   │   │   ├── database.js
│   │   │   ├── init-db.js
│   │   │   └── migrations/
│   │   │
│   │   ├── middleware/         # Autenticación
│   │   │   └── requireAuth.js
│   │   │
│   │   ├── utils/              # Utilidades
│   │   │   ├── reservationConfig.js
│   │   │   └── dbError.js
│   │   │
│   │   └── server.js           # Entrada principal
│   │
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── views/              # Páginas
│   │   │   ├── HomeView.vue
│   │   │   ├── LoginView.vue
│   │   │   ├── RegisterView.vue
│   │   │   ├── DashboardView.vue
│   │   │   ├── AdminDashboardView.vue
│   │   │   ├── AdminReportesView.vue
│   │   │   ├── SpaceDetailView.vue
│   │   │   └── RecuperarPasswordView.vue
│   │   │
│   │   ├── components/         # Componentes reutilizables
│   │   │   ├── Navbar.vue
│   │   │   ├── Footer.vue
│   │   │   ├── AdminLoginModal.vue
│   │   │   └── QRScannerModal.vue
│   │   │
│   │   ├── router/             # Configuración de rutas
│   │   │   └── index.js
│   │   │
│   │   ├── App.vue             # Componente raíz
│   │   ├── main.js             # Entrada principal
│   │   └── index.css           # Estilos (Tailwind)
│   │
│   ├── package.json
│   └── vite.config.js
│
└── documentación/
    ├── HU12_SEARCH_FILTERS.md
    ├── HU13_FEASIBILITY_ANALYSIS.md
    ├── HU13_QR_IMPLEMENTATION.md
    ├── SPRINT2_RESUMEN_FINAL.md
    ├── HOTFIX_DASHBOARDVIEW.md
    ├── PROJECT_STATUS.md
    └── README_FINAL.md (este archivo)
```

---

## 🔌 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registrarse
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/logout` - Cerrar sesión
- `GET /api/auth/profile` - Obtener perfil
- `POST /api/auth/recuperar-password` - Recuperar contraseña

### Espacios
- `GET /api/espacios` - Listar espacios
- `GET /api/espacios/buscar` - Buscar con filtros
- `GET /api/espacios/:id` - Obtener detalle

### Reservas
- `POST /api/reservas` - Crear reserva
- `GET /api/reservas/mis-reservas` - Mis reservas
- `DELETE /api/reservas/:id` - Cancelar reserva
- `GET /api/reservas/:id/ics` - Descargar .ics

### Asistencias
- `GET /api/asistencias/:id/qr` - Obtener QR
- `POST /api/asistencias/escanear` - Registrar asistencia
- `GET /api/asistencias/historial/todas` - Historial (Admin)
- `GET /api/asistencias/estadisticas/resumen` - Estadísticas (Admin)

### Admin
- `GET /api/admin/usuarios` - Listar usuarios
- `PUT /api/admin/usuarios/:id/rol` - Cambiar rol
- `PATCH /api/admin/usuarios/:id/estado` - Cambiar estado
- `GET /api/admin/reportes` - Reportes
- `GET /api/admin/espacios` - Espacios (Admin)

---

## 🛠️ Configuración Importante

### Archivo `.env` Backend
```bash
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=reservas_utc
DB_USER=postgres
DB_PASSWORD=your_password
SESSION_SECRET=your_secret_key
CORS_ORIGIN=http://localhost:5173
```

### Archivo `.env` Frontend
```bash
VITE_API_URL=http://localhost:3001
```

---

## 🗄️ Base de Datos

### Tablas Principales
- `usuarios` - Información de usuarios
- `espacios` - Espacios disponibles
- `reservas` - Registro de reservas
- `asistencias` - Registro de asistencias con QR
- `qr_codes` - Códigos QR generados
- `auditoria_usuarios` - Historial de cambios
- `configuracion_reservas` - Configuración del sistema
- `session` - Sesiones de usuarios

### Inicialización
```bash
# Crear base de datos y tablas
npm run init-db

# Crear usuario admin
npm run create-admin

# Seed de datos (opcional)
npm run seed-espacios
```

---

## 👥 Usuarios de Prueba

### Usuario Regular
```
Email: usuario@utc.edu.ec
Contraseña: password123
```

### Usuario Administrador
```
Email: admin@utc.edu.ec
Contraseña: admin123
```

---

## 🔐 Seguridad

### Implementado
✅ Autenticación por sesión  
✅ Hash de contraseñas (bcrypt)  
✅ Validación de inputs  
✅ Queries paramétrizadas  
✅ CORS configurado  
✅ Roles y permisos  
✅ Auditoría de cambios  

### Mejoras Futuras
⏳ Two-Factor Authentication (2FA)  
⏳ Encriptación end-to-end  
⏳ Rate limiting  
⏳ DDoS protection  

---

## 📊 Testing

### Unit Tests
```bash
cd backend && npm run test
cd frontend && npm run test
```

### Manual Testing Checklist
- [ ] Registro e inicio de sesión
- [ ] Búsqueda y filtros de espacios
- [ ] Reserva de espacios
- [ ] Escaneo de QR
- [ ] Descarga de .ics
- [ ] Generación de reportes
- [ ] Gestión de usuarios (Admin)

---

## 📈 Roadmap

### Sprint 2 ✅ COMPLETADO
- [x] Gestión de espacios
- [x] Búsqueda y filtros
- [x] Integración Google Calendar
- [x] Escaneo QR
- [x] Reportes
- [x] Gestión de usuarios

### Sprint 3 ⏳ PRÓXIMO
- [ ] Notificaciones por email
- [ ] Sistema de calificaciones
- [ ] App móvil nativa
- [ ] Integración SSO

### Sprint 4+ 🔮 FUTURO
- [ ] Análisis avanzado
- [ ] Machine Learning (recomendaciones)
- [ ] Integración Outlook/Apple Calendar
- [ ] Chat integrado

---

## 🐛 Troubleshooting

### Error: "Cannot find module 'express'"
```bash
cd backend && npm install
```

### Error: "Connection refused (PostgreSQL)"
```bash
# Verificar que PostgreSQL está corriendo
psql -U postgres
# Si no está en PATH, usar:
# Windows: C:\Program Files\PostgreSQL\bin\psql.exe
# Linux/Mac: /usr/bin/psql
```

### Error: "Port 3001 already in use"
```bash
# Cambiar puerto en .env
PORT=3002
```

### Error: "CORS error" en el navegador
```bash
# Verificar CORS_ORIGIN en .env
CORS_ORIGIN=http://localhost:5173
```

---

## 📚 Documentación Adicional

- `SPRINT2_RESUMEN_FINAL.md` - Resumen completo del Sprint 2
- `HU12_SEARCH_FILTERS.md` - Detalles de búsqueda y filtros
- `HU13_QR_IMPLEMENTATION.md` - Implementación de QR
- `PROJECT_STATUS.md` - Estado actual del proyecto

---

## 🤝 Contribuir

Para reportar bugs o sugerir mejoras:
1. Crear un issue describiendo el problema
2. Incluir pasos para reproducir
3. Adjuntar screenshots si es relevante
4. Sugerir soluciones si es posible

---

## 📞 Soporte

- **Documentación:** Ver archivos `.md` en raíz
- **Issues:** Revisar `PROJECT_STATUS.md`
- **Preguntas Técnicas:** Consultar código comentado

---

## 📄 Licencia

Este proyecto es propiedad de la Universidad Técnica de Cotopaxi (UTC) y está bajo licencia privada.

---

## ✨ Agradecimientos

Agradecimiento especial a:
- Equipo de desarrollo UTC
- Usuarios testers
- Equipo de IT UTC

---

## 🎉 ¡Gracias por usar el Sistema!

```
     ╔═══════════════════════════════════╗
     ║  SISTEMA OPERATIVO Y FUNCIONAL   ║
     ║     LISTO PARA PRODUCCIÓN        ║
     ╚═══════════════════════════════════╝
```

**Versión:** 1.0.0  
**Última Actualización:** 2 de Julio de 2026  
**Estado:** ✅ OPERATIVO

---

*Para iniciar: `npm run dev` en ambos directorios*
