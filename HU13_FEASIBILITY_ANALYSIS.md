# Historia de Usuario 13: Escáner de QR para Registro de Asistencia
## Análisis de Factibilidad

---

## 📊 RESUMEN EJECUTIVO

**VEREDICTO: ✅ 100% FACTIBLE - Puede implementarse completamente**

Esta funcionalidad es totalmente viable con la tecnología actual. No hay barreras técnicas significativas y puede desarrollarse de manera progresiva.

---

## 1. ✅ GENERACIÓN DE CÓDIGOS QR

### Estado: COMPLETAMENTE FACTIBLE

#### Opciones Disponibles:

**Opción 1: QR Backend (RECOMENDADA)**
- Librería: `qrcode` (npm package)
- Instalación: `npm install qrcode`
- Ventajas:
  - Genera QR en el backend como imagen PNG/SVG
  - Fácil de enviar por email
  - Almacenable en base de datos
  - Mejor control y seguridad

```javascript
// Ejemplo implementación
import QRCode from 'qrcode';

const qrData = `RESERVA_${reserva_id}_${usuario_id}_${fecha}`;
const qrImage = await QRCode.toDataURL(qrData);
// Guardar en BD o retornar al frontend
```

**Opción 2: QR Frontend**
- Librería: `qrcode.vue` o `vue-qr`
- Ventajas:
  - Menos carga en servidor
  - Generación instantánea
- Desventajas:
  - Requiere componente adicional

#### Datos a Incluir en QR:
```
RESERVA|{id}|{usuario_id}|{espacio_id}|{fecha}|{hora_inicio}|{token_unique}
```

**Complejidad:** ⭐ Muy fácil (1-2 horas)

---

## 2. ✅ ESCANEO DE CÓDIGOS QR

### Estado: COMPLETAMENTE FACTIBLE

#### Opciones Disponibles:

**Opción A: Web Escaneo (RECOMENDADA PARA INICIO)**
- Librería: `jsqr` o `html5-qrcode`
- Instalación: `npm install html5-qrcode`
- Ventajas:
  - Funciona en navegador con cámara
  - Cross-platform
  - No requiere app nativa
  - Compatible con dispositivos móviles

```javascript
// Ejemplo código
import { Html5Qrcode } from "html5-qrcode";

const html5QrCode = new Html5Qrcode("reader");
html5QrCode.start(
  { facingMode: "environment" },
  { fps: 10, qrbox: 250 },
  (decodedText) => {
    console.log("QR Escaneado:", decodedText);
    registrarAsistencia(decodedText);
  }
);
```

**Opción B: App Nativa**
- Frameworks: React Native / Flutter
- Tiempo: 3-4 semanas
- Recomendación: **FASE 2 (después de web)**

**Opción C: Scanner Externo**
- Hardware QR scanner
- Integración simple (simula teclado)
- Requiere dispositivo físico en espacios

**Complejidad (Web):** ⭐⭐ Fácil (2-3 horas)

---

## 3. ✅ VALIDACIÓN DE QR

### Estado: COMPLETAMENTE FACTIBLE

**Validaciones a Implementar:**

```javascript
// Backend - Endpoint registrarAsistencia
POST /api/reservas/{id}/asistencia

// Validaciones:
1. El QR debe decodificarse correctamente
2. La reserva debe existir
3. La reserva debe estar confirmada (no cancelada)
4. La fecha/hora actual debe estar dentro del rango de la reserva
5. La asistencia no debe haber sido registrada previamente
6. El usuario que escanea debe ser el propietario de la reserva
```

**Lógica:**
```javascript
// Pseudocódigo
const validarQR = async (qrData, usuarioId) => {
  const { reserva_id, fecha, hora_inicio, token } = parsearQR(qrData);
  
  const reserva = await pool.query(
    'SELECT * FROM reservas WHERE id=$1 AND usuario_id=$2',
    [reserva_id, usuarioId]
  );
  
  if (!reserva) throw 'Reserva no encontrada';
  if (reserva.estado !== 'confirmado') throw 'Reserva no confirmada';
  
  const ahora = new Date();
  if (ahora < new Date(reserva.fecha)) throw 'Aún no es la fecha de la reserva';
  if (ahora > addHours(new Date(reserva.fecha), 24)) throw 'La reserva ya pasó';
  
  const asistencia = await pool.query(
    'SELECT id FROM asistencias WHERE reserva_id=$1',
    [reserva_id]
  );
  
  if (asistencia.rows.length > 0) throw 'Asistencia ya registrada';
  
  return true;
};
```

**Complejidad:** ⭐⭐ Fácil (2-3 horas)

---

## 4. ✅ BASE DE DATOS - TABLA DE ASISTENCIAS

### Estado: COMPLETAMENTE FACTIBLE

**Nueva Tabla Requerida:**

```sql
CREATE TABLE asistencias (
  id SERIAL PRIMARY KEY,
  reserva_id INTEGER NOT NULL UNIQUE REFERENCES reservas(id),
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
  espacio_id INTEGER NOT NULL REFERENCES espacios(id),
  fecha_asistencia TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  hora_escaneado TIME,
  codigo_qr VARCHAR(500),
  dispositivo_escaneo VARCHAR(255),
  ubicacion_ip VARCHAR(50),
  estado VARCHAR(50) DEFAULT 'registrado',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_asistencias_usuario ON asistencias(usuario_id);
CREATE INDEX idx_asistencias_espacio ON asistencias(espacio_id);
CREATE INDEX idx_asistencias_fecha ON asistencias(fecha_asistencia);
```

**Migraciones:**
- Script SQL para crear tabla
- Tiempo: 15 minutos

**Complejidad:** ⭐ Muy fácil

---

## 5. ✅ DASHBOARD DEL USUARIO

### Estado: COMPLETAMENTE FACTIBLE

**Sección QR en Dashboard:**

```vue
<div class="qr-section">
  <!-- Mostrar QR generado -->
  <div class="qr-display">
    <img :src="reserva.qr_image" />
    <p>Escanea este código para registrar asistencia</p>
  </div>
  
  <!-- Botón para escanear -->
  <button @click="abrirScannerQR">
    📱 Escanear QR
  </button>
  
  <!-- Validez del QR -->
  <div v-if="esQRValido" class="estado-qr">
    ✅ Válido desde {{ reserva.fecha }}
  </div>
  <div v-else class="estado-qr error">
    ❌ QR no válido en este momento
  </div>
  
  <!-- Confirmación de asistencia -->
  <div v-if="asistenciaRegistrada" class="confirmacion">
    ✅ Asistencia registrada el {{ asistencia.fecha_hora }}
  </div>
</div>
```

**Complejidad:** ⭐⭐ Fácil (3-4 horas)

---

## 6. ✅ PANEL DE ADMINISTRADOR

### Estado: COMPLETAMENTE FACTIBLE

**Nueva Pestaña: "Historial de Asistencias"**

```sql
-- Query para obtener historial
SELECT 
  a.id,
  u.nombre as usuario,
  e.nombre as espacio,
  r.fecha as fecha_reserva,
  a.fecha_asistencia,
  a.estado
FROM asistencias a
JOIN usuarios u ON u.id = a.usuario_id
JOIN espacios e ON e.id = a.espacio_id
JOIN reservas r ON r.id = a.reserva_id
ORDER BY a.fecha_asistencia DESC
LIMIT 100;
```

**Funcionalidades:**
- Tabla con filtros por:
  - Rango de fechas
  - Usuario
  - Espacio
  - Estado (registrado, cancelado, etc.)
- Estadísticas:
  - Total de asistencias
  - Tasa de asistencia por espacio
  - Usuarios más activos

**Complejidad:** ⭐⭐⭐ Moderada (4-5 horas)

---

## 7. 📧 EMAIL DE CONFIRMACIÓN

### Estado: COMPLETAMENTE FACTIBLE

**Incluir QR en Email:**

```javascript
// Adjuntar QR a email
const transporter = nodemailer.createTransport({...});

const mailOptions = {
  from: 'reservas@utc.edu.ec',
  to: usuario.email,
  subject: 'Confirmación de Reserva - Código QR',
  html: htmlTemplate,
  attachments: [
    {
      filename: `qr_reserva_${reserva.id}.png`,
      content: qrBuffer,
      cid: 'qr_unique_id'
    }
  ]
};

transporter.sendMail(mailOptions, ...);
```

**Complejidad:** ⭐⭐ Fácil (1-2 horas)

---

## 📋 PLAN DE IMPLEMENTACIÓN RECOMENDADO

### FASE 1: MVP (Semana 1 - 2)
**Tiempo: 15-18 horas de desarrollo**

1. **Generación de QR** (2h)
   - Agregar librería `qrcode`
   - Generar QR al confirmar reserva
   - Guardar QR en BD

2. **Base de Datos** (1h)
   - Crear tabla `asistencias`
   - Migraciones

3. **Validación de QR** (3h)
   - Endpoint `/api/reservas/{id}/asistencia`
   - Lógica de validación temporal
   - Prevenir duplicados

4. **Scanner Web** (4h)
   - Integrar `html5-qrcode`
   - Componente de escaneo
   - Decodificar QR

5. **Dashboard Usuario** (3h)
   - Mostrar QR en reservas
   - Botón "Escanear"
   - Modal de escaneo
   - Confirmación visual

6. **Panel Admin** (3h)
   - Tabla de asistencias
   - Filtros básicos
   - Estadísticas simples

---

### FASE 2: Mejoras (Semana 3 - 4)
**Tiempo: 10-12 horas**

- App móvil nativa con React Native
- Scanner de hardware integrado
- Reportes avanzados
- Analytics del uso de espacios
- Notificaciones en tiempo real

---

## 🛠️ TECNOLOGÍAS RECOMENDADAS

| Componente | Librería | Versión | Tamaño |
|-----------|----------|---------|--------|
| Generación QR | `qrcode` | ^1.5.3 | ~45KB |
| Escaneo Web | `html5-qrcode` | ^2.3.8 | ~120KB |
| Control de cámara | Nativa (navigator.mediaDevices) | - | 0KB |
| Base de datos | PostgreSQL | 12+ | ✅ Ya existe |

**Dependencias totales nuevas:** ~165KB (minificado)

---

## ⚠️ CONSIDERACIONES IMPORTANTES

### 1. **Permisos de Cámara**
- Requiere HTTPS en producción
- En localhost funciona sin HTTPS
- Mostrar prompt de permisos al usuario

### 2. **Compatibilidad de Navegadores**
| Navegador | Soporte |
|-----------|---------|
| Chrome/Edge | ✅ Completo |
| Firefox | ✅ Completo |
| Safari (iOS) | ✅ iOS 11+ |
| Opera | ✅ Completo |

### 3. **Validez Temporal del QR**
```javascript
// El QR es válido durante 24 horas después de la reserva
const esValido = (fechaReserva) => {
  const ahora = new Date();
  const inicio = new Date(fechaReserva);
  const fin = addHours(inicio, 24);
  return ahora >= inicio && ahora <= fin;
};
```

### 4. **Seguridad**
- El QR incluye token único
- Validación en servidor
- No expone datos sensibles
- Una asistencia por reserva

### 5. **Offline Mode**
- ⚠️ El escaneo requiere internet
- El QR se genera offline sin problemas
- Considerar caché local para futuro

---

## 📊 TABLA DE ESFUERZO

| Tarea | Horas | Dificultad | Estado |
|------|-------|-----------|--------|
| Generación QR | 2 | ⭐ | ✅ Fácil |
| Base de Datos | 1 | ⭐ | ✅ Fácil |
| Validación QR | 3 | ⭐⭐ | ✅ Fácil |
| Scanner Web | 4 | ⭐⭐ | ✅ Fácil |
| UI Dashboard Usuario | 3 | ⭐⭐ | ✅ Fácil |
| Panel Admin | 3 | ⭐⭐⭐ | ✅ Moderada |
| Email QR | 2 | ⭐⭐ | ✅ Fácil |
| Testing | 4 | ⭐⭐ | ✅ Fácil |
| **Total FASE 1** | **22h** | - | ✅ Viable |

---

## 🎯 CONCLUSIÓN FINAL

### ✅ RECOMENDACIÓN: IMPLEMENTAR EN DOS FASES

**FASE 1 (2-3 semanas):** MVP básico
- Generación de QR
- Escaneo web
- Registro de asistencia
- Historial admin

**FASE 2 (Adicional):** Mejoras avanzadas
- App móvil nativa
- Reportes complejos
- Analytics avanzado

---

## 🚀 PRÓXIMOS PASOS

Si decides proceder con HU13:

1. ✅ Crear tabla `asistencias` en BD
2. ✅ Instalar dependencia `qrcode`
3. ✅ Implementar generación de QR
4. ✅ Agregar endpoint de asistencia
5. ✅ Integrar escaneo web
6. ✅ Actualizar UI del dashboard
7. ✅ Agregar panel admin
8. ✅ Testing completo

**Estimado Total:** 22-25 horas de desarrollo
**Dificultad:** Baja a Moderada
**Bloqueadores:** Ninguno

---

## 📞 ALTERNATIVAS

Si prefieres no implementar QR por ahora:

1. **Asistencia Manual:** Admin confirma manualmente
2. **Código de Acceso:** Texto simple en lugar de QR
3. **Registro por Email:** Confirmación vía email
4. **Check-in por App:** Botón simple en dashboard

---

**VEREDICTO FINAL: 100% FACTIBLE Y RECOMENDADO ✅**
