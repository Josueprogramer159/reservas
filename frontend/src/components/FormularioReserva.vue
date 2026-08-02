<template>
  <div class="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
    <h2 class="text-xl font-bold text-slate-900 mb-6">Detalles de la Reserva</h2>

    <form @submit.prevent="submitFormulario" class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Email solicitante -->
        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-2">Email Solicitante *</label>
          <input
            v-model="formulario.email_solicitante"
            type="email"
            placeholder="correo@utc.edu.ec"
            class="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003087]"
            required
          />
        </div>

        <!-- Fecha -->
        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-2">Fecha *</label>
          <input
            v-model="formulario.fecha"
            type="date"
            disabled
            class="w-full px-4 py-2.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-600"
          />
        </div>

        <!-- Carrera -->
        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-2">Carrera *</label>
          <select
            v-model="formulario.carrera"
            class="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003087]"
            required
          >
            <option value="">Seleccionar carrera</option>
            <option value="ELECTRICIDAD">ELECTRICIDAD</option>
            <option value="ELECTRÓNICA">ELECTRÓNICA</option>
            <option value="SISTEMAS">SISTEMAS</option>
            <option value="INDUSTRIAL">INDUSTRIAL</option>
            <option value="INGENIERÍA AGRÓNOMA">INGENIERÍA AGRÓNOMA</option>
          </select>
        </div>

        <!-- Tipo/Motivo -->
        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-2">Tipo/Motivo *</label>
          <select
            v-model="formulario.tipo"
            class="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003087]"
            required
          >
            <option value="">Seleccionar tipo</option>
            <option value="CLASE PRÁCTICA">CLASE PRÁCTICA</option>
            <option value="LABORATORIO">LABORATORIO</option>
            <option value="PROYECTO">PROYECTO</option>
            <option value="EVENTO">EVENTO</option>
            <option value="OTRO">OTRO</option>
          </select>
        </div>

        <!-- Tema -->
        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-2">Tema *</label>
          <input
            v-model="formulario.tema"
            type="text"
            placeholder="Ej: Control PID"
            class="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003087]"
            required
          />
        </div>

        <!-- Responsable Académico -->
        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-2">Responsable Académico *</label>
          <input
            v-model="formulario.responsable_academico"
            type="text"
            class="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003087]"
            required
          />
        </div>

        <!-- Nombre solicitante -->
        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-2">Nombre Solicitante *</label>
          <input
            v-model="formulario.nombre_solicitante"
            type="text"
            class="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003087]"
            required
          />
        </div>

        <!-- Hora de inicio -->
        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-2">Hora de Inicio *</label>
          <input
            v-model="formulario.hora_inicio"
            type="time"
            class="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003087]"
            required
          />
        </div>

        <!-- Ciclo -->
        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-2">Ciclo *</label>
          <select
            v-model="formulario.ciclo"
            class="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003087]"
            required
          >
            <option value="">Seleccionar ciclo</option>
            <option value="PRIMER">PRIMER</option>
            <option value="SEGUNDO">SEGUNDO</option>
            <option value="TERCERO">TERCERO</option>
            <option value="CUARTO">CUARTO</option>
            <option value="QUINTO">QUINTO</option>
            <option value="SEXTO">SEXTO</option>
            <option value="SÉPTIMO">SÉPTIMO</option>
            <option value="OCTAVO">OCTAVO</option>
          </select>
        </div>

        <!-- Total de asistentes -->
        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-2">Total de Asistentes *</label>
          <input
            v-model.number="formulario.total_asistentes"
            type="number"
            min="1"
            class="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003087]"
            required
          />
        </div>

        <!-- Responsable Administrativo -->
        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-2">Responsable Administrativo *</label>
          <input
            v-model="formulario.responsable_administrativo"
            type="text"
            class="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003087]"
            required
          />
        </div>

        <!-- Hora de finalización -->
        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-2">Hora de Finalización *</label>
          <input
            v-model="formulario.hora_finalizacion"
            type="time"
            class="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003087]"
            required
          />
        </div>

        <!-- Paralelo -->
        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-2">Paralelo *</label>
          <select
            v-model="formulario.paralelo"
            class="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003087]"
            required
          >
            <option value="">Seleccionar paralelo</option>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
            <option value="D">D</option>
            <option value="E">E</option>
          </select>
        </div>

        <!-- Software -->
        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-2">Software *</label>
          <input
            v-model="formulario.software"
            type="text"
            placeholder="Ej: Matlab, Python, etc."
            class="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003087]"
            required
          />
        </div>
      </div>

      <!-- Descripción -->
      <div>
        <label class="block text-sm font-semibold text-slate-700 mb-2">Descripción/Comentario *</label>
        <textarea
          v-model="formulario.descripcion"
          rows="4"
          class="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003087]"
          required
        ></textarea>
      </div>

      <!-- Botones -->
      <div class="flex gap-3 pt-6 border-t border-slate-100">
        <button
          type="button"
          @click="$emit('cancelar')"
          class="px-6 py-2.5 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition"
        >
          Cancelar
        </button>
        <button
          type="submit"
          :disabled="enviando"
          class="flex-1 px-6 py-2.5 bg-[#003087] text-white font-semibold rounded-lg hover:bg-[#002060] transition disabled:opacity-50"
        >
          {{ enviando ? 'Procesando...' : 'Confirmar Reserva' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'

const props = defineProps({
  espacio: Object,
  fechaSeleccionada: String
})

const emit = defineEmits(['reserva-completada', 'cancelar', 'error'])

const enviando = ref(false)
const formulario = ref({
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
})

// Obtener email del usuario autenticado
const cargarEmailDelUsuario = async () => {
  try {
    const response = await fetch('/api/auth/profile', {
      credentials: 'include'
    })
    const data = await response.json()
    if (data.success && data.user?.email) {
      formulario.value.email_solicitante = data.user.email
      console.log('Email del usuario cargado:', data.user.email)
    }
  } catch (err) {
    console.error('Error al cargar email del usuario:', err)
  }
}

onMounted(() => {
  formulario.value.fecha = props.fechaSeleccionada
  cargarEmailDelUsuario()
})

watch(() => props.fechaSeleccionada, (nuevaFecha) => {
  formulario.value.fecha = nuevaFecha
})

const submitFormulario = async () => {
  if (!validarFormulario()) return

  // Validar que todos los campos requeridos tengan valores
  const camposRequeridos = [
    'email_solicitante', 'fecha', 'carrera', 'tipo', 'tema',
    'responsable_academico', 'nombre_solicitante', 'hora_inicio', 'ciclo',
    'total_asistentes', 'responsable_administrativo', 'hora_finalizacion',
    'paralelo', 'software', 'descripcion'
  ];
  
  for (const campo of camposRequeridos) {
    if (!formulario.value[campo]) {
      emit('error', `Campo obligatorio vacío: ${campo}`);
      return;
    }
  }

  enviando.value = true
  try {
    const payload = {
      espacio_id: props.espacio.id,
      ...formulario.value
    }
    console.log('Enviando payload:', payload)
    
    const response = await fetch('/api/reservas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload)
    })

    const data = await response.json()

    if (data.success) {
      emit('reserva-completada', data.message)
    } else {
      emit('error', data.message || 'Error al crear la reserva')
    }
  } catch (err) {
    emit('error', 'Error de conexión')
  } finally {
    enviando.value = false
  }
}

const validarFormulario = () => {
  if (!formulario.value.hora_inicio || !formulario.value.hora_finalizacion) {
    emit('error', 'Las horas son requeridas')
    return false
  }

  if (formulario.value.hora_inicio >= formulario.value.hora_finalizacion) {
    emit('error', 'La hora de inicio debe ser anterior a la de finalización')
    return false
  }

  return true
}
</script>
