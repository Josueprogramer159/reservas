# Checklist de Verificación Manual

## Pre-Requisitos
- [ ] PostgreSQL 17+ iniciado
- [ ] Base de datos con espacios de prueba
- [ ] Backend corriendo en puerto 3002
- [ ] Frontend corriendo en puerto 3000
- [ ] Usuario autenticado en el navegador

---

## HU003: Visualización de Espacios por Categoría

### CV1: Mostrar Categorías
**Ruta:** `/categorias`

- [ ] Página carga correctamente
- [ ] Se muestran exactamente 3 categorías
- [ ] Cada categoría tiene:
  - [ ] Icono correspondiente (Beaker, Shovel, Presentation)
  - [ ] Nombre de categoría
  - [ ] Total de espacios (número)
  - [ ] Número de espacios disponibles
- [ ] Las tarjetas tienen efecto hover
- [ ] Las tarjetas son clickeables
- [ ] Mensaje de loading visible mientras carga
- [ ] Si hay error, se muestra mensaje claro

### CV2: Listar Espacios de Categoría
**Ruta:** `/categorias/Laboratorios` (o cualquier categoría)

- [ ] URL cambia correctamente
- [ ] Página carga la lista de espacios
- [ ] Cada espacio muestra:
  - [ ] Nombre
  - [ ] Ubicación
  - [ ] Horario
  - [ ] Capacidad
  - [ ] Indicador de disponibilidad (badge verde/rojo)
  - [ ] Imagen (o placeholder si no tiene)
- [ ] Hay botón "Volver a categorías" visible
- [ ] Hay contador de espacios encontrados
- [ ] Botón "Volver" redirige a `/categorias`

### CV3: Búsqueda por Nombre
**Acción:** Escribir en campo de búsqueda

- [ ] Campo de entrada visible
- [ ] Al escribir, los espacios se filtran en tiempo real
- [ ] La búsqueda es case-insensitive
  - [ ] "lab" muestra "Laboratorio"
  - [ ] "LAB" muestra "Laboratorio"
  - [ ] "Laboratorio" muestra "Laboratorio"
- [ ] Contador se actualiza con número de resultados
- [ ] Si no hay coincidencias, muestra mensaje
- [ ] Al limpiar el campo, vuelven todos los espacios

### CV4: Filtros de Capacidad
**Acción:** Usar campos de "Cap. Mín" y "Cap. Máx"

- [ ] Campos de entrada visible
- [ ] Al establecer Cap. Mín = 20:
  - [ ] Solo se muestran espacios con capacidad >= 20
  - [ ] El contador se actualiza
- [ ] Al establecer Cap. Máx = 50:
  - [ ] Solo se muestran espacios con capacidad <= 50
  - [ ] El contador se actualiza
- [ ] Al establecer ambos (20-50):
  - [ ] Solo se muestran espacios entre 20 y 50
  - [ ] El contador es correcto
- [ ] Los filtros funcionan con búsqueda (se combinan)

### CV5: Limpiar Filtros
**Acción:** Click en "Limpiar Filtros"

- [ ] Botón está visible
- [ ] Al hacer click:
  - [ ] Campo de nombre se vacía
  - [ ] Campo de Cap. Mín se vacía
  - [ ] Campo de Cap. Máx se vacía
  - [ ] Se muestran todos los espacios nuevamente
  - [ ] El contador vuelve al total

---

## HU004: Consulta de Información Detallada

### DV1: Información Detallada Completa
**Acción:** Click en un espacio desde la lista

- [ ] URL cambia a `/espacios/:id`
- [ ] Página carga correctamente
- [ ] Se muestra:
  - [ ] Imagen principal (o placeholder)
  - [ ] Nombre del espacio (h1)
  - [ ] Tipo/Categoría
  - [ ] Capacidad
  - [ ] Ubicación
  - [ ] Descripción
  - [ ] Horario
  - [ ] Indicador de disponibilidad (badge)
- [ ] Si es usuario normal:
  - [ ] Hay botón "Favorito" funcionando
  - [ ] Hay botón "Reservar este espacio"
- [ ] Hay botón "Volver" visible
- [ ] Hay información de fecha y horario de configuración

### DV2: Espacio No Existe
**Acción:** Acceder a `/espacios/99999` (ID inválido)

- [ ] Página carga
- [ ] Se muestra error con:
  - [ ] Icono de error (AlertCircle)
  - [ ] Mensaje "Espacio no encontrado"
  - [ ] Descripción clara del problema
- [ ] Hay botón "Volver a categorías"
- [ ] Al click, redirecciona a `/categorias`
- [ ] No hay crash de la aplicación

### DV3: Usuario No Autenticado
**Acción:** Cerrar sesión y acceder a `/categorias`

- [ ] Se redirecciona automáticamente a `/login`
- [ ] No se muestra la página de categorías
- [ ] Mensaje de requerimiento de autenticación visible
- [ ] Después de login, permite acceder a `/categorias`

### DV4: Espacio Desactivado
**Acción:** Como admin, desactivar un espacio; como usuario, intentar verlo

- [ ] Si el espacio está desactivado:
  - [ ] Se carga la página pero muestra error especial
  - [ ] Icono de advertencia (AlertTriangle)
  - [ ] Mensaje "Espacio no disponible"
  - [ ] Información del espacio (nombre) se muestra
  - [ ] Botón "Ver otros espacios"
- [ ] Al click en "Ver otros espacios", va a `/categorias`
- [ ] No hay botón de "Reservar"

### DV5: Espacio Eliminado
**Acción:** Como admin, eliminar un espacio; como usuario, intentar verlo

- [ ] Si el espacio fue eliminado:
  - [ ] Se muestra error "Espacio no encontrado"
  - [ ] Icono de error
  - [ ] Mensaje claro del problema
  - [ ] Botón "Volver a categorías"
- [ ] No hay crash de la aplicación
- [ ] La redirección funciona correctamente

---

## Tests de Navegación

### Navegación Circular
- [ ] Categorías → Laboratorios → Espacio → Volver → Laboratorios
- [ ] Laboratorios → Espacio → Volver a Categorías → Categorías
- [ ] Espacio A → Volver → Laboratorios → Espacio B
- [ ] Todos los botones "Volver" funcionan

### Filtros y Navegación
- [ ] Aplicar filtros en Laboratorios
- [ ] Click en espacio
- [ ] Volver a Laboratorios
- [ ] Los filtros se mantienen (opcional) o se limpian (aceptable)

### Búsqueda y Click
- [ ] Buscar "Lab" en Laboratorios
- [ ] Hacer click en un resultado
- [ ] Verificar que el espacio es correcto
- [ ] Volver

---

## Tests de Errores

### Validación de Entrada
- [ ] Intentar acceder a `/categorias/InvalidCategory`
  - [ ] Debe mostrar error 400 o similar
- [ ] Intentar capacidad negativa
  - [ ] Los campos deben permitir solo números positivos
- [ ] Campo de búsqueda con caracteres especiales
  - [ ] Debe funcionar sin errores

### Estados de Carga
- [ ] Al cargar `/categorias`, hay skeleton/loader visible
- [ ] Al cargar espacios de una categoría, hay skeleton visible
- [ ] Al cargar detalle, hay skeleton visible
- [ ] Todos los loaders desaparecen cuando los datos cargan

---

## Tests de Performance

### Velocidad de Carga
- [ ] `/categorias` carga en < 1 segundo
- [ ] `/categorias/:categoria` carga en < 2 segundos
- [ ] `/espacios/:id` carga en < 1 segundo
- [ ] Los filtros responden en < 300ms

### Filtros en Tiempo Real
- [ ] Escribir "L" → respuesta inmediata
- [ ] Escribir "La" → respuesta inmediata
- [ ] Escribir "Lab" → respuesta inmediata
- [ ] Sin lag o delay perceptible

---

## Tests de Accesibilidad

### Navegación por Teclado
- [ ] TAB navega por elementos
- [ ] ENTER activa botones
- [ ] ENTER en campos de búsqueda funciona

### Responsivo
- [ ] Desktop (1920x1080): Todo visible y bien distribuido
- [ ] Tablet (768x1024): Grid se adapta
- [ ] Mobile (375x667): Grid de 1 columna
- [ ] Menú hamburguesa visible en mobile (si aplica)

---

## Tests de Datos

### Datos Correctos
- [ ] Contadores de categorías son precisos
- [ ] Los espacios tienen información completa
- [ ] Las imágenes cargan correctamente
- [ ] No hay datos duplicados

### Sincronización
- [ ] Después de crear un espacio, aparece en `/categorias`
- [ ] Después de desactivar, muestra error de inactivo
- [ ] Después de eliminar, muestra error de no existe

---

## Tests de Seguridad

### Control de Acceso
- [ ] Logged out: No puede acceder a `/categorias`
- [ ] Logged out: No puede acceder a `/espacios/:id`
- [ ] Logged in como admin: Puede ver todas las rutas
- [ ] Logged in como user: Puede ver todas las rutas

### Validación Backend
- [ ] Enviar request sin autenticación → 401
- [ ] Enviar request con categoría inválida → 400
- [ ] Enviar request con espacio inactivo → 403

---

## Resumen Final

Total de checks: **75+**

Cuando haya completado todos los checks:

```
✅ HU003: Completada
✅ HU004: Completada
✅ Sistema listo para producción
```

---

**Instrucciones:**
1. Ejecutar cada test
2. Marcar con [x] cuando se complete
3. Si algún test falla, reportar el issue
4. Repetir hasta que todos los tests pasen

**Fecha de Verificación:** _______________
**Verificado por:** _______________
**Resultado:** ✅ APROBADO / ❌ RECHAZADO

