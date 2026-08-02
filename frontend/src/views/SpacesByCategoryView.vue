<template>
  <div class="min-h-screen bg-[#f8fafc]">
    <!-- Navbar -->
    <Navbar />

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <!-- Header with Back Button -->
      <div class="mb-8">
        <router-link
          to="/categorias"
          class="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-[#003087] mb-4 transition-colors group"
        >
          <ChevronLeft class="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Volver a categorías
        </router-link>

        <div class="flex items-center gap-3 mb-2">
          <div
            class="p-3 rounded-xl"
            :class="{
              'bg-blue-50 text-blue-600': categoryMeta?.color === 'blue',
              'bg-emerald-50 text-emerald-600': categoryMeta?.color === 'emerald',
              'bg-purple-50 text-purple-600': categoryMeta?.color === 'purple'
            }"
          >
            <component :is="categoryMeta?.icon" class="w-6 h-6" />
          </div>
          <div>
            <h1 class="text-3xl md:text-4xl font-extrabold text-slate-900">{{ category }}</h1>
            <p class="text-slate-600 text-sm mt-1">{{ categoryMeta?.description }}</p>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center py-20">
        <div class="text-center">
          <Loader2 class="w-8 h-8 text-[#003087] animate-spin mx-auto mb-3" />
          <p class="text-slate-600 font-medium">Cargando espacios...</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-2xl p-6">
        <div class="flex items-start gap-3">
          <AlertCircle class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 class="font-bold text-red-900 mb-1">Error al cargar espacios</h3>
            <p class="text-sm text-red-700">{{ error }}</p>
          </div>
        </div>
      </div>

      <!-- Filters Section -->
      <template v-else>
        <div class="bg-white rounded-2xl border border-slate-100 p-6 mb-8 shadow-sm">
          <h3 class="font-bold text-slate-900 text-base mb-4">Buscar y Filtrar</h3>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <!-- Search by Name -->
            <div>
              <label class="block text-xs font-semibold text-slate-600 mb-2 uppercase">Nombre</label>
              <input
                v-model="filters.nombre"
                type="text"
                placeholder="Ej: Lab..."
                @input="aplicarFiltros"
                class="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#003087] focus:border-transparent transition"
              />
            </div>

            <!-- Capacity Min -->
            <div>
              <label class="block text-xs font-semibold text-slate-600 mb-2 uppercase">Cap. Mín</label>
              <input
                v-model.number="filters.capacidad_min"
                type="number"
                placeholder="Ej: 10"
                @input="aplicarFiltros"
                min="0"
                class="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#003087] focus:border-transparent transition"
              />
            </div>

            <!-- Capacity Max -->
            <div>
              <label class="block text-xs font-semibold text-slate-600 mb-2 uppercase">Cap. Máx</label>
              <input
                v-model.number="filters.capacidad_max"
                type="number"
                placeholder="Ej: 50"
                @input="aplicarFiltros"
                min="0"
                class="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#003087] focus:border-transparent transition"
              />
            </div>

            <!-- Action Buttons -->
            <div class="flex items-end gap-3">
              <button
                @click="limpiarFiltros"
                class="px-4 py-2.5 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 transition active:scale-95 flex-1"
              >
                Limpiar Filtros
              </button>
            </div>

            <!-- Result Counter -->
            <div class="flex items-end">
              <div class="text-center w-full">
                <p class="text-xs text-slate-500 font-medium">Espacios encontrados</p>
                <p
                  class="text-2xl font-extrabold mt-1"
                  :class="{
                    'text-slate-900': espaciosFiltrados.length > 0,
                    'text-red-600': espaciosFiltrados.length === 0
                  }"
                >
                  {{ espaciosFiltrados.length }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="espacios.length === 0 && !loading" class="text-center py-16 bg-white rounded-2xl border border-slate-100">
          <component :is="categoryMeta?.icon" class="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 class="text-lg font-bold text-slate-900 mb-2">No hay espacios disponibles</h3>
          <p class="text-slate-600 text-sm mb-6">En este momento no hay espacios en la categoría {{ category }}</p>
          <router-link
            to="/categorias"
            class="inline-flex items-center gap-2 px-4 py-2.5 bg-[#003087] text-white font-semibold rounded-lg hover:bg-[#002060] transition"
          >
            <ChevronLeft class="w-4 h-4" />
            Volver a categorías
          </router-link>
        </div>

        <!-- No Results After Filter -->
        <div v-else-if="espaciosFiltrados.length === 0 && espacios.length > 0" class="text-center py-16 bg-white rounded-2xl border border-slate-100">
          <Search class="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 class="text-lg font-bold text-slate-900 mb-2">No se encontraron espacios</h3>
          <p class="text-slate-600 text-sm mb-6">Intenta cambiar los filtros o buscar con otros términos</p>
          <button
            @click="limpiarFiltros"
            class="inline-flex items-center gap-2 px-4 py-2.5 bg-[#003087] text-white font-semibold rounded-lg hover:bg-[#002060] transition"
          >
            <RotateCcw class="w-4 h-4" />
            Limpiar todos los filtros
          </button>
        </div>

        <!-- Spaces Grid -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <router-link
            v-for="espacio in espaciosFiltrados"
            :key="espacio.id"
            :to="`/espacios/${espacio.id}`"
            class="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg hover:border-[#003087] transition-all duration-300 active:scale-95"
          >
            <!-- Image -->
            <div class="h-48 bg-gradient-to-br from-slate-200 to-slate-300 overflow-hidden relative">
              <img
                v-if="espacio.imagen"
                :src="espacio.imagen"
                :alt="espacio.nombre"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div v-else class="w-full h-full flex items-center justify-center bg-slate-100">
                <component :is="categoryMeta?.icon" class="w-12 h-12 text-slate-400" />
              </div>

              <!-- Availability Badge -->
              <div
                class="absolute top-3 right-3 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5"
                :class="espacio.disponible
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'"
              >
                <div
                  class="w-2 h-2 rounded-full"
                  :class="espacio.disponible ? 'bg-green-500' : 'bg-red-500'"
                />
                {{ espacio.disponible ? 'Disponible' : 'Ocupado' }}
              </div>
            </div>

            <!-- Content -->
            <div class="p-5">
              <h3 class="font-bold text-slate-900 mb-1 line-clamp-2 group-hover:text-[#003087] transition-colors">
                {{ espacio.nombre }}
              </h3>
              <p class="text-xs text-slate-600 mb-4">{{ espacio.ubicacion }}</p>

              <!-- Stats -->
              <div class="space-y-2 mb-4 pb-4 border-b border-slate-100">
                <div class="flex items-center justify-between text-xs">
                  <span class="text-slate-600">Capacidad</span>
                  <span class="font-semibold text-slate-900">{{ espacio.capacidad }} personas</span>
                </div>
                <div class="flex items-center justify-between text-xs">
                  <span class="text-slate-600">Horario</span>
                  <span class="font-semibold text-slate-900">{{ espacio.horario }}</span>
                </div>
              </div>

              <!-- Action -->
              <div class="flex items-center gap-2 text-[#003087] font-semibold text-sm group-hover:gap-3 transition-all">
                Ver detalles
                <ChevronRight class="w-4 h-4" />
              </div>
            </div>
          </router-link>
        </div>
      </template>
    </main>

    <!-- Footer -->
    <Footer />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import Navbar from '../components/Navbar.vue'
import Footer from '../components/Footer.vue'
import {
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Search,
  RotateCcw,
  Beaker,
  Shovel,
  Presentation
} from 'lucide-vue-next'

const route = useRoute()
const loading = ref(true)
const error = ref(null)
const espacios = ref([])

// Filters state
const filters = ref({
  nombre: '',
  capacidad_min: null,
  capacidad_max: null
})

// Get category from URL params
const category = computed(() => route.params.categoria)

// Category metadata
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

// Icon mapping
const iconMap = {
  'Beaker': Beaker,
  'Shovel': Shovel,
  'Presentation': Presentation
}

const categoryMeta = computed(() => ({
  ...categoriasMeta[category.value],
  icon: iconMap[categoriasMeta[category.value]?.icon]
}))

// Apply filters (search + capacity range)
const espaciosFiltrados = computed(() => {
  return espacios.value.filter(espacio => {
    // Filter by name (case-insensitive)
    if (filters.value.nombre.trim()) {
      const nombre = espacio.nombre.toLowerCase()
      const busqueda = filters.value.nombre.toLowerCase()
      if (!nombre.includes(busqueda)) {
        return false
      }
    }

    // Filter by min capacity
    if (filters.value.capacidad_min !== null && filters.value.capacidad_min > 0) {
      if (espacio.capacidad < filters.value.capacidad_min) {
        return false
      }
    }

    // Filter by max capacity
    if (filters.value.capacidad_max !== null && filters.value.capacidad_max > 0) {
      if (espacio.capacidad > filters.value.capacidad_max) {
        return false
      }
    }

    return true
  })
})

const cargarEspacios = async () => {
  try {
    loading.value = true
    error.value = null

    const response = await fetch(`/api/espacios/categorias/${category.value}`, {
      method: 'GET',
      credentials: 'include'
    })

    if (!response.ok) {
      throw new Error('Error al cargar los espacios')
    }

    const data = await response.json()

    if (data.success) {
      espacios.value = data.espacios
    } else {
      throw new Error(data.message || 'Error desconocido')
    }
  } catch (err) {
    console.error('Error:', err)
    error.value = err.message || 'No se pudieron cargar los espacios'
  } finally {
    loading.value = false
  }
}

const aplicarFiltros = () => {
  // Validation happens in computed property
}

const limpiarFiltros = () => {
  filters.value = {
    nombre: '',
    capacidad_min: null,
    capacidad_max: null
  }
}

onMounted(() => {
  cargarEspacios()
})
</script>
