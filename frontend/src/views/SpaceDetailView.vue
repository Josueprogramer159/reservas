<template>
  <div class="min-h-screen bg-[#f8fafc] py-10 px-4">
    <div class="max-w-4xl mx-auto">
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

      <!-- Error -->
      <div v-else-if="errorMessage" class="bg-white rounded-2xl p-8 shadow-sm border border-red-100 text-center space-y-4">
        <AlertTriangle class="w-12 h-12 text-red-400 mx-auto" />
        <h2 class="text-lg font-bold text-slate-900">{{ errorMessage }}</h2>
        <router-link to="/dashboard" class="btn-primary inline-block text-sm">Ir al listado</router-link>
      </div>

      <!-- Detalle del espacio -->
      <div v-else-if="espacio" class="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div class="relative h-56 md:h-72 bg-slate-100">
          <img
            v-if="espacio.imagen"
            :src="espacio.imagen"
            :alt="espacio.nombre"
            class="w-full h-full object-cover"
          >
          <span class="absolute top-4 left-4 bg-[#003087] text-white text-xs font-extrabold px-3 py-1.5 rounded-full uppercase tracking-wider">
            {{ espacio.tipo }}
          </span>
          <span
            class="absolute top-4 right-4 text-xs font-bold px-3 py-1.5 rounded-full"
            :class="espacio.disponible ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'"
          >
            {{ espacio.disponible ? 'Disponible' : 'No disponible' }}
          </span>
        </div>

        <div class="p-8 space-y-6">
          <div>
            <h1 class="text-2xl font-extrabold text-slate-900">{{ espacio.nombre }}</h1>
            <p class="text-sm text-slate-500 mt-2 leading-relaxed">{{ espacio.descripcion }}</p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <Users class="w-5 h-5 text-[#FFB800] mb-2" />
              <p class="text-xs text-slate-400 font-bold uppercase">Capacidad</p>
              <p class="text-lg font-bold text-slate-900">{{ espacio.capacidad }} personas</p>
            </div>
            <div class="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <MapPin class="w-5 h-5 text-[#FFB800] mb-2" />
              <p class="text-xs text-slate-400 font-bold uppercase">Ubicación</p>
              <p class="text-sm font-semibold text-slate-900">{{ espacio.ubicacion }}</p>
            </div>
            <div class="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <Tag class="w-5 h-5 text-[#FFB800] mb-2" />
              <p class="text-xs text-slate-400 font-bold uppercase">Tipo</p>
              <p class="text-sm font-semibold text-slate-900">{{ espacio.tipo }}</p>
            </div>
          </div>

          <div v-if="espacio.info_complementaria" class="bg-blue-50 rounded-xl p-5 border border-blue-100">
            <h3 class="text-sm font-bold text-[#003087] mb-2">Información complementaria</h3>
            <p class="text-sm text-slate-600 leading-relaxed">{{ espacio.info_complementaria }}</p>
          </div>

          <div class="bg-slate-50 rounded-xl p-5 border border-slate-100">
            <h3 class="text-sm font-bold text-slate-900 mb-2">Reserva definida por administración</h3>
            <p v-if="reservationConfig" class="text-sm text-slate-600">
              Fecha: <span class="font-semibold text-slate-900">{{ reservationConfig.fecha }}</span>
              | Horario: <span class="font-semibold text-slate-900">{{ reservationConfig.horario }}</span>
            </p>
            <p v-else class="text-sm text-amber-600 font-medium">
              El administrador aún no ha configurado la fecha y el horario para reservar.
            </p>
          </div>

          <div v-if="espacio.horarios_libres?.length > 0" class="space-y-2">
            <p class="text-xs font-bold text-slate-500 uppercase">Horario disponible</p>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="h in espacio.horarios_libres"
                :key="h"
                class="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-lg border border-emerald-100"
              >
                {{ h }}
              </span>
            </div>
          </div>
          <div v-else class="p-4 bg-red-50 rounded-xl border border-red-100">
            <p class="text-sm text-red-700 font-medium">No hay disponibilidad para la configuración actual de reservas.</p>
          </div>

          <div v-if="successMessage" class="p-3.5 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-sm font-medium">
            {{ successMessage }}
          </div>
          <div v-if="reservationError" class="p-3.5 bg-red-50 border border-red-100 text-red-700 rounded-xl text-sm font-medium">
            {{ reservationError }}
          </div>

          <button
            v-if="espacio.disponible"
            @click="showModal = true"
            :disabled="!reservationConfig"
            class="w-full bg-[#003087] text-white font-bold py-3 rounded-xl hover:bg-blue-800 transition active:scale-95 disabled:opacity-50"
          >
            Reservar este espacio
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de reserva -->
    <div v-if="showModal && espacio" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div class="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-md w-full overflow-hidden">
        <div class="h-1.5 bg-[#003087]"></div>
        <div class="p-6">
          <h3 class="text-lg font-bold text-slate-900 mb-2">Completar Reserva</h3>
          <p class="text-xs text-slate-500 mb-6">
            Reservando: <span class="font-semibold text-[#003087]">{{ espacio.nombre }}</span>
          </p>
          <div class="space-y-4">
            <div class="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p class="text-sm text-slate-700">¿Estás seguro de que deseas confirmar esta reserva?</p>
            </div>
          </div>
          <div class="flex space-x-3 mt-8">
            <button @click="showModal = false" class="w-1/2 border border-slate-200 text-slate-700 font-semibold py-2.5 rounded-xl text-xs hover:bg-slate-50">
              Cancelar
            </button>
            <button
              @click="confirmReservation"
              :disabled="submitting || !reservationConfig"
              class="w-1/2 bg-[#003087] text-white font-bold py-2.5 rounded-xl text-xs hover:bg-blue-800 disabled:opacity-50"
            >
              {{ submitting ? 'Procesando...' : 'Confirmar' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ArrowLeft, MapPin, Users, Tag, AlertTriangle, Loader2 } from 'lucide-vue-next';

export default {
  name: 'SpaceDetailView',
  components: { ArrowLeft, MapPin, Users, Tag, AlertTriangle, Loader2 },
  data() {
    return {
      espacio: null,
      loading: true,
      errorMessage: '',
      reservationConfig: null,
      showModal: false,
      successMessage: '',
      reservationError: '',
      submitting: false
    };
  },
  async mounted() {
    await this.fetchEspacio();
  },
  methods: {
    async fetchEspacio() {
      this.loading = true;
      this.errorMessage = '';
      try {
        const res = await fetch(`/api/espacios/${this.$route.params.id}`);
        const data = await res.json();
        if (res.status === 404) {
          this.errorMessage = data.message || 'El espacio solicitado no existe';
          this.espacio = null;
        } else if (res.status === 403) {
          this.errorMessage = data.message || 'Este espacio no está disponible';
          this.espacio = null;
        } else if (data.success) {
          this.espacio = data.espacio;
          this.reservationConfig = data.configuracionReserva || null;
        } else {
          this.errorMessage = data.message || 'Error al cargar el espacio';
        }
      } catch {
        this.errorMessage = 'Error de conexión con el servidor';
      } finally {
        this.loading = false;
      }
    },
    async confirmReservation() {
      if (!this.espacio || !this.reservationConfig) return;
      this.submitting = true;
      this.reservationError = '';
      try {
        const res = await fetch('/api/reservas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            espacio_id: this.espacio.id
          })
        });
        const data = await res.json();
        if (data.success) {
          this.showModal = false;
          this.successMessage = data.message;
          await this.fetchEspacio();
        } else {
          this.reservationError = data.message;
        }
      } catch {
        this.reservationError = 'Error de conexión al procesar la reserva';
      } finally {
        this.submitting = false;
      }
    }
  }
};
</script>
