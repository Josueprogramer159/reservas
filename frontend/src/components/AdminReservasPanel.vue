<template>
  <div class="space-y-6">
    <!-- Toast de notificaciones -->
    <div v-if="toastMsg" :class="['p-3.5 rounded-xl text-sm font-medium transition', 
      toastType === 'ok' ? 'bg-emerald-50 border border-emerald-100 text-emerald-700' : 'bg-red-50 border border-red-100 text-red-700']">
      {{ toastMsg }}
    </div>

    <!-- Sección de Filtros -->
    <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
      <h3 class="text-lg font-bold text-slate-900 mb-4">Filtros de Búsqueda</h3>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <!-- Búsqueda general -->
        <div>
          <label class="block text-xs font-semibold text-slate-600 uppercase mb-2">Buscar (Usuario/Email/Espacio)</label>
          <input 
            v-model="filtros.busqueda"
            @input="aplicarFiltros"
            type="text" 
            placeholder="Ej: Juan, juan@email.com"
            class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#003087] focus:border-transparent outline-none text-sm"
          />
        </div>

        <!-- Fecha inicio -->
        <div>
          <label class="block text-xs font-semibold text-slate-600 uppercase mb-2">Fecha Inicio</label>
          <input 
            v-model="filtros.fechaInicio"
            @change="aplicarFiltros"
            type="date"
            class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#003087] focus:border-transparent outline-none text-sm"
          />
        </div>

        <!-- Fecha fin -->
        <div>
          <label class="block text-xs font-semibold text-slate-600 uppercase mb-2">Fecha Fin</label>
          <input 
            v-model="filtros.fechaFin"
            @change="aplicarFiltros"
            type="date"
            class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#003087] focus:border-transparent outline-none text-sm"
          />
        </div>

        <!-- Filtro por Espacio -->
        <div>
          <label class="block text-xs font-semibold text-slate-600 uppercase mb-2">Espacio</label>
          <select 
            v-model="filtros.espacioId"
            @change="aplicarFiltros"
            class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#003087] focus:border-transparent outline-none text-sm"
          >
            <option value="">-- Todos los espacios --</option>
            <option v-for="espacio in espacios" :key="espacio.id" :value="espacio.id">
              {{ espacio.nombre }}
            </option>
          </select>
        </div>

        <!-- Filtro por Estado -->
        <div>
          <label class="block text-xs font-semibold text-slate-600 uppercase mb-2">Estado</label>
          <select 
            v-model="filtros.estado"
            @change="aplicarFiltros"
            class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#003087] focus:border-transparent outline-none text-sm"
          >
            <option value="">-- Todos --</option>
            <option value="confirmado">Confirmado</option>
            <option value="cancelado">Cancelado</option>
            <option value="completado">Completado</option>
          </select>
        </div>
      </div>

      <!-- Botones de acciones -->
      <div class="mt-4 flex gap-3">
        <button 
          @click="limpiarFiltros"
          class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-lg transition">
          ✕ Limpiar Filtros
        </button>
        <button 
          @click="exportarCSV"
          class="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-sm rounded-lg transition">
          📥 Exportar CSV
        </button>
      </div>
    </div>

    <!-- Tabla de Reservas -->
    <div class="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-slate-100 text-slate-400 text-xs uppercase font-semibold bg-slate-50">
              <th class="py-3 px-4">ID</th>
              <th class="py-3 px-4">Usuario</th>
              <th class="py-3 px-4">Email</th>
              <th class="py-3 px-4">Espacio</th>
              <th class="py-3 px-4">Fecha</th>
              <th class="py-3 px-4">Horario</th>
              <th class="py-3 px-4">Estado</th>
              <th class="py-3 px-4">Creada el</th>
              <th class="py-3 px-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <!-- Loading state -->
            <tr v-if="loading">
              <td colspan="9" class="py-10 text-center text-slate-400">
                <div class="flex justify-center items-center space-x-2">
                  <div class="animate-spin">⏳</div>
                  <span>Cargando reservas...</span>
                </div>
              </td>
            </tr>

            <!-- Empty state -->
            <tr v-else-if="reservas.length === 0">
              <td colspan="9" class="py-10 text-center text-slate-400">
                No hay reservas que coincidan con los filtros aplicados.
              </td>
            </tr>

            <!-- Data rows -->
            <tr v-for="reserva in reservas" :key="reserva.id" 
              class="border-b border-slate-50 hover:bg-slate-50/50 transition text-sm text-slate-700">
              <td class="py-3.5 px-4 font-semibold text-slate-900">#{{ reserva.id }}</td>
              <td class="py-3.5 px-4 font-medium">{{ reserva.usuario_nombre }}</td>
              <td class="py-3.5 px-4 text-slate-500 truncate max-w-[200px]">{{ reserva.usuario_email }}</td>
              <td class="py-3.5 px-4 font-medium">{{ reserva.espacio_nombre }}</td>
              <td class="py-3.5 px-4 font-semibold">
                {{ formatearFecha(reserva.fecha) }}
              </td>
              <td class="py-3.5 px-4">{{ reserva.horario }}</td>
              <td class="py-3.5 px-4">
                <span 
                  class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
                  :class="getEstadoClase(reserva.estado)">
                  {{ getEstadoLabel(reserva.estado) }}
                </span>
              </td>
              <td class="py-3.5 px-4 text-slate-500 text-xs">
                {{ formatearFechaCorta(reserva.fecha_creacion) }}
              </td>
              <td class="py-3.5 px-4">
                <div class="flex justify-center gap-2">
                  <button 
                    v-if="reserva.estado === 'confirmado'"
                    @click="confirmarCancelar(reserva)"
                    title="Cancelar reserva"
                    class="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                  <button 
                    @click="mostrarDetalles(reserva)"
                    title="Ver detalles"
                    class="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#003087] transition">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Paginación -->
    <div v-if="!loading && reservas.length > 0" class="flex justify-between items-center bg-white rounded-2xl p-4 border border-slate-100">
      <div class="text-sm text-slate-600 font-semibold">
        Mostrando {{ (paginacion.pagina - 1) * paginacion.porPagina + 1 }} - 
        {{ Math.min(paginacion.pagina * paginacion.porPagina, paginacion.total) }} 
        de {{ paginacion.total }} reservas
      </div>

      <div class="flex gap-2">
        <button 
          @click="irAPagina(paginacion.pagina - 1)"
          :disabled="paginacion.pagina <= 1"
          class="px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition">
          ← Anterior
        </button>

        <div class="flex gap-1">
          <button 
            v-for="num in getPaginasVisibles()" 
            :key="num"
            @click="irAPagina(num)"
            :class="['px-3 py-1.5 rounded-lg text-sm font-semibold transition border',
              num === paginacion.pagina 
                ? 'bg-[#003087] text-white border-[#003087]' 
                : 'border-slate-200 hover:bg-slate-50']">
            {{ num }}
          </button>
        </div>

        <button 
          @click="irAPagina(paginacion.pagina + 1)"
          :disabled="paginacion.pagina >= paginacion.totalPaginas"
          class="px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition">
          Siguiente →
        </button>
      </div>

      <select 
        v-model.number="paginacion.porPagina"
        @change="aplicarFiltros"
        class="px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-semibold">
        <option value="10">10 por página</option>
        <option value="25">25 por página</option>
        <option value="50">50 por página</option>
        <option value="100">100 por página</option>
      </select>
    </div>

    <!-- Modal de detalles -->
    <div v-if="mostrandoDetalles && reservaSeleccionada" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-bold text-slate-900">Detalles de la Reserva #{{ reservaSeleccionada.id }}</h3>
          <button 
            @click="mostrandoDetalles = false"
            class="text-slate-400 hover:text-slate-600 text-2xl">
            ×
          </button>
        </div>

        <div class="space-y-3 text-sm">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-slate-500 font-semibold">Usuario</p>
              <p class="text-slate-900 font-bold">{{ reservaSeleccionada.usuario_nombre }}</p>
            </div>
            <div>
              <p class="text-slate-500 font-semibold">Email</p>
              <p class="text-slate-900 font-bold">{{ reservaSeleccionada.usuario_email }}</p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-slate-500 font-semibold">Espacio</p>
              <p class="text-slate-900 font-bold">{{ reservaSeleccionada.espacio_nombre }}</p>
            </div>
            <div>
              <p class="text-slate-500 font-semibold">Tipo</p>
              <p class="text-slate-900 font-bold">{{ reservaSeleccionada.espacio_tipo }}</p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-slate-500 font-semibold">Capacidad</p>
              <p class="text-slate-900 font-bold">{{ reservaSeleccionada.capacidad }} personas</p>
            </div>
            <div>
              <p class="text-slate-500 font-semibold">Ubicación</p>
              <p class="text-slate-900 font-bold">{{ reservaSeleccionada.espacio_ubicacion }}</p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-slate-500 font-semibold">Fecha</p>
              <p class="text-slate-900 font-bold">{{ formatearFecha(reservaSeleccionada.fecha) }}</p>
            </div>
            <div>
              <p class="text-slate-500 font-semibold">Horario</p>
              <p class="text-slate-900 font-bold">{{ reservaSeleccionada.horario }}</p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-slate-500 font-semibold">Estado</p>
              <span :class="['inline-block px-2 py-1 rounded text-xs font-semibold', getEstadoClase(reservaSeleccionada.estado)]">
                {{ getEstadoLabel(reservaSeleccionada.estado) }}
              </span>
            </div>
            <div>
              <p class="text-slate-500 font-semibold">Creada el</p>
              <p class="text-slate-900 font-bold text-xs">{{ formatearFechaCompleta(reservaSeleccionada.fecha_creacion) }}</p>
            </div>
          </div>
        </div>

        <button 
          @click="mostrandoDetalles = false"
          class="w-full mt-6 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition">
          Cerrar
        </button>
      </div>
    </div>

    <!-- Modal de confirmación de cancelación -->
    <div v-if="mostrandoConfirmacion && reservaParaCancelar" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full">
        <h3 class="text-lg font-bold text-slate-900 mb-2">¿Cancelar reserva?</h3>
        <p class="text-slate-600 text-sm mb-4">
          Está a punto de cancelar la reserva #{{ reservaParaCancelar.id }} para 
          <strong>{{ reservaParaCancelar.usuario_nombre }}</strong> en 
          <strong>{{ reservaParaCancelar.espacio_nombre }}</strong>
        </p>

        <div class="flex gap-3">
          <button 
            @click="mostrandoConfirmacion = false"
            class="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition">
            No, cancelar
          </button>
          <button 
            @click="cancelarReserva"
            class="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition">
            Sí, cancelar reserva
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, reactive } from 'vue';

export default {
  name: 'AdminReservasPanel',
  setup() {
    const loading = ref(false);
    const reservas = ref([]);
    const espacios = ref([]);
    const toastMsg = ref('');
    const toastType = ref('ok');

    const filtros = reactive({
      busqueda: '',
      fechaInicio: '',
      fechaFin: '',
      espacioId: '',
      usuarioId: '',
      estado: ''
    });

    const paginacion = reactive({
      pagina: 1,
      porPagina: 10,
      total: 0,
      totalPaginas: 1
    });

    const mostrandoDetalles = ref(false);
    const mostrandoConfirmacion = ref(false);
    const reservaSeleccionada = ref(null);
    const reservaParaCancelar = ref(null);

    // Funciones utilitarias
    const formatearFecha = (fecha) => {
      const date = new Date(fecha);
      return date.toLocaleDateString('es-ES', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' });
    };

    const formatearFechaCorta = (fecha) => {
      const date = new Date(fecha);
      return date.toLocaleDateString('es-ES') + ' ' + date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    };

    const formatearFechaCompleta = (fecha) => {
      const date = new Date(fecha);
      return date.toLocaleString('es-ES', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const getEstadoClase = (estado) => {
      const clases = {
        'confirmado': 'bg-emerald-50 text-emerald-700 border border-emerald-100',
        'cancelado': 'bg-red-50 text-red-700 border border-red-100',
        'completado': 'bg-blue-50 text-blue-700 border border-blue-100'
      };
      return clases[estado] || clases.confirmado;
    };

    const getEstadoLabel = (estado) => {
      const labels = {
        'confirmado': '✓ Confirmado',
        'cancelado': '✕ Cancelado',
        'completado': '✓ Completado'
      };
      return labels[estado] || estado;
    };

    // Cargar espacios
    const cargarEspacios = async () => {
      try {
        const res = await fetch('/api/espacios');
        const data = await res.json();
        if (data.success) {
          espacios.value = data.espacios || [];
        }
      } catch (error) {
        console.error('Error cargando espacios:', error);
      }
    };

    // Cargar reservas con filtros
    const cargarReservas = async () => {
      loading.value = true;
      try {
        const params = new URLSearchParams();
        
        if (filtros.busqueda) params.append('busqueda', filtros.busqueda);
        if (filtros.fechaInicio) params.append('fechaInicio', filtros.fechaInicio);
        if (filtros.fechaFin) params.append('fechaFin', filtros.fechaFin);
        if (filtros.espacioId) params.append('espacioId', filtros.espacioId);
        if (filtros.usuarioId) params.append('usuarioId', filtros.usuarioId);
        if (filtros.estado) params.append('estado', filtros.estado);
        
        params.append('pagina', paginacion.pagina);
        params.append('porPagina', paginacion.porPagina);

        const res = await fetch(`/api/admin/reservas?${params.toString()}`, {
          credentials: 'include'
        });

        const data = await res.json();
        
        if (data.success) {
          reservas.value = data.reservas || [];
          paginacion.total = data.total || 0;
          paginacion.totalPaginas = data.totalPaginas || 1;
        } else {
          mostrarToast('Error al cargar reservas', 'error');
        }
      } catch (error) {
        console.error('Error cargando reservas:', error);
        mostrarToast('Error de conexión', 'error');
      } finally {
        loading.value = false;
      }
    };

    // Aplicar filtros
    const aplicarFiltros = () => {
      paginacion.pagina = 1;
      cargarReservas();
    };

    // Limpiar filtros
    const limpiarFiltros = () => {
      filtros.busqueda = '';
      filtros.fechaInicio = '';
      filtros.fechaFin = '';
      filtros.espacioId = '';
      filtros.usuarioId = '';
      filtros.estado = '';
      aplicarFiltros();
    };

    // Ir a página
    const irAPagina = (pagina) => {
      if (pagina >= 1 && pagina <= paginacion.totalPaginas) {
        paginacion.pagina = pagina;
        cargarReservas();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    // Obtener páginas visibles
    const getPaginasVisibles = () => {
      const delta = 2;
      const left = Math.max(1, paginacion.pagina - delta);
      const right = Math.min(paginacion.totalPaginas, paginacion.pagina + delta);
      const paginas = [];

      if (left > 1) {
        paginas.push(1);
        if (left > 2) paginas.push('...');
      }

      for (let i = left; i <= right; i++) {
        paginas.push(i);
      }

      if (right < paginacion.totalPaginas) {
        if (right < paginacion.totalPaginas - 1) paginas.push('...');
        paginas.push(paginacion.totalPaginas);
      }

      return paginas.filter(p => p !== '...');
    };

    // Mostrar detalles
    const mostrarDetalles = (reserva) => {
      reservaSeleccionada.value = reserva;
      mostrandoDetalles.value = true;
    };

    // Confirmar cancelación
    const confirmarCancelar = (reserva) => {
      reservaParaCancelar.value = reserva;
      mostrandoConfirmacion.value = true;
    };

    // Cancelar reserva
    const cancelarReserva = async () => {
      if (!reservaParaCancelar.value) return;

      try {
        const res = await fetch(`/api/admin/reservas/${reservaParaCancelar.value.id}`, {
          method: 'DELETE',
          credentials: 'include'
        });

        const data = await res.json();

        if (data.success) {
          mostrarToast('Reserva cancelada correctamente', 'ok');
          mostrandoConfirmacion.value = false;
          reservaParaCancelar.value = null;
          cargarReservas();
        } else {
          mostrarToast(data.message || 'Error al cancelar la reserva', 'error');
        }
      } catch (error) {
        console.error('Error cancelando reserva:', error);
        mostrarToast('Error de conexión', 'error');
      }
    };

    // Exportar a CSV
    const exportarCSV = () => {
      if (reservas.value.length === 0) {
        mostrarToast('No hay reservas para exportar', 'error');
        return;
      }

      const headers = ['ID', 'Usuario', 'Email', 'Espacio', 'Fecha', 'Horario', 'Estado', 'Creada el'];
      const rows = reservas.value.map(r => [
        r.id,
        r.usuario_nombre,
        r.usuario_email,
        r.espacio_nombre,
        r.fecha,
        r.horario,
        getEstadoLabel(r.estado),
        new Date(r.fecha_creacion).toLocaleString('es-ES')
      ]);

      let csv = headers.join(',') + '\n';
      rows.forEach(row => {
        csv += row.map(cell => `"${cell}"`).join(',') + '\n';
      });

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reservas_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      mostrarToast('Archivo CSV descargado', 'ok');
    };

    // Mostrar toast
    const mostrarToast = (msg, tipo) => {
      toastMsg.value = msg;
      toastType.value = tipo;
      setTimeout(() => {
        toastMsg.value = '';
      }, 3000);
    };

    // Inicializar
    onMounted(() => {
      cargarEspacios();
      cargarReservas();
    });

    return {
      loading,
      reservas,
      espacios,
      toastMsg,
      toastType,
      filtros,
      paginacion,
      mostrandoDetalles,
      mostrandoConfirmacion,
      reservaSeleccionada,
      reservaParaCancelar,
      formatearFecha,
      formatearFechaCorta,
      formatearFechaCompleta,
      getEstadoClase,
      getEstadoLabel,
      cargarReservas,
      aplicarFiltros,
      limpiarFiltros,
      irAPagina,
      getPaginasVisibles,
      mostrarDetalles,
      confirmarCancelar,
      cancelarReserva,
      exportarCSV
    };
  }
};
</script>

<style scoped>
/* Estilos específicos si es necesario */
</style>
