<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

    <!-- Cabecera -->
    <div class="bg-slate-900 rounded-3xl p-8 shadow-xl text-white mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6 border border-slate-800">
      <div class="flex items-center space-x-4">
        <div class="w-16 h-16 rounded-2xl bg-yellow-500 text-slate-950 flex items-center justify-center font-bold text-2xl shadow-lg">AD</div>
        <div>
          <h1 class="text-2xl font-extrabold tracking-tight">Panel de Administración</h1>
          <p class="text-xs text-slate-400 font-semibold tracking-wider uppercase mt-1">Administrador: {{ state.admin?.nombre }}</p>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <router-link to="/admin-reportes"
          class="flex items-center justify-center space-x-2 bg-[#FFB800] hover:bg-yellow-500 text-slate-900 font-bold px-5 py-3 rounded-xl transition text-sm active:scale-95">
          <span>📊</span><span>Reportes</span>
        </router-link>
        <button @click="handleLogout" class="flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-3 rounded-xl transition text-sm active:scale-95">
          <LogOut class="w-4 h-4" /><span>Salir del Panel</span>
        </button>
      </div>
    </div>

    <!-- Estadísticas -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center space-x-4">
        <div class="p-4 bg-blue-50 text-[#003087] rounded-xl"><Users class="w-6 h-6" /></div>
        <div><h4 class="text-slate-400 font-semibold text-xs uppercase">Usuarios</h4><p class="text-2xl font-extrabold text-slate-900 mt-1">{{ users.length }}</p></div>
      </div>
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center space-x-4">
        <div class="p-4 bg-yellow-50 text-[#FFB800] rounded-xl"><ShieldCheck class="w-6 h-6" /></div>
        <div><h4 class="text-slate-400 font-semibold text-xs uppercase">Admins</h4><p class="text-2xl font-extrabold text-slate-900 mt-1">{{ admins.length }}</p></div>
      </div>
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center space-x-4">
        <div class="p-4 bg-emerald-50 text-emerald-600 rounded-xl"><CalendarCheck class="w-6 h-6" /></div>
        <div><h4 class="text-slate-400 font-semibold text-xs uppercase">Reservas Activas</h4><p class="text-2xl font-extrabold text-slate-900 mt-1">{{ reservasActivas }}</p></div>
      </div>
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center space-x-4">
        <div class="p-4 bg-purple-50 text-purple-600 rounded-xl"><Building class="w-6 h-6" /></div>
        <div><h4 class="text-slate-400 font-semibold text-xs uppercase">Espacios</h4><p class="text-2xl font-extrabold text-slate-900 mt-1">{{ espacios.length }}</p></div>
      </div>
    </div>

    <!-- Tabs de navegación -->
    <div class="flex space-x-2 mb-8 border-b border-slate-100 pb-0">
      <button v-for="tab in tabs" :key="tab.key" @click="activeTab = tab.key"
        class="px-5 py-3 text-sm font-semibold rounded-t-xl transition-all duration-200 border-b-2"
        :class="activeTab === tab.key ? 'bg-white border-[#003087] text-[#003087] shadow-sm' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'">
        {{ tab.label }}
      </button>
    </div>

    <!-- TAB: GESTIÓN DE ESPACIOS -->
    <div v-if="activeTab === 'espacios'" class="space-y-6">

      <!-- Toast -->
      <div v-if="toastMsg" class="p-3.5 rounded-xl text-sm font-medium" :class="toastType === 'ok' ? 'bg-emerald-50 border border-emerald-100 text-emerald-700' : 'bg-red-50 border border-red-100 text-red-700'">{{ toastMsg }}</div>

      <!-- Botón nuevo espacio -->
      <div class="flex justify-between items-center">
        <h3 class="text-lg font-bold text-slate-900">Espacios Universitarios</h3>
        <button @click="abrirModalCrear" class="flex items-center gap-2 bg-[#003087] text-white font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-blue-800 transition active:scale-95">
          <Plus class="w-4 h-4" /> Nuevo Espacio
        </button>
      </div>

      <!-- Tabla de espacios -->
      <div class="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-slate-100 text-slate-400 text-xs uppercase font-semibold bg-slate-50">
                <th class="py-3 px-4">ID</th>
                <th class="py-3 px-4">Nombre</th>
                <th class="py-3 px-4">Tipo</th>
                <th class="py-3 px-4">Capacidad</th>
                <th class="py-3 px-4">Horario</th>
                <th class="py-3 px-4">Ubicación</th>
                <th class="py-3 px-4">Estado</th>
                <th class="py-3 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loadingEspacios">
                <td colspan="8" class="py-10 text-center text-slate-400">Cargando espacios...</td>
              </tr>
              <tr v-else-if="espacios.length === 0">
                <td colspan="8" class="py-10 text-center text-slate-400">No hay espacios registrados.</td>
              </tr>
              <tr v-for="esp in espacios" :key="esp.id" class="border-b border-slate-50 hover:bg-slate-50/50 transition text-sm text-slate-700">
                <td class="py-3.5 px-4 font-semibold text-slate-900">#{{ esp.id }}</td>
                <td class="py-3.5 px-4 font-medium max-w-[180px] truncate">{{ esp.nombre }}</td>
                <td class="py-3.5 px-4"><span class="px-2 py-0.5 rounded bg-blue-50 text-[#003087] font-semibold text-xs">{{ esp.tipo }}</span></td>
                <td class="py-3.5 px-4">{{ esp.capacidad }} pers.</td>
                <td class="py-3.5 px-4 text-slate-600 font-medium text-xs">{{ esp.horario || 'No definido' }}</td>
                <td class="py-3.5 px-4 text-slate-500 max-w-[160px] truncate">{{ esp.ubicacion }}</td>
                <td class="py-3.5 px-4">
                  <button @click="toggleActivo(esp)" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition"
                    :class="esp.activo ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-red-50 text-red-600 hover:bg-red-100'">
                    <span class="w-1.5 h-1.5 rounded-full" :class="esp.activo ? 'bg-emerald-500' : 'bg-red-500'"></span>
                    {{ esp.activo ? 'Activo' : 'Inactivo' }}
                  </button>
                </td>
                <td class="py-3.5 px-4">
                  <div class="flex items-center justify-center gap-2">
                    <button @click="abrirModalEditar(esp)" class="p-2 text-[#003087] hover:bg-blue-50 rounded-lg transition" title="Editar"><Pencil class="w-4 h-4" /></button>
                    <button @click="confirmarEliminar(esp)" class="p-2 text-red-500 hover:bg-red-50 rounded-lg transition" title="Eliminar"><Trash2 class="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- TAB: CONTROL DE DISPONIBILIDAD -->
    <div v-if="activeTab === 'disponibilidad'" class="space-y-6">

      <!-- Toast disponibilidad -->
      <div v-if="toastMsg" class="p-3.5 rounded-xl text-sm font-medium" :class="toastType === 'ok' ? 'bg-emerald-50 border border-emerald-100 text-emerald-700' : 'bg-red-50 border border-red-100 text-red-700'">{{ toastMsg }}</div>

      <!-- Resumen de configuración activa -->
      <div class="bg-[#003087] rounded-2xl p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p class="text-xs font-semibold uppercase tracking-wider text-blue-200 mb-1">Configuración de reservas activa</p>
          <p v-if="reservationSettingsForm.fecha && reservationSettingsForm.horario" class="text-xl font-extrabold">
            📅 {{ formatFecha(reservationSettingsForm.fecha) }} &nbsp;|&nbsp; 🕐 {{ reservationSettingsForm.horario }}
          </p>
          <p v-else class="text-yellow-300 font-semibold text-sm">⚠️ Sin configuración de fecha/horario definida</p>
        </div>
        <div class="flex gap-3 text-sm">
          <div class="bg-emerald-500/20 border border-emerald-400/30 rounded-xl px-4 py-2 text-center">
            <p class="text-2xl font-extrabold text-emerald-300">{{ espaciosActivos }}</p>
            <p class="text-xs text-emerald-200 font-semibold">Activos</p>
          </div>
          <div class="bg-red-500/20 border border-red-400/30 rounded-xl px-4 py-2 text-center">
            <p class="text-2xl font-extrabold text-red-300">{{ espaciosInactivos }}</p>
            <p class="text-xs text-red-200 font-semibold">Inactivos</p>
          </div>
          <div class="bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-center">
            <p class="text-2xl font-extrabold">{{ espaciosDisponibles }}</p>
            <p class="text-xs text-blue-200 font-semibold">Disponibles</p>
          </div>
        </div>
      </div>

      <!-- Filtros -->
      <div class="flex flex-wrap gap-3 items-center">
        <span class="text-sm font-semibold text-slate-600">Filtrar por estado:</span>
        <button v-for="f in filtrosDisp" :key="f.val" @click="filtroDisp = f.val"
          class="px-4 py-1.5 rounded-full text-xs font-bold transition"
          :class="filtroDisp === f.val ? 'bg-[#003087] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'">
          {{ f.label }}
        </button>
        <span class="ml-auto text-xs text-slate-400">{{ espaciosFiltrados.length }} espacios</span>
      </div>

      <!-- Tarjetas de disponibilidad -->
      <div v-if="loadingEspacios" class="text-center py-10 text-slate-400">Cargando...</div>
      <div v-else-if="espaciosFiltrados.length === 0" class="text-center py-10 bg-white rounded-2xl border border-slate-100 text-slate-400">
        No hay espacios con ese filtro.
      </div>
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="esp in espaciosFiltrados" :key="esp.id"
          class="bg-white rounded-2xl border shadow-sm p-5 flex flex-col gap-4 transition hover:shadow-md"
          :class="esp.activo ? 'border-slate-100' : 'border-red-100 bg-red-50/30'">

          <div class="flex items-start justify-between gap-2">
            <div>
              <span class="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full"
                :class="esp.tipo === 'Laboratorios' ? 'bg-blue-50 text-blue-600' : esp.tipo === 'Canchas' ? 'bg-emerald-50 text-emerald-600' : 'bg-purple-50 text-purple-600'">
                {{ esp.tipo }}
              </span>
              <h4 class="font-bold text-slate-900 text-sm mt-2 leading-snug">{{ esp.nombre }}</h4>
              <p class="text-xs text-slate-400 mt-0.5">📍 {{ esp.ubicacion }}</p>
            </div>
            <button @click="toggleActivo(esp)"
              class="flex-shrink-0 w-12 h-6 rounded-full transition-all duration-300 relative focus:outline-none focus:ring-2 focus:ring-offset-1"
              :class="esp.activo ? 'bg-emerald-500 focus:ring-emerald-400' : 'bg-slate-300 focus:ring-slate-400'"
              :title="esp.activo ? 'Desactivar espacio' : 'Activar espacio'">
              <span class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300"
                :class="esp.activo ? 'translate-x-6' : 'translate-x-0'"></span>
            </button>
          </div>

          <div class="rounded-xl p-3 text-xs font-semibold"
            :class="!esp.activo ? 'bg-red-50 text-red-600 border border-red-100' :
                    esp.disponible ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                    'bg-amber-50 text-amber-700 border border-amber-100'">
            <span v-if="!esp.activo">🔴 Espacio desactivado — no visible para usuarios</span>
            <span v-else-if="esp.disponible">🟢 Disponible para reservar en la fecha configurada</span>
            <span v-else>🟡 Ocupado — ya tiene reserva confirmada en la fecha configurada</span>
          </div>

          <div class="flex items-center justify-between text-xs text-slate-500">
            <span>👥 Capacidad: <strong class="text-slate-700">{{ esp.capacidad }} personas</strong></span>
            <span class="font-semibold" :class="esp.activo ? 'text-emerald-600' : 'text-red-500'">
              {{ esp.activo ? 'Activo' : 'Inactivo' }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB: RESERVAS ACTIVAS -->
    <div v-if="activeTab === 'reservas'" class="space-y-6">

      <!-- Toast -->
      <div v-if="toastMsg" class="p-3.5 rounded-xl text-sm font-medium" :class="toastType === 'ok' ? 'bg-emerald-50 border border-emerald-100 text-emerald-700' : 'bg-red-50 border border-red-100 text-red-700'">{{ toastMsg }}</div>

      <!-- Encabezado + filtros -->
      <div class="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 class="text-lg font-bold text-slate-900">Reservas Activas</h3>
            <p class="text-xs text-slate-500 mt-0.5">{{ reservas.length }} reserva{{ reservas.length !== 1 ? 's' : '' }} con estado <span class="font-semibold text-emerald-600">confirmado</span></p>
          </div>
          <button @click="fetchReservas" class="flex items-center gap-2 text-sm font-semibold text-[#003087] hover:bg-blue-50 px-4 py-2 rounded-xl transition">
            🔄 Actualizar
          </button>
        </div>

        <!-- Filtros -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div class="sm:col-span-2">
            <label class="block text-xs font-bold text-slate-400 mb-1">Buscar por usuario o espacio</label>
            <input v-model="busquedaReservas" @input="fetchReservas" type="text"
              class="form-input text-sm" placeholder="Ej: Juan Pérez, Laboratorio...">
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-400 mb-1">Filtrar por fecha</label>
            <input v-model="filtroFechaReservas" @change="fetchReservas" type="date" class="form-input text-sm">
          </div>
        </div>
        <div v-if="busquedaReservas || filtroFechaReservas" class="flex justify-end">
          <button @click="limpiarFiltrosReservas" class="text-xs text-slate-500 hover:text-red-500 font-semibold transition">
            ✕ Limpiar filtros
          </button>
        </div>
      </div>

      <!-- Tabla -->
      <div class="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-slate-100 text-slate-400 text-xs uppercase font-semibold bg-slate-50">
                <th class="py-3 px-4">ID</th>
                <th class="py-3 px-4">Usuario</th>
                <th class="py-3 px-4">Espacio</th>
                <th class="py-3 px-4">Tipo</th>
                <th class="py-3 px-4">Fecha</th>
                <th class="py-3 px-4">Horario</th>
                <th class="py-3 px-4">Estado</th>
                <th class="py-3 px-4 text-center">Acción</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loadingReservas">
                <td colspan="8" class="py-12 text-center text-slate-400">
                  <div class="flex items-center justify-center gap-2">
                    <span class="w-4 h-4 border-2 border-[#003087] border-t-transparent rounded-full animate-spin"></span>
                    Cargando reservas...
                  </div>
                </td>
              </tr>
              <tr v-else-if="reservas.length === 0">
                <td colspan="8" class="py-16 text-center">
                  <div class="space-y-2">
                    <p class="text-3xl">📋</p>
                    <p class="font-bold text-slate-500">No hay reservas activas</p>
                    <p class="text-xs text-slate-400">{{ busquedaReservas || filtroFechaReservas ? 'No se encontraron resultados con ese filtro.' : 'No existen reservas confirmadas en este momento.' }}</p>
                  </div>
                </td>
              </tr>
              <tr v-for="r in reservas" :key="r.id" class="border-b border-slate-50 hover:bg-slate-50/50 transition text-sm text-slate-700">
                <td class="py-3.5 px-4 font-semibold text-slate-400 text-xs">#{{ r.id }}</td>
                <td class="py-3.5 px-4">
                  <div>
                    <p class="font-semibold text-slate-900">{{ r.usuario_nombre }}</p>
                    <p class="text-xs text-slate-400">{{ r.usuario_email }}</p>
                  </div>
                </td>
                <td class="py-3.5 px-4">
                  <p class="font-medium text-slate-800 max-w-[180px] truncate" :title="r.espacio_nombre">{{ r.espacio_nombre }}</p>
                  <p class="text-xs text-slate-400">{{ r.espacio_ubicacion }}</p>
                </td>
                <td class="py-3.5 px-4">
                  <span class="px-2 py-0.5 rounded text-xs font-bold"
                    :class="r.espacio_tipo === 'Laboratorios' ? 'bg-blue-50 text-blue-600' : r.espacio_tipo === 'Canchas' ? 'bg-emerald-50 text-emerald-600' : 'bg-purple-50 text-purple-600'">
                    {{ r.espacio_tipo }}
                  </span>
                </td>
                <td class="py-3.5 px-4 font-medium text-slate-700 whitespace-nowrap">{{ r.fecha }}</td>
                <td class="py-3.5 px-4 text-slate-600 whitespace-nowrap">{{ r.horario }}</td>
                <td class="py-3.5 px-4">
                  <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    {{ r.estado }}
                  </span>
                </td>
                <td class="py-3.5 px-4 text-center">
                  <button @click="abrirCancelModal(r)"
                    class="flex items-center gap-1.5 mx-auto text-xs font-bold text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition active:scale-95">
                    ✕ Cancelar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- MODAL CANCELAR RESERVA (ADMIN) -->
    <div v-if="showCancelModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div class="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-md w-full overflow-hidden">
        <div class="h-1.5 bg-red-500"></div>
        <div class="p-6 space-y-4">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-xl bg-red-50 text-red-500 flex items-center justify-center flex-shrink-0">
              <Trash2 class="w-6 h-6" />
            </div>
            <div>
              <h3 class="text-base font-bold text-slate-900">Cancelar Reserva</h3>
              <p class="text-xs text-slate-500 mt-0.5">Esta acción no se puede deshacer</p>
            </div>
          </div>

          <div class="bg-slate-50 rounded-xl p-4 space-y-1.5 text-sm">
            <p><span class="text-slate-400 text-xs font-semibold uppercase">Usuario</span><br><span class="font-semibold text-slate-800">{{ reservaACancelar?.usuario_nombre }}</span> <span class="text-slate-400 text-xs">{{ reservaACancelar?.usuario_email }}</span></p>
            <p><span class="text-slate-400 text-xs font-semibold uppercase">Espacio</span><br><span class="font-semibold text-slate-800">{{ reservaACancelar?.espacio_nombre }}</span></p>
            <p><span class="text-slate-400 text-xs font-semibold uppercase">Fecha y Horario</span><br><span class="font-semibold text-slate-800">{{ reservaACancelar?.fecha }} — {{ reservaACancelar?.horario }}</span></p>
          </div>

          <div v-if="cancelError" class="p-3 bg-red-50 border border-red-100 text-red-700 rounded-xl text-xs font-medium">{{ cancelError }}</div>

          <div class="flex gap-3 pt-1">
            <button @click="showCancelModal = false; cancelError = ''" class="flex-1 border border-slate-200 text-slate-600 font-semibold py-2.5 rounded-xl text-sm hover:bg-slate-50 transition">
              Mantener reserva
            </button>
            <button @click="confirmarCancelacion" :disabled="cancelando"
              class="flex-1 bg-red-600 text-white font-bold py-2.5 rounded-xl text-sm hover:bg-red-700 transition disabled:opacity-50 active:scale-95">
              {{ cancelando ? 'Cancelando...' : 'Sí, cancelar reserva' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB: CONFIGURACIÓN DE RESERVAS -->
    <div v-if="activeTab === 'configuracion'" class="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
      <div class="mb-6">
        <h3 class="text-lg font-bold text-slate-900">Configuración de Reservas</h3>
        <p class="text-sm text-slate-500 mt-1">Define la fecha y el horario global que se asignará a todas las reservas de usuarios.</p>
      </div>
      <div v-if="settingsMessage" class="mb-4 p-3.5 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-sm font-medium">{{ settingsMessage }}</div>
      <div v-if="settingsError" class="mb-4 p-3.5 bg-red-50 border border-red-100 text-red-700 rounded-xl text-sm font-medium">{{ settingsError }}</div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-bold text-slate-500 mb-1">Fecha de reserva</label>
          <input v-model="reservationSettingsForm.fecha" type="date" class="form-input text-sm" :min="todayDate">
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-500 mb-1">Horario de reserva</label>
          <select v-model="reservationSettingsForm.horario" class="form-input text-sm">
            <option value="" disabled>Selecciona un horario</option>
            <option v-for="h in availableHorarios" :key="h" :value="h">{{ h }}</option>
          </select>
        </div>
      </div>
      <div class="flex items-center justify-between gap-4 mt-6">
        <p class="text-xs text-slate-500">
          Configuración actual:
          <span v-if="reservationSettingsForm.fecha && reservationSettingsForm.horario" class="font-semibold text-slate-700">{{ reservationSettingsForm.fecha }} | {{ reservationSettingsForm.horario }}</span>
          <span v-else class="font-semibold text-amber-600">Sin configuración definida</span>
        </p>
        <button @click="saveReservationSettings" :disabled="savingSettings || !reservationSettingsForm.fecha || !reservationSettingsForm.horario"
          class="bg-[#003087] text-white font-bold px-5 py-3 rounded-xl text-sm hover:bg-blue-800 transition disabled:opacity-50">
          {{ savingSettings ? 'Guardando...' : 'Guardar Configuración' }}
        </button>
      </div>
    </div>

    <!-- TAB: GESTIÓN DE USUARIOS HU10 -->
    <div v-if="activeTab === 'usuarios'" class="space-y-6">

      <!-- Toast -->
      <div v-if="toastMsg" class="p-3.5 rounded-xl text-sm font-medium" :class="toastType === 'ok' ? 'bg-emerald-50 border border-emerald-100 text-emerald-700' : 'bg-red-50 border border-red-100 text-red-700'">{{ toastMsg }}</div>

      <!-- Filtros -->
      <div class="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 class="text-lg font-bold text-slate-900">Gestión de Usuarios</h3>
            <p class="text-xs text-slate-500 mt-0.5">{{ usuariosGestion.length }} usuario{{ usuariosGestion.length !== 1 ? 's' : '' }} encontrado{{ usuariosGestion.length !== 1 ? 's' : '' }}</p>
          </div>
          <button @click="fetchUsuariosGestion" class="text-sm font-semibold text-[#003087] hover:bg-blue-50 px-4 py-2 rounded-xl transition">🔄 Actualizar</button>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div class="sm:col-span-1">
            <label class="block text-xs font-bold text-slate-400 mb-1">Buscar por nombre o email</label>
            <input v-model="busquedaUsuarios" @input="fetchUsuariosGestion" type="text" class="form-input text-sm" placeholder="Ej: Juan, juan@email.com...">
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-400 mb-1">Filtrar por rol</label>
            <select v-model="filtroRol" @change="fetchUsuariosGestion" class="form-input text-sm">
              <option value="">Todos los roles</option>
              <option value="usuario">Usuario</option>
              <option value="admin">Admin</option>
              <option value="invitado">Invitado</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-400 mb-1">Filtrar por estado</label>
            <select v-model="filtroEstado" @change="fetchUsuariosGestion" class="form-input text-sm">
              <option value="">Todos</option>
              <option value="activo">Activos</option>
              <option value="inactivo">Inactivos</option>
            </select>
          </div>
        </div>
        <div v-if="busquedaUsuarios || filtroRol || filtroEstado" class="flex justify-end">
          <button @click="busquedaUsuarios=''; filtroRol=''; filtroEstado=''; fetchUsuariosGestion()" class="text-xs text-slate-400 hover:text-red-500 font-semibold transition">✕ Limpiar filtros</button>
        </div>
      </div>

      <!-- Tabla -->
      <div class="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-slate-100 text-slate-400 text-xs uppercase font-semibold bg-slate-50">
                <th class="py-3 px-4">ID</th>
                <th class="py-3 px-4">Nombre</th>
                <th class="py-3 px-4">Email</th>
                <th class="py-3 px-4">Rol</th>
                <th class="py-3 px-4">Estado</th>
                <th class="py-3 px-4">Registro</th>
                <th class="py-3 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loadingUsuarios">
                <td colspan="7" class="py-12 text-center text-slate-400">
                  <span class="w-4 h-4 border-2 border-[#003087] border-t-transparent rounded-full animate-spin inline-block mr-2"></span>Cargando...
                </td>
              </tr>
              <tr v-else-if="usuariosGestion.length === 0">
                <td colspan="7" class="py-14 text-center">
                  <p class="text-3xl mb-2">👤</p>
                  <p class="font-bold text-slate-500">Sin usuarios encontrados</p>
                  <p class="text-xs text-slate-400 mt-1">{{ busquedaUsuarios || filtroRol || filtroEstado ? 'Prueba con otros filtros.' : 'No hay usuarios registrados.' }}</p>
                </td>
              </tr>
              <tr v-for="u in usuariosGestion" :key="u.id" class="border-b border-slate-50 hover:bg-slate-50/50 transition text-sm text-slate-700"
                :class="!u.activo ? 'opacity-60' : ''">
                <td class="py-3.5 px-4 text-xs font-semibold text-slate-400">#{{ u.id }}</td>
                <td class="py-3.5 px-4 font-semibold text-slate-900">{{ u.nombre }}</td>
                <td class="py-3.5 px-4 text-[#003087] font-medium text-xs">{{ u.email }}</td>
                <td class="py-3.5 px-4">
                  <span class="px-2.5 py-1 rounded-full text-xs font-bold"
                    :class="u.rol === 'admin' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                            u.rol === 'invitado' ? 'bg-slate-100 text-slate-500' :
                            'bg-blue-50 text-[#003087]'">
                    {{ u.rol }}
                  </span>
                </td>
                <td class="py-3.5 px-4">
                  <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
                    :class="u.activo ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'">
                    <span class="w-1.5 h-1.5 rounded-full" :class="u.activo ? 'bg-emerald-500' : 'bg-red-500'"></span>
                    {{ u.activo ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>
                <td class="py-3.5 px-4 text-xs text-slate-400">{{ formatDate(u.fecha_registro) }}</td>
                <td class="py-3.5 px-4">
                  <div class="flex items-center justify-center gap-1.5">
                    <button @click="abrirRolModal(u)" class="p-1.5 text-[#003087] hover:bg-blue-50 rounded-lg transition" title="Cambiar rol">
                      <Pencil class="w-3.5 h-3.5" />
                    </button>
                    <button @click="abrirEstadoModal(u)" class="p-1.5 rounded-lg transition"
                      :class="u.activo ? 'text-red-500 hover:bg-red-50' : 'text-emerald-600 hover:bg-emerald-50'"
                      :title="u.activo ? 'Desactivar cuenta' : 'Activar cuenta'">
                      <component :is="u.activo ? 'UserX' : 'UserCheck'" class="w-3.5 h-3.5" />
                    </button>
                    <button @click="verAuditoria(u)" class="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg transition" title="Ver historial">
                      <ClipboardList class="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- MODAL CAMBIAR ROL -->
    <div v-if="showRolModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div class="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-sm w-full overflow-hidden">
        <div class="h-1.5 bg-[#003087]"></div>
        <div class="p-6 space-y-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-blue-50 text-[#003087] flex items-center justify-center"><Pencil class="w-5 h-5" /></div>
            <div><h3 class="font-bold text-slate-900">Cambiar Rol</h3><p class="text-xs text-slate-400">{{ usuarioEditandoRol?.nombre }}</p></div>
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 mb-1">Nuevo rol</label>
            <select v-model="nuevoRol" class="form-input text-sm">
              <option value="usuario">Usuario</option>
              <option value="admin">Admin</option>
              <option value="invitado">Invitado</option>
            </select>
          </div>
          <div v-if="rolError" class="p-3 bg-red-50 border border-red-100 text-red-700 rounded-xl text-xs">{{ rolError }}</div>
          <div class="flex gap-3">
            <button @click="showRolModal=false" class="flex-1 border border-slate-200 text-slate-600 font-semibold py-2.5 rounded-xl text-sm hover:bg-slate-50 transition">Cancelar</button>
            <button @click="confirmarCambioRol" :disabled="cambiandoRol || nuevoRol === usuarioEditandoRol?.rol"
              class="flex-1 bg-[#003087] text-white font-bold py-2.5 rounded-xl text-sm hover:bg-blue-800 transition disabled:opacity-50">
              {{ cambiandoRol ? 'Guardando...' : 'Confirmar cambio' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL CAMBIAR ESTADO -->
    <div v-if="showEstadoModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div class="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-sm w-full overflow-hidden">
        <div class="h-1.5" :class="usuarioEditandoEstado?.activo ? 'bg-red-500' : 'bg-emerald-500'"></div>
        <div class="p-6 space-y-4 text-center">
          <div class="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto"
            :class="usuarioEditandoEstado?.activo ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-600'">
            <component :is="usuarioEditandoEstado?.activo ? 'UserX' : 'UserCheck'" class="w-7 h-7" />
          </div>
          <div>
            <h3 class="text-base font-bold text-slate-900">{{ usuarioEditandoEstado?.activo ? 'Desactivar' : 'Activar' }} Usuario</h3>
            <p class="text-sm text-slate-500 mt-1">
              ¿Confirmas {{ usuarioEditandoEstado?.activo ? 'desactivar' : 'activar' }} la cuenta de
              <span class="font-semibold text-slate-800">{{ usuarioEditandoEstado?.nombre }}</span>?
            </p>
            <p v-if="usuarioEditandoEstado?.activo" class="text-xs text-slate-400 mt-2">El usuario no podrá iniciar sesión. Sus reservas anteriores se conservarán.</p>
          </div>
          <div v-if="estadoError" class="p-3 bg-red-50 border border-red-100 text-red-700 rounded-xl text-xs">{{ estadoError }}</div>
          <div class="flex gap-3">
            <button @click="showEstadoModal=false" class="flex-1 border border-slate-200 text-slate-600 font-semibold py-2.5 rounded-xl text-sm hover:bg-slate-50 transition">Cancelar</button>
            <button @click="confirmarCambioEstado" :disabled="cambiandoEstado"
              class="flex-1 text-white font-bold py-2.5 rounded-xl text-sm transition disabled:opacity-50"
              :class="usuarioEditandoEstado?.activo ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'">
              {{ cambiandoEstado ? 'Procesando...' : (usuarioEditandoEstado?.activo ? 'Sí, desactivar' : 'Sí, activar') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL AUDITORÍA -->
    <div v-if="showAuditoriaModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div class="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden">
        <div class="h-1.5 bg-slate-700"></div>
        <div class="p-6">
          <div class="flex items-center justify-between mb-5">
            <div>
              <h3 class="font-bold text-slate-900">Historial de Auditoría</h3>
              <p class="text-xs text-slate-400 mt-0.5">{{ auditoriaUsuario?.nombre }} — {{ auditoriaUsuario?.email }}</p>
            </div>
            <button @click="showAuditoriaModal=false" class="p-2 hover:bg-slate-100 rounded-lg transition text-slate-400">✕</button>
          </div>
          <div v-if="auditoriaData.length === 0" class="text-center py-8 text-slate-400">
            <p class="text-2xl mb-2">📋</p>Sin registros de auditoría.
          </div>
          <div v-else class="space-y-3 max-h-80 overflow-y-auto pr-1">
            <div v-for="a in auditoriaData" :key="a.id"
              class="flex items-start gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50 text-sm">
              <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold"
                :class="a.accion === 'DESACTIVACION' ? 'bg-red-100 text-red-600' :
                        a.accion === 'ACTIVACION' ? 'bg-emerald-100 text-emerald-600' :
                        'bg-blue-100 text-blue-600'">
                {{ a.accion === 'DESACTIVACION' ? '🔴' : a.accion === 'ACTIVACION' ? '🟢' : '✏️' }}
              </div>
              <div class="flex-grow">
                <p class="font-semibold text-slate-800 text-xs">{{ a.accion.replace('_', ' ') }}</p>
                <p class="text-xs text-slate-500 mt-0.5">{{ a.detalle }}</p>
                <p class="text-xs text-slate-400 mt-1">Admin: {{ a.admin_nombre }} · {{ new Date(a.fecha).toLocaleString('es-ES') }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB: ADMINISTRADORES -->
    <div v-if="activeTab === 'admins'" class="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
      <h3 class="text-lg font-bold text-slate-900 mb-6 flex items-center space-x-2"><ShieldCheck class="w-5 h-5 text-[#FFB800]" /><span>Administradores del Sistema</span></h3>
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead><tr class="border-b border-slate-100 text-slate-400 text-xs uppercase font-semibold">
            <th class="py-3 px-4">ID</th><th class="py-3 px-4">Nombre</th><th class="py-3 px-4">Email</th><th class="py-3 px-4">Rol</th><th class="py-3 px-4">Estado</th>
          </tr></thead>
          <tbody>
            <tr v-for="adm in admins" :key="adm.id" class="border-b border-slate-50 hover:bg-slate-50/50 text-sm text-slate-700">
              <td class="py-3.5 px-4 font-semibold text-slate-900">#{{ adm.id }}</td>
              <td class="py-3.5 px-4">{{ adm.nombre }}</td>
              <td class="py-3.5 px-4 text-[#003087] font-medium">{{ adm.email }}</td>
              <td class="py-3.5 px-4"><span class="px-2 py-0.5 rounded bg-slate-100 font-semibold text-xs text-slate-600 uppercase">{{ adm.rol }}</span></td>
              <td class="py-3.5 px-4">
                <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold" :class="adm.activo ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'">
                  <span class="w-1.5 h-1.5 rounded-full" :class="adm.activo ? 'bg-emerald-500' : 'bg-red-500'"></span>
                  {{ adm.activo ? 'Activo' : 'Inactivo' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- MODAL CREAR / EDITAR ESPACIO -->
    <div v-if="showEspacioModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div class="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden">
        <div class="h-1.5 bg-[#003087]"></div>
        <div class="p-6">
          <h3 class="text-lg font-bold text-slate-900 mb-5">{{ editando ? 'Editar Espacio' : 'Nuevo Espacio' }}</h3>

          <div v-if="formError" class="mb-4 p-3 bg-red-50 border border-red-100 text-red-700 rounded-xl text-xs font-medium">{{ formError }}</div>

          <div class="grid grid-cols-1 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-500 mb-1">Nombre <span class="text-red-500">*</span></label>
              <input v-model="form.nombre" type="text" class="form-input text-sm" placeholder="Ej: Laboratorio de Computación B3" maxlength="200">
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label class="block text-xs font-bold text-slate-500 mb-1">Tipo <span class="text-red-500">*</span></label>
                <select v-model="form.tipo" class="form-input text-sm">
                  <option value="" disabled>Selecciona un tipo</option>
                  <option value="Laboratorios">Laboratorios</option>
                  <option value="Canchas">Canchas</option>
                  <option value="Salas">Salas</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-500 mb-1">Capacidad <span class="text-red-500">*</span></label>
                <input v-model="form.capacidad" type="number" min="1" class="form-input text-sm" placeholder="Ej: 30">
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-500 mb-1">Horario Disponible <span class="text-red-500">*</span></label>
                <div class="flex gap-2">
                  <select v-model="form.horario" class="form-input text-sm flex-1">
                    <option value="" disabled>Selecciona un horario</option>
                    <option v-for="h in availableHorarios" :key="h" :value="h">{{ h }}</option>
                    <option value="personalizado">📝 Horario personalizado</option>
                  </select>
                  <input v-if="form.horario === 'personalizado'" v-model="horarioPersonalizado" 
                    type="text" 
                    placeholder="Ej: 09:30 - 11:30"
                    class="form-input text-sm w-40"
                    @blur="aplicarHorarioPersonalizado">
                </div>
                <p v-if="form.horario === 'personalizado'" class="text-xs text-slate-500 mt-1">
                  Formato: HH:MM - HH:MM (ej: 09:30 - 11:30)
                </p>
              </div>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 mb-1">Ubicación <span class="text-red-500">*</span></label>
              <input v-model="form.ubicacion" type="text" class="form-input text-sm" placeholder="Ej: Bloque B, Segundo Piso" maxlength="200">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 mb-1">Descripción</label>
              <textarea v-model="form.descripcion" class="form-input text-sm" rows="2" placeholder="Descripción breve del espacio..."></textarea>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 mb-1">Imagen del Espacio</label>

              <!-- Zona de carga -->
              <div
                class="border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition hover:border-[#003087] hover:bg-blue-50/30"
                :class="form.imagen ? 'border-emerald-300 bg-emerald-50/20' : 'border-slate-200'"
                @click="$refs.inputImagen.click()"
                @dragover.prevent
                @drop.prevent="onDropImagen"
              >
                <!-- Previsualización -->
                <div v-if="form.imagen" class="relative">
                  <img :src="form.imagen" :alt="form.nombre" class="w-full h-40 object-cover rounded-lg mx-auto">
                  <button type="button" @click.stop="quitarImagen"
                    class="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition shadow">
                    ✕
                  </button>
                  <p class="text-xs text-emerald-600 font-semibold mt-2">✓ Imagen cargada</p>
                </div>
                <!-- Sin imagen -->
                <div v-else class="py-4 space-y-2">
                  <div class="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto text-2xl">🖼️</div>
                  <p class="text-sm font-semibold text-slate-600">Haz clic o arrastra una imagen aquí</p>
                  <p class="text-xs text-slate-400">JPG, PNG o WEBP · Máx. 5 MB</p>
                </div>
              </div>

              <!-- Input oculto -->
              <input
                ref="inputImagen"
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                class="hidden"
                @change="onSeleccionarImagen"
              >

              <!-- Estado subida -->
              <p v-if="subiendoImagen" class="text-xs text-[#003087] font-semibold mt-2 flex items-center gap-1.5">
                <span class="w-3 h-3 border-2 border-[#003087] border-t-transparent rounded-full animate-spin"></span>
                Subiendo imagen...
              </p>
              <p v-if="imagenError" class="text-xs text-red-500 font-semibold mt-1.5">{{ imagenError }}</p>
            </div>
          </div>

          <div class="flex space-x-3 mt-6">
            <button @click="cerrarModal" class="flex-1 border border-slate-200 text-slate-700 font-semibold py-2.5 rounded-xl text-sm hover:bg-slate-50 transition active:scale-95">Cancelar</button>
            <button @click="guardarEspacio" :disabled="guardando" class="flex-1 bg-[#003087] text-white font-bold py-2.5 rounded-xl text-sm hover:bg-blue-800 transition active:scale-95 disabled:opacity-50">
              {{ guardando ? 'Guardando...' : (editando ? 'Guardar Cambios' : 'Crear Espacio') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL CONFIRMAR ELIMINAR -->
    <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div class="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-sm w-full overflow-hidden">
        <div class="h-1.5 bg-red-500"></div>
        <div class="p-6 text-center space-y-4">
          <div class="w-14 h-14 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mx-auto"><Trash2 class="w-7 h-7" /></div>
          <h3 class="text-lg font-bold text-slate-900">Eliminar Espacio</h3>
          <p class="text-sm text-slate-500">¿Estás seguro de eliminar <span class="font-semibold text-slate-800">{{ espacioAEliminar?.nombre }}</span>? Esta acción no se puede deshacer.</p>
          <div v-if="deleteError" class="p-3 bg-red-50 border border-red-100 text-red-700 rounded-xl text-xs font-medium">{{ deleteError }}</div>
          <div class="flex gap-3 pt-2">
            <button @click="showDeleteModal = false; deleteError = ''" class="flex-1 border border-slate-200 text-slate-600 font-semibold py-2.5 rounded-xl text-sm hover:bg-slate-50 transition">Cancelar</button>
            <button @click="eliminarEspacio" :disabled="eliminando" class="flex-1 bg-red-600 text-white font-bold py-2.5 rounded-xl text-sm hover:bg-red-700 transition disabled:opacity-50">
              {{ eliminando ? 'Eliminando...' : 'Sí, eliminar' }}
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import { Users, ShieldCheck, CalendarCheck, LogOut, Building, Plus, Pencil, Trash2, UserX, UserCheck as UserCheckIcon, ClipboardList } from 'lucide-vue-next';
import { authState } from '../router';

const FORM_VACIO = { nombre: '', tipo: '', capacidad: '', ubicacion: '', descripcion: '', imagen: '', horario: '' };

export default {
  name: 'AdminDashboardView',
  components: { Users, ShieldCheck, CalendarCheck, LogOut, Building, Plus, Pencil, Trash2, UserX, UserCheck: UserCheckIcon, ClipboardList },
  data() {
    return {
      state: authState,
      activeTab: 'espacios',
      tabs: [
        { key: 'espacios',       label: '🏛️ Gestión de Espacios' },
        { key: 'disponibilidad', label: '🔛 Control de Disponibilidad' },
        { key: 'reservas',       label: '📋 Reservas Activas' },
        { key: 'usuarios',       label: '👤 Gestión de Usuarios' },
        { key: 'configuracion',  label: '⚙️ Configuración de Reservas' },
        { key: 'admins',         label: '🛡️ Administradores' }
      ],
      users: [], admins: [], reservasActivas: 0,
      espacios: [], loadingEspacios: false,
      // Modal crear/editar
      showEspacioModal: false, editando: false,
      form: { ...FORM_VACIO },
      formError: '', guardando: false,
      espacioEditandoId: null,
      imagenError: false,
      subiendoImagen: false,
      horarioPersonalizado: '',
      // Modal eliminar
      showDeleteModal: false, espacioAEliminar: null,
      deleteError: '', eliminando: false,
      // Toast
      toastMsg: '', toastType: 'ok',
      // Reservas admin
      reservas: [], loadingReservas: false,
      busquedaReservas: '', filtroFechaReservas: '',
      reservaACancelar: null, showCancelModal: false,
      cancelando: false, cancelError: '',
      // Gestión de usuarios HU10
      usuariosGestion: [], loadingUsuarios: false,
      busquedaUsuarios: '', filtroRol: '', filtroEstado: '',
      showRolModal: false, usuarioEditandoRol: null, nuevoRol: '',
      cambiandoRol: false, rolError: '',
      showEstadoModal: false, usuarioEditandoEstado: null,
      cambiandoEstado: false, estadoError: '',
      showAuditoriaModal: false, auditoriaData: [], auditoriaUsuario: null,
      // Disponibilidad
      filtroDisp: 'todos',
      filtrosDisp: [
        { val: 'todos',     label: 'Todos' },
        { val: 'activos',   label: '🟢 Activos' },
        { val: 'inactivos', label: '🔴 Inactivos' },
        { val: 'ocupados',  label: '🟡 Ocupados' }
      ],
      // Configuración reservas
      reservationSettingsForm: { fecha: '', horario: '' },
      availableHorarios: ['08:00 - 10:00','10:00 - 12:00','12:00 - 14:00','14:00 - 16:00','16:00 - 18:00'],
      savingSettings: false, settingsMessage: '', settingsError: ''
    };
  },
  computed: {
    todayDate() { return new Date().toISOString().split('T')[0]; },
    espaciosActivos()     { return this.espacios.filter(e => e.activo).length; },
    espaciosInactivos()   { return this.espacios.filter(e => !e.activo).length; },
    espaciosDisponibles() { return this.espacios.filter(e => e.activo && e.disponible).length; },
    espaciosFiltrados() {
      if (this.filtroDisp === 'activos')   return this.espacios.filter(e => e.activo);
      if (this.filtroDisp === 'inactivos') return this.espacios.filter(e => !e.activo);
      if (this.filtroDisp === 'ocupados')  return this.espacios.filter(e => e.activo && !e.disponible);
      return this.espacios;
    }
  },
  mounted() {
    this.fetchDashboardData();
    this.fetchEspacios();
    this.fetchReservas();
    this.fetchUsuariosGestion();
  },
  methods: {
    async fetchDashboardData() {
      try {
        const res = await fetch('/api/admin/dashboard-data');
        const data = await res.json();
        if (data.success) {
          this.users = data.usuarios || [];
          this.admins = data.administradores || [];
          this.reservasActivas = data.reservasActivas ?? 0;
          this.reservationSettingsForm.fecha = data.configuracionReserva?.fecha || '';
          this.reservationSettingsForm.horario = data.configuracionReserva?.horario || '';
        }
      } catch (e) { console.error(e); }
    },
    async fetchEspacios() {
      this.loadingEspacios = true;
      try {
        // Usa el endpoint público que incluye disponible, horarios_ocupados, etc.
        const res = await fetch('/api/espacios/admin/todos');
        const data = await res.json();
        if (data.success) this.espacios = data.espacios || [];
      } catch (e) { console.error(e); }
      finally { this.loadingEspacios = false; }
    },
    abrirModalCrear() {
      this.editando = false;
      this.form = { ...FORM_VACIO };
      this.formError = '';
      this.imagenError = false;
      this.subiendoImagen = false;
      this.espacioEditandoId = null;
      this.horarioPersonalizado = '';
      this.showEspacioModal = true;
    },
    abrirModalEditar(esp) {
      this.editando = true;
      this.espacioEditandoId = esp.id;
      this.imagenError = false;
      this.subiendoImagen = false;
      this.form = {
        nombre: esp.nombre, tipo: esp.tipo, capacidad: esp.capacidad,
        ubicacion: esp.ubicacion, descripcion: esp.descripcion || '',
        imagen: esp.imagen || '', horario: esp.horario || ''
      };
      // Si el horario no está en la lista predefinida, es personalizado
      this.horarioPersonalizado = '';
      if (esp.horario && !this.availableHorarios.includes(esp.horario)) {
        this.horarioPersonalizado = esp.horario;
        this.form.horario = 'personalizado';
      }
      this.formError = '';
      this.showEspacioModal = true;
    },
    cerrarModal() { 
      this.showEspacioModal = false; 
      this.formError = ''; 
      this.horarioPersonalizado = '';
    },
    aplicarHorarioPersonalizado() {
      if (this.horarioPersonalizado.trim()) {
        // Validar formato básico HH:MM - HH:MM
        const horarioPattern = /^\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2}$/;
        if (horarioPattern.test(this.horarioPersonalizado.trim())) {
          this.form.horario = this.horarioPersonalizado.trim();
        } else {
          this.formError = 'Formato de horario inválido. Use: HH:MM - HH:MM (ej: 09:30 - 11:30)';
        }
      }
    },
    async subirImagen(file) {
      if (!file) return;
      const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowed.includes(file.type)) {
        this.imagenError = 'Solo se permiten imágenes JPG, PNG o WEBP.'; return;
      }
      if (file.size > 5 * 1024 * 1024) {
        this.imagenError = 'La imagen no puede superar 5 MB.'; return;
      }
      this.subiendoImagen = true;
      this.imagenError = false;
      try {
        const fd = new FormData();
        fd.append('imagen', file);
        const res = await fetch('/api/upload/imagen', { method: 'POST', body: fd });
        const data = await res.json();
        if (data.success) {
          this.form.imagen = data.url;
        } else {
          this.imagenError = data.message || 'Error al subir la imagen';
        }
      } catch {
        this.imagenError = 'Error de conexión al subir la imagen';
      } finally {
        this.subiendoImagen = false;
      }
    },
    onSeleccionarImagen(e) {
      const file = e.target.files[0];
      if (file) this.subirImagen(file);
      e.target.value = '';
    },
    onDropImagen(e) {
      const file = e.dataTransfer.files[0];
      if (file) this.subirImagen(file);
    },
    quitarImagen() {
      this.form.imagen = '';
      this.imagenError = false;
    },
    async guardarEspacio() {
      this.guardando = true; this.formError = '';
      try {
        const url = this.editando ? `/api/espacios/${this.espacioEditandoId}` : '/api/espacios';
        const method = this.editando ? 'PUT' : 'POST';
        const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(this.form) });
        const data = await res.json();
        if (data.success) {
          this.showEspacioModal = false;
          this.mostrarToast(data.message, 'ok');
          await this.fetchEspacios();
        } else {
          this.formError = data.message;
        }
      } catch (e) { this.formError = 'Error de conexión'; }
      finally { this.guardando = false; }
    },
    confirmarEliminar(esp) {
      this.espacioAEliminar = esp;
      this.deleteError = '';
      this.showDeleteModal = true;
    },
    async eliminarEspacio() {
      this.eliminando = true; this.deleteError = '';
      try {
        const res = await fetch(`/api/espacios/${this.espacioAEliminar.id}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
          this.showDeleteModal = false;
          this.mostrarToast(data.message, 'ok');
          await this.fetchEspacios();
        } else {
          this.deleteError = data.message;
        }
      } catch (e) { this.deleteError = 'Error de conexión'; }
      finally { this.eliminando = false; }
    },
    async toggleActivo(esp) {
      try {
        const res = await fetch(`/api/espacios/${esp.id}/toggle-activo`, { method: 'PATCH' });
        const data = await res.json();
        if (data.success) {
          esp.activo = data.espacio.activo;
          this.mostrarToast(data.message, 'ok');
        } else {
          this.mostrarToast(data.message, 'err');
        }
      } catch (e) { this.mostrarToast('Error de conexión', 'err'); }
    },
    mostrarToast(msg, type = 'ok') {
      this.toastMsg = msg; this.toastType = type;
      setTimeout(() => { this.toastMsg = ''; }, 6000);
    },
    async saveReservationSettings() {
      this.savingSettings = true; this.settingsMessage = ''; this.settingsError = '';
      try {
        const res = await fetch('/api/admin/reservation-settings', {
          method: 'PUT', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.reservationSettingsForm)
        });
        const data = await res.json();
        if (data.success) {
          this.settingsMessage = data.message;
          this.reservationSettingsForm.fecha = data.configuracionReserva?.fecha || '';
          this.reservationSettingsForm.horario = data.configuracionReserva?.horario || '';
          this.fetchDashboardData();
        } else { this.settingsError = data.message; }
      } catch (e) { this.settingsError = 'Error de conexión'; }
      finally { this.savingSettings = false; }
    },
    formatDate(d) {
      if (!d) return '';
      return new Date(d).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
    },
    formatFecha(d) {
      if (!d) return '';
      // Evita desfase de zona horaria parseando como local
      const [y, m, day] = d.split('-');
      return new Date(y, m - 1, day).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    },
    async fetchReservas() {
      this.loadingReservas = true;
      try {
        const params = new URLSearchParams();
        if (this.busquedaReservas.trim()) params.append('busqueda', this.busquedaReservas.trim());
        if (this.filtroFechaReservas) params.append('fecha', this.filtroFechaReservas);
        const res = await fetch(`/api/admin/reservas?${params}`);
        const data = await res.json();
        if (data.success) this.reservas = data.reservas || [];
      } catch (e) { console.error(e); }
      finally { this.loadingReservas = false; }
    },
    abrirCancelModal(reserva) {
      this.reservaACancelar = reserva;
      this.cancelError = '';
      this.showCancelModal = true;
    },
    async confirmarCancelacion() {
      this.cancelando = true; this.cancelError = '';
      try {
        const res = await fetch(`/api/admin/reservas/${this.reservaACancelar.id}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
          this.showCancelModal = false;
          this.mostrarToast(data.message, 'ok');
          await Promise.all([this.fetchReservas(), this.fetchDashboardData(), this.fetchEspacios()]);
        } else {
          this.cancelError = data.message;
        }
      } catch { this.cancelError = 'Error de conexión'; }
      finally { this.cancelando = false; }
    },
    limpiarFiltrosReservas() {
      this.busquedaReservas = '';
      this.filtroFechaReservas = '';
      this.fetchReservas();
    },
    // ── HU10: Gestión de usuarios ──────────────────────────
    async fetchUsuariosGestion() {
      this.loadingUsuarios = true;
      try {
        const p = new URLSearchParams();
        if (this.busquedaUsuarios.trim()) p.append('busqueda', this.busquedaUsuarios.trim());
        if (this.filtroRol)    p.append('rol',    this.filtroRol);
        if (this.filtroEstado) p.append('estado', this.filtroEstado);
        const res = await fetch(`/api/admin/usuarios?${p}`);
        const data = await res.json();
        if (data.success) this.usuariosGestion = data.usuarios || [];
      } catch (e) { console.error(e); }
      finally { this.loadingUsuarios = false; }
    },
    abrirRolModal(u) {
      this.usuarioEditandoRol = u;
      this.nuevoRol = u.rol;
      this.rolError = '';
      this.showRolModal = true;
    },
    async confirmarCambioRol() {
      this.cambiandoRol = true; this.rolError = '';
      try {
        const res = await fetch(`/api/admin/usuarios/${this.usuarioEditandoRol.id}/rol`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rol: this.nuevoRol })
        });
        const data = await res.json();
        if (data.success) {
          this.showRolModal = false;
          this.mostrarToast(data.message, 'ok');
          await this.fetchUsuariosGestion();
        } else { this.rolError = data.message; }
      } catch { this.rolError = 'Error de conexión'; }
      finally { this.cambiandoRol = false; }
    },
    abrirEstadoModal(u) {
      this.usuarioEditandoEstado = u;
      this.estadoError = '';
      this.showEstadoModal = true;
    },
    async confirmarCambioEstado() {
      this.cambiandoEstado = true; this.estadoError = '';
      try {
        const res = await fetch(`/api/admin/usuarios/${this.usuarioEditandoEstado.id}/estado`, { method: 'PATCH' });
        const data = await res.json();
        if (data.success) {
          this.showEstadoModal = false;
          this.mostrarToast(data.message, 'ok');
          await this.fetchUsuariosGestion();
          await this.fetchDashboardData();
        } else { this.estadoError = data.message; }
      } catch { this.estadoError = 'Error de conexión'; }
      finally { this.cambiandoEstado = false; }
    },
    async verAuditoria(u) {
      this.auditoriaUsuario = u;
      this.auditoriaData = [];
      this.showAuditoriaModal = true;
      try {
        const res = await fetch(`/api/admin/usuarios/${u.id}/auditoria`);
        const data = await res.json();
        if (data.success) this.auditoriaData = data.auditoria || [];
      } catch (e) { console.error(e); }
    },
    async handleLogout() {
      try {
        const res = await fetch('/api/admin/logout', { method: 'POST', headers: { 'Content-Type': 'application/json' } });
        const data = await res.json();
        if (data.success) { this.state.logoutAdmin(); this.$router.push('/'); }
      } catch (e) { console.error(e); }
    }
  }
};
</script>
