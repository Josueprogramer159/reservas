<template>
  <div class="relative bg-[#003087] text-white overflow-hidden rounded-3xl mx-4 my-8 lg:mx-8 shadow-2xl">
    <!-- Capa de Degradado Institucional -->
    <div class="absolute inset-0 bg-gradient-to-r from-[#003087] via-[#003087]/90 to-transparent z-10"></div>
    
    <!-- Imagen de Fondo Decorativa -->
    <div class="absolute right-0 top-0 w-full h-full md:w-1/2 opacity-25 md:opacity-40 bg-cover bg-center" style="background-image: url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=1200');"></div>
    
    <div class="relative max-w-7xl mx-auto px-6 py-16 sm:px-12 sm:py-24 lg:px-16 z-20">
      <div class="max-w-2xl">
        <!-- Distintivo de Sistema -->
        <span class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#FFB800] text-slate-900 mb-6 shadow-sm">
          <span class="w-1.5 h-1.5 rounded-full bg-[#003087] animate-pulse"></span>
          Sistema de Gestión UTC
        </span>
        
        <!-- Título Principal -->
        <h1 class="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-6 leading-tight">
          Reserva Espacios en la UTC <br class="hidden sm:inline">
          <span class="text-[#FFB800] bg-clip-text">de Forma Ágil y Segura</span>
        </h1>
        
        <!-- Descripción -->
        <p class="text-base sm:text-lg text-slate-200 mb-8 leading-relaxed">
          Accede al catálogo completo de laboratorios, áreas deportivas y salas de reuniones de la universidad. Reserva tu lugar, consulta disponibilidad en tiempo real y gestiona tus horarios académicos con facilidad.
        </p>
        
        <!-- Botones de Acción -->
        <div class="flex flex-wrap gap-4">
          <router-link to="/login" class="bg-[#FFB800] text-slate-900 font-bold px-6 py-3.5 rounded-xl hover:bg-yellow-500 transition-all duration-300 shadow-lg shadow-[#FFB800]/20 hover:-translate-y-0.5 active:scale-95">
            Reservar Espacio
          </router-link>
          <router-link to="/register" class="bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-3.5 rounded-xl border border-white/20 transition-all duration-300 hover:-translate-y-0.5 active:scale-95 backdrop-blur-sm">
            Crear Cuenta Nueva
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Hero'
}
</script>
