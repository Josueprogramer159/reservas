<template>
  <div class="min-h-screen bg-[#f8fafc]">
    <!-- Navbar -->
    <Navbar />

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <!-- Header -->
      <div class="mb-12">
        <h1 class="text-3xl md:text-4xl font-extrabold text-slate-900 mb-2">Reservar Espacios Universitarios</h1>
        <p class="text-base text-slate-600">Selecciona una categoría para explorar los espacios disponibles</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center py-20">
        <div class="text-center">
          <Loader2 class="w-8 h-8 text-[#003087] animate-spin mx-auto mb-3" />
          <p class="text-slate-600 font-medium">Cargando categorías...</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8">
        <div class="flex items-start gap-3">
          <AlertCircle class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 class="font-bold text-red-900 mb-1">Error al cargar categorías</h3>
            <p class="text-sm text-red-700">{{ error }}</p>
          </div>
        </div>
      </div>

      <!-- Categories Grid -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <router-link
          v-for="categoria in categoriasArray"
          :key="categoria.tipo"
          :to="`/categorias/${categoria.tipo}`"
          class="group bg-white rounded-2xl border-2 border-slate-200 p-8 transition-all duration-300 hover:shadow-lg hover:border-[#003087] active:scale-95 cursor-pointer flex flex-col"
        >
          <!-- Icon -->
          <div
            class="p-5 rounded-2xl w-fit mb-4 transition-colors group-hover:scale-110"
            :class="{
              'bg-blue-50 text-blue-600': categoria.color === 'blue',
              'bg-emerald-50 text-emerald-600': categoria.color === 'emerald',
              'bg-purple-50 text-purple-600': categoria.color === 'purple'
            }"
          >
            <component :is="categoria.icon" class="w-8 h-8" />
          </div>

          <!-- Content -->
          <h3 class="text-xl font-extrabold text-slate-900 mb-1">{{ categoria.label }}</h3>
          <p class="text-sm text-slate-600 mb-6 flex-grow">{{ categoria.description }}</p>

          <!-- Stats -->
          <div class="space-y-3 border-t border-slate-100 pt-6">
            <div class="flex items-center justify-between">
              <span class="text-sm font-semibold text-slate-700">Total de espacios</span>
              <span
                class="px-3 py-1 rounded-full text-sm font-bold"
                :class="{
                  'bg-blue-50 text-blue-700': categoria.color === 'blue',
                  'bg-emerald-50 text-emerald-700': categoria.color === 'emerald',
                  'bg-purple-50 text-purple-700': categoria.color === 'purple'
                }"
              >
                {{ categoria.total }}
              </span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm font-semibold text-slate-700">Disponibles ahora</span>
              <span
                class="px-3 py-1 rounded-full text-sm font-bold"
                :class="{
                  'bg-green-50 text-green-700': categoria.disponibles > 0,
                  'bg-gray-50 text-gray-700': categoria.disponibles === 0
                }"
              >
                {{ categoria.disponibles }}
              </span>
            </div>
          </div>

          <!-- Arrow -->
          <div class="mt-6 flex items-center gap-2 text-[#003087] font-semibold text-sm group-hover:gap-3 transition-all">
            Ver espacios
            <ChevronRight class="w-4 h-4" />
          </div>
        </router-link>
      </div>

      <!-- Footer Info -->
      <div v-if="!loading && !error" class="mt-12 p-6 bg-blue-50 rounded-2xl border border-blue-100">
        <p class="text-sm text-blue-900">
          <span class="font-semibold">💡 Tip:</span> Selecciona una categoría para ver todos los espacios disponibles, aplicar filtros de búsqueda y capacidad, y realizar tu reserva.
        </p>
      </div>
    </main>

    <!-- Footer -->
    <Footer />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Navbar from '../components/Navbar.vue'
import Footer from '../components/Footer.vue'
import {
  Loader2,
  AlertCircle,
  ChevronRight,
  Beaker,
  Shovel,
  Presentation
} from 'lucide-vue-next'

const router = useRouter()
const loading = ref(true)
const error = ref(null)
const categorias = ref({})

// Mapeo de iconos y colores para las categorías
const categoriasMeta = {
  'Laboratorios': {
    icon: 'Beaker',
    color: 'blue',
    description: 'Espacios equipados para prácticas y experimentación'
  },
  'Canchas': {
    icon: 'Shovel',
    color: 'emerald',
    description: 'Espacios abiertos para actividades deportivas'
  },
  'Salas': {
    icon: 'Presentation',
    color: 'purple',
    description: 'Salas especializadas para conferencias y presentaciones'
  }
}

// Mapeo de iconos real desde Lucide
const iconMap = {
  'Beaker': Beaker,
  'Shovel': Shovel,
  'Presentation': Presentation
}

const categoriasArray = computed(() => {
  return Object.entries(categorias.value).map(([tipo, stats]) => ({
    tipo,
    label: tipo,
    ...categoriasMeta[tipo],
    icon: iconMap[categoriasMeta[tipo].icon],
    total: stats.total,
    disponibles: stats.disponibles
  }))
})

const cargarCategorias = async () => {
  try {
    loading.value = true
    error.value = null

    const response = await fetch('/api/espacios/categorias/resumen', {
      method: 'GET',
      credentials: 'include'
    })

    if (!response.ok) {
      throw new Error('Error al cargar las categorías')
    }

    const data = await response.json()

    if (data.success) {
      categorias.value = data.categorias
    } else {
      throw new Error(data.message || 'Error desconocido')
    }
  } catch (err) {
    console.error('Error:', err)
    error.value = err.message || 'No se pudieron cargar las categorías'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  cargarCategorias()
})
</script>
