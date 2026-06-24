<template>
  <div class="min-h-[80vh] flex items-center justify-center bg-[#f8fafc] px-4 py-12">
    <!-- Contenedor del Formulario -->
    <div class="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden transform transition-all duration-300">
      <div class="h-1.5 bg-[#003087]"></div>
      
      <div class="p-8">
        <div class="text-center mb-8">
          <h2 class="text-2xl font-bold text-slate-900">Iniciar Sesión</h2>
          <p class="text-sm text-slate-500 mt-1.5">Ingresa tus datos para reservar espacios universitarios</p>
        </div>

        <form @submit.prevent="handleLogin">
          <!-- Correo -->
          <div class="mb-4">
            <label class="block text-sm font-semibold text-slate-700 mb-2">Correo Electrónico</label>
            <input 
              v-model="email"
              type="email"
              class="form-input"
              :class="{ 'border-red-500 ring-2 ring-red-500/10': errors.email }"
              placeholder="tu@email.com"
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

          <!-- Botón de Envío -->
          <button 
            type="submit"
            class="w-full bg-[#003087] text-white py-3 rounded-xl hover:bg-blue-800 transition-all font-bold shadow-md hover:shadow-lg flex items-center justify-center space-x-2 active:scale-95 disabled:opacity-50"
            :disabled="loading"
          >
            <span v-if="loading">Cargando...</span>
            <template v-else>
              <LogIn class="w-4 h-4" />
              <span>Ingresar</span>
            </template>
          </button>
        </form>

        <p class="mt-8 text-center text-sm text-slate-600">
          ¿No tienes una cuenta? 
          <router-link to="/register" class="text-[#003087] font-semibold hover:underline">
            Regístrate aquí
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { LogIn, AlertCircle } from 'lucide-vue-next';
import { authState } from '../router';

export default {
  name: 'LoginView',
  components: {
    LogIn,
    AlertCircle
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
        this.errors.email = 'Introduce un correo electrónico válido.';
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
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: this.email,
            password: this.password
          })
        });
        
        const data = await response.json();
        
        if (data.success) {
          authState.user = data.user;
          authState.admin = null;
          this.$router.push('/dashboard');
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
