<template>
  <div class="min-h-[85vh] flex items-center justify-center bg-[#f8fafc] px-4 py-12">
    <!-- Contenedor del Formulario -->
    <div class="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden transform transition-all duration-300">
      <div class="h-1.5 bg-[#003087]"></div>
      
      <div class="p-8">
        <div class="text-center mb-8">
          <h2 class="text-2xl font-bold text-slate-900">Crear Cuenta</h2>
          <p class="text-sm text-slate-500 mt-1.5">Regístrate para reservar espacios universitarios</p>
        </div>

        <form @submit.prevent="handleRegister">
          <!-- Nombre Completo -->
          <div class="mb-4">
            <label class="block text-sm font-semibold text-slate-700 mb-2">Nombre Completo</label>
            <input 
              v-model="nombre"
              type="text"
              class="form-input"
              :class="{ 'border-red-500 ring-2 ring-red-500/10': errors.nombre }"
              placeholder="Juan Pérez"
              required
            >
            <p v-if="errors.nombre" class="text-red-500 text-xs mt-1.5 font-medium">{{ errors.nombre }}</p>
          </div>

          <!-- Correo Electrónico -->
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
          <div class="mb-4">
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

          <!-- Confirmar Contraseña -->
          <div class="mb-6">
            <label class="block text-sm font-semibold text-slate-700 mb-2">Confirmar Contraseña</label>
            <input 
              v-model="confirmPassword"
              type="password"
              class="form-input"
              :class="{ 'border-red-500 ring-2 ring-red-500/10': errors.confirmPassword }"
              placeholder="••••••••"
              required
            >
            <p v-if="errors.confirmPassword" class="text-red-500 text-xs mt-1.5 font-medium">{{ errors.confirmPassword }}</p>
          </div>

          <!-- Alerta de Éxito -->
          <div v-if="successMessage" class="mb-5 p-3.5 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-sm font-medium flex items-center space-x-2">
            <CheckCircle class="w-5 h-5 flex-shrink-0 text-emerald-500" />
            <span>{{ successMessage }}</span>
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
            <span v-if="loading">Creando cuenta...</span>
            <template v-else>
              <UserPlus class="w-4 h-4" />
              <span>Registrarse</span>
            </template>
          </button>
        </form>

        <p class="mt-8 text-center text-sm text-slate-600">
          ¿Ya tienes cuenta? 
          <router-link to="/login" class="text-[#003087] font-semibold hover:underline">
            Inicia sesión aquí
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { UserPlus, AlertCircle, CheckCircle } from 'lucide-vue-next';
import { authState } from '../router';

export default {
  name: 'RegisterView',
  components: {
    UserPlus,
    AlertCircle,
    CheckCircle
  },
  data() {
    return {
      nombre: '',
      email: '',
      password: '',
      confirmPassword: '',
      errors: {},
      errorMessage: '',
      successMessage: '',
      loading: false
    }
  },
  methods: {
    validateForm() {
      this.errors = {};
      const camposFaltantes = [];

      if (!this.nombre.trim()) camposFaltantes.push('nombre');
      if (!this.email.trim()) camposFaltantes.push('correo electrónico');
      if (!this.password) camposFaltantes.push('contraseña');
      if (!this.confirmPassword) camposFaltantes.push('confirmar contraseña');

      if (camposFaltantes.length > 0) {
        this.errorMessage = `Campos obligatorios faltantes: ${camposFaltantes.join(', ')}`;
        return false;
      }

      this.errorMessage = '';

      if (this.nombre.trim().length < 2) {
        this.errors.nombre = 'El nombre es muy corto (mínimo 2 caracteres).';
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.email)) {
        this.errors.email = 'Introduce un correo electrónico válido.';
      }

      if (this.password.length < 8) {
        this.errors.password = 'La contraseña debe tener al menos 8 caracteres.';
      }

      if (this.password !== this.confirmPassword) {
        this.errors.confirmPassword = 'Las contraseñas no coinciden.';
      }

      return Object.keys(this.errors).length === 0;
    },
    
    async handleRegister() {
      if (!this.validateForm()) return;
      
      this.loading = true;
      this.errorMessage = '';
      
      try {
        const response = await fetch('/api/auth/registro', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nombre: this.nombre,
            email: this.email,
            password: this.password
          })
        });
        
        const data = await response.json();
        
        if (data.success) {
          authState.user = data.user;
          authState.admin = null;
          this.successMessage = data.message || 'Registro exitoso. Tu cuenta ha sido creada correctamente.';
          setTimeout(() => this.$router.push('/dashboard'), 1500);
        } else {
          this.errorMessage = data.message || 'Error al registrar la cuenta.';
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
