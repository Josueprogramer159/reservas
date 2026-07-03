<template>
  <nav class="bg-white border-b border-slate-100 sticky top-0 z-50 shadow-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <!-- Logo y Nombre Institucional -->
        <div class="flex items-center">
          <router-link to="/" class="flex items-center space-x-3 group">
            <div class="bg-[#003087] text-[#FFB800] p-2.5 rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-300">
              <Calendar class="w-5.5 h-5.5" />
            </div>
            <div class="flex flex-col">
              <span class="font-bold text-lg text-[#003087] tracking-tight leading-none">ReservaUTC</span>
              <span class="text-[10px] text-slate-500 font-semibold tracking-wider uppercase mt-1">Universidad</span>
            </div>
          </router-link>
        </div>

        <!-- Menú de Navegación de Escritorio -->
        <div class="hidden md:flex items-center space-x-4">
          <router-link to="/" class="text-slate-600 hover:text-[#003087] px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200">
            Inicio
          </router-link>

          <!-- Sección exclusiva de Sesión de Usuario -->
          <template v-if="state.user">
            <router-link to="/dashboard" class="text-slate-600 hover:text-[#003087] px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200">
              Reservar Espacios
            </router-link>
            <div class="h-4 w-[1px] bg-slate-200 mx-2"></div>
            <div class="flex items-center space-x-2 bg-blue-50/50 border border-blue-100 text-[#003087] px-3 py-1.5 rounded-full text-xs font-semibold">
              <User class="w-3.5 h-3.5 text-[#FFB800]" />
              <span>{{ state.user.nombre }}</span>
            </div>
            <button @click="handleLogout" class="flex items-center space-x-1.5 text-red-600 hover:bg-red-50/80 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200">
              <LogOut class="w-4 h-4" />
              <span>Cerrar Sesión</span>
            </button>
          </template>

          <!-- Sección exclusiva de Sesión de Administrador -->
          <template v-else-if="state.admin">
            <router-link to="/admin-dashboard" class="text-[#003087] hover:text-blue-800 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center space-x-1 bg-yellow-50 border border-yellow-200">
              <ShieldAlert class="w-4 h-4 text-[#FFB800]" />
              <span>Panel de Control</span>
            </router-link>
            <div class="h-4 w-[1px] bg-slate-200 mx-2"></div>
            <div class="flex items-center space-x-2 bg-slate-50 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-full text-xs font-semibold">
              <User class="w-3.5 h-3.5 text-slate-500" />
              <span>{{ state.admin.nombre }} (Admin)</span>
            </div>
            <button @click="handleAdminLogout" class="flex items-center space-x-1.5 text-red-600 hover:bg-red-50/80 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200">
              <LogOut class="w-4 h-4" />
              <span>Salir del Panel</span>
            </button>
          </template>

          <!-- Sección de Invitado (Sin autenticar) -->
          <template v-else>
            <router-link to="/login" class="text-slate-600 hover:text-[#003087] px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              Iniciar Sesión
            </router-link>
            <router-link to="/register" class="bg-[#003087] text-white hover:bg-blue-800 px-4.5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 hover:shadow-md hover:shadow-[#003087]/10 active:scale-95">
              Registrarse
            </router-link>
            <router-link to="/admin-login" class="border border-[#003087]/20 text-[#003087] hover:bg-[#003087]/5 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              Acceso Admin
            </router-link>
            <router-link to="/invitado" class="border border-slate-200 text-slate-600 hover:bg-slate-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5">
              <Eye class="w-3.5 h-3.5" />
              Acceso como invitado
            </router-link>
          </template>
        </div>

        <!-- Botón del Menú Móvil -->
        <div class="flex items-center md:hidden">
          <button @click="isOpen = !isOpen" class="text-slate-500 hover:text-slate-700 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003087]/20">
            <Menu v-if="!isOpen" class="w-6 h-6" />
            <X v-else class="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>

    <!-- Menú Responsivo Móvil -->
    <div v-if="isOpen" class="md:hidden border-t border-slate-100 bg-white">
      <div class="px-2 pt-2 pb-3 space-y-1">
        <router-link to="/" @click="isOpen = false" class="block text-slate-700 hover:text-[#003087] hover:bg-slate-50 px-3 py-2 rounded-md text-base font-medium">
          Inicio
        </router-link>

        <template v-if="state.user">
          <router-link to="/dashboard" @click="isOpen = false" class="block text-slate-700 hover:text-[#003087] hover:bg-slate-50 px-3 py-2 rounded-md text-base font-medium">
            Reservar Espacios
          </router-link>
          <div class="px-3 py-2 text-sm text-[#003087] font-semibold flex items-center space-x-2">
            <User class="w-4 h-4 text-[#FFB800]" />
            <span>{{ state.user.nombre }}</span>
          </div>
          <button @click="handleLogout(); isOpen = false" class="w-full text-left flex items-center space-x-2 text-red-600 hover:bg-red-50 px-3 py-2 rounded-md text-base font-medium">
            <LogOut class="w-4 h-4" />
            <span>Cerrar Sesión</span>
          </button>
        </template>

        <template v-else-if="state.admin">
          <router-link to="/admin-dashboard" @click="isOpen = false" class="block text-[#003087] hover:bg-slate-50 px-3 py-2 rounded-md text-base font-semibold">
            Panel de Control
          </router-link>
          <div class="px-3 py-2 text-sm text-[#003087] font-semibold flex items-center space-x-2">
            <User class="w-4 h-4 text-slate-500" />
            <span>{{ state.admin.nombre }} (Admin)</span>
          </div>
          <button @click="handleAdminLogout(); isOpen = false" class="w-full text-left flex items-center space-x-2 text-red-600 hover:bg-red-50 px-3 py-2 rounded-md text-base font-medium">
            <LogOut class="w-4 h-4" />
            <span>Salir del Panel</span>
          </button>
        </template>

        <template v-else>
          <router-link to="/login" @click="isOpen = false" class="block text-slate-700 hover:text-[#003087] hover:bg-slate-50 px-3 py-2 rounded-md text-base font-medium">
            Iniciar Sesión
          </router-link>
          <router-link to="/register" @click="isOpen = false" class="block text-slate-700 hover:text-[#003087] hover:bg-slate-50 px-3 py-2 rounded-md text-base font-medium">
            Registrarse
          </router-link>
          <router-link to="/admin-login" @click="isOpen = false" class="block text-[#003087] hover:bg-[#003087]/5 px-3 py-2 rounded-md text-base font-medium">
            Acceso Admin
          </router-link>
          <router-link to="/invitado" @click="isOpen = false" class="block text-slate-600 hover:bg-slate-50 px-3 py-2 rounded-md text-base font-medium flex items-center gap-2">
            <Eye class="w-4 h-4" />
            Acceso como invitado
          </router-link>
        </template>
      </div>
    </div>
  </nav>
</template>

<script>
import { Calendar, User, LogOut, Menu, X, ShieldAlert, Eye } from 'lucide-vue-next';
import { authState } from '../router';

export default {
  name: 'Navbar',
  components: {
    Calendar,
    User,
    LogOut,
    Menu,
    X,
    ShieldAlert,
    Eye
  },
  data() {
    return {
      isOpen: false,
      state: authState
    }
  },
  methods: {
    async handleLogout() {
      try {
        const response = await fetch('/api/auth/logout', { 
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include' // Incluir cookies de sesión
        });
        const data = await response.json();
        if (data.success) {
          this.state.logoutUser();
          this.$router.push('/login');
        }
      } catch (error) {
        console.error('Error al intentar cerrar la sesión del usuario:', error);
      }
    },
    async handleAdminLogout() {
      try {
        const response = await fetch('/api/admin/logout', { 
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include' // Incluir cookies de sesión
        });
        const data = await response.json();
        if (data.success) {
          this.state.logoutAdmin();
          this.$router.push('/');
        }
      } catch (error) {
        console.error('Error al intentar cerrar la sesión de administración:', error);
      }
    }
  }
}
</script>
