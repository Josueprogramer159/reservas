<template>
  <div class="min-h-screen bg-[#f8fafc] py-10 px-4">
    <div class="max-w-5xl mx-auto">
      <!-- Botón volver -->
      <router-link
        to="/dashboard"
        class="inline-flex items-center space-x-2 text-sm font-semibold text-[#003087] hover:underline mb-6"
      >
        <ArrowLeft class="w-4 h-4" />
        <span>Volver al listado de espacios</span>
      </router-link>

      <!-- Cargando -->
      <div v-if="loading" class="text-center py-20">
        <Loader2 class="w-10 h-10 text-[#003087] animate-spin mx-auto" />
        <p class="text-sm text-slate-500 mt-4">Cargando información del espacio...</p>
      </div>

      <!-- Error - Espacio no encontrado -->
      <div v-else-if="errorMessage" class="bg-white rounded-2xl p-8 shadow-sm border border-red-100 text-center space-y-4">
        <AlertTriangle class="w-12 h-12 text-red-400 mx-auto" />
        <h2 class="text-lg font-bold text-slate-900">{{ errorMessage }}</h2>
        <router-link to="/dashboard" class="inline-block px-4 py-2.5 bg-[#003087] text-white text-sm font-semibold rounded-lg hover:bg-blue-800 transition">
          Volver al listado
        </router-link>
      </div>

      <!-- Error - Espacio inactivo -->
      <div v-else-if="espacioInactivo && espacio" class="bg-white rounded-2xl p-8 shadow-sm border border-yellow-100 text-center space-y-4">
        <AlertTriangle class="w-12 h-12 text-yellow-600 mx-auto" />
        <h2 class="text-lg font-bold text-slate-900">Espacio no disponible</h2>
        <p class="text-slate-600">{{ espacio.nombre }} ha sido desactivado y no está disponible para reservas en este momento.</p>
        <router-link to="/dashboard" class="inline-block px-4 py-2.5 bg-[#003087] text-white text-sm font-semibold rounded-lg hover:bg-blue-800 transition">
          Explorar otros espacios
        </router-link>
      </div>

      <!-- Detalle del espacio -->
      <div v-else-if="espacio" class="space-y-6">
        <!-- Imagen del espacio -->
        <div class="relative rounded-2xl overflow-hidden bg-slate-100 h-80 shadow-sm border border-slate-100">
          <img
            v-if="espacio.imagen"
            :src="espacio.imagen"
            :alt="espacio.nombre"
            class="w-full h-full object-cover"
          />
          <div v-else class="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300">
            <Beaker class="w-20 h-20 text-slate-400" />
          </div>

          <!-- Badge de disponibilidad -->
          <div class="absolute top-4 right-4">
            <span :class="espacio.disponible ? 'bg-emerald-500' : 'bg-red-500'" class="px-3 py-1.5 text-xs font-bold rounded-full text-white">
              {{ espacio.disponible ? '✓ Disponible' : '✕ No disponible' }}
            </span>
          </div>

          <!-- Badge de tipo -->
          <div class="absolute top-4 left-4">
            <span class="px-3 py-1.5 bg-[#003087] text-white text-xs font-bold rounded-full">
              {{ espacio.tipo }}
            </span>
          </div>

          <!-- Botón de favorito -->
          <div v-if="usuarioAutenticado" class="absolute top-4 right-16">
            <FavoritoButton 
              :espacio-id="espacio.id" 
              :es-favorito="espacio.es_favorito" 
              @toggle="handleFavoritoToggle"
              @error="handleFavoritoError"
            />
          </div>
        </div>

        <!-- Información principal -->
        <div class="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
          <h1 class="text-3xl font-extrabold text-slate-900 mb-2">{{ espacio.nombre }}</h1>
          
          <!-- Info de uso -->
          <div class="flex items-center gap-2 mb-6">
            <span class="px-3 py-1 bg-blue-50 text-[#003087] text-xs font-bold rounded-full">
              {{ espacio.info_uso || 'Docencia e Investigación' }}
            </span>
          </div>

          <!-- Descripción -->
          <div v-if="espacio.descripcion" class="mb-6">
            <h3 class="text-sm font-bold text-slate-700 uppercase mb-2">Descripción</h3>
            <p class="text-slate-600 leading-relaxed">{{ espacio.descripcion }}</p>
          </div>

          <!-- Grid de información -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div class="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <p class="text-xs text-slate-500 font-bold uppercase mb-1">Capacidad</p>
              <p class="text-2xl font-bold text-slate-900">{{ espacio.capacidad }}</p>
              <p class="text-xs text-slate-400">personas</p>
            </div>

            <div class="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <p class="text-xs text-slate-500 font-bold uppercase mb-1">Ubicación</p>
              <p class="text-sm font-semibold text-slate-900 line-clamp-2">{{ espacio.ubicacion }}</p>
            </div>

            <div class="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
              <p class="text-xs text-emerald-600 font-bold uppercase mb-1">Horario</p>
              <p class="text-sm font-bold text-emerald-900">{{ espacio.horario }}</p>
            </div>
          </div>

          <!-- Mensajes de éxito/error -->
          <div v-if="successMessage" class="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-sm font-medium mb-6">
            {{ successMessage }}
          </div>
          <div v-if="reservationError" class="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm font-medium mb-6">
            {{ reservationError }}
          </div>

          <!-- Botón Reservar -->
          <button
            v-if="espacio.disponible && usuarioAutenticado"
            @click="showReservaModal = true"
            class="w-full bg-[#003087] text-white font-bold py-3 rounded-xl hover:bg-blue-800 transition active:scale-95"
          >
            Reservar este espacio
          </button>
          <button
            v-else-if="!usuarioAutenticado"
            @click="$router.push('/login')"
            class="w-full bg-slate-300 text-slate-600 font-bold py-3 rounded-xl cursor-not-allowed"
          >
            Inicia sesión para reservar
          </button>
        </div>

        <!-- Responsables -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Responsable Académico -->
          <div class="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
            <h2 class="text-lg font-bold text-slate-900 mb-4">👨‍🎓 Responsable Académico</h2>
            <div class="space-y-3">
              <div>
                <p class="text-xs text-slate-500 font-bold uppercase">Nombre</p>
                <p class="text-sm font-semibold text-slate-900">{{ espacio.responsable_academico?.nombre }}</p>
              </div>
              <div>
                <p class="text-xs text-slate-500 font-bold uppercase">Email</p>
                <a :href="`mailto:${espacio.responsable_academico?.email}`" class="text-sm font-semibold text-[#003087] hover:underline">
                  {{ espacio.responsable_academico?.email }}
                </a>
              </div>
              <div>
                <p class="text-xs text-slate-500 font-bold uppercase">Teléfono</p>
                <a :href="`tel:${espacio.responsable_academico?.telefono}`" class="text-sm font-semibold text-[#003087] hover:underline">
                  {{ espacio.responsable_academico?.telefono }}
                </a>
              </div>
            </div>
          </div>

          <!-- Responsable Administrativo -->
          <div class="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
            <h2 class="text-lg font-bold text-slate-900 mb-4">👨‍💼 Responsable Administrativo</h2>
            <div class="space-y-3">
              <div>
                <p class="text-xs text-slate-500 font-bold uppercase">Nombre</p>
                <p class="text-sm font-semibold text-slate-900">{{ espacio.responsable_administrativo?.nombre }}</p>
              </div>
              <div>
                <p class="text-xs text-slate-500 font-bold uppercase">Email</p>
                <a :href="`mailto:${espacio.responsable_administrativo?.email}`" class="text-sm font-semibold text-[#003087] hover:underline">
                  {{ espacio.responsable_administrativo?.email }}
                </a>
              </div>
              <div>
                <p class="text-xs text-slate-500 font-bold uppercase">Teléfono</p>
                <a :href="`tel:${espacio.responsable_administrativo?.telefono}`" class="text-sm font-semibold text-[#003087] hover:underline">
                  {{ espacio.responsable_administrativo?.telefono }}
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- Información adicional -->
        <div class="bg-blue-50 rounded-2xl border border-blue-100 p-6">
          <h3 class="font-bold text-blue-900 mb-3">ℹ️ Información Importante</h3>
          <ul class="text-sm text-blue-800 space-y-2">
            <li>• Verififica la disponibilidad del espacio antes de hacer tu reserva</li>
            <li>• Puedes contactar con los responsables para consultas específicas</li>
            <li>• El espacio está disponible en horario: {{ espacio.horario }}</li>
            <li>• Marca como favorito para acceso rápido en futuras reservas</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Modal de reserva -->
    <ReservaModal
      :is-open="showReservaModal"
      :espacio="espacio"
      @close="showReservaModal = false"
      @reserva-completada="handleReservaCompletada"
      @error="handleReservaError"
    />
  </div>
</template>

<script>
import { ArrowLeft, AlertTriangle, Loader2, Beaker } from 'lucide-vue-next';
import FavoritoButton from '../components/FavoritoButton.vue';
import ReservaModal from '../components/ReservaModal.vue';

export default {
  name: 'SpaceDetailView',
  components: { ArrowLeft, AlertTriangle, Loader2, Beaker, FavoritoButton, ReservaModal },
  data() {
    return {
      espacio: null,
      loading: true,
      errorMessage: '',
      espacioInactivo: false,
      showReservaModal: false,
      successMessage: '',
      reservationError: '',
      submitting: false
    };
  },
  computed: {
    usuarioAutenticado() {
      return document.cookie.includes('connect.sid') || sessionStorage.getItem('user');
    }
  },
  async mounted() {
    await this.fetchEspacio();
  },
  methods: {
    async fetchEspacio() {
      this.loading = true;
      this.errorMessage = '';
      this.espacioInactivo = false;
      try {
        const res = await fetch(`/api/espacios/${this.$route.params.id}`, {
          credentials: 'include'
        });
        const data = await res.json();

        if (res.status === 404) {
          this.errorMessage = 'El espacio solicitado no existe o ha sido eliminado del sistema';
          this.espacio = null;
        } else if (res.status === 403) {
          this.espacioInactivo = true;
          this.espacio = data.espacio || null;
        } else if (data.success) {
          this.espacio = data.espacio;
        } else {
          this.errorMessage = data.message || 'Error al cargar el espacio';
        }
      } catch {
        this.errorMessage = 'Error de conexión con el servidor';
      } finally {
        this.loading = false;
      }
    },

    handleReservaCompletada(mensaje) {
      this.successMessage = mensaje || 'Reserva confirmada exitosamente';
      setTimeout(() => {
        this.$router.push('/dashboard');
      }, 2000);
    },

    handleReservaError(error) {
      this.reservationError = error;
      setTimeout(() => {
        this.reservationError = '';
      }, 5000);
    },

    handleFavoritoToggle(evento) {
      if (this.espacio) {
        this.espacio.es_favorito = evento.esFavorito;
      }
      this.successMessage = evento.message;
      setTimeout(() => { this.successMessage = ''; }, 6000);
    },

    handleFavoritoError(evento) {
      this.reservationError = evento.message;
      setTimeout(() => { this.reservationError = ''; }, 6000);
    }
  }
};
</script>
