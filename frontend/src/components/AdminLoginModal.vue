<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300">
    <!-- Contenedor del Modal -->
    <div class="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all duration-300 scale-100">
      <!-- Cenefa de color UTC decorativa -->
      <div class="h-2 bg-gradient-to-r from-[#003087] via-[#FFB800] to-[#003087]"></div>
      
      <!-- Botón de Cerrar -->
      <button @click="$emit('close')" class="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors">
        <X class="w-5 h-5" />
      </button>

      <div class="p-8">
        <!-- Cabecera -->
        <div class="flex items-center space-x-3 mb-6">
          <div class="bg-blue-50 text-[#003087] p-2.5 rounded-xl">
            <Lock class="w-6 h-6" />
          </div>
          <div>
            <h3 class="text-xl font-bold text-slate-900">Acceso de Administrador</h3>
            <p class="text-xs text-slate-500 font-medium">Panel de gestión de recursos</p>
          </div>
        </div>

        <!-- Formulario -->
        <form @submit.prevent="handleLogin">
          <!-- Correo -->
          <div class="mb-4">
            <label class="block text-sm font-semibold text-slate-700 mb-2">Correo Institucional</label>
            <input 
              v-model="email"
              type="email"
              class="form-input"
              :class="{ 'border-red-500 ring-2 ring-red-500/10': errors.email }"
              placeholder="admin@utc.edu"
              required
            >
            <p v-if="errors.email" class="text-red-500 text-xs mt-1.5 font-medium">{{ errors.email }}</p>
          </div>

          <!-- Contraseña -->
          <div class="mb-6">
            <label class="block text-sm font-semibold text-slate-700 mb-2">Contraseña</label>
            <input 
              v-model="password"
              type="password"
              class="form-input"
              :class="{ 'border-red-500 ring-2 ring-red-500/10': errors.password }"
              placeholder="••••••••"
              required
            >
            <p v-if="errors.password" class="text-red-500 text-xs mt-1.5 font-medium">{{ errors.password }}</p>
          </div>

          <!-- Alerta de Error General -->
          <div v-if="errorMessage" class="mb-5 p-3.5 bg-red-50 border border-red-100 text-red-700 rounded-xl text-sm font-medium flex items-center space-x-2">
            <AlertCircle class="w-5 h-5 flex-shrink-0 text-red-500" />
            <span>{{ errorMessage }}</span>
          </div>

          <!-- Enviar Formulario -->
          <button 
            type="submit"
            class="w-full bg-[#003087] text-white py-3 rounded-xl hover:bg-blue-800 transition-all font-bold shadow-md hover:shadow-lg flex items-center justify-center space-x-2 active:scale-95 disabled:opacity-50"
            :disabled="loading"
          >
            <span v-if="loading">Iniciando sesión...</span>
            <template v-else>
              <Key class="w-4 h-4" />
              <span>Ingresar al Sistema</span>
            </template>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { X, Lock, Key, AlertCircle } from 'lucide-vue-next';
import { authState } from '../router';

export default {
  name: 'AdminLoginModal',
  components: {
    X,
    Lock,
    Key,
    AlertCircle
  },
  props: {
    show: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      email: '',
      password: '',
      errors: {},
      errorMessage: '',
      loading: false
    }
  },
  methods: {
    validateForm() {
      this.errors = {};
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.email)) {
        this.errors.email = 'Ingresa un correo institucional válido.';
      }
      
      if (this.password.length < 6) {
        this.errors.password = 'La contraseña debe tener al menos 6 caracteres.';
      }
      
      return Object.keys(this.errors).length === 0;
    },
    
    async handleLogin() {
      if (!this.validateForm()) return;
      
      this.loading = true;
      this.errorMessage = '';
      
      try {
        const response = await fetch('/api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: this.email,
            password: this.password
          })
        });
        
        const data = await response.json();
        
        if (data.success) {
          authState.admin = data.admin;
          authState.user = null;
          this.$emit('close');
          this.$router.push('/admin-dashboard');
        } else {
          this.errorMessage = data.message || 'Credenciales incorrectas.';
        }
      } catch (error) {
        this.errorMessage = 'Error de conexión con el servidor.';
      } finally {
        this.loading = false;
      }
    }
  }
}
</script>
