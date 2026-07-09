<template>
  <div class="min-h-screen bg-[#f8fafc] flex flex-col md:flex-row">
    <!-- SIDEBAR -->
    <aside class="w-full md:w-64 bg-white border-r border-slate-100 flex flex-col justify-between p-6 flex-shrink-0">
      <div class="space-y-8">
        <div class="flex items-center space-x-3 pb-6 border-b border-slate-100">
          <div class="w-10 h-10 rounded-xl bg-[#003087] text-white flex items-center justify-center font-bold text-lg shadow-sm">
            {{ userInitials }}
          </div>
          <div class="overflow-hidden">
            <h4 class="font-bold text-sm text-slate-900 truncate">{{ state.user?.nombre || 'Usuario UTC' }}</h4>
            <p class="text-xs text-slate-500 truncate">{{ state.user?.email }}</p>
          </div>
        </div>

        <nav class="space-y-1.5">
          <button @click="activeTab = 'reservas'" class="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200" :class="activeTab === 'reservas' ? 'bg-[#003087] text-white shadow-md shadow-[#003087]/15' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'">
            <CalendarRange class="w-5 h-5" />
            <span>Reservar Espacios</span>
          </button>
          <button @click="activeTab = 'favoritos'" class="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200" :class="activeTab === 'favoritos' ? 'bg-[#003087] text-white shadow-md shadow-[#003087]/15' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'">
            <Heart class="w-5 h-5" />
            <span>Mis Favoritos</span>
          </button>
          <button @click="activeTab = 'mis-espacios'" class="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200" :class="activeTab === 'mis-espacios' ? 'bg-[#003087] text-white shadow-md shadow-[#003087]/15' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'">
            <BookmarkCheck class="w-5 h-5" />
            <span>Mis Espacios</span>
          </button>
          <button @click="activeTab = 'calendario'; construirCalendario()" class="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200" :class="activeTab === 'calendario' ? 'bg-[#003087] text-white shadow-md shadow-[#003087]/15' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'">
            <CalendarDays class="w-5 h-5" />
            <span>Mi Calendario</span>
          </button>
          <button @click="activeTab = 'perfil'" class="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200" :class="activeTab === 'perfil' ? 'bg-[#003087] text-white shadow-md shadow-[#003087]/15' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'">
            <UserCheck class="w-5 h-5" />
            <span>Mi Perfil</span>
          </button>
        </nav>
      </div>

      <div class="pt-6 border-t border-slate-100 mt-6">
        <button @click="handleLogout" class="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-all duration-200 active:scale-95">
          <LogOut class="w-5 h-5" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>

    <!-- MAIN CONTENT -->
    <main class="flex-grow p-6 md:p-10 space-y-8 overflow-y-auto max-h-screen">
      <!-- TAB: RESERVAR ESPACIOS -->
      <div v-if="activeTab === 'reservas'" class="space-y-8">
        <div>
          <h1 class="text-2xl font-extrabold text-slate-900">Reservar Espacios Universitarios</h1>
          <p class="text-sm text-slate-500 mt-1">Explora y selecciona el espacio disponible según la categoría requerida</p>
        </div>

        <!-- Toast -->
        <div v-if="toastMessage" class="p-3.5 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-sm font-medium">{{ toastMessage }}</div>

        <!-- Loading -->
        <div v-if="loadingSpaces" class="text-center py-16">
          <Loader2 class="w-8 h-8 text-[#003087] animate-spin mx-auto" />
        </div>

        <!-- Error -->
        <div v-else-if="spacesError" class="p-6 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-sm">{{ spacesError }}</div>

        <!-- Category_Panel: shown when no category is selected -->
        <div v-else-if="!activeCategory" class="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <button
            v-for="cat in categoriasPanel"
            :key="cat.key"
            @click="selectCategory(cat.key)"
            class="relative bg-white border-2 rounded-2xl p-8 flex flex-col items-center gap-4 transition-all duration-200 hover:shadow-md hover:border-[#003087] focus:outline-none focus:ring-2 focus:ring-[#003087]"
            :class="spacesError ? 'opacity-50 pointer-events-none cursor-not-allowed border-slate-200' : 'border-slate-200 cursor-pointer active:scale-95'"
          >
            <div class="p-4 rounded-2xl" :class="{
              'bg-blue-50 text-blue-600': cat.color === 'blue',
              'bg-emerald-50 text-emerald-600': cat.color === 'emerald',
              'bg-purple-50 text-purple-600': cat.color === 'purple'
            }">
              <component :is="cat.icon" class="w-10 h-10" />
            </div>
            <div class="text-center">
              <h3 class="font-extrabold text-slate-900 text-base">{{ cat.label }}</h3>
              <p class="text-xs text-slate-500 mt-1">{{ spacesError ? '—' : cat.count }} espacios</p>
              <p class="text-xs font-semibold mt-1" :class="{
                'text-blue-600': cat.color === 'blue',
                'text-emerald-600': cat.color === 'emerald',
                'text-purple-600': cat.color === 'purple'
              }">{{ spacesError ? '—' : cat.availableCount }} disponibles</p>
            </div>
          </button>
        </div>

        <!-- Category_Section: shown when a category is selected -->
        <div v-else class="space-y-6">
          <!-- Header with back button and filters -->
          <div class="flex flex-col gap-4">
            <div class="flex items-center gap-3">
              <button @click="selectCategory(activeCategory)" class="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-[#003087] hover:bg-slate-100 px-3 py-2 rounded-lg transition-colors">
                <ChevronLeft class="w-4 h-4" />
                Volver a categorías
              </button>
              <div class="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold" :class="{
                'bg-blue-50 text-blue-700': activeCategoryMeta?.color === 'blue',
                'bg-emerald-50 text-emerald-700': activeCategoryMeta?.color === 'emerald',
                'bg-purple-50 text-purple-700': activeCategoryMeta?.color === 'purple'
              }">
                <component :is="activeCategoryMeta?.icon" class="w-4 h-4" />
                {{ activeCategoryMeta?.label }}
              </div>
            </div>

            <!-- Filters scoped to active category -->
            <div class="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4">
              <h3 class="font-bold text-slate-900 text-sm">Buscar y Filtrar</h3>
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label class="block text-xs font-semibold text-slate-600 mb-2 uppercase">Nombre</label>
                  <input v-model="filtros.nombre" type="text" placeholder="Ej: Laboratorio..." @input="aplicarFiltros" class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#003087]" />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-600 mb-2 uppercase">Tipo</label>
                  <span class="flex items-center w-full px-3 py-2 rounded-lg text-sm font-semibold" :class="{
                    'bg-blue-50 text-blue-700': activeCategoryMeta?.color === 'blue',
                    'bg-emerald-50 text-emerald-700': activeCategoryMeta?.color === 'emerald',
                    'bg-purple-50 text-purple-700': activeCategoryMeta?.color === 'purple'
                  }">{{ activeCategoryMeta?.label }}</span>
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-600 mb-2 uppercase">Cap. Min</label>
                  <input v-model.number="filtros.capacidad_min" type="number" placeholder="Ej: 10" @input="aplicarFiltros" min="0" class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#003087]" />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-600 mb-2 uppercase">Cap. Max</label>
                  <input v-model.number="filtros.capacidad_max" type="number" placeholder="Ej: 50" @input="aplicarFiltros" min="0" class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#003087]" />
                </div>
              </div>
              <div class="flex gap-3 pt-2">
                <button @click="limpiarFiltros" class="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 transition active:scale-95">Limpiar Filtros</button>
                <div class="flex-1"></div>
                <span class="text-xs text-slate-500 font-medium">{{ espaciosCategoriaActiva.length }} espacio(s) encontrado(s)</span>
              </div>
            </div>
          </div>

          <!-- Empty state -->
          <div v-if="espaciosCategoriaActiva.length === 0 && activeCategory !== 'lab'" class="text-center py-16 bg-white rounded-3xl border border-slate-100">
            <component :is="activeCategoryMeta?.icon" class="w-12 h-12 text-slate-300 mx-auto" />
            <h4 class="font-bold text-slate-600 mt-4">{{ tieneFiltros ? 'Ningún espacio coincide con los filtros' : 'No hay espacios en esta categoría' }}</h4>
            <p class="text-xs text-slate-400 mt-2">{{ tieneFiltros ? 'Intenta ajustar los filtros' : 'Contacta al administrador' }}</p>
          </div>

          <!-- Lab sub-categories: CIYA, CAREN, CAYE, CSAYE -->
          <template v-else-if="activeCategory === 'lab'">
            <!-- Sub-category tiles when none selected -->
            <div v-if="!activeSubCategory" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <button
                v-for="sub in subCategoriasLab"
                :key="sub.key"
                @click="selectSubCategory(sub.key)"
                class="bg-white border-2 border-slate-200 rounded-2xl p-6 flex flex-col items-center gap-3 transition-all duration-200 hover:shadow-md hover:border-[#003087] focus:outline-none focus:ring-2 focus:ring-[#003087] active:scale-95 cursor-pointer"
              >
                <div class="w-14 h-14 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-extrabold text-lg">
                  {{ sub.key }}
                </div>
                <div class="text-center">
                  <h3 class="font-extrabold text-slate-900 text-sm">{{ sub.label }}</h3>
                  <p class="text-[10px] text-slate-400 mt-0.5 leading-tight">{{ sub.desc }}</p>
                  <p class="text-xs text-slate-500 mt-2">{{ sub.count }} laboratorio(s)</p>
                  <p class="text-xs font-semibold text-blue-600 mt-0.5">{{ sub.availableCount }} disponible(s)</p>
                </div>
              </button>
            </div>

            <!-- Sub-category section: labs of selected carrera -->
            <div v-else class="space-y-5">
              <div class="flex items-center gap-3">
                <button @click="selectSubCategory(activeSubCategory)" class="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-[#003087] hover:bg-slate-100 px-3 py-2 rounded-lg transition-colors">
                  <ChevronLeft class="w-4 h-4" />
                  Volver a carreras
                </button>
                <div class="px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-sm font-bold">
                  Laboratorios — {{ activeSubCategory }}
                </div>
              </div>

              <div v-if="espaciosSubCategoriaActiva.length === 0" class="text-center py-16 bg-white rounded-3xl border border-slate-100">
                <Monitor class="w-12 h-12 text-slate-300 mx-auto" />
                <h4 class="font-bold text-slate-600 mt-4">No hay laboratorios disponibles en {{ activeSubCategory }}</h4>
                <p class="text-xs text-slate-400 mt-2">Contacta al administrador</p>
              </div>

              <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div v-for="space in espaciosSubCategoriaActiva" :key="space.id" class="card-premium overflow-hidden flex flex-col">
                  <div class="relative overflow-hidden h-40 bg-slate-100">
                    <img :src="space.imagen" :alt="space.nombre" class="w-full h-full object-cover" />
                    <span class="absolute top-3 left-3 bg-[#003087] text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full">{{ space.tipo }}</span>
                    <span class="absolute top-3 right-12 text-[10px] font-extrabold px-2.5 py-1 rounded-full" :class="space.disponible ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'">{{ space.disponible ? 'Disponible' : 'No disponible' }}</span>
                    <div class="absolute top-3 right-3">
                      <FavoritoButton :espacio-id="space.id" :es-favorito="space.es_favorito" @toggle="handleFavoritoToggle" @error="handleFavoritoError" />
                    </div>
                  </div>
                  <div class="p-5 flex-grow flex flex-col justify-between">
                    <div>
                      <h3 class="font-bold text-slate-900 text-sm mb-1">{{ space.nombre }}</h3>
                      <p class="text-xs text-slate-500 mb-2">{{ space.descripcion }}</p>
                      <div class="flex items-center space-x-2 text-xs text-slate-400 mb-1">
                        <MapPin class="w-3.5 h-3.5" /><span>{{ space.ubicacion }}</span>
                      </div>
                      <div class="flex items-center space-x-2 text-xs text-slate-400 mb-1">
                        <Users class="w-3.5 h-3.5" /><span>Cap: {{ space.capacidad }}</span>
                      </div>
                      <div v-if="space.horario" class="flex items-center space-x-2 text-xs text-emerald-600 mb-4 font-medium">
                        <span>🕐</span><span>{{ space.horario }}</span>
                      </div>
                    </div>
                    <div class="flex space-x-2">
                      <router-link :to="`/espacios/${space.id}`" class="flex-1 text-center border border-[#003087] text-[#003087] text-xs font-semibold py-2.5 rounded-lg hover:bg-blue-50">Ver detalle</router-link>
                      <button @click="openReservationModal(space)" :disabled="!space.disponible" class="flex-1 text-xs font-semibold py-2.5 rounded-lg transition" :class="space.disponible ? 'bg-[#003087] text-white hover:bg-blue-800' : 'bg-slate-200 text-slate-500'">
                        {{ space.disponible ? 'Reservar' : 'Ocupado' }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <!-- Space cards grid for non-lab categories -->
          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div v-for="space in espaciosCategoriaActiva" :key="space.id" class="card-premium overflow-hidden flex flex-col">
              <div class="relative overflow-hidden h-40 bg-slate-100">
                <img :src="space.imagen" :alt="space.nombre" class="w-full h-full object-cover" />
                <span class="absolute top-3 left-3 bg-[#003087] text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full">{{ space.tipo }}</span>
                <span class="absolute top-3 right-12 text-[10px] font-extrabold px-2.5 py-1 rounded-full" :class="space.disponible ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'">{{ space.disponible ? 'Disponible' : 'No disponible' }}</span>
                <div class="absolute top-3 right-3">
                  <FavoritoButton :espacio-id="space.id" :es-favorito="space.es_favorito" @toggle="handleFavoritoToggle" @error="handleFavoritoError" />
                </div>
              </div>
              <div class="p-5 flex-grow flex flex-col justify-between">
                <div>
                  <h3 class="font-bold text-slate-900 text-sm mb-1">{{ space.nombre }}</h3>
                  <p class="text-xs text-slate-500 mb-2">{{ space.descripcion }}</p>
                  <div class="flex items-center space-x-2 text-xs text-slate-400 mb-1">
                    <MapPin class="w-3.5 h-3.5" /><span>{{ space.ubicacion }}</span>
                  </div>
                  <div class="flex items-center space-x-2 text-xs text-slate-400 mb-1">
                    <Users class="w-3.5 h-3.5" /><span>Cap: {{ space.capacidad }}</span>
                  </div>
                  <div v-if="space.horario" class="flex items-center space-x-2 text-xs text-emerald-600 mb-4 font-medium">
                    <span>🕐</span><span>{{ space.horario }}</span>
                  </div>
                </div>
                <div class="flex space-x-2">
                  <router-link :to="`/espacios/${space.id}`" class="flex-1 text-center border border-[#003087] text-[#003087] text-xs font-semibold py-2.5 rounded-lg hover:bg-blue-50">Ver detalle</router-link>
                  <button @click="openReservationModal(space)" :disabled="!space.disponible" class="flex-1 text-xs font-semibold py-2.5 rounded-lg transition" :class="space.disponible ? 'bg-[#003087] text-white hover:bg-blue-800' : 'bg-slate-200 text-slate-500'">
                    {{ space.disponible ? 'Reservar' : 'Ocupado' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else-if="activeTab === 'mis-espacios'" class="space-y-6">
        <div>
          <h1 class="text-2xl font-extrabold text-slate-900">Mis Espacios Reservados</h1>
          <p class="text-sm text-slate-500 mt-1">Tus reservas con códigos QR</p>
        </div>

        <div v-if="loadingReservations" class="text-center py-12">
          <Loader2 class="w-8 h-8 text-[#003087] animate-spin mx-auto" />
        </div>

        <div v-else class="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <div v-if="myReservations.length > 0" class="space-y-6">
            <div v-for="res in myReservations" :key="res.id" class="p-4 rounded-2xl border border-slate-100 space-y-4">
              <div class="flex flex-col sm:flex-row justify-between gap-4">
                <div class="flex items-start space-x-4">
                  <div class="p-3 bg-blue-50 text-[#003087] rounded-xl">
                    <component :is="getSpaceIcon(res.espacio_tipo)" class="w-5 h-5" />
                  </div>
                  <div>
                    <h4 class="font-bold text-slate-900 text-sm">{{ res.espacio_nombre }}</h4>
                    <p class="text-xs text-slate-500 mt-1">{{ res.fecha }} | {{ res.horario }}</p>
                  </div>
                </div>
                <div class="flex gap-3">
                  <span class="px-3 py-1 text-[11px] font-bold rounded-full bg-emerald-50 text-emerald-700">{{ res.estado }}</span>
                  <button @click="descargarCalendario(res)" class="flex items-center gap-1.5 text-xs font-semibold text-[#003087] hover:bg-blue-50 px-2.5 py-2 rounded-lg">
                    <CalendarPlus class="w-4 h-4" />
                    Calendario
                  </button>
                  <button @click="cancelReservation(res.id)" class="text-red-500 hover:bg-red-50 p-2 rounded-lg">
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </div>

              <!-- QR Section -->
              <div v-if="codigosQR[res.id]" class="border-t border-slate-100 pt-4 flex flex-col sm:flex-row gap-4">
                <div class="flex-shrink-0 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <img v-if="codigosQR[res.id].qr_base64" :src="codigosQR[res.id].qr_base64" alt="QR" class="w-24 h-24 rounded" />
                </div>
                <div class="flex-1 space-y-3">
                  <div>
                    <p class="text-xs font-semibold text-slate-500 uppercase mb-1">Código QR</p>
                    <p class="text-sm text-slate-700">Escanea para registrar asistencia</p>
                  </div>
                  <div class="flex gap-2 flex-wrap">
                    <button @click="abrirScannerQR" class="flex items-center gap-2 px-3 py-2 bg-[#003087] text-white text-xs font-semibold rounded-lg hover:bg-blue-800">
                      <QrCode class="w-4 h-4" />
                      Escanear
                    </button>
                    <a v-if="codigosQR[res.id].qr_base64" :href="codigosQR[res.id].qr_base64" download class="flex items-center gap-2 px-3 py-2 border border-[#003087] text-[#003087] text-xs font-semibold rounded-lg hover:bg-blue-50">
                      📥 Descargar
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-12 space-y-3">
            <BookmarkCheck class="w-12 h-12 text-slate-300 mx-auto" />
            <h4 class="font-bold text-slate-600">No tienes reservas</h4>
            <button @click="activeTab = 'reservas'" class="btn-primary mt-2 text-xs">Reservar Ahora</button>
          </div>
        </div>
      </div>

      <!-- TAB: MIS FAVORITOS -->
      <div v-else-if="activeTab === 'favoritos'" class="space-y-6">
        <div>
          <h1 class="text-2xl font-extrabold text-slate-900">Mis Espacios Favoritos</h1>
          <p class="text-sm text-slate-500 mt-1">Espacios que has marcado como favoritos para acceso rápido</p>
        </div>

        <div v-if="loadingFavoritos" class="text-center py-16">
          <Loader2 class="w-8 h-8 text-[#003087] animate-spin mx-auto" />
        </div>

        <div v-else-if="favoritosError" class="p-6 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-sm">{{ favoritosError }}</div>

        <div v-else-if="favoritos.length === 0" class="text-center py-16 bg-white rounded-3xl border border-slate-100">
          <Heart class="w-12 h-12 text-slate-300 mx-auto" />
          <h4 class="font-bold text-slate-600 mt-4">No tienes espacios favoritos</h4>
          <p class="text-xs text-slate-400 mt-2">Ve a la sección "Reservar Espacios" y marca algunos espacios como favoritos</p>
          <button @click="activeTab = 'reservas'" class="mt-4 px-4 py-2 bg-[#003087] text-white text-sm font-semibold rounded-lg hover:bg-blue-800 transition-colors">
            Explorar Espacios
          </button>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="space in favoritos" :key="space.id" class="card-premium overflow-hidden flex flex-col">
            <div class="relative overflow-hidden h-40 bg-slate-100">
              <img :src="space.imagen_url" :alt="space.nombre" class="w-full h-full object-cover" />
              <span class="absolute top-3 left-3 bg-[#003087] text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full">{{ space.tipo }}</span>
              <span class="absolute top-3 right-12 text-[10px] font-extrabold px-2.5 py-1 rounded-full" :class="space.activo ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'">{{ space.activo ? 'Disponible' : 'No disponible' }}</span>
              <div class="absolute top-3 right-3">
                <FavoritoButton 
                  :espacio-id="space.id" 
                  :es-favorito="true" 
                  @toggle="handleFavoritoToggleFromFavoritos"
                  @error="handleFavoritoError"
                />
              </div>
            </div>
            <div class="p-5 flex-grow flex flex-col justify-between">
              <div>
                <h3 class="font-bold text-slate-900 text-sm mb-1">{{ space.nombre }}</h3>
                <p class="text-xs text-slate-500 mb-2">{{ space.descripcion }}</p>
                <div class="flex items-center space-x-2 text-xs text-slate-400 mb-1">
                  <MapPin class="w-3.5 h-3.5" />
                  <span>{{ space.ubicacion }}</span>
                </div>
                <div class="flex items-center space-x-2 text-xs text-slate-400 mb-1">
                  <Users class="w-3.5 h-3.5" />
                  <span>Cap: {{ space.capacidad }}</span>
                </div>
                <div v-if="space.horario" class="flex items-center space-x-2 text-xs text-emerald-600 mb-1 font-medium">
                  <span>🕐</span>
                  <span>{{ space.horario }}</span>
                </div>
                <div class="flex items-center space-x-2 text-xs text-slate-400 mb-4">
                  <Heart class="w-3.5 h-3.5 fill-current text-red-500" />
                  <span>Agregado el {{ formatearFechaFavorito(space.fecha_agregado) }}</span>
                </div>
              </div>
              <div class="flex space-x-2">
                <router-link :to="`/espacios/${space.id}`" class="flex-1 text-center border border-[#003087] text-[#003087] text-xs font-semibold py-2.5 rounded-lg hover:bg-blue-50">Ver detalle</router-link>
                <button @click="openReservationModalFromFavorito(space)" :disabled="!space.activo" class="flex-1 text-xs font-semibold py-2.5 rounded-lg transition" :class="space.activo ? 'bg-[#003087] text-white hover:bg-blue-800' : 'bg-slate-200 text-slate-500'">
                  {{ space.activo ? 'Reservar' : 'No disponible' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB: MI CALENDARIO -->
      <div v-else-if="activeTab === 'calendario'" class="space-y-6">
        <div>
          <h1 class="text-2xl font-extrabold text-slate-900">Mi Calendario</h1>
          <p class="text-sm text-slate-500 mt-1">Tus reservas en vista mensual</p>
        </div>

        <div class="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 space-y-6">
          <div class="flex items-center justify-between mb-6">
            <button @click="mesAnterior" class="p-2 hover:bg-slate-100 rounded-lg">
              <ChevronLeft class="w-5 h-5 text-slate-600" />
            </button>
            <h2 class="text-xl font-bold text-slate-900 min-w-48 text-center capitalize">{{ nombreMes }} {{ anioActual }}</h2>
            <button @click="mesSiguiente" class="p-2 hover:bg-slate-100 rounded-lg">
              <ChevronRight class="w-5 h-5 text-slate-600" />
            </button>
          </div>

          <div class="grid grid-cols-7 gap-1 mb-2">
            <div v-for="dia in ['L', 'M', 'X', 'J', 'V', 'S', 'D']" :key="dia" class="h-10 flex items-center justify-center font-bold text-xs text-slate-500">{{ dia }}</div>
          </div>

          <div class="grid grid-cols-7 gap-1">
            <div v-for="(celda, idx) in celdasCalendario" :key="idx" class="aspect-square rounded-lg p-2 cursor-pointer transition-all" :class="[celda.mesActual ? (celda.esHoy ? 'bg-[#003087] text-white font-bold' : 'bg-slate-50 hover:bg-slate-100') : 'bg-slate-100 text-slate-400', celda.eventos.length > 0 ? 'ring-2 ring-emerald-400' : '']" @click="celda.eventos.length > 0 && seleccionarEvento(celda.eventos[0])">
              <div class="text-sm font-semibold">{{ celda.dia }}</div>
              <div v-if="celda.eventos.length > 0" class="flex gap-0.5 flex-wrap mt-1">
                <div v-for="evt in celda.eventos.slice(0, 2)" :key="evt.id" class="w-1.5 h-1.5 rounded-full" :class="{
                  'bg-blue-500': evt.espacio_tipo === 'Laboratorios',
                  'bg-emerald-500': evt.espacio_tipo === 'Canchas',
                  'bg-purple-500': evt.espacio_tipo === 'Salas'
                }"></div>
              </div>
            </div>
          </div>
          <div v-if="eventoSeleccionado" class="mt-8 pt-6 border-t border-slate-200 space-y-4">
            <h3 class="font-bold text-slate-900">Evento Seleccionado</h3>
            <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div>
                <p class="text-xs text-slate-500 font-semibold uppercase">Espacio</p>
                <p class="text-sm font-bold text-slate-900">{{ eventoSeleccionado.espacio_nombre }}</p>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p class="text-xs text-slate-500 font-semibold uppercase">Fecha</p>
                  <p class="text-sm font-bold">{{ eventoSeleccionado.fecha }}</p>
                </div>
                <div>
                  <p class="text-xs text-slate-500 font-semibold uppercase">Horario</p>
                  <p class="text-sm font-bold">{{ eventoSeleccionado.horario }}</p>
                </div>
              </div>
              <button @click="descargarCalendario(eventoSeleccionado)" class="w-full mt-4 flex items-center justify-center gap-2 bg-[#003087] text-white font-semibold py-2.5 rounded-lg hover:bg-blue-800 text-sm">
                <CalendarPlus class="w-4 h-4" />
                Agregar a calendario
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB: MI PERFIL -->
      <div v-else-if="activeTab === 'perfil'" class="space-y-6">
        <div>
          <h1 class="text-2xl font-extrabold text-slate-900">Mi Perfil</h1>
          <p class="text-sm text-slate-500 mt-1">Gestiona tu información personal y configuración de cuenta</p>
        </div>

        <!-- Loading perfil -->
        <div v-if="loadingPerfil" class="text-center py-12">
          <Loader2 class="w-8 h-8 text-[#003087] animate-spin mx-auto" />
          <p class="text-sm text-slate-500 mt-2">Cargando perfil...</p>
        </div>

        <!-- Contenido del perfil -->
        <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <!-- Información Personal -->
          <div class="lg:col-span-2 bg-white rounded-3xl p-8 shadow-sm border border-slate-100 space-y-6">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-bold text-slate-900">Información Personal</h3>
              <button v-if="!editandoPerfil" @click="iniciarEdicionPerfil" class="text-[#003087] hover:bg-blue-50 px-3 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2">
                <Pencil class="w-4 h-4" />
                Editar
              </button>
            </div>

            <div v-if="perfilError" class="p-3 bg-red-50 border border-red-100 text-red-700 rounded-xl text-sm font-medium">{{ perfilError }}</div>
            <div v-if="perfilSuccess" class="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-sm font-medium">{{ perfilSuccess }}</div>

            <!-- Modo Vista -->
            <div v-if="!editandoPerfil" class="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label class="block text-xs font-bold text-slate-400 uppercase mb-2">Nombre</label>
                <p class="text-sm font-semibold text-slate-800">{{ perfilData?.nombre || 'No disponible' }}</p>
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-400 uppercase mb-2">Correo Electrónico</label>
                <p class="text-sm font-semibold text-slate-800">{{ perfilData?.email || 'No disponible' }}</p>
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-400 uppercase mb-2">Teléfono</label>
                <p class="text-sm font-semibold text-slate-800">{{ perfilData?.telefono || 'No especificado' }}</p>
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-400 uppercase mb-2">Miembro desde</label>
                <p class="text-sm font-semibold text-slate-800">{{ formatDate(perfilData?.fecha_registro || perfilData?.created_at) }}</p>
              </div>
            </div>

            <!-- Modo Edición -->
            <div v-else class="space-y-4">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold text-slate-500 mb-2">Nombre *</label>
                  <input v-model="perfilForm.nombre" type="text" class="form-input text-sm" placeholder="Tu nombre completo">
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-500 mb-2">Correo Electrónico *</label>
                  <input v-model="perfilForm.email" type="email" class="form-input text-sm" placeholder="tu@email.com">
                </div>
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-500 mb-2">Teléfono</label>
                <input v-model="perfilForm.telefono" type="tel" class="form-input text-sm" placeholder="Ej: +593 999 999 999">
              </div>
              <div class="flex gap-3 pt-2">
                <button @click="cancelarEdicionPerfil" class="px-4 py-2 border border-slate-300 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 transition">
                  Cancelar
                </button>
                <button @click="guardarPerfil" :disabled="guardandoPerfil" class="px-6 py-2 bg-[#003087] text-white text-sm font-bold rounded-lg hover:bg-blue-800 transition disabled:opacity-50">
                  {{ guardandoPerfil ? 'Guardando...' : 'Guardar Cambios' }}
                </button>
              </div>
            </div>
          </div>

          <!-- Estadísticas y Cambio de Contraseña -->
          <div class="space-y-6">
            
            <!-- Resumen de Actividad -->
            <div class="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              <h3 class="text-lg font-bold text-slate-900 mb-4">Resumen de Actividad</h3>
              <div class="bg-emerald-50 rounded-xl p-4 border border-emerald-100 text-center">
                <div class="text-3xl font-extrabold text-emerald-700">{{ estadisticas.total_reservas }}</div>
                <div class="text-xs font-semibold text-emerald-600 uppercase mt-1">Reservas Realizadas</div>
              </div>
            </div>

            <!-- Cambiar Contraseña -->
            <div class="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
              <h3 class="text-lg font-bold text-slate-900">Cambiar Contraseña</h3>
              
              <div v-if="contrasenaError" class="p-3 bg-red-50 border border-red-100 text-red-700 rounded-xl text-sm font-medium">{{ contrasenaError }}</div>
              <div v-if="contrasenaSuccess" class="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-sm font-medium">{{ contrasenaSuccess }}</div>

              <div class="space-y-3">
                <div>
                  <label class="block text-xs font-bold text-slate-500 mb-1">Contraseña Actual *</label>
                  <input v-model="contrasenaForm.actual" type="password" class="form-input text-sm" placeholder="Tu contraseña actual">
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-500 mb-1">Nueva Contraseña *</label>
                  <input v-model="contrasenaForm.nueva" type="password" class="form-input text-sm" placeholder="Mínimo 8 caracteres">
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-500 mb-1">Confirmar Contraseña *</label>
                  <input v-model="contrasenaForm.confirmar" type="password" class="form-input text-sm" placeholder="Confirma la nueva contraseña">
                </div>
              </div>

              <button @click="cambiarContrasena" :disabled="cambiandoContrasena" class="w-full bg-red-600 text-white font-bold py-2.5 rounded-lg hover:bg-red-700 transition disabled:opacity-50 text-sm">
                {{ cambiandoContrasena ? 'Cambiando...' : 'Cambiar Contraseña' }}
              </button>
            </div>

          </div>
        </div>
      </div>
    </main>
    <!-- MODAL: RESERVE CONFIRMATION -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div class="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-md w-full">
        <div class="h-1.5 bg-[#003087]"></div>
        <div class="p-6">
          <h3 class="text-lg font-bold text-slate-900 mb-2">Completar Reserva</h3>
          <p class="text-xs text-slate-500 mb-6">Estás reservando: <span class="font-semibold text-[#003087]">{{ selectedSpace?.nombre }}</span></p>
          <div v-if="modalError" class="mb-4 p-3 bg-red-50 border border-red-100 text-red-700 rounded-xl text-xs font-medium">{{ modalError }}</div>
          <div class="rounded-2xl border border-slate-100 bg-slate-50 p-4 mb-6">
            <p class="text-sm text-slate-700">¿Estás seguro?</p>
          </div>
          <div class="flex space-x-3">
            <button @click="showModal = false" class="w-1/2 border border-slate-200 text-slate-700 font-semibold py-2.5 rounded-xl text-xs hover:bg-slate-50">Cancelar</button>
            <button @click="confirmReservation" :disabled="submitting" class="w-1/2 bg-[#003087] text-white font-bold py-2.5 rounded-xl text-xs hover:bg-blue-800 disabled:opacity-50">
              {{ submitting ? 'Procesando...' : 'Confirmar' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- QR SCANNER MODAL -->
    <QRScannerModal :mostrar="mostrarScannerQR" @cerrar="mostrarScannerQR = false" @asistencia-registrada="onAsistenciaRegistrada" />
  </div>
</template>
<script>
import { CalendarRange, BookmarkCheck, UserCheck, LogOut, MapPin, Trash2, Monitor, Trophy, Video, Users, Loader2, CalendarPlus, CalendarDays, ChevronLeft, ChevronRight, QrCode, Pencil, Heart } from 'lucide-vue-next';
import { authState } from '../router';
import QRScannerModal from '../components/QRScannerModal.vue';
import FavoritoButton from '../components/FavoritoButton.vue';

export default {
  name: 'DashboardView',
  components: { CalendarRange, BookmarkCheck, UserCheck, LogOut, MapPin, Trash2, Monitor, Trophy, Video, Users, Loader2, CalendarPlus, CalendarDays, ChevronLeft, ChevronRight, QrCode, QRScannerModal, Pencil, Heart, FavoritoButton },
  data() {
    return {
      state: authState,
      activeTab: 'reservas',
      showModal: false,
      selectedSpace: null,
      spaces: [],
      myReservations: [],
      reservationConfig: null,
      loadingSpaces: true,
      loadingReservations: true,
      spacesError: '',
      modalError: '',
      toastMessage: '',
      submitting: false,
      ultimaReservaId: null,
      filtros: { nombre: '', tipo: '', capacidad_min: null, capacidad_max: null },
      espaciosFiltrados: [],
      mostrarScannerQR: false,
      codigosQR: {},
      mesActual: new Date().getMonth(),
      anioActual: new Date().getFullYear(),
      celdasCalendario: [],
      eventoSeleccionado: null,
      // Gestión de favoritos HU16
      favoritos: [],
      loadingFavoritos: false,
      favoritosError: '',
      // Gestión de perfil HU15
      loadingPerfil: false,
      perfilData: {},
      estadisticas: { total_reservas: 0 },
      editandoPerfil: false,
      perfilForm: { nombre: '', email: '', telefono: '' },
      perfilError: '',
      perfilSuccess: '',
      guardandoPerfil: false,
      // Cambio de contraseña
      contrasenaForm: { actual: '', nueva: '', confirmar: '' },
      contrasenaError: '',
      contrasenaSuccess: '',
      cambiandoContrasena: false,
      // Category panel state
      activeCategory: null,
      _savedCategory: null,
      activeSubCategory: null
    };
  },
  computed: {
    userInitials() {
      const name = this.state.user?.nombre || 'Usuario';
      return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    },
    nombreMes() {
      return new Date(this.anioActual, this.mesActual, 1).toLocaleDateString('es-ES', { month: 'long' }).split(' ')[0];
    },
    tieneFiltros() {
      return this.filtros.nombre.trim() !== '' || this.filtros.tipo !== '' || this.filtros.capacidad_min !== null || this.filtros.capacidad_max !== null;
    },
    laboratorios() { return this.espaciosFiltrados.filter(s => s.tipo === 'Laboratorios'); },
    canchas() { return this.espaciosFiltrados.filter(s => s.tipo === 'Canchas'); },
    salas() { return this.espaciosFiltrados.filter(s => s.tipo === 'Salas'); },
    categoriasFiltradas() {
      return [
        { key: 'lab', label: '🔬 Laboratorios', icon: 'Monitor', spaces: this.laboratorios },
        { key: 'canchas', label: '⚽ Canchas', icon: 'Trophy', spaces: this.canchas },
        { key: 'salas', label: '🏛️ Salas', icon: 'Video', spaces: this.salas }
      ];
    },
    categoriasPanel() {
      return [
        { key: 'lab',     backendTipo: 'Laboratorios', label: 'Laboratorios',        icon: 'Monitor', color: 'blue'    },
        { key: 'canchas', backendTipo: 'Canchas',       label: 'Canchas',             icon: 'Trophy',  color: 'emerald' },
        { key: 'salas',   backendTipo: 'Salas',         label: 'Salas de Auditorio',  icon: 'Video',   color: 'purple'  }
      ].map(cat => ({
        ...cat,
        count: this.spaces.filter(s => s.tipo === cat.backendTipo).length,
        availableCount: this.spaces.filter(s => s.tipo === cat.backendTipo && s.disponible).length
      }));
    },
    activeCategoryMeta() {
      if (!this.activeCategory) return null;
      return this.categoriasPanel.find(c => c.key === this.activeCategory) || null;
    },
    espaciosCategoriaActiva() {
      if (!this.activeCategory || !this.activeCategoryMeta) return [];
      return this.espaciosFiltrados.filter(s => s.tipo === this.activeCategoryMeta.backendTipo);
    },
    subCategoriasLab() {
      const carreras = [
        { key: 'CIYA',  label: 'CIYA',  desc: 'Cs. de la Ingeniería y Aplicadas' },
        { key: 'CAREN', label: 'CAREN', desc: 'Cs. Agropecuarias y Recursos Naturales' },
        { key: 'CAYE',  label: 'CAYE',  desc: 'Cs. Administrativas y Económicas' },
        { key: 'CSAYE', label: 'CSAYE', desc: 'Cs. de la Salud y Educación' }
      ];
      return carreras.map(c => ({
        ...c,
        count: this.spaces.filter(s => s.tipo === 'Laboratorios' &&
          (s.nombre.toUpperCase().includes(c.key) || s.ubicacion.toUpperCase().includes(c.key))).length,
        availableCount: this.spaces.filter(s => s.tipo === 'Laboratorios' && s.disponible &&
          (s.nombre.toUpperCase().includes(c.key) || s.ubicacion.toUpperCase().includes(c.key))).length
      }));
    },
    espaciosSubCategoriaActiva() {
      if (!this.activeSubCategory) return [];
      return this.espaciosFiltrados.filter(s =>
        s.tipo === 'Laboratorios' &&
        (s.nombre.toUpperCase().includes(this.activeSubCategory) ||
         s.ubicacion.toUpperCase().includes(this.activeSubCategory))
      );
    }
  },
  async mounted() {
    await Promise.all([this.fetchSpaces(), this.fetchMyReservations()]);
  },
  watch: {
    myReservations() { this.construirCalendario(); },
    activeTab(newTab, oldTab) {
      if (oldTab === 'reservas') {
        this._savedCategory = this.activeCategory;
      }
      if (newTab === 'reservas' && this._savedCategory) {
        this.$nextTick(() => {
          this.selectCategory(this._savedCategory);
        });
      }
      if (newTab === 'perfil') {
        this.fetchPerfil();
      } else if (newTab === 'favoritos') {
        this.fetchFavoritos();
      }
    }
  },
  methods: {
    async fetchSpaces() {
      this.loadingSpaces = true;
      this.spacesError = '';
      try {
        const res = await fetch('/api/espacios', {
          credentials: 'include' // Incluir cookies de sesión
        });
        const data = await res.json();
        if (data.success) {
          this.spaces = data.espacios || [];
          this.espaciosFiltrados = this.spaces;
          this.reservationConfig = data.configuracionReserva || null;
        } else {
          this.spacesError = data.message || 'Error al cargar espacios';
        }
      } catch {
        this.spacesError = 'Error de conexión';
      } finally {
        this.loadingSpaces = false;
      }
    },
    async fetchMyReservations() {
      this.loadingReservations = true;
      try {
        const res = await fetch('/api/reservas/mis-reservas', {
          credentials: 'include' // Incluir cookies de sesión
        });
        const data = await res.json();
        if (data.success) {
          this.myReservations = data.reservas || [];
          await this.cargarCodigosQR();
        }
      } catch (e) {
        console.error('Error:', e);
      } finally {
        this.loadingReservations = false;
      }
    },
    async cargarCodigosQR() {
      for (const reserva of this.myReservations) {
        try {
          const res = await fetch(`/api/asistencias/${reserva.id}/qr`, {
            credentials: 'include' // Incluir cookies de sesión
          });
          const data = await res.json();
          if (data.success) {
            this.codigosQR[reserva.id] = data.qr;
          }
        } catch (e) {
          console.error(`Error cargando QR para ${reserva.id}:`, e);
        }
      }
    },
    selectCategory(key) {
      if (this.activeCategory === key) {
        this.activeCategory = null;
        this.filtros.tipo = '';
      } else {
        this.activeCategory = key;
        this.filtros.tipo = this.categoriasPanel.find(c => c.key === key)?.backendTipo || '';
      }
      this.activeSubCategory = null;
      this.aplicarFiltros();
    },
    selectSubCategory(key) {
      this.activeSubCategory = this.activeSubCategory === key ? null : key;
    },
    aplicarFiltros() {
      this.espaciosFiltrados = this.spaces.filter(space => {
        if (this.filtros.nombre.trim() && !space.nombre.toLowerCase().includes(this.filtros.nombre.toLowerCase())) return false;
        if (this.filtros.tipo && space.tipo !== this.filtros.tipo) return false;
        if (this.filtros.capacidad_min !== null && this.filtros.capacidad_min > 0 && space.capacidad < this.filtros.capacidad_min) return false;
        if (this.filtros.capacidad_max !== null && this.filtros.capacidad_max > 0 && space.capacidad > this.filtros.capacidad_max) return false;
        return true;
      });
    },
    limpiarFiltros() {
      this.filtros = {
        nombre: '',
        tipo: this.activeCategory ? (this.activeCategoryMeta?.backendTipo || '') : '',
        capacidad_min: null,
        capacidad_max: null
      };
      this.aplicarFiltros();
    },
    
    // Métodos de favoritos HU16
    async fetchFavoritos() {
      this.loadingFavoritos = true;
      this.favoritosError = '';
      
      try {
        const response = await fetch('/api/usuario/favoritos', {
          credentials: 'include' // Incluir cookies de sesión
        });
        const data = await response.json();
        
        if (data.success) {
          this.favoritos = data.favoritos || [];
        } else {
          this.favoritosError = data.message || 'Error al cargar favoritos';
        }
      } catch (error) {
        console.error('Error al cargar favoritos:', error);
        this.favoritosError = 'Error de conexión con el servidor';
      } finally {
        this.loadingFavoritos = false;
      }
    },

    handleFavoritoToggle(evento) {
      // Actualizar estado local del espacio en la lista principal
      const espacio = this.spaces.find(s => s.id === evento.espacioId);
      if (espacio) {
        espacio.es_favorito = evento.esFavorito;
      }

      // También actualizar en espacios filtrados
      const espacioFiltrado = this.espaciosFiltrados.find(s => s.id === evento.espacioId);
      if (espacioFiltrado) {
        espacioFiltrado.es_favorito = evento.esFavorito;
      }

      // Mostrar mensaje
      this.toastMessage = evento.message;
      setTimeout(() => { this.toastMessage = ''; }, 6000);

      // Si estamos en la pestaña de favoritos, recargar la lista
      if (this.activeTab === 'favoritos') {
        this.fetchFavoritos();
      }
    },

    handleFavoritoToggleFromFavoritos(evento) {
      // Eliminar de la lista local de favoritos
      if (!evento.esFavorito) {
        this.favoritos = this.favoritos.filter(f => f.id !== evento.espacioId);
      }

      // Actualizar estado en espacios principales
      const espacio = this.spaces.find(s => s.id === evento.espacioId);
      if (espacio) {
        espacio.es_favorito = evento.esFavorito;
      }

      // También actualizar en espacios filtrados
      const espacioFiltrado = this.espaciosFiltrados.find(s => s.id === evento.espacioId);
      if (espacioFiltrado) {
        espacioFiltrado.es_favorito = evento.esFavorito;
      }

      // Mostrar mensaje
      this.toastMessage = evento.message;
      setTimeout(() => { this.toastMessage = ''; }, 6000);
    },

    handleFavoritoError(evento) {
      this.toastMessage = evento.message;
      setTimeout(() => { this.toastMessage = ''; }, 6000);
    },

    formatearFechaFavorito(fechaISO) {
      const fecha = new Date(fechaISO);
      return fecha.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    },

    openReservationModalFromFavorito(space) {
      // Convertir el espacio favorito al formato esperado por el modal
      const espacioParaModal = {
        id: space.id,
        nombre: space.nombre,
        tipo: space.tipo,
        capacidad: space.capacidad,
        ubicacion: space.ubicacion,
        descripcion: space.descripcion,
        imagen: space.imagen_url,
        horario: space.horario,
        disponible: space.activo,
        es_favorito: true
      };
      
      this.openReservationModal(espacioParaModal);
    },
    getSpaceIcon(tipo) {
      return tipo === 'Laboratorios' ? 'Monitor' : tipo === 'Canchas' ? 'Trophy' : 'Video';
    },
    openReservationModal(space) {
      this.selectedSpace = space;
      this.modalError = '';
      this.showModal = true;
    },
    async confirmReservation() {
      if (!this.selectedSpace) return;
      this.submitting = true;
      this.modalError = '';
      try {
        const res = await fetch('/api/reservas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include', // Incluir cookies de sesión
          body: JSON.stringify({ espacio_id: this.selectedSpace.id })
        });
        const data = await res.json();
        if (data.success) {
          this.showModal = false;
          this.ultimaReservaId = data.reserva?.id || null;
          this.toastMessage = data.message;
          setTimeout(() => { this.toastMessage = ''; }, 6000);
          await Promise.all([this.fetchSpaces(), this.fetchMyReservations()]);
          this.activeTab = 'mis-espacios';
        } else {
          this.modalError = data.message;
        }
      } catch {
        this.modalError = 'Error de conexión';
      } finally {
        this.submitting = false;
      }
    },
    async cancelReservation(resId) {
      if (!confirm('¿Cancelar esta reserva?')) return;
      try {
        const res = await fetch(`/api/reservas/${resId}`, { 
          method: 'DELETE',
          credentials: 'include' // Incluir cookies de sesión
        });
        const data = await res.json();
        if (data.success) {
          this.toastMessage = data.message;
          setTimeout(() => { this.toastMessage = ''; }, 6000);
          await Promise.all([this.fetchSpaces(), this.fetchMyReservations()]);
        } else {
          alert(data.message);
        }
      } catch {
        alert('Error al cancelar');
      }
    },
    abrirScannerQR() {
      this.mostrarScannerQR = true;
    },
    onAsistenciaRegistrada() {
      this.toastMessage = '✅ Asistencia registrada';
      setTimeout(() => { this.toastMessage = ''; }, 6000);
      this.fetchMyReservations();
    },
    construirCalendario() {
      const hoy = new Date();
      const primerDia = new Date(this.anioActual, this.mesActual, 1);
      const ultimoDia = new Date(this.anioActual, this.mesActual + 1, 0);
      let inicioSemana = primerDia.getDay() - 1;
      if (inicioSemana < 0) inicioSemana = 6;
      const celdas = [];
      for (let i = inicioSemana - 1; i >= 0; i--) {
        const d = new Date(this.anioActual, this.mesActual, -i);
        celdas.push({ dia: d.getDate(), mesActual: false, fecha: null, eventos: [], esHoy: false });
      }
      for (let d = 1; d <= ultimoDia.getDate(); d++) {
        const fecha = `${this.anioActual}-${String(this.mesActual + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const eventos = this.myReservations.filter(r => String(r.fecha).split('T')[0] === fecha);
        const esHoy = hoy.getFullYear() === this.anioActual && hoy.getMonth() === this.mesActual && hoy.getDate() === d;
        celdas.push({ dia: d, mesActual: true, fecha, eventos, esHoy });
      }
      const restante = 7 - (celdas.length % 7);
      if (restante < 7) {
        for (let d = 1; d <= restante; d++) {
          celdas.push({ dia: d, mesActual: false, fecha: null, eventos: [], esHoy: false });
        }
      }
      this.celdasCalendario = celdas;
    },
    mesAnterior() {
      if (this.mesActual === 0) { this.mesActual = 11; this.anioActual--; } else this.mesActual--;
      this.construirCalendario();
    },
    mesSiguiente() {
      if (this.mesActual === 11) { this.mesActual = 0; this.anioActual++; } else this.mesActual++;
      this.construirCalendario();
    },
    seleccionarEvento(evento) {
      this.eventoSeleccionado = evento;
    },
    tipoColor(tipo) {
      if (tipo === 'Laboratorios') return 'bg-blue-100 text-blue-700';
      if (tipo === 'Canchas') return 'bg-emerald-100 text-emerald-700';
      return 'bg-purple-100 text-purple-700';
    },
    async descargarCalendario(reserva) {
      await this.descargarCalendarioById(reserva.id);
    },
    async descargarCalendarioById(id) {
      try {
        const res = await fetch(`/api/reservas/${id}/ics`, {
          credentials: 'include' // Incluir cookies de sesión
        });
        if (!res.ok) {
          const data = await res.json();
          alert(data.message || 'Error');
          return;
        }
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reserva_${id}.ics`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch (e) {
        alert('Error de conexión');
      }
    },
    async handleLogout() {
      try {
        const res = await fetch('/api/auth/logout', { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include' // Incluir cookies de sesión
        });
        const data = await res.json();
        if (data.success) {
          this.state.logoutUser();
          this.$router.push('/login');
        }
      } catch (e) {
        console.error('Error:', e);
      }
    },
    // Métodos de gestión de perfil HU15
    async fetchPerfil() {
      this.loadingPerfil = true;
      this.perfilError = '';
      try {
        const res = await fetch('/api/perfil', {
          credentials: 'include' // Incluir cookies de sesión
        });
        const data = await res.json();
        if (data.success) {
          this.perfilData = data.usuario || {};
          this.estadisticas = data.estadisticas || { total_reservas: 0 };
          this.perfilError = '';
        } else {
          this.perfilData = {};
          this.perfilError = data.message || 'No se pudo cargar el perfil';
        }
      } catch (e) {
        this.perfilData = {};
        this.perfilError = 'Error de conexión al cargar el perfil';
      } finally {
        this.loadingPerfil = false;
      }
    },
    iniciarEdicionPerfil() {
      this.perfilForm = {
        nombre: this.perfilData?.nombre || '',
        email: this.perfilData?.email || '',
        telefono: this.perfilData?.telefono || ''
      };
      this.editandoPerfil = true;
      this.perfilError = '';
      this.perfilSuccess = '';
    },
    cancelarEdicionPerfil() {
      this.editandoPerfil = false;
      this.perfilForm = { nombre: '', email: '', telefono: '' };
      this.perfilError = '';
    },
    async guardarPerfil() {
      this.guardandoPerfil = true;
      this.perfilError = '';
      this.perfilSuccess = '';
      try {
        const res = await fetch('/api/perfil', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include', // Incluir cookies de sesión
          body: JSON.stringify(this.perfilForm)
        });
        const data = await res.json();
        if (data.success) {
          this.perfilData = data.usuario;
          this.editandoPerfil = false;
          this.perfilSuccess = data.message;
          setTimeout(() => { this.perfilSuccess = ''; }, 6000);
          // Actualizar estado global del usuario
          this.state.user = { ...this.state.user, ...data.usuario };
        } else {
          this.perfilError = data.message;
        }
      } catch (e) {
        this.perfilError = 'Error de conexión al actualizar el perfil';
      } finally {
        this.guardandoPerfil = false;
      }
    },
    async cambiarContrasena() {
      this.cambiandoContrasena = true;
      this.contrasenaError = '';
      this.contrasenaSuccess = '';
      
      if (!this.contrasenaForm.actual || !this.contrasenaForm.nueva || !this.contrasenaForm.confirmar) {
        this.contrasenaError = 'Todos los campos son obligatorios';
        this.cambiandoContrasena = false;
        return;
      }
      
      if (this.contrasenaForm.nueva !== this.contrasenaForm.confirmar) {
        this.contrasenaError = 'Las contraseñas nuevas no coinciden';
        this.cambiandoContrasena = false;
        return;
      }
      
      try {
        const res = await fetch('/api/perfil/cambiar-contrasena', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include', // Incluir cookies de sesión
          body: JSON.stringify({
            contrasena_actual: this.contrasenaForm.actual,
            nueva_contrasena: this.contrasenaForm.nueva,
            confirmar_contrasena: this.contrasenaForm.confirmar
          })
        });
        const data = await res.json();
        if (data.success) {
          this.contrasenaSuccess = data.message;
          this.contrasenaForm = { actual: '', nueva: '', confirmar: '' };
          setTimeout(() => { this.contrasenaSuccess = ''; }, 6000);
        } else {
          this.contrasenaError = data.message;
        }
      } catch (e) {
        this.contrasenaError = 'Error de conexión al cambiar la contraseña';
      } finally {
        this.cambiandoContrasena = false;
      }
    },
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
  }
};
</script>