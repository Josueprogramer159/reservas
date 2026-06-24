<template>
  <div class="min-h-screen bg-[#f8fafc] flex flex-col md:flex-row">
    <aside class="w-full md:w-64 bg-white border-r border-slate-100 flex flex-col justify-between p-6 flex-shrink-0">
      <div class="space-y-8">
        <div class="flex items-center space-x-3 pb-6 border-b border-slate-100">
          <div class="w-10 h-10 rounded-xl bg-[#003087] text-white flex items-center justify-center font-bold text-lg shadow-sm">
            {{ userInitials }}
          </div>
          <div class="overflow-hidden">
            <h4 class="font-bold text-sm text-slate-900 truncate">{{ state.user?.nombre || 'Usuario UTC' }}</h4>
            <p class="text-xs text-slate-500 truncate">{{ state.user?.email }}</p>
          </div>
        </div>

        <nav class="space-y-1.5">
          <button
            @click="activeTab = 'reservas'"
            class="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200"
            :class="activeTab === 'reservas' ? 'bg-[#003087] text-white shadow-md shadow-[#003087]/15' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'"
          >
            <CalendarRange class="w-5 h-5" />
            <span>Reservar Espacios</span>
          </button>
          <button
            @click="activeTab = 'mis-espacios'"
            class="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200"
            :class="activeTab === 'mis-espacios' ? 'bg-[#003087] text-white shadow-md shadow-[#003087]/15' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'"
          >
            <BookmarkCheck class="w-5 h-5" />
            <span>Mis Espacios</span>
          </button>
          <button
            @click="activeTab = 'perfil'"
            class="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200"
            :class="activeTab === 'perfil' ? 'bg-[#003087] text-white shadow-md shadow-[#003087]/15' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'"
          >
            <UserCheck class="w-5 h-5" />
            <span>Mi Perfil</span>
          </button>
        </nav>
      </div>

      <div class="pt-6 border-t border-slate-100 mt-6">
        <button
          @click="handleLogout"
          class="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-all duration-200 active:scale-95"
        >
          <LogOut class="w-5 h-5" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>

    <main class="flex-grow p-6 md:p-10 space-y-8 overflow-y-auto max-h-screen">

      <!-- RESERVAR ESPACIOS -->
      <div v-if="activeTab === 'reservas'" class="space-y-8">
        <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 class="text-2xl font-extrabold text-slate-900">Reservar Espacios Universitarios</h1>
            <p class="text-sm text-slate-500 mt-1">Explora y selecciona el espacio disponible según la categoría requerida</p>
          </div>
        </div>

        <div v-if="toastMessage" class="p-3.5 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-sm font-medium">
          {{ toastMessage }}
        </div>

        <div v-if="loadingSpaces" class="text-center py-16">
          <Loader2 class="w-8 h-8 text-[#003087] animate-spin mx-auto" />
          <p class="text-sm text-slate-500 mt-3">Cargando espacios...</p>
        </div>

        <div v-else-if="spacesError" class="p-6 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-sm">
          {{ spacesError }}
        </div>

        <div v-else-if="spaces.length === 0" class="text-center py-16 bg-white rounded-3xl border border-slate-100">
          <CalendarRange class="w-12 h-12 text-slate-300 mx-auto" />
          <h4 class="font-bold text-slate-600 mt-4">No existen espacios disponibles</h4>
          <p class="text-xs text-slate-400 mt-2">Contacta al administrador para más información.</p>
        </div>

        <template v-else>
          <div v-for="cat in categorias" :key="cat.key" class="space-y-4">
            <h2 v-if="cat.spaces.length > 0" class="text-lg font-bold text-[#003087] flex items-center space-x-2 border-b border-slate-100 pb-2">
              <component :is="cat.icon" class="w-5 h-5 text-[#FFB800]" />
              <span>{{ cat.label }}</span>
            </h2>
            <div v-if="cat.spaces.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div
                v-for="space in cat.spaces"
                :key="space.id"
                class="card-premium overflow-hidden flex flex-col justify-between group"
              >
                <div class="relative overflow-hidden h-40 bg-slate-100">
                  <img :src="space.imagen" :alt="space.nombre" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                  <span class="absolute top-3 left-3 bg-[#003087] text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {{ space.tipo }}
                  </span>
                  <span
                    class="absolute top-3 right-3 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm"
                    :class="space.disponible ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'"
                  >
                    {{ space.disponible ? 'Disponible' : 'No disponible' }}
                  </span>
                </div>
                <div class="p-5 flex-grow flex flex-col justify-between">
                  <div>
                    <h3 class="font-bold text-slate-900 text-sm mb-1.5 leading-snug">{{ space.nombre }}</h3>
                    <p class="text-xs text-slate-500 mb-2 leading-relaxed line-clamp-2">{{ space.descripcion }}</p>
                    <div class="flex items-center space-x-2 text-xs text-slate-400 font-semibold mb-1">
                      <MapPin class="w-3.5 h-3.5 text-[#FFB800]" />
                      <span>{{ space.ubicacion }}</span>
                    </div>
                    <div class="flex items-center space-x-2 text-xs text-slate-400 font-semibold mb-4">
                      <Users class="w-3.5 h-3.5 text-[#FFB800]" />
                      <span>Capacidad: {{ space.capacidad }} personas</span>
                    </div>
                  </div>
                  <div class="flex space-x-2">
                    <router-link
                      :to="`/espacios/${space.id}`"
                      class="flex-1 text-center border border-[#003087] text-[#003087] text-xs font-semibold py-2.5 rounded-lg hover:bg-blue-50 transition"
                    >
                      Ver detalle
                    </router-link>
                    <button
                      @click="openReservationModal(space)"
                      :disabled="!space.disponible"
                      class="flex-1 text-xs font-semibold py-2.5 rounded-lg transition duration-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                      :class="space.disponible ? 'bg-[#003087] text-white hover:bg-blue-800' : 'bg-slate-200 text-slate-500'"
                    >
                      {{ space.disponible ? 'Reservar' : 'Ocupado' }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>

      <!-- MIS ESPACIOS -->
      <div v-else-if="activeTab === 'mis-espacios'" class="space-y-6">
        <div>
          <h1 class="text-2xl font-extrabold text-slate-900">Mis Espacios Reservados</h1>
          <p class="text-sm text-slate-500 mt-1">Gestiona y revisa tus reservas académicas y deportivas solicitadas</p>
        </div>

        <div v-if="loadingReservations" class="text-center py-12">
          <Loader2 class="w-8 h-8 text-[#003087] animate-spin mx-auto" />
        </div>

        <div v-else class="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <div v-if="myReservations.length > 0" class="space-y-4">
            <div
              v-for="res in myReservations"
              :key="res.id"
              class="p-4 rounded-2xl border border-slate-100 hover:border-slate-200/80 hover:bg-slate-50/50 transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div class="flex items-start sm:items-center space-x-4">
                <div class="p-3 bg-blue-50 text-[#003087] rounded-xl flex-shrink-0">
                  <component :is="getSpaceIcon(res.espacio_tipo)" class="w-5.5 h-5.5" />
                </div>
                <div>
                  <h4 class="font-bold text-slate-900 text-sm">{{ res.espacio_nombre }}</h4>
                  <p class="text-xs text-slate-500 mt-1 font-medium flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span>Fecha: {{ res.fecha }}</span>
                    <span class="text-slate-300">|</span>
                    <span>Horario: {{ res.horario }}</span>
                  </p>
                </div>
              </div>
              <div class="flex items-center justify-between sm:justify-end gap-3">
                <span class="px-3 py-1 text-[11px] font-bold rounded-full bg-emerald-50 text-emerald-700">
                  {{ res.estado }}
                </span>
                <button
                  @click="cancelReservation(res.id)"
                  class="text-red-500 hover:bg-red-50 p-2 rounded-lg transition duration-200"
                  title="Cancelar Reserva"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-12 space-y-3">
            <BookmarkCheck class="w-12 h-12 text-slate-300 mx-auto" />
            <h4 class="font-bold text-slate-600">No tienes espacios reservados</h4>
            <p class="text-xs text-slate-400 max-w-xs mx-auto">Dirígete a la pestaña "Reservar Espacios" para realizar tu primera reserva.</p>
            <button @click="activeTab = 'reservas'" class="btn-primary mt-2 text-xs">Reservar Ahora</button>
          </div>
        </div>
      </div>

      <!-- MI PERFIL -->
      <div v-else-if="activeTab === 'perfil'" class="space-y-6">
        <div>
          <h1 class="text-2xl font-extrabold text-slate-900">Mi Perfil</h1>
          <p class="text-sm text-slate-500 mt-1">Datos personales de tu cuenta en la plataforma</p>
        </div>
        <div class="max-w-xl bg-white rounded-3xl p-8 shadow-sm border border-slate-100 space-y-6">
          <div class="flex items-center space-x-4">
            <div class="w-16 h-16 rounded-2xl bg-[#003087]/5 text-[#003087] flex items-center justify-center font-bold text-2xl border border-[#003087]/15">
              {{ userInitials }}
            </div>
            <div>
              <h3 class="font-bold text-lg text-slate-900">{{ state.user?.nombre || 'Usuario UTC' }}</h3>
              <span class="px-2.5 py-0.5 rounded bg-blue-50 text-[#003087] border border-blue-100 font-semibold text-[10px] uppercase">Estudiante / Docente</span>
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
            <div>
              <h5 class="text-xs text-slate-400 font-bold uppercase tracking-wider">Correo Electrónico</h5>
              <p class="text-sm font-semibold text-slate-800 mt-1.5">{{ state.user?.email }}</p>
            </div>
            <div>
              <h5 class="text-xs text-slate-400 font-bold uppercase tracking-wider">ID de Cuenta</h5>
              <p class="text-sm font-semibold text-slate-800 mt-1.5">#{{ state.user?.id || '0' }}</p>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- MODAL DE RESERVA -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div class="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-md w-full overflow-hidden">
        <div class="h-1.5 bg-[#003087]"></div>
        <div class="p-6">
          <h3 class="text-lg font-bold text-slate-900 mb-2">Completar Reserva</h3>
          <p class="text-xs text-slate-500 mb-6">
            Estás reservando: <span class="font-semibold text-[#003087]">{{ selectedSpace?.nombre }}</span>
          </p>

          <div v-if="modalError" class="mb-4 p-3 bg-red-50 border border-red-100 text-red-700 rounded-xl text-xs font-medium">
            {{ modalError }}
          </div>

          <div class="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <p class="text-sm text-slate-700">¿Estás seguro de que deseas confirmar esta reserva?</p>
          </div>

          <div class="flex space-x-3 mt-8">
            <button @click="showModal = false" class="w-1/2 border border-slate-200 text-slate-700 font-semibold py-2.5 rounded-xl text-xs hover:bg-slate-50 transition active:scale-95">
              Cancelar
            </button>
            <button
              @click="confirmReservation"
              :disabled="submitting"
              class="w-1/2 bg-[#003087] text-white font-bold py-2.5 rounded-xl text-xs hover:bg-blue-800 transition active:scale-95 shadow-md shadow-[#003087]/5 disabled:opacity-50"
            >
              {{ submitting ? 'Procesando...' : 'Confirmar Reserva' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  CalendarRange, BookmarkCheck, UserCheck, LogOut, MapPin, Trash2,
  Monitor, Trophy, Video, Users, Loader2
} from 'lucide-vue-next';
import { authState } from '../router';

export default {
  name: 'DashboardView',
  components: {
    CalendarRange, BookmarkCheck, UserCheck, LogOut, MapPin, Trash2,
    Monitor, Trophy, Video, Users, Loader2
  },
  data() {
    return {
      state: authState,
      activeTab: 'reservas',
      showModal: false,
      selectedSpace: null,
      spaces: [],
      myReservations: [],
      reservationConfig: null,
      loadingSpaces: true,
      loadingReservations: true,
      spacesError: '',
      modalError: '',
      toastMessage: '',
      submitting: false
    };
  },
  computed: {
    userInitials() {
      const name = this.state.user?.nombre || 'Usuario';
      return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    },
    laboratorios() {
      return this.spaces.filter(s => s.tipo === 'Laboratorios');
    },
    canchas() {
      return this.spaces.filter(s => s.tipo === 'Canchas');
    },
    salas() {
      return this.spaces.filter(s => s.tipo === 'Salas');
    },
    categorias() {
      return [
        { key: 'lab', label: '🔬 Laboratorios de Computación y Especializados', icon: 'Monitor', spaces: this.laboratorios },
        { key: 'canchas', label: '⚽ Canchas Deportivas', icon: 'Trophy', spaces: this.canchas },
        { key: 'salas', label: '🏛️ Salas de Conferencias y Estudio', icon: 'Video', spaces: this.salas }
      ];
    }
  },
  async mounted() {
    await Promise.all([this.fetchSpaces(), this.fetchMyReservations()]);
  },
  methods: {
    async fetchSpaces() {
      this.loadingSpaces = true;
      this.spacesError = '';
      try {
        const res = await fetch('/api/espacios');
        const data = await res.json();
        if (data.success) {
          this.spaces = data.espacios || [];
          this.reservationConfig = data.configuracionReserva || null;
        } else {
          this.spacesError = data.message || 'Error al cargar espacios';
        }
      } catch {
        this.spacesError = 'Error de conexión al cargar espacios';
      } finally {
        this.loadingSpaces = false;
      }
    },
    async fetchMyReservations() {
      this.loadingReservations = true;
      try {
        const res = await fetch('/api/reservas/mis-reservas');
        const data = await res.json();
        if (data.success) {
          this.myReservations = data.reservas || [];
        }
      } catch {
        console.error('Error al cargar reservas');
      } finally {
        this.loadingReservations = false;
      }
    },
    getSpaceIcon(tipo) {
      if (tipo === 'Laboratorios') return 'Monitor';
      if (tipo === 'Canchas') return 'Trophy';
      return 'Video';
    },
    openReservationModal(space) {
      this.selectedSpace = space;
      this.modalError = '';
      this.showModal = true;
    },
    async confirmReservation() {
      if (!this.selectedSpace) return;
      this.submitting = true;
      this.modalError = '';
      try {
        const res = await fetch('/api/reservas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            espacio_id: this.selectedSpace.id
          })
        });
        const data = await res.json();
        if (data.success) {
          this.showModal = false;
          this.toastMessage = data.message;
          setTimeout(() => { this.toastMessage = ''; }, 4000);
          await Promise.all([this.fetchSpaces(), this.fetchMyReservations()]);
          this.activeTab = 'mis-espacios';
        } else {
          this.modalError = data.message;
        }
      } catch {
        this.modalError = 'Error de conexión al procesar la reserva';
      } finally {
        this.submitting = false;
      }
    },
    async cancelReservation(resId) {
      if (!confirm('¿Estás seguro de que deseas cancelar esta reserva?')) return;
      try {
        const res = await fetch(`/api/reservas/${resId}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
          this.toastMessage = data.message;
          setTimeout(() => { this.toastMessage = ''; }, 4000);
          await Promise.all([this.fetchSpaces(), this.fetchMyReservations()]);
          if (this.activeTab !== 'reservas') {
            this.activeTab = 'reservas';
          }
        } else {
          alert(data.message || 'Error al cancelar la reserva');
        }
      } catch {
        alert('Error de conexión al cancelar la reserva');
      }
    },
    async handleLogout() {
      try {
        const response = await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        const data = await response.json();
        if (data.success) {
          this.state.logoutUser();
          this.$router.push('/login');
        }
      } catch (error) {
        console.error('Error al intentar cerrar la sesión del usuario:', error);
      }
    }
  }
};
</script>
