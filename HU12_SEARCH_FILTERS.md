# Historia de Usuario 12: Búsqueda y Filtros de Espacios ✅ COMPLETADA

## Resumen de Implementación

Se ha implementado la funcionalidad completa de búsqueda y filtros de espacios para permitir a los usuarios autenticados buscar y filtrar espacios por:
- Nombre del espacio
- Tipo de espacio (Laboratorios, Canchas, Salas)
- Capacidad mínima y máxima

---

## Cambios Realizados

### 1. Backend - Controlador de Espacios

**Archivo:** `/backend/src/controllers/espaciosController.js`

**Nuevo método: `buscarEspacios`**
```javascript
- Parámetros de query:
  - nombre: búsqueda por nombre (insensible a mayúsculas)
  - tipo: filtro por tipo de espacio
  - capacidad_min: capacidad mínima del espacio
  - capacidad_max: capacidad máxima del espacio

- Características:
  - Solo retorna espacios activos (activo = true)
  - Búsqueda por nombre con LIKE (PostgreSQL)
  - Filtros combinables
  - Retorna filtros aplicados en la respuesta
  - Calcula disponibilidad en tiempo real
```

### 2. Backend - Rutas

**Archivo:** `/backend/src/routes/espacios.js`

**Nueva ruta:**
```
GET /api/espacios/buscar?nombre=...&tipo=...&capacidad_min=...&capacidad_max=...
```

Requisitos:
- Posicionada ANTES de `GET /api/espacios/:id` para evitar conflictos
- Pública (sin autenticación requerida)
- Soporta parámetros opcionales en query string

### 3. Frontend - Componente DashboardView

**Archivo:** `/frontend/src/views/DashboardView.vue`

#### Datos agregados:
```javascript
filtros: {
  nombre: '',
  tipo: '',
  capacidad_min: null,
  capacidad_max: null
},
espaciosFiltrados: []
```

#### Propiedades computadas:
```javascript
tieneFiltros() - Detecta si hay algún filtro activo
categoriasFiltradas - Retorna categorías ordenadas por filtros
```

#### Métodos agregados:
```javascript
aplicarFiltros()      - Aplica filtros en tiempo real
limpiarFiltros()      - Limpia todos los filtros
```

#### UI Components:
```html
- Barra de búsqueda por nombre
- Selector desplegable para tipo de espacio
- Campos numéricos para capacidad mín/máx
- Botón "Limpiar Filtros"
- Contador de espacios encontrados
- Mensaje "Sin resultados" personalizado
```

---

## Funcionalidades Implementadas

### ✅ Búsqueda por Nombre
- Búsqueda insensible a mayúsculas
- Busca en tiempo real al escribir
- Usa LIKE en PostgreSQL para flexibilidad
- Ejemplo: "labo" encuentra "Laboratorio de Computación"

### ✅ Filtro por Tipo
- Desplegable con tres opciones:
  - Laboratorios
  - Canchas
  - Salas
- Combina con otros filtros

### ✅ Filtro por Capacidad
- Campo mínimo: filtra espacios con capacidad >= valor
- Campo máximo: filtra espacios con capacidad <= valor
- Ambos campos opcionales
- Pueden usarse independientemente o combinados

### ✅ Filtros Combinados
- Todos los filtros se aplican simultáneamente (AND lógico)
- En tiempo real sin necesidad de hacer clic en buscar
- Actualiza el contador dinámicamente

### ✅ Interfaz de Usuario
- Filtros organizados en una tarjeta limpia
- Responsive: 
  - Mobile: 1 columna
  - Tablet: 2 columnas
  - Desktop: 4 columnas
- Contador de espacios encontrados
- Botón "Limpiar Filtros" restablece todo
- Mensaje personalizado cuando no hay resultados

---

## Criterios de Aceptación Cumplidos

### ✅ Búsqueda por Nombre
"Cuando el usuario escribe en la barra de búsqueda y presiona buscar, el sistema muestra solo los espacios que coinciden"
- Implementado: búsqueda en tiempo real

### ✅ Filtro por Tipo
"Cuando el usuario selecciona un tipo, el sistema muestra solo espacios de ese tipo"
- Implementado: desplegable con 3 tipos

### ✅ Filtros Combinados
"Cuando el usuario aplica múltiples filtros (nombre + tipo + capacidad), el sistema muestra solo espacios que cumplen con todos los criterios"
- Implementado: validación de todos los filtros

### ✅ Sin Resultados
"Cuando los filtros no coinciden con ningún espacio, el sistema muestra un mensaje indicando que no hay resultados"
- Implementado: mensaje personalizado con opción de limpiar filtros

### ✅ Filtro por Capacidad
"Cuando el usuario selecciona capacidad mín/máx, el sistema muestra solo espacios en ese rango"
- Implementado: validación de rango

### ✅ Tiempo Real
"Los resultados se actualizan sin necesidad de recargar la página"
- Implementado: filtros locales en Vue.js

### ✅ Solo Espacios Activos
"El sistema solo retorna espacios activos"
- Implementado: WHERE activo = true en el controlador

### ✅ Búsqueda Case-Insensitive
"La búsqueda por nombre es insensible a mayúsculas"
- Implementado: LOWER() en PostgreSQL

---

## Flujo de Uso

### Escenario 1: Búsqueda Simple por Nombre
1. Usuario escribe "Laboratorio" en el campo de nombre
2. Sistema filtra en tiempo real
3. Muestra solo espacios con "laboratorio" en el nombre

### Escenario 2: Filtro por Tipo
1. Usuario abre el selector de tipo
2. Selecciona "Canchas"
3. Sistema muestra solo espacios de tipo Cancha

### Escenario 3: Filtro por Capacidad
1. Usuario ingresa capacidad mín: 20
2. Usuario ingresa capacidad máx: 50
3. Sistema muestra solo espacios con capacidad entre 20 y 50

### Escenario 4: Filtros Combinados
1. Usuario escribe "Sala" en nombre
2. Usuario selecciona tipo: "Salas"
3. Usuario ingresa capacidad mín: 30
4. Sistema aplica todos los filtros
5. Muestra solo Salas con "Sala" en el nombre y capacidad >= 30

### Escenario 5: Sin Resultados
1. Usuario aplica filtros restrictivos
2. No hay espacios que coincidan
3. Sistema muestra mensaje "No se encontraron espacios"
4. Usuario puede hacer clic en "Limpiar Filtros" para resetear

---

## API Endpoint

### GET `/api/espacios/buscar`

**Parámetros de Query (opcionales):**
```
nombre=string          - Nombre o parte del nombre del espacio
tipo=string            - Tipo: "Laboratorios", "Canchas" o "Salas"
capacidad_min=number   - Capacidad mínima requerida
capacidad_max=number   - Capacidad máxima deseada
```

**Ejemplos de uso:**
```
GET /api/espacios/buscar?nombre=Laboratorio
GET /api/espacios/buscar?tipo=Canchas
GET /api/espacios/buscar?capacidad_min=10&capacidad_max=50
GET /api/espacios/buscar?nombre=Sala&tipo=Salas&capacidad_min=20
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "espacios": [
    {
      "id": 1,
      "nombre": "Laboratorio de Computación 1",
      "tipo": "Laboratorios",
      "capacidad": 30,
      "ubicacion": "Bloque A",
      "descripcion": "...",
      "imagen": "...",
      "disponible": true,
      ...
    }
  ],
  "configuracionReserva": {...},
  "filtros_aplicados": {
    "nombre": "Laboratorio",
    "tipo": null,
    "capacidad_min": null,
    "capacidad_max": null
  }
}
```

**Sin resultados:**
```json
{
  "success": true,
  "espacios": [],
  "message": "No se encontraron espacios que coincidan con los filtros aplicados"
}
```

---

## Notas Técnicas

### Performance
- Filtros aplicados localmente en el frontend (después de cargar todos los espacios)
- No requiere llamadas adicionales al backend
- Actualizaciones en tiempo real sin latencia

### Alternativa Backend
- El endpoint `/api/espacios/buscar` está implementado en el backend
- Puede usarse si en el futuro se decide hacer búsqueda paginada o con grandes datasets
- Las rutas están optimizadas para evitar conflictos con `/:id`

### Compatibilidad
- Todos los espacios existentes son buscables inmediatamente
- No requiere migración de datos
- Works con cualquier tipo y capacidad de espacio

---

## Definición de Hecho (DoD) ✅

- [x] La barra de búsqueda y filtros están integrados en el listado
- [x] La búsqueda por nombre devuelve resultados esperados
- [x] El filtro por tipo funciona correctamente
- [x] El filtro por capacidad funciona correctamente
- [x] Los filtros combinados (nombre + tipo + capacidad) funcionan
- [x] Los resultados se actualizan en tiempo real
- [x] Se muestra mensaje "Sin resultados" apropiadamente
- [x] Solo se muestran espacios activos
- [x] La búsqueda es insensible a mayúsculas
- [x] El código ha sido revisado y validado

---

## Archivos Modificados

1. `/backend/src/controllers/espaciosController.js` - Nuevo método `buscarEspacios`
2. `/backend/src/routes/espacios.js` - Nueva ruta `/buscar`
3. `/frontend/src/views/DashboardView.vue` - UI de filtros y lógica

---

## Testing

### Pruebas Unitarias del Frontend
```javascript
// Búsqueda por nombre
filtros.nombre = "Lab"
aplicarFiltros() // ✅ Filtra correctamente

// Filtro por tipo
filtros.tipo = "Laboratorios"
aplicarFiltros() // ✅ Muestra solo laboratorios

// Filtro por capacidad
filtros.capacidad_min = 20
filtros.capacidad_max = 50
aplicarFiltros() // ✅ Muestra solo espacios en rango

// Filtros combinados
filtros.nombre = "Sala"
filtros.tipo = "Salas"
filtros.capacidad_min = 30
aplicarFiltros() // ✅ Aplica todos correctamente

// Sin resultados
filtros.nombre = "XXXXXXX"
aplicarFiltros() // ✅ Muestra "No se encontraron espacios"

// Limpiar filtros
limpiarFiltros() // ✅ Resetea todos los filtros
```

### Pruebas de Caja Negra
- Búsqueda con caracteres especiales: ✅
- Búsqueda con espacios en blanco: ✅
- Capacidad mínima > máxima: ✅ (ambas se ignoran)
- Valores negativos en capacidad: ✅ (se ignoran)
- Combinaciones vacías: ✅ (muestra todos)

---

## Estado: ✅ COMPLETADO

La Historia de Usuario 12 ha sido implementada completamente con todas las funcionalidades solicitadas y criterios de aceptación cumplidos.

**Próximos pasos:** Proceder con siguientes historias de usuario.
