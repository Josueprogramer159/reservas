# Pruebas Funcionales - HU003 y HU004

## HU003: Visualización de Espacios por Categoría

### Criterio de Aceptación 1: Mostrar categorías con contadores
**Descripción:** Dado que el usuario autenticado accede al sistema, cuando la página principal carga correctamente, entonces el sistema deberá mostrar las categorías disponibles (Laboratorios, Canchas, Salas de Auditorio) con el número total de espacios y los disponibles en cada una.

**Pasos de prueba:**
1. Iniciar sesión como usuario
2. Navegar a `/categorias`
3. Verificar que se muestren 3 tarjetas de categoría

**Resultados esperados:**
- ✓ Se muestren las 3 categorías: Laboratorios, Canchas, Salas
- ✓ Cada categoría muestre el número total de espacios
- ✓ Cada categoría muestre el número de espacios disponibles
- ✓ Se visualicen los iconos correspondientes a cada categoría
- ✓ Las tarjetas sean clickeables

**Resultado:** PENDIENTE

---

### Criterio de Aceptación 2: Listado de espacios al seleccionar categoría
**Descripción:** Dado que el usuario autenticado selecciona una categoría (ej. Laboratorios), cuando hace clic en ella, entonces el sistema deberá mostrar el listado de todos los espacios pertenecientes a esa categoría con su nombre, ubicación y disponibilidad.

**Pasos de prueba:**
1. Desde la vista de categorías, hacer clic en "Laboratorios"
2. Esperar que cargue la lista de espacios
3. Verificar que se muestren los espacios

**Resultados esperados:**
- ✓ URL cambia a `/categorias/Laboratorios`
- ✓ Se cargue la lista de espacios de esa categoría
- ✓ Se muestren nombre, ubicación y disponibilidad de cada espacio
- ✓ Haya un botón "Volver a categorías" visible
- ✓ Se muestre el contador de espacios encontrados

**Resultado:** PENDIENTE

---

### Criterio de Aceptación 3: Búsqueda por nombre
**Descripción:** Dado que el usuario autenticado se encuentra en el listado de una categoría y escribe un nombre en la barra de búsqueda, cuando presiona "Buscar", entonces el sistema deberá mostrar solo los espacios cuyo nombre coincida con el texto ingresado.

**Pasos de prueba:**
1. Estar en la vista de SpacesByCategory
2. Escribir un nombre parcial en la barra de búsqueda (ej: "Lab")
3. Verificar que los espacios se filtren en tiempo real

**Resultados esperados:**
- ✓ La búsqueda sea case-insensitive (mayúsculas/minúsculas)
- ✓ Se muestren solo los espacios que coincidan
- ✓ El contador se actualice automáticamente
- ✓ Si no hay coincidencias, mostrar mensaje "No se encontraron espacios"

**Resultado:** PENDIENTE

---

### Criterio de Aceptación 4: Filtros de capacidad
**Descripción:** Dado que el usuario autenticado se encuentra en el listado de una categoría y aplica filtros de capacidad mínima y máxima, cuando ejecuta la búsqueda, entonces el sistema deberá mostrar únicamente los espacios que tengan una capacidad dentro del rango establecido.

**Pasos de prueba:**
1. Estar en la vista de SpacesByCategory
2. Establecer "Cap. Mín" = 20 y "Cap. Máx" = 50
3. Verificar que solo se muestren espacios con capacidad en ese rango

**Resultados esperados:**
- ✓ Los filtros se apliquen en tiempo real
- ✓ Solo se muestren espacios con capacidad >= 20 y <= 50
- ✓ El contador se actualice correctamente
- ✓ Los filtros se combinen con la búsqueda por nombre

**Resultado:** PENDIENTE

---

### Criterio de Aceptación 5: Limpiar filtros
**Descripción:** Dado que el usuario autenticado aplica filtros y desea reiniciar la búsqueda, cuando selecciona "Limpiar Filtros", entonces el sistema deberá reiniciar todos los filtros y mostrar todos los espacios de la categoría seleccionada.

**Pasos de prueba:**
1. Aplicar varios filtros (nombre, capacidad mín/máx)
2. Hacer clic en "Limpiar Filtros"
3. Verificar que todos los campos se limpien

**Resultados esperados:**
- ✓ Los campos de filtro se vacíen
- ✓ Se muestren todos los espacios de la categoría nuevamente
- ✓ El contador vuelva al total de espacios
- ✓ No se pierda el estado de la categoría seleccionada

**Resultado:** PENDIENTE

---

## HU004: Consulta de Información Detallada de un Espacio

### Criterio de Aceptación 1: Mostrar detalle completo
**Descripción:** Dado que el usuario autenticado se encuentra en el listado de espacios de una categoría, cuando selecciona un espacio activo para ver su información detallada, entonces el sistema deberá mostrar una pantalla con toda la información del espacio: nombre, tipo, capacidad, ubicación, descripción, imagen y horarios disponibles.

**Pasos de prueba:**
1. Estar en SpacesByCategory
2. Hacer clic en un espacio
3. Verificar que se muestre toda la información

**Resultados esperados:**
- ✓ Se cargue la página de detalle
- ✓ URL sea `/espacios/:id`
- ✓ Se muestren: nombre, tipo, capacidad, ubicación, descripción
- ✓ Se muestre la imagen del espacio (o placeholder si no tiene)
- ✓ Se muestre el horario disponible
- ✓ Se muestren indicadores de disponibilidad
- ✓ Haya botón de favorito funcional
- ✓ Haya botón "Reservar este espacio"

**Resultado:** PENDIENTE

---

### Criterio de Aceptación 2: Espacio no existe
**Descripción:** Dado que el usuario autenticado intenta acceder al detalle de un espacio que no existe en la base de datos, cuando ingresa a la URL o selecciona un enlace inválido, entonces el sistema deberá mostrar un mensaje de error indicando que el espacio no existe y redirigir al usuario al listado de la categoría correspondiente.

**Pasos de prueba:**
1. Acceder directamente a `/espacios/99999` (ID que no existe)
2. Verificar el mensaje de error
3. Verificar opción para volver a categorías

**Resultados esperados:**
- ✓ Se muestre mensaje "Espacio no encontrado"
- ✓ Se muestre ícono de error
- ✓ Haya botón "Volver a categorías"
- ✓ El botón redirija a `/categorias`

**Resultado:** PENDIENTE

---

### Criterio de Aceptación 3: Usuario no autenticado
**Descripción:** Dado que un usuario no autenticado intenta acceder al detalle de un espacio, cuando intenta visualizar la información, entonces el sistema deberá redirigirlo a la página de inicio de sesión y mostrar un mensaje indicando que debe iniciar sesión para acceder a esta funcionalidad.

**Pasos de prueba:**
1. Cerrar sesión (si está abierta)
2. Intentar acceder a `/espacios/1` directamente
3. Verificar que redirija a login

**Resultados esperados:**
- ✓ Se redirija a `/login`
- ✓ Se muestre un mensaje sobre necesidad de autenticación
- ✓ Después del login, permita acceder al espacio

**Resultado:** PENDIENTE

---

### Criterio de Aceptación 4: Espacio desactivado
**Descripción:** Dado que el usuario autenticado intenta acceder al detalle de un espacio que ha sido desactivado por el administrador, cuando selecciona el espacio, entonces el sistema deberá mostrar un mensaje indicando que el espacio no está disponible actualmente y sugerirle ver otros espacios activos.

**Pasos de prueba:**
1. Como admin, desactivar un espacio
2. Como usuario, intentar acceder al espacio desactivado
3. Verificar el mensaje

**Resultados esperados:**
- ✓ Se cargue pero muestre estado de inactivo
- ✓ Se muestre mensaje "Espacio no disponible"
- ✓ Se muestre la razón (desactivado por administrador)
- ✓ Haya botón "Ver otros espacios"
- ✓ El botón redirija a categorías

**Resultado:** PENDIENTE

---

### Criterio de Aceptación 5: Espacio eliminado
**Descripción:** Dado que el usuario autenticado consulta un espacio que ha sido eliminado previamente, cuando intenta acceder a su detalle, entonces el sistema deberá mostrar un mensaje de error claro indicando que el espacio solicitado ya no está disponible y ofrecer una opción para regresar al listado de la categoría.

**Pasos de prueba:**
1. Como admin, eliminar un espacio
2. Como usuario, intentar acceder al espacio eliminado
3. Verificar el mensaje

**Resultados esperados:**
- ✓ Se muestre mensaje "Espacio no encontrado"
- ✓ El error sea claro (no vago)
- ✓ Se ofrezca opción para volver a categorías
- ✓ No cause crash en la aplicación

**Resultado:** PENDIENTE

---

## Resumen de Pruebas

| # | Criterio | Resultado | Fecha | Tester |
|---|----------|-----------|-------|--------|
| HU003-1 | Categorías con contadores | PENDIENTE | - | - |
| HU003-2 | Listado por categoría | PENDIENTE | - | - |
| HU003-3 | Búsqueda por nombre | PENDIENTE | - | - |
| HU003-4 | Filtros de capacidad | PENDIENTE | - | - |
| HU003-5 | Limpiar filtros | PENDIENTE | - | - |
| HU004-1 | Detalle completo | PENDIENTE | - | - |
| HU004-2 | Espacio no existe | PENDIENTE | - | - |
| HU004-3 | Usuario no autenticado | PENDIENTE | - | - |
| HU004-4 | Espacio desactivado | PENDIENTE | - | - |
| HU004-5 | Espacio eliminado | PENDIENTE | - | - |

---

## Notas de Pruebas

### Notas Generales
- Todos los tests requieren que el servidor backend esté corriendo en puerto 3002
- Todos los tests requieren que el servidor frontend esté corriendo en puerto 3000
- Se debe tener conexión activa a PostgreSQL
- Se recomienda usar base de datos de prueba

### Notas de Navegación
- La navegación de "Volver" debe funcionar correctamente sin perder datos
- Los botones de "Volver a categorías" deben ser consistentes en toda la aplicación

### Notas de Rendimiento
- Las búsquedas y filtros deben responder en menos de 500ms
- La carga de categorías no debe exceder 1 segundo
- La carga de espacios por categoría no debe exceder 2 segundos

