<template>
  <div class="min-h-screen bg-[#f8fafc] flex flex-col md:flex-row">
    <!-- Barra Lateral (Sidebar Izquierda) -->
    <aside class="w-full md:w-64 bg-white border-r border-slate-100 flex flex-col justify-between p-6 flex-shrink-0">
      <div class="space-y-8">
        <!-- Perfil del Usuario Logueado en Sidebar -->
        <div class="flex items-center space-x-3 pb-6 border-b border-slate-100">
          <div class="w-10 h-10 rounded-xl bg-[#003087] text-white flex items-center justify-center font-bold text-lg shadow-sm">
            {{ userInitials }}
          </div>
          <div class="overflow-hidden">
            <h4 class="font-bold text-sm text-slate-900 truncate">{{ state.user?.nombre || 'Usuario UTC' }}</h4>
            <p class="text-xs text-slate-500 truncate">{{ state.user?.email }}</p>
          </div>
        </div>

        <!-- Navegación del Dashboard -->
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

      <!-- Salir en la parte inferior del Sidebar -->
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

    <!-- Contenido del Panel Derecho -->
    <main class="flex-grow p-6 md:p-10 space-y-8 overflow-y-auto max-h-screen">
      
      <!-- SECCIÓN: RESERVAS DE ESPACIOS (ORGANIZADA POR CATEGORÍAS) -->
      <div v-if="activeTab === 'reservas'" class="space-y-10">
        <div>
          <h1 class="text-2xl font-extrabold text-slate-900">Reservar Espacios Universitarios</h1>
          <p class="text-sm text-slate-500 mt-1">Explora y selecciona el espacio disponible según la categoría requerida</p>
        </div>

        <!-- 1. CATEGORÍA: LABORATORIOS -->
        <div class="space-y-4">
          <h2 class="text-lg font-bold text-[#003087] flex items-center space-x-2 border-b border-slate-100 pb-2">
            <Monitor class="w-5 h-5 text-[#FFB800]" />
            <span>🔬 Laboratorios de Computación y Especializados</span>
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div v-for="space in laboratorios" :key="space.id" class="card-premium overflow-hidden flex flex-col justify-between group">
              <div class="relative overflow-hidden h-40 bg-slate-100">
                <img :src="space.image" :alt="space.name" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                <span class="absolute top-3 left-3 bg-[#003087] text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                  {{ space.category }}
                </span>
              </div>
              <div class="p-5 flex-grow flex flex-col justify-between">
                <div>
                  <h3 class="font-bold text-slate-900 text-sm mb-1.5 leading-snug">{{ space.name }}</h3>
                  <p class="text-xs text-slate-500 mb-4 leading-relaxed">{{ space.description }}</p>
                  <div class="flex items-center space-x-2 text-xs text-slate-400 font-semibold mb-4">
                    <MapPin class="w-3.5 h-3.5 text-[#FFB800]" />
                    <span>{{ space.location }}</span>
                  </div>
                </div>
                <button 
                  @click="openReservationModal(space)"
                  class="w-full bg-[#003087] text-white text-xs font-semibold py-2.5 rounded-lg hover:bg-blue-800 transition duration-200 active:scale-95"
                >
                  Reservar Ahora
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 2. CATEGORÍA: CANCHAS -->
        <div class="space-y-4">
          <h2 class="text-lg font-bold text-[#003087] flex items-center space-x-2 border-b border-slate-100 pb-2">
            <Trophy class="w-5 h-5 text-[#FFB800]" />
            <span>⚽ Canchas Deportivas</span>
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div v-for="space in canchas" :key="space.id" class="card-premium overflow-hidden flex flex-col justify-between group">
              <div class="relative overflow-hidden h-40 bg-slate-100">
                <img :src="space.image" :alt="space.name" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                <span class="absolute top-3 left-3 bg-[#003087] text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                  {{ space.category }}
                </span>
              </div>
              <div class="p-5 flex-grow flex flex-col justify-between">
                <div>
                  <h3 class="font-bold text-slate-900 text-sm mb-1.5 leading-snug">{{ space.name }}</h3>
                  <p class="text-xs text-slate-500 mb-4 leading-relaxed">{{ space.description }}</p>
                  <div class="flex items-center space-x-2 text-xs text-slate-400 font-semibold mb-4">
                    <MapPin class="w-3.5 h-3.5 text-[#FFB800]" />
                    <span>{{ space.location }}</span>
                  </div>
                </div>
                <button 
                  @click="openReservationModal(space)"
                  class="w-full bg-[#003087] text-white text-xs font-semibold py-2.5 rounded-lg hover:bg-blue-800 transition duration-200 active:scale-95"
                >
                  Reservar Ahora
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 3. CATEGORÍA: SALAS -->
        <div class="space-y-4">
          <h2 class="text-lg font-bold text-[#003087] flex items-center space-x-2 border-b border-slate-100 pb-2">
            <Video class="w-5 h-5 text-[#FFB800]" />
            <span>🏛️ Salas de Conferencias y Estudio</span>
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div v-for="space in salas" :key="space.id" class="card-premium overflow-hidden flex flex-col justify-between group">
              <div class="relative overflow-hidden h-40 bg-slate-100">
                <img :src="space.image" :alt="space.name" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                <span class="absolute top-3 left-3 bg-[#003087] text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                  {{ space.category }}
                </span>
              </div>
              <div class="p-5 flex-grow flex flex-col justify-between">
                <div>
                  <h3 class="font-bold text-slate-900 text-sm mb-1.5 leading-snug">{{ space.name }}</h3>
                  <p class="text-xs text-slate-500 mb-4 leading-relaxed">{{ space.description }}</p>
                  <div class="flex items-center space-x-2 text-xs text-slate-400 font-semibold mb-4">
                    <MapPin class="w-3.5 h-3.5 text-[#FFB800]" />
                    <span>{{ space.location }}</span>
                  </div>
                </div>
                <button 
                  @click="openReservationModal(space)"
                  class="w-full bg-[#003087] text-white text-xs font-semibold py-2.5 rounded-lg hover:bg-blue-800 transition duration-200 active:scale-95"
                >
                  Reservar Ahora
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- SECCIÓN: MIS ESPACIOS (RESERVAS ACTIVAS) -->
      <div v-else-if="activeTab === 'mis-espacios'" class="space-y-6">
        <div>
          <h1 class="text-2xl font-extrabold text-slate-900">Mis Espacios Reservados</h1>
          <p class="text-sm text-slate-500 mt-1">Gestiona y revisa tus reservas académicas y deportivas solicitadas</p>
        </div>

        <div class="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <div v-if="myReservations.length > 0" class="space-y-4">
            <div 
              v-for="res in myReservations" 
              :key="res.id" 
              class="p-4 rounded-2xl border border-slate-100 hover:border-slate-200/80 hover:bg-slate-50/50 transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div class="flex items-start sm:items-center space-x-4">
                <div class="p-3 bg-blue-50 text-[#003087] rounded-xl flex-shrink-0">
                  <component :is="getSpaceIcon(res.category)" class="w-5.5 h-5.5" />
                </div>
                <div>
                  <h4 class="font-bold text-slate-900 text-sm">{{ res.spaceName }}</h4>
                  <p class="text-xs text-slate-500 mt-1 font-medium flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span>Fecha: {{ res.date }}</span>
                    <span class="text-slate-300">|</span>
                    <span>Horario: {{ res.time }}</span>
                  </p>
                </div>
              </div>
              
              <div class="flex items-center justify-between sm:justify-end gap-3">
                <span class="px-3 py-1 text-[11px] font-bold rounded-full bg-emerald-50 text-emerald-700">
                  {{ res.status }}
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

      <!-- SECCIÓN: MI PERFIL -->
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

    <!-- MODAL DE CONFIRMACIÓN DE RESERVA -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div class="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-md w-full overflow-hidden">
        <div class="h-1.5 bg-[#003087]"></div>
        
        <div class="p-6">
          <h3 class="text-lg font-bold text-slate-900 mb-2">Completar Reserva</h3>
          <p class="text-xs text-slate-500 mb-6">Estás reservando: <span class="font-semibold text-[#003087]">{{ selectedSpace?.name }}</span></p>
          
          <div class="space-y-4">
            <!-- Selección de Fecha -->
            <div>
              <label class="block text-xs font-bold text-slate-600 mb-1">Fecha</label>
              <input v-model="form.date" type="date" class="form-input text-sm" :min="todayDate">
            </div>
            
            <!-- Selección de Horario -->
            <div>
              <label class="block text-xs font-bold text-slate-600 mb-1">Horario</label>
              <select v-model="form.time" class="form-input text-sm">
                <option value="08:00 - 10:00">08:00 - 10:00</option>
                <option value="10:00 - 12:00">10:00 - 12:00</option>
                <option value="12:00 - 14:00">12:00 - 14:00</option>
                <option value="14:00 - 16:00">14:00 - 16:00</option>
                <option value="16:00 - 18:00">16:00 - 18:00</option>
              </select>
            </div>
          </div>

          <div class="flex space-x-3 mt-8">
            <button @click="showModal = false" class="w-1/2 border border-slate-200 text-slate-700 font-semibold py-2.5 rounded-xl text-xs hover:bg-slate-50 transition active:scale-95">
              Cancelar
            </button>
            <button @click="confirmReservation" class="w-1/2 bg-[#003087] text-white font-bold py-2.5 rounded-xl text-xs hover:bg-blue-800 transition active:scale-95 shadow-md shadow-[#003087]/5">
              Confirmar Reserva
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { 
  CalendarRange, 
  BookmarkCheck, 
  UserCheck, 
  LogOut, 
  MapPin, 
  Trash2, 
  Monitor, 
  Trophy, 
  Video 
} from 'lucide-vue-next';
import { authState } from '../router';

export default {
  name: 'DashboardView',
  components: {
    CalendarRange,
    BookmarkCheck,
    UserCheck,
    LogOut,
    MapPin,
    Trash2,
    Monitor,
    Trophy,
    Video
  },
  data() {
    return {
      state: authState,
      activeTab: 'reservas',
      showModal: false,
      selectedSpace: null,
      form: {
        date: '',
        time: '10:00 - 12:00'
      },
      // Espacios Reservables clasificados correctamente
      spaces: [
        {
          id: 1,
          name: 'Laboratorio de Computación Avanzada B3',
          category: 'Laboratorios',
          description: 'Equipado con 30 ordenadores de alto rendimiento e internet de fibra óptica.',
          location: 'Bloque B, Segundo Piso',
          image: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=600'
        },
        {
          id: 2,
          name: 'Cancha de Fútbol Sintética Nº 1',
          category: 'Canchas',
          description: 'Cancha reglamentaria de césped sintético ideal para entrenamientos y partidos.',
          location: 'Área Deportiva Principal',
          image: 'https://images.unsplash.com/photo-1544698310-74ea9d1c8258?auto=format&fit=crop&q=80&w=600'
        },
        {
          id: 3,
          name: 'Auditorio de Conferencias UTC',
          category: 'Salas',
          description: 'Sala magna equipada con sonido envolvente y proyector de alta definición.',
          location: 'Bloque Administrativo, PB',
          image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=600'
        },
        {
          id: 4,
          name: 'Laboratorio de Robótica y Hardware',
          category: 'Laboratorios',
          description: 'Mesas de trabajo técnico equipadas con osciloscopios, cautines y kits Arduino.',
          location: 'Bloque C, Primer Piso',
          image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&q=80&w=600'
        },
        {
          id: 5,
          name: 'Cancha de Baloncesto y Vóley Cubierta',
          category: 'Canchas',
          description: 'Coliseo techado con tableros profesionales y gradas para espectadores.',
          location: 'Coliseo Universitario',
          image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&q=80&w=600'
        },
        {
          id: 6,
          name: 'Sala de Estudio Grupal A2',
          category: 'Salas',
          description: 'Espacio silencioso equipado con pizarra acrílica y mesa redonda para trabajos colaborativos.',
          location: 'Bloque A, Primer Piso',
          image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=600'
        }
      ],
      // Reservas del Usuario (en memoria)
      myReservations: [
        {
          id: 101,
          spaceName: 'Laboratorio de Computación Avanzada B3',
          category: 'Laboratorios',
          date: '2026-06-25',
          time: '10:00 - 12:00',
          status: 'Confirmado'
        },
        {
          id: 102,
          spaceName: 'Cancha de Fútbol Sintética Nº 1',
          category: 'Canchas',
          date: '2026-06-27',
          time: '16:00 - 18:00',
          status: 'Confirmado'
        }
      ]
    }
  },
  computed: {
    userInitials() {
      const name = this.state.user?.nombre || 'Usuario';
      return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    },
    todayDate() {
      const today = new Date();
      const dd = String(today.getDate()).padStart(2, '0');
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const yyyy = today.getFullYear();
      return `${yyyy}-${mm}-${dd}`;
    },
    // Computed properties para filtrar por categorías
    laboratorios() {
      return this.spaces.filter(space => space.category === 'Laboratorios');
    },
    canchas() {
      return this.spaces.filter(space => space.category === 'Canchas');
    },
    salas() {
      return this.spaces.filter(space => space.category === 'Salas');
    }
  },
  mounted() {
    this.form.date = this.todayDate;
  },
  methods: {
    getSpaceIcon(category) {
      if (category === 'Laboratorios') return 'Monitor';
      if (category === 'Canchas') return 'Trophy';
      return 'Video';
    },
    openReservationModal(space) {
      this.selectedSpace = space;
      this.showModal = true;
    },
    confirmReservation() {
      if (!this.form.date) return;
      
      const newRes = {
        id: Date.now(),
        spaceName: this.selectedSpace.name,
        category: this.selectedSpace.category,
        date: this.form.date,
        time: this.form.time,
        status: 'Confirmado'
      };
      
      this.myReservations.unshift(newRes);
      this.showModal = false;
      this.activeTab = 'mis-espacios'; // Redirigir a sus espacios reservados
    },
    cancelReservation(resId) {
      if (confirm('¿Estás seguro de que deseas cancelar esta reserva?')) {
        this.myReservations = this.myReservations.filter(res => res.id !== resId);
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
          this.$router.push('/');
        }
      } catch (error) {
        console.error('Error al intentar cerrar la sesión del usuario:', error);
      }
    }
  }
}
</script>
