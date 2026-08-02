<template>
  <div class="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h3 class="text-lg font-bold text-slate-900">{{ meses[mesActual] }} {{ yearActual }}</h3>
      </div>
      <div class="flex gap-2">
        <button @click="mesPasado" class="p-2 hover:bg-slate-100 rounded-lg transition">
          <ChevronLeft class="w-5 h-5" />
        </button>
        <button @click="mesProximo" class="p-2 hover:bg-slate-100 rounded-lg transition">
          <ChevronRight class="w-5 h-5" />
        </button>
      </div>
    </div>

    <!-- Días de semana -->
    <div class="grid grid-cols-7 gap-2 mb-4">
      <div v-for="dia in diasSemana" :key="dia" class="text-center text-xs font-bold text-slate-600 py-2">
        {{ dia }}
      </div>
    </div>

    <!-- Días del calendario -->
    <div class="grid grid-cols-7 gap-2">
      <button
        v-for="dia in diasCalendario"
        :key="dia.id"
        @click="seleccionarDia(dia)"
        :disabled="!dia.habilitado"
        :class="{
          'bg-[#003087] text-white': dia.seleccionado,
          'bg-slate-100 text-slate-400 cursor-not-allowed': !dia.habilitado,
          'bg-white border border-slate-200 hover:bg-slate-50 cursor-pointer': dia.habilitado && !dia.seleccionado,
          'bg-yellow-50 border-2 border-yellow-300': dia.tieneReserva && !dia.seleccionado
        }"
        class="p-2 rounded-lg text-sm font-semibold transition"
      >
        {{ dia.numero }}
      </button>
    </div>

    <!-- Leyenda -->
    <div class="mt-6 space-y-2 text-xs">
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 rounded-sm bg-slate-100"></div>
        <span class="text-slate-600">Disponible</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 rounded-sm bg-yellow-300"></div>
        <span class="text-slate-600">Con reserva</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 rounded-sm bg-slate-200"></div>
        <span class="text-slate-600">No disponible</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

const props = defineProps({
  espacioId: String
})

const emit = defineEmits(['fecha-seleccionada', 'error', 'reserva-seleccionada'])

const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
const diasSemana = ['L', 'M', 'M', 'J', 'V', 'S', 'D']
const festivos = ['2026-08-10', '2026-12-25', '2026-01-01']

const mesActual = ref(new Date().getMonth())
const yearActual = ref(new Date().getFullYear())
const fechaSeleccionada = ref(null)
const reservasExistentes = ref([])

const cargarReservasExistentes = async () => {
  try {
    const response = await fetch(`/api/reservas/espacio/${props.espacioId}`, {
      credentials: 'include'
    })
    const data = await response.json()
    if (data.success) {
      reservasExistentes.value = data.reservas.map(r => r.fecha)
    }
  } catch (err) {
    console.error('Error al cargar reservas:', err)
  }
}

const esHabil = (fecha) => {
  const dia = fecha.getDay()
  return dia !== 0 && dia !== 6 && !festivos.includes(fecha.toISOString().split('T')[0])
}

const diasCalendario = computed(() => {
  const primerDia = new Date(yearActual.value, mesActual.value, 1)
  const ultimoDia = new Date(yearActual.value, mesActual.value + 1, 0)
  const diasArray = []
  
  const diaInicio = primerDia.getDay() === 0 ? 6 : primerDia.getDay() - 1
  
  for (let i = diaInicio; i > 0; i--) {
    const fecha = new Date(primerDia)
    fecha.setDate(fecha.getDate() - i)
    diasArray.push({
      numero: fecha.getDate(),
      fecha: fecha.toISOString().split('T')[0],
      habilitado: false,
      mesActual: false
    })
  }
  
  for (let i = 1; i <= ultimoDia.getDate(); i++) {
    const fecha = new Date(yearActual.value, mesActual.value, i)
    const fechaStr = fecha.toISOString().split('T')[0]
    const hoy = new Date().toISOString().split('T')[0]
    const esFuturo = fechaStr >= hoy
    const esHabilidad = esHabil(fecha)
    
    diasArray.push({
      id: fechaStr,
      numero: i,
      fecha: fechaStr,
      habilitado: esFuturo && esHabilidad,
      mesActual: true,
      seleccionado: fechaSeleccionada.value === fechaStr,
      tieneReserva: reservasExistentes.value.includes(fechaStr)
    })
  }
  
  const diasFaltantes = 42 - diasArray.length
  for (let i = 1; i <= diasFaltantes; i++) {
    diasArray.push({
      numero: i,
      habilitado: false,
      mesActual: false
    })
  }
  
  return diasArray
})

const seleccionarDia = (dia) => {
  if (!dia.habilitado || !dia.mesActual) return
  
  // Si tiene reserva, navegar directamente al detalle
  if (dia.tieneReserva) {
    // Emitir evento para que el padre maneje la navegación
    emit('reserva-seleccionada', dia.fecha)
  } else {
    // Si no tiene reserva, emitir como antes
    fechaSeleccionada.value = dia.fecha
    emit('fecha-seleccionada', dia.fecha)
  }
}

const mesPasado = () => {
  mesActual.value--
  if (mesActual.value < 0) {
    mesActual.value = 11
    yearActual.value--
  }
}

const mesProximo = () => {
  mesActual.value++
  if (mesActual.value > 11) {
    mesActual.value = 0
    yearActual.value++
  }
}

onMounted(() => {
  cargarReservasExistentes()
})
</script>
