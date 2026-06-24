<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Componente Hero -->
    <Hero />

    <!-- Sección de Espacios Disponibles -->
    <div class="mt-16">
      <div class="text-center md:text-left mb-12">
        <h2 class="text-3xl font-extrabold text-[#003087] tracking-tight">Nuestros Espacios Reservables</h2>
        <p class="mt-2 text-slate-500 max-w-xl font-medium">
          Explora los diferentes ambientes disponibles en la UTC para tus actividades académicas, recreativas o culturales.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- Tarjeta 1: Laboratorios de Computación -->
        <div class="card-premium flex flex-col justify-between overflow-hidden group">
          <div class="relative overflow-hidden h-48 bg-slate-100">
            <img src="https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=600" alt="Laboratorios" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
            <span class="absolute top-4 left-4 bg-[#003087] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">Académico</span>
          </div>
          <div class="p-6 flex-grow flex flex-col justify-between">
            <div>
              <h3 class="font-bold text-xl text-slate-900 mb-2">Laboratorios de Cómputo</h3>
              <p class="text-sm text-slate-500 mb-6">Equipados con computadoras de última generación, software especializado y conexión a internet de alta velocidad para investigación y desarrollo.</p>
            </div>
            <router-link to="/login" class="w-full text-center bg-[#003087] hover:bg-blue-800 text-white font-semibold py-2.5 rounded-xl transition duration-200 block text-sm active:scale-95">
              Reservar Laboratorio
            </router-link>
          </div>
        </div>

        <!-- Tarjeta 2: Canchas -->
        <div class="card-premium flex flex-col justify-between overflow-hidden group">
          <div class="relative overflow-hidden h-48 bg-slate-100">
            <img src="https://images.unsplash.com/photo-1544698310-74ea9d1c8258?auto=format&fit=crop&q=80&w=600" alt="Canchas" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
            <span class="absolute top-4 left-4 bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">Deportivo</span>
          </div>
          <div class="p-6 flex-grow flex flex-col justify-between">
            <div>
              <h3 class="font-bold text-xl text-slate-900 mb-2">Áreas Recreativas y Canchas</h3>
              <p class="text-sm text-slate-500 mb-6">Canchas multideportivas reglamentarias con iluminación nocturna, perfectas para campeonatos internos y actividades físicas grupales.</p>
            </div>
            <router-link to="/login" class="w-full text-center bg-[#003087] hover:bg-blue-800 text-white font-semibold py-2.5 rounded-xl transition duration-200 block text-sm active:scale-95">
              Reservar Cancha
            </router-link>
          </div>
        </div>

        <!-- Tarjeta 3: Salas de Conferencias -->
        <div class="card-premium flex flex-col justify-between overflow-hidden group">
          <div class="relative overflow-hidden h-48 bg-slate-100">
            <img src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=600" alt="Salas de Conferencias" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
            <span class="absolute top-4 left-4 bg-[#FFB800] text-slate-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">Eventos / Reunión</span>
          </div>
          <div class="p-6 flex-grow flex flex-col justify-between">
            <div>
              <h3 class="font-bold text-xl text-slate-900 mb-2">Salas de Conferencias</h3>
              <p class="text-sm text-slate-500 mb-6">Salas acondicionadas con proyectores interactivos y sistemas de audio profesional para talleres, defensas de tesis y conferencias.</p>
            </div>
            <router-link to="/login" class="w-full text-center bg-[#003087] hover:bg-blue-800 text-white font-semibold py-2.5 rounded-xl transition duration-200 block text-sm active:scale-95">
              Reservar Sala
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Hero from '../components/Hero.vue';

export default {
  name: 'HomeView',
  components: {
    Hero
  }
}
</script>
