# Historia de Usuario 13: Escáner de QR para Registro de Asistencia ✅ COMPLETADA

## 🎯 Resumen de Implementación

Se ha implementado un sistema completo de códigos QR para registrar asistencia a reservas. El sistema genera un código QR único al confirmar cada reserva, que puede ser escaneado desde la aplicación web para registrar la asistencia automáticamente.

---

## 📦 Componentes Implementados

### 1. Backend - Controlador de Asistencias

**Archivo:** `/backend/src/controllers/asistenciaController.js`

#### Métodos implementados:

##### `generarCodigoQR(reservaId, usuarioId, espacioId, fecha)`
- Genera automáticamente un QR al confirmar una reserva
- Crea token único con crypto
- Convierte a Base64 para almacenamiento
- Guarda en tabla `qr_codes`

```javascript
// Datos incluidos en QR:
RESERVA|{reservaId}|{usuarioId}|{espacioId}|{fecha}|{tokenUnico}
```

##### `obtenerCodigoQR(req, res)` - GET `/api/asistencias/:id/qr`
- Retorna QR en Base64 para mostrar en interfaz
- Solo el propietario de la reserva puede obtenerlo
- Validaciones de seguridad

##### `registrarAsistencia(req, res)` - POST `/api/asistencias/escanear`
- Recibe datos del QR escaneado
- Validaciones:
  1. ✅ QR pertenece al usuario autenticado
  2. ✅ Reserva existe y está confirmada
  3. ✅ Fecha/hora válida (30 min antes - 24h después)
  4. ✅ Asistencia no registrada previamente
  5. ✅ Token único válido en BD
- Registra asistencia con timestamp
- Desactiva QR para prevenir reuso

##### `obtenerHistorialAsistencias(req, res)` - GET `/api/asistencias/historial/todas`
- Solo admin
- Retorna todas las asistencias registradas
- Filtros: usuario, espacio, rango de fechas, estado
- Incluye información completa del usuario y espacio

##### `obtenerEstadisticasAsistencia(req, res)` - GET `/api/asistencias/estadisticas/resumen`
- Solo admin
- Retorna estadísticas de asistencia
- Incluye:
  - Total de asistencias
  - Asistencias por espacio
  - Usuarios más activos
  - Últimos 7 días
  - Tasa de asistencia por espacio

##### `cancelarAsistencia(req, res)` - DELETE `/api/asistencias/:id`
- Solo admin
- Cancela asistencia registrada
- Reactiva QR para permitir nuevo escaneo

---

### 2. Base de Datos

**Archivo:** `/backend/src/db/migrations/001-create-asistencias.sql`

#### Tabla `asistencias`
```sql
CREATE TABLE asistencias (
  id SERIAL PRIMARY KEY,
  reserva_id INTEGER NOT NULL UNIQUE REFERENCES reservas(id),
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
  espacio_id INTEGER NOT NULL REFERENCES espacios(id),
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
```

#### Tabla `qr_codes`
```sql
CREATE TABLE qr_codes (
  id SERIAL PRIMARY KEY,
  reserva_id INTEGER NOT NULL UNIQUE REFERENCES reservas(id),
  qr_data TEXT NOT NULL,
  qr_image BYTEA,
  qr_base64 TEXT,
  token_unico VARCHAR(255) UNIQUE NOT NULL,
  fecha_generacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_expiracion TIMESTAMP,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

### 3. Rutas Backend

**Archivo:** `/backend/src/routes/asistencias.js`

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| GET | `/api/asistencias/:id/qr` | Obtener QR de una reserva | User |
| POST | `/api/asistencias/escanear` | Registrar asistencia | User |
| GET | `/api/asistencias/historial/todas` | Obtener historial | Admin |
| GET | `/api/asistencias/estadisticas/resumen` | Obtener estadísticas | Admin |
| DELETE | `/api/asistencias/:id` | Cancelar asistencia | Admin |

---

### 4. Frontend - Componente Scanner QR

**Archivo:** `/frontend/src/components/QRScannerModal.vue`

#### Features:
- ✅ Acceso a cámara web
- ✅ Escaneo en tiempo real con `html5-qrcode`
- ✅ Ingreso manual de código QR
- ✅ Validaciones del lado del cliente
- ✅ Feedback visual (confirmación exitosa)
- ✅ Manejo de errores y permisos

#### Props:
- `mostrar` - Controla visibilidad del modal

#### Eventos:
- `cerrar` - Cierra el modal
- `asistencia-registrada` - Emitido cuando se registra exitosamente

---

### 5. Frontend - Dashboard Actualizado

**Archivo:** `/frontend/src/views/DashboardView.vue`

#### Cambios:

##### New Data Properties:
```javascript
mostrarScannerQR: false,
codigosQR: {},              // Map de QR por reserva
asistenciasRegistradas: {},  // Track de asistencias registradas
```

##### New Methods:
```javascript
cargarCodigosQR()           // Carga QR para todas las reservas
abrirScannerQR()            // Abre modal de scanner
onAsistenciaRegistrada()    // Callback después de escaneo exitoso
```

#### UI Actualizada - Sección "Mis Espacios":
- Muestra código QR en Base64 para cada reserva
- Botón "Escanear QR" para abrir scanner
- Botón "Descargar" para descargar imagen QR
- Información sobre validez del QR
- Estado visual de asistencia registrada

---

## 🔐 Validaciones de Seguridad

### 1. Validación de Usuario
```javascript
if (parseInt(qrUsuarioId) !== usuarioId) {
  return { error: 'Este código QR no pertenece a tu usuario' };
}
```

### 2. Validación de Estado de Reserva
```javascript
if (reserva.estado !== 'confirmado') {
  return { error: 'La reserva no está confirmada' };
}
```

### 3. Validación Temporal
```javascript
const inicioValido = new Date(fechaReserva.getTime() - 30 * 60000);  // 30 min antes
const finValido = new Date(fechaReserva.getTime() + 24 * 60 * 60000); // 24h después

if (ahora < inicioValido || ahora > finValido) {
  return { error: 'Código QR fuera de su ventana de validez' };
}
```

### 4. Prevención de Duplicados
```javascript
const asistenciaExistente = await pool.query(
  `SELECT id FROM asistencias WHERE reserva_id = $1`,
  [reservaId]
);

if (asistenciaExistente.rows.length > 0) {
  return { error: 'La asistencia ya fue registrada' };
}
```

### 5. Validación de Token
```javascript
const qrCodeCheck = await pool.query(
  `SELECT id, activo FROM qr_codes 
   WHERE reserva_id = $1 AND token_unico = $2`,
  [reservaId, tokenUnico]
);

if (!qrCodeCheck.rows[0].activo) {
  return { error: 'Código QR inválido o revocado' };
}
```

---

## 🔄 Flujo de Operación

### 1. Confirmación de Reserva
```
Usuario → Confirma Reserva
         ↓
Backend  → Crea entrada en tabla reservas
         → Genera QR automáticamente
         → Almacena en tabla qr_codes
         ↓
Frontend → Recibe reservaId en respuesta
         → Muestra mensaje de éxito
```

### 2. Escaneo de Asistencia
```
Usuario → Abre Modal de Escaneo
        ↓
Modal  → Accede a cámara web
       → Escanea código QR
       ↓
Frontend → Extrae datos del QR
         → Envía a /api/asistencias/escanear
         ↓
Backend → Valida todas las condiciones
        → Registra asistencia
        → Desactiva QR
        → Retorna confirmación
         ↓
Frontend → Muestra "✅ Asistencia Registrada"
```

### 3. Consulta Admin
```
Admin → Accede a Dashboard
      ↓
Panel → GET /api/asistencias/historial/todas
      ↓
Backend → Retorna todas las asistencias
        → Incluye datos del usuario y espacio
        ↓
Frontend → Muestra tabla con filtros
         → Mostrar estadísticas
```

---

## 📊 Criterios de Aceptación

### ✅ Criterio 1: Generación Automática del QR
"Dado que el usuario confirma una reserva, el sistema genera un código QR único"
- Implementado: ✅ Generación automática en `crearReserva`
- Base64 listo para mostrar: ✅
- Guardado en BD: ✅

### ✅ Criterio 2: Escaneo Exitoso
"Dado que el usuario escanea el código en la aplicación, se registra la asistencia"
- Implementado: ✅ Componente QRScannerModal
- Decodificación: ✅ html5-qrcode
- Registro en BD: ✅ POST /api/asistencias/escanear

### ✅ Criterio 3: Validación Temporal
"Dado que intenta escanear fuera de fecha/hora, rechaza"
- Implementado: ✅ Validación de ±30 min a +24h
- Mensaje claro: ✅

### ✅ Criterio 4: Prevención de Reuso
"Dado que intenta escanear un QR ya utilizado, rechaza"
- Implementado: ✅ Desactivación de QR después de uso
- Check de duplicados: ✅

### ✅ Criterio 5: Historial Admin
"Dado que el admin consulta el historial, ve todas las asistencias"
- Implementado: ✅ GET /api/asistencias/historial/todas
- Filtros: ✅ usuario, espacio, fecha, estado
- Estadísticas: ✅ GET /api/asistencias/estadisticas/resumen

---

## 🌐 API Endpoints Completos

### GET `/api/asistencias/:id/qr`
**Obtener Código QR de una Reserva**

**Response:**
```json
{
  "success": true,
  "qr": {
    "id": 1,
    "qr_base64": "data:image/png;base64,...",
    "token_unico": "abc123def456...",
    "fecha_generacion": "2026-07-02T10:30:00Z",
    "fecha_expiracion": "2026-07-03T10:30:00Z",
    "activo": true
  }
}
```

### POST `/api/asistencias/escanear`
**Registrar Asistencia**

**Request:**
```json
{
  "qrData": "RESERVA|123|456|789|2026-07-02|token123"
}
```

**Response (Exitoso):**
```json
{
  "success": true,
  "message": "✅ Asistencia registrada correctamente para Laboratorio de Computación 1",
  "asistencia": {
    "id": 1,
    "reserva_id": 123,
    "espacio_nombre": "Laboratorio de Computación 1",
    "fecha_asistencia": "2026-07-02T10:35:00Z",
    "hora_escaneado": "10:35:00"
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "La asistencia para esta reserva ya fue registrada previamente"
}
```

### GET `/api/asistencias/historial/todas` (Admin)
**Obtener Historial de Asistencias**

**Parámetros Query (todos opcionales):**
```
usuario_id=123
espacio_id=456
fecha_inicio=2026-07-01
fecha_fin=2026-07-31
estado=registrado
```

**Response:**
```json
{
  "success": true,
  "total_registros": 150,
  "registros_mostrados": 50,
  "asistencias": [
    {
      "id": 1,
      "reserva_id": 123,
      "usuario_nombre": "Juan Pérez",
      "usuario_email": "juan@utc.edu.ec",
      "espacio_nombre": "Laboratorio 1",
      "espacio_tipo": "Laboratorios",
      "fecha_reserva": "2026-07-02",
      "horario": "10:00 - 12:00",
      "fecha_asistencia": "2026-07-02T10:35:00Z",
      "hora_escaneado": "10:35:00",
      "estado": "registrado",
      "dispositivo_escaneo": "Mozilla/5.0...",
      "ubicacion_ip": "192.168.1.100"
    }
  ]
}
```

### GET `/api/asistencias/estadisticas/resumen` (Admin)
**Obtener Estadísticas de Asistencia**

**Response:**
```json
{
  "success": true,
  "estadisticas": {
    "total_asistencias": 450,
    "asistencias_por_espacio": [
      {
        "nombre": "Laboratorio de Computación 1",
        "total": 120,
        "porcentaje": 26.67
      }
    ],
    "usuarios_mas_activos": [
      {
        "nombre": "Juan Pérez",
        "total_asistencias": 15
      }
    ],
    "ultimos_7_dias": [
      {
        "fecha": "2026-06-26",
        "total": 45
      }
    ],
    "tasa_asistencia": [
      {
        "nombre": "Laboratorio de Computación 1",
        "total_reservas": 150,
        "asistencias": 120,
        "tasa_porcentaje": 80.0
      }
    ]
  }
}
```

---

## 📱 Uso desde el Frontend

### 1. Mostrar QR al Usuario
```vue
<div v-if="codigosQR[reserva.id]" class="qr-section">
  <img :src="codigosQR[reserva.id].qr_base64" />
  <button @click="abrirScannerQR">Escanear QR</button>
</div>
```

### 2. Abrir Modal de Escaneo
```vue
<QRScannerModal
  :mostrar="mostrarScannerQR"
  @cerrar="mostrarScannerQR = false"
  @asistencia-registrada="onAsistenciaRegistrada"
/>
```

### 3. Escuchar Resultado
```javascript
onAsistenciaRegistrada() {
  // Recargar datos
  this.fetchMyReservations();
}
```

---

## 🚀 Instalación de Dependencias

### Backend
```bash
cd backend
npm install qrcode --save
```

### Frontend
```bash
cd frontend
npm install html5-qrcode --save
```

---

## 📋 Tareas Completadas ✅

- [x] Diseñar estructura de QR
- [x] Crear tabla de asistencias en BD
- [x] Crear tabla qr_codes en BD
- [x] Implementar generación de QR
- [x] Generar QR automáticamente en reserva
- [x] Implementar escaneo web (html5-qrcode)
- [x] Implementar validaciones temporales
- [x] Prevenir reuso de QR
- [x] Crear endpoint de registro de asistencia
- [x] Crear endpoint de historial admin
- [x] Crear endpoint de estadísticas
- [x] Implementar UI de scanner
- [x] Mostrar QR en dashboard
- [x] Testing de seguridad
- [x] Documentación completa

---

## 📊 Definición de Hecho (DoD) ✅

- [x] El código QR se genera automáticamente al confirmar
- [x] El código QR se muestra correctamente en el dashboard
- [x] La funcionalidad de escaneo registra asistencia
- [x] El código QR solo es válido en fecha/hora de reserva
- [x] El historial de asistencias está disponible
- [x] El código QR no puede ser reutilizado
- [x] Las validaciones funcionan correctamente
- [x] El código ha sido revisado

---

## 🔄 Mejoras Futuras (FASE 2)

1. **App Móvil Nativa**
   - React Native o Flutter
   - Mejor rendimiento
   - Offline support

2. **Reportes Avanzados**
   - Gráficos interactivos
   - Exportación PDF/Excel
   - Análisis de tendencias

3. **Notificaciones**
   - Email cuando se registra asistencia
   - Push notifications
   - SMS opcional

4. **Scanner de Hardware**
   - Integración con lectores QR externos
   - Modo kiosco para entrada/salida

---

## 📞 Soporte

### Errores Comunes

**"No se pudo acceder a la cámara"**
- Requiere HTTPS en producción
- Dar permisos al navegador
- Verificar que el dispositivo tiene cámara

**"Código QR inválido"**
- Verificar que es código QR correcto
- Revisar que no ha expirado (24h)
- Comprobar que ya no fue escaneado

**"Asistencia ya registrada"**
- Solo se puede escanear una vez por reserva
- Contactar admin para cancelar si es necesario

---

## ✨ Estado Final

**IMPLEMENTACIÓN COMPLETADA Y LISTA PARA PRODUCCIÓN** ✅

- Todos los criterios de aceptación cumplidos
- Validaciones de seguridad en lugar
- UI/UX intuitiva y responsiva
- Documentación exhaustiva
- Testing realizado

**Próxima Historia:** Proceder con HU14 o mejoras de FASE 2
