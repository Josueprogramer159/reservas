<template>
  <Teleport to="body" v-if="isOpen">
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div class="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <h2 class="text-xl font-bold text-slate-900">
            {{ paso === 1 ? 'Selecciona una fecha' : 'Completa tu reserva' }}
          </h2>
          <button @click="cerrar" class="p-2 hover:bg-slate-100 rounded-lg">
            ✕
          </button>
        </div>

        <div class="p-6">
        <Toast ref="toast" />
          <!-- PASO 1: CALENDARIO -->
          <div v-if="paso === 1" class="space-y-4">
            <p class="text-slate-600">Elige un día disponible para reservar {{ espacio?.nombre }}</p>
            
            <div class="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <div class="flex items-center justify-between mb-4">
                <h3 class="font-bold text-slate-900">{{ meses[mesActual] }} {{ yearActual }}</h3>
                <div class="flex gap-2">
                  <button @click="mesPasado" class="p-2 hover:bg-white rounded-lg">◀</button>
                  <button @click="mesProximo" class="p-2 hover:bg-white rounded-lg">▶</button>
                </div>
              </div>

              <div class="grid grid-cols-7 gap-2 mb-2">
                <div v-for="dia in diasSemana" :key="dia" class="text-center text-xs font-bold text-slate-600 py-2">
                  {{ dia }}
                </div>
              </div>

              <div class="grid grid-cols-7 gap-2">
                <button
                  v-for="dia in diasCalendario"
                  :key="dia.id || dia.numero"
                  @click="seleccionarDia(dia)"
                  :disabled="!dia.habilitado"
                  :class="{
                    'bg-[#003087] text-white': dia.seleccionado,
                    'bg-slate-200 text-slate-400': !dia.habilitado,
                    'bg-white border border-slate-300 hover:bg-slate-100': dia.habilitado && !dia.seleccionado,
                    'bg-yellow-100 border-2 border-yellow-400': dia.tieneReserva && !dia.seleccionado
                  }"
                  class="p-2 rounded-lg text-sm font-semibold"
                >
                  {{ dia.numero }}
                </button>
              </div>
            </div>

            <div v-if="fechaSeleccionada" class="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p class="text-sm font-semibold text-blue-900">
                📅 {{ formatearFecha(fechaSeleccionada) }}
              </p>
            </div>
          </div>

          <!-- PASO 2: FORMULARIO -->
          <div v-else class="space-y-4">
            <form @submit.prevent="submitFormulario" class="space-y-3">
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">Email *</label>
                  <input v-model="formulario.email_solicitante" id="email" type="email" class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" required />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">Nombre *</label>
                  <input v-model="formulario.nombre_solicitante" id="nombre" type="text" class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" required />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">Carrera *</label>
                  <select v-model="formulario.carrera" id="carrera" class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" required>
                    <option value="">Seleccionar</option>
                    <option v-for="carrera in carrerasDisponibles" :key="carrera" :value="carrera">
                      {{ carrera }}
                    </option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">Ciclo *</label>
                  <select v-model="formulario.ciclo" id="ciclo" class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" required>
                    <option value="">Seleccionar</option>
                    <option value="NIVELACIÓN">NIVELACIÓN</option>
                    <option value="PRIMER SEMESTRE">PRIMER SEMESTRE</option>
                    <option value="SEGUNDO SEMESTRE">SEGUNDO SEMESTRE</option>
                    <option value="TERCER SEMESTRE">TERCER SEMESTRE</option>
                    <option value="CUARTO SEMESTRE">CUARTO SEMESTRE</option>
                    <option value="QUINTO SEMESTRE">QUINTO SEMESTRE</option>
                    <option value="SEXTO SEMESTRE">SEXTO SEMESTRE</option>
                    <option value="SÉPTIMO SEMESTRE">SÉPTIMO SEMESTRE</option>
                    <option value="OCTAVO SEMESTRE">OCTAVO SEMESTRE</option>
                    <option value="NOVENO SEMESTRE">NOVENO SEMESTRE</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">Tipo *</label>
                  <select v-model="formulario.tipo" id="tipo" class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" required>
                    <option value="">Seleccionar</option>
                    <option value="CLASE PRÁCTICA">CLASE PRÁCTICA</option>
                    <option value="LABORATORIO">LABORATORIO</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">Paralelo *</label>
                  <select v-model="formulario.paralelo" id="paralelo" class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" required>
                    <option value="">Seleccionar</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">Tema *</label>
                  <input v-model="formulario.tema" id="tema" type="text" class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" required />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">Resp. Académico *</label>
                  <input v-model="formulario.responsable_academico" id="resp_ac" type="text" class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" required />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">Resp. Administrativo *</label>
                  <input v-model="formulario.responsable_administrativo" id="resp_ad" type="text" class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" required />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">Hora Inicio *</label>
                  <input v-model="formulario.hora_inicio" id="hora_inicio" type="time" class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" required />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">Hora Fin *</label>
                  <input v-model="formulario.hora_finalizacion" id="hora_fin" type="time" class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" required />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">Asistentes * (Máx: {{ espacio?.capacidad }})</label>
                  <input v-model.number="formulario.total_asistentes" id="asistentes" type="number" :max="espacio?.capacidad" min="1" class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" required />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">Software *</label>
                  <input v-model="formulario.software" id="software" type="text" class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" required />
                </div>
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Descripción *</label>
                <textarea v-model="formulario.descripcion" id="descripcion" rows="2" class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" required></textarea>
              </div>

              <div v-if="errorFormulario" class="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {{ errorFormulario }}
              </div>

              <div class="flex gap-3 pt-4 border-t">
                <button type="button" @click="paso = 1" class="px-4 py-2 border border-slate-300 text-slate-700 font-semibold rounded-lg text-sm">
                  Atrás
                </button>
                <button type="submit" :disabled="enviando" class="flex-1 px-4 py-2 bg-[#003087] text-white font-semibold rounded-lg text-sm">
                  {{ enviando ? 'Procesando...' : 'Confirmar' }}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div class="sticky bottom-0 border-t bg-slate-50 px-6 py-3 flex gap-3">
          <button v-if="paso === 1" @click="cerrar" class="flex-1 px-4 py-2 border border-slate-300 text-slate-700 font-semibold rounded-lg text-sm">
            Cancelar
          </button>
          <button v-if="paso === 1" @click="irAlFormulario" :disabled="!fechaSeleccionada" class="flex-1 px-4 py-2 bg-[#003087] text-white font-semibold rounded-lg text-sm">
            Continuar
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script>
import Toast from './Toast.vue';

export default {
  name: 'ReservaModal',
  components: { Toast },
  props: {
    isOpen: Boolean,
    espacio: Object
  },
  emits: ['close', 'reserva-completada', 'error'],
  data() {
    return {
      paso: 1,
      fechaSeleccionada: null,
      enviando: false,
      errorFormulario: '',
      meses: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
      diasSemana: ['L', 'M', 'M', 'J', 'V', 'S', 'D'],
      mesActual: new Date().getMonth(),
      yearActual: new Date().getFullYear(),
      reservasExistentes: [],
      carrerasPorFacultad: {
        CIYA: ['ELECTRICIDAD', 'ELECTROMECÁNICA', 'HIDRÁULICA', 'INDUSTRIAL', 'SISTEMAS DE INFORMACIÓN', 'SOFTWARE'],
        CAYE: ['ADMINISTRACIÓN DE EMPRESAS', 'CONTABILIDAD Y FINANZAS', 'ECONOMÍA', 'GESTIÓN DE LA INFORMACIÓN GERENCIAL', 'GESTIÓN DEL TALENTO HUMANO', 'MERCADOTECNIA'],
        CSAYE: ['DISEÑO GRÁFICO', 'DISEÑO GRÁFICO INTERACTIVO', 'COMUNICACIÓN DIGITAL ESTRATÉGICA', 'TRABAJO SOCIAL', 'ANIMACIÓN DIGITAL', 'PSICOLOGÍA SOCIAL'],
        CAREN: ['AGRONOMÍA', 'MEDICINA VETERINARIA', 'BIOTECNOLOGÍA', 'AGROINDUSTRIA', 'AGROPECUARIA', 'AMBIENTE', 'TURISMO']
      },
      formulario: {
        email_solicitante: '',
        fecha: '',
        carrera: '',
        tipo: '',
        tema: '',
        responsable_academico: '',
        nombre_solicitante: '',
        hora_inicio: '',
        ciclo: '',
        total_asistentes: 1,
        responsable_administrativo: '',
        hora_finalizacion: '',
        paralelo: '',
        software: '',
        descripcion: ''
      }
    };
  },
  computed: {
    diasCalendario() {
      const primerDia = new Date(this.yearActual, this.mesActual, 1);
      const ultimoDia = new Date(this.yearActual, this.mesActual + 1, 0);
      const diasArray = [];
      const diaInicio = primerDia.getDay() === 0 ? 6 : primerDia.getDay() - 1;
      
      for (let i = diaInicio; i > 0; i--) {
        const fecha = new Date(primerDia);
        fecha.setDate(fecha.getDate() - i);
        diasArray.push({ numero: fecha.getDate(), habilitado: false });
      }
      
      for (let i = 1; i <= ultimoDia.getDate(); i++) {
        const fecha = new Date(this.yearActual, this.mesActual, i);
        const fechaStr = fecha.toISOString().split('T')[0];
        const hoy = new Date().toISOString().split('T')[0];
        const esFuturo = fechaStr >= hoy;
        const esDiaLaboral = fecha.getDay() !== 0 && fecha.getDay() !== 6;
        
        diasArray.push({
          id: fechaStr,
          numero: i,
          fecha: fechaStr,
          habilitado: esFuturo && esDiaLaboral,
          mesActual: true,
          seleccionado: this.fechaSeleccionada === fechaStr,
          tieneReserva: this.reservasExistentes.includes(fechaStr)
        });
      }
      
      const diasFaltantes = 42 - diasArray.length;
      for (let i = 1; i <= diasFaltantes; i++) {
        diasArray.push({ numero: i, habilitado: false });
      }
      
      return diasArray;
    },
    carrerasDisponibles() {
      if (!this.espacio?.ubicacion) return [];
      const match = this.espacio.ubicacion.match(/^(CIYA|CAREN|CAYE|CSAYE)\s*[—–-]/i);
      const facultad = match ? match[1].toUpperCase() : null;
      return facultad && this.carrerasPorFacultad[facultad] ? this.carrerasPorFacultad[facultad] : this.carrerasPorFacultad.CIYA;
    }
  },
  watch: {
    isOpen(nuevoValor) {
      if (nuevoValor) {
        this.cargarReservasExistentes();
        this.cargarEmailDelUsuario();
        this.paso = 1;
        this.fechaSeleccionada = null;
      }
    }
  },
  methods: {
    seleccionarDia(dia) {
      if (dia.habilitado && dia.mesActual) {
        this.fechaSeleccionada = dia.fecha;
      }
    },
    mesPasado() {
      this.mesActual--;
      if (this.mesActual < 0) {
        this.mesActual = 11;
        this.yearActual--;
      }
    },
    mesProximo() {
      this.mesActual++;
      if (this.mesActual > 11) {
        this.mesActual = 0;
        this.yearActual++;
      }
    },
    formatearFecha(fecha) {
      if (!fecha) return '';
      const date = new Date(fecha + 'T00:00:00');
      return date.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    },
    irAlFormulario() {
      if (this.fechaSeleccionada) {
        this.formulario.fecha = this.fechaSeleccionada;
        this.paso = 2;
      }
    },
    async cargarReservasExistentes() {
      try {
        const response = await fetch(`/api/reservas/espacio/${this.espacio?.id}`, { credentials: 'include' });
        const data = await response.json();
        if (data.success) {
          this.reservasExistentes = data.reservas.map(r => r.fecha);
        }
      } catch (err) {
        console.error('Error:', err);
      }
    },
    async cargarEmailDelUsuario() {
      try {
        const response = await fetch('/api/auth/profile', { credentials: 'include' });
        const data = await response.json();
        if (data.success && data.user?.email) {
          this.formulario.email_solicitante = data.user.email;
        }
      } catch (err) {
        console.error('Error:', err);
      }
    },
    async submitFormulario() {
      this.errorFormulario = '';
      
      if (!this.formulario.hora_inicio || !this.formulario.hora_finalizacion) {
        this.errorFormulario = 'Las horas son requeridas';
        return;
      }

      if (this.formulario.hora_inicio >= this.formulario.hora_finalizacion) {
        this.errorFormulario = 'Hora inicio debe ser antes que hora fin';
        return;
      }

      if (this.formulario.total_asistentes > this.espacio?.capacidad) {
        this.errorFormulario = `No puedes ingresar más de ${this.espacio.capacidad} asistentes. La capacidad máxima del espacio es ${this.espacio.capacidad} personas.`;
        return;
      }

      if (this.formulario.total_asistentes < 1) {
        this.errorFormulario = 'Debes ingresar al menos 1 asistente';
        return;
      }

      this.enviando = true;
      try {
        const payload = { espacio_id: this.espacio.id, ...this.formulario };
        const response = await fetch('/api/reservas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (data.success) {
          this.$refs.toast.mostrar('Reserva confirmada correctamente', 'info', 5000);
          this.$emit('reserva-completada', data.message || 'Reserva confirmada');
          setTimeout(() => this.cerrar(), 500);
        } else {
          this.$refs.toast.mostrar(data.message || 'Error al crear la reserva', 'error', 5000);
          this.errorFormulario = data.message || 'Error al crear la reserva';
        }
      } catch (err) {
        this.$refs.toast.mostrar('Error de conexión', 'error', 5000);
        this.errorFormulario = 'Error de conexión';
      } finally {
        this.enviando = false;
      }
    },
    cerrar() {
      this.paso = 1;
      this.fechaSeleccionada = null;
      this.formulario = {
        email_solicitante: '',
        fecha: '',
        carrera: '',
        tipo: '',
        tema: '',
        responsable_academico: '',
        nombre_solicitante: '',
        hora_inicio: '',
        ciclo: '',
        total_asistentes: 1,
        responsable_administrativo: '',
        hora_finalizacion: '',
        paralelo: '',
        software: '',
        descripcion: ''
      };
      this.errorFormulario = '';
      this.$emit('close');
    }
  }
};
</script>
