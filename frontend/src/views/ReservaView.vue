<template>
  <div class="min-h-screen bg-[#f8fafc]">
    <Navbar />

    <main class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8">
        <h1 class="text-3xl font-extrabold text-slate-900">Reservar {{ espacio?.nombre }}</h1>
        <p class="text-slate-600 mt-1">Selecciona una fecha y completa los detalles de tu reserva</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Calendario -->
        <div class="lg:col-span-1">
          <CalendarioReserva
            :espacio-id="espacioId"
            @fecha-seleccionada="handleFechaSeleccionada"
            @error="handleError"
          />
        </div>

        <!-- Formulario -->
        <div class="lg:col-span-2">
          <FormularioReserva
            v-if="fechaSeleccionada"
            :espacio="espacio"
            :fecha-seleccionada="fechaSeleccionada"
            @reserva-completada="handleReservaCompletada"
            @cancelar="resetFormulario"
            @error="handleError"
          />
          <div v-else class="bg-white rounded-2xl border border-slate-100 p-12 text-center">
            <CalendarDays class="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p class="text-slate-600 font-medium text-lg">Selecciona una fecha en el calendario</p>
            <p class="text-slate-500 text-sm mt-2">para completar tu reserva</p>
          </div>
        </div>
      </div>

      <!-- Toast de éxito -->
      <div v-if="successMessage" class="fixed bottom-4 right-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg shadow-lg">
        {{ successMessage }}
      </div>

      <!-- Toast de error -->
      <div v-if="errorMessage" class="fixed bottom-4 right-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg shadow-lg">
        {{ errorMessage }}
      </div>
    </main>

    <Footer />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Navbar from '../components/Navbar.vue'
import Footer from '../components/Footer.vue'
import CalendarioReserva from '../components/CalendarioReserva.vue'
import FormularioReserva from '../components/FormularioReserva.vue'
import { CalendarDays } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()

const espacioId = route.params.id
const espacio = ref(null)
const fechaSeleccionada = ref(null)
const successMessage = ref('')
const errorMessage = ref('')

const cargarEspacio = async () => {
  try {
    const response = await fetch(`/api/espacios/${espacioId}`, {
      credentials: 'include'
    })
    const data = await response.json()
    if (data.success) {
      espacio.value = data.espacio
    } else {
      handleError(data.message || 'Error al cargar el espacio')
      router.push('/categorias')
    }
  } catch (err) {
    handleError('Error de conexión')
    router.push('/categorias')
  }
}

const handleFechaSeleccionada = (fecha) => {
  fechaSeleccionada.value = fecha
}

const handleReservaCompletada = (mensaje) => {
  successMessage.value = mensaje || 'Reserva confirmada exitosamente'
  setTimeout(() => {
    router.push('/dashboard')
  }, 2000)
}

const handleError = (error) => {
  errorMessage.value = error
  setTimeout(() => {
    errorMessage.value = ''
  }, 5000)
}

const resetFormulario = () => {
  fechaSeleccionada.value = null
}

onMounted(() => {
  cargarEspacio()
})
</script>
