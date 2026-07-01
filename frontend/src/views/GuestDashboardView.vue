<template>
  <div class="min-h-screen bg-[#f8fafc] flex flex-col md:flex-row">

    <!-- SIDEBAR -->
    <aside class="w-full md:w-64 bg-white border-r border-slate-100 flex flex-col justify-between p-6 flex-shrink-0">
      <div class="space-y-8">
        <div class="flex items-center space-x-3 pb-6 border-b border-slate-100">
          <div class="w-10 h-10 rounded-xl bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-lg shadow-sm">
            <UserIcon class="w-5 h-5" />
          </div>
          <div class="overflow-hidden">
            <h4 class="font-bold text-sm text-slate-900 truncate">Invitado</h4>
            <p class="text-xs text-slate-400 truncate">Sin sesión iniciada</p>
          </div>
        </div>

        <nav class="space-y-1.5">
          <button
            @click="activeTab = 'reservas'"
            class="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200"
            :class="activeTab === 'reservas' ? 'bg-[#003087] text-white shadow-md shadow-[#003087]/15' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'"
          >
            <CalendarRange class="w-5 h-5" />
            <span>Espacios Disponibles</span>
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
        <router-link
          to="/login"
          class="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold text-[#003087] hover:bg-blue-50 transition-all duration-200 active:scale-95"
        >
          <LogIn class="w-5 h-5" />
          <span>Iniciar Sesión</span>
        </router-link>
      </div>
    </aside>

    <!-- CONTENIDO PRINCIPAL -->
    <main class="flex-grow p-6 md:p-10 space-y-8 overflow-y-auto max-h-screen">

      <!-- TAB: RESERVAR ESPACIOS -->
      <div v-if="activeTab === 'reservas'" class="space-y-8">
        <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 class="text-2xl font-extrabold text-slate-900">Reservar Espacios Universitarios</h1>
            <p class="text-sm text-slate-500 mt-1">Explora y selecciona el espacio disponible según la categoría requerida</p>
          </div>
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
                      @click="goToLogin"
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

      <!-- TAB: MIS ESPACIOS -->
      <div v-else-if="activeTab === 'mis-espacios'" class="space-y-6">
        <div>
          <h1 class="text-2xl font-extrabold text-slate-900">Mis Espacios Reservados</h1>
          <p class="text-sm text-slate-500 mt-1">Gestiona y revisa tus reservas académicas y deportivas solicitadas</p>
        </div>
        <div class="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <div class="text-center py-12 space-y-3">
            <BookmarkCheck class="w-12 h-12 text-slate-300 mx-auto" />
            <h4 class="font-bold text-slate-600">Inicia sesión para ver tus reservas</h4>
            <p class="text-xs text-slate-400 max-w-xs mx-auto">Crea una cuenta o inicia sesión para poder reservar y gestionar tus espacios universitarios.</p>
            <router-link to="/login" class="inline-flex items-center gap-2 bg-[#003087] text-white font-bold px-5 py-2.5 rounded-xl hover:bg-blue-800 transition text-xs mt-2">
              <LogIn class="w-3.5 h-3.5" />
              Iniciar Sesión
            </router-link>
          </div>
        </div>
      </div>

      <!-- TAB: PERFIL -->
      <div v-else-if="activeTab === 'perfil'" class="space-y-6">
        <div>
          <h1 class="text-2xl font-extrabold text-slate-900">Mi Perfil</h1>
          <p class="text-sm text-slate-500 mt-1">Datos personales de tu cuenta en la plataforma</p>
        </div>
        <div class="max-w-xl bg-white rounded-3xl p-8 shadow-sm border border-slate-100 space-y-6">
          <div class="flex items-center space-x-4">
            <div class="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center font-bold text-2xl border border-slate-200">
              <UserIcon class="w-8 h-8" />
            </div>
            <div>
              <h3 class="font-bold text-lg text-slate-900">Invitado</h3>
              <span class="px-2.5 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200 font-semibold text-[10px] uppercase">Sin sesión</span>
            </div>
          </div>
          <div class="pt-6 border-t border-slate-100 text-center space-y-3">
            <p class="text-sm text-slate-500">Inicia sesión o regístrate para acceder a tu perfil completo.</p>
            <div class="flex gap-3 justify-center">
              <router-link to="/login" class="bg-[#003087] text-white font-bold px-5 py-2.5 rounded-xl hover:bg-blue-800 transition text-xs">
                Iniciar Sesión
              </router-link>
              <router-link to="/register" class="border border-[#003087] text-[#003087] font-bold px-5 py-2.5 rounded-xl hover:bg-blue-50 transition text-xs">
                Crear Cuenta
              </router-link>
            </div>
          </div>
        </div>
      </div>

    </main>

    <!-- MODAL: redirige al login al intentar reservar -->
    <div v-if="showLoginModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div class="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-sm w-full overflow-hidden">
        <div class="h-1.5 bg-[#003087]"></div>
        <div class="p-6 text-center space-y-4">
          <div class="w-14 h-14 rounded-2xl bg-blue-50 text-[#003087] flex items-center justify-center mx-auto">
            <LogIn class="w-7 h-7" />
          </div>
          <h3 class="text-lg font-bold text-slate-900">Necesitas una cuenta</h3>
          <p class="text-sm text-slate-500">Para reservar un espacio debes iniciar sesión o crear una cuenta gratuita.</p>
          <div class="flex gap-3 pt-2">
            <button @click="showLoginModal = false" class="flex-1 border border-slate-200 text-slate-600 font-semibold py-2.5 rounded-xl text-xs hover:bg-slate-50 transition">
              Cancelar
            </button>
            <router-link to="/register" class="flex-1 text-center border border-[#003087] text-[#003087] font-semibold py-2.5 rounded-xl text-xs hover:bg-blue-50 transition">
              Registrarse
            </router-link>
            <router-link to="/login" class="flex-1 text-center bg-[#003087] text-white font-bold py-2.5 rounded-xl text-xs hover:bg-blue-800 transition">
              Iniciar Sesión
            </router-link>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import {
  CalendarRange, BookmarkCheck, UserCheck, MapPin,
  Monitor, Trophy, Video, Users, Loader2, LogIn,
  User as UserIcon
} from 'lucide-vue-next';

export default {
  name: 'GuestDashboardView',
  components: {
    CalendarRange, BookmarkCheck, UserCheck, MapPin,
    Monitor, Trophy, Video, Users, Loader2, LogIn, UserIcon
  },
  data() {
    return {
      activeTab: 'reservas',
      spaces: [],
      loadingSpaces: true,
      spacesError: '',
      showLoginModal: false
    };
  },
  computed: {
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
        { key: 'lab',     label: '🔬 Laboratorios de Computación y Especializados', icon: 'Monitor', spaces: this.laboratorios },
        { key: 'canchas', label: '⚽ Canchas Deportivas',                            icon: 'Trophy',  spaces: this.canchas },
        { key: 'salas',   label: '🏛️ Salas de Conferencias y Estudio',              icon: 'Video',   spaces: this.salas }
      ];
    }
  },
  async mounted() {
    await this.fetchSpaces();
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
        } else {
          this.spacesError = data.message || 'Error al cargar espacios';
        }
      } catch {
        this.spacesError = 'Error de conexión al cargar espacios';
      } finally {
        this.loadingSpaces = false;
      }
    },
    goToLogin() {
      this.showLoginModal = true;
    }
  }
};
</script>
