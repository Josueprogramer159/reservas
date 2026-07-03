<template>
  <div class="min-h-[85vh] flex items-center justify-center bg-[#f8fafc] px-4 py-12">
    <!-- Contenedor del Formulario -->
    <div class="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden transform transition-all duration-300">
      <div class="h-1.5 bg-[#003087]"></div>
      
      <div class="p-8">
        <!-- PASO 1: Solicitar confirmación para usar código de registro -->
        <div v-if="!codigoSolicitado">
          <div class="text-center mb-8">
            <h2 class="text-2xl font-bold text-slate-900">Recuperar Contraseña</h2>
            <p class="text-sm text-slate-500 mt-1.5">Use el código que recibió al registrarse</p>
          </div>

          <form @submit.prevent="solicitarCodigoRecuperacion">
            <!-- Correo Electrónico -->
            <div class="mb-6">
              <label class="block text-sm font-semibold text-slate-700 mb-2">Correo Electrónico</label>
              <input 
                v-model="email"
                type="email"
                class="form-input"
                :class="{ 'border-red-500 ring-2 ring-red-500/10': errors.email }"
                placeholder="tu@email.com"
                required
                :disabled="loading"
              >
              <p v-if="errors.email" class="text-red-500 text-xs mt-1.5 font-medium">{{ errors.email }}</p>
              <p class="text-xs text-slate-500 mt-1">Debe ser el email con el que te registraste</p>
            </div>

            <!-- Alerta de Error -->
            <div v-if="errorMessage" class="mb-5 p-3.5 bg-red-50 border border-red-100 text-red-700 rounded-xl text-sm font-medium flex items-center space-x-2">
              <AlertCircle class="w-5 h-5 flex-shrink-0 text-red-500" />
              <span>{{ errorMessage }}</span>
            </div>

            <!-- Botón de Continuar -->
            <button 
              type="submit"
              class="w-full bg-[#003087] text-white py-3 rounded-xl hover:bg-blue-800 transition-all font-bold shadow-md hover:shadow-lg flex items-center justify-center space-x-2 active:scale-95 disabled:opacity-50"
              :disabled="loading"
            >
              <span v-if="loading">Verificando...</span>
              <template v-else>
                <Mail class="w-4 h-4" />
                <span>Continuar</span>
              </template>
            </button>
          </form>
        </div>

        <!-- PASO 2: Verificar código y cambiar contraseña -->
        <div v-else>
          <div class="text-center mb-8">
            <h2 class="text-2xl font-bold text-slate-900">Nueva Contraseña</h2>
            <p class="text-sm text-slate-500 mt-1.5">Ingresa el código que recibiste al registrarte en <span class="font-semibold">{{ email }}</span></p>
          </div>

          <form @submit.prevent="restablecerContraseña">
            <!-- Código de Verificación -->
            <div class="mb-4">
              <label class="block text-sm font-semibold text-slate-700 mb-2">Código de Registro</label>
              <input 
                v-model="codigo"
                type="text"
                maxlength="6"
                class="form-input text-center text-xl tracking-widest"
                :class="{ 'border-red-500 ring-2 ring-red-500/10': errors.codigo }"
                placeholder="123456"
                required
                :disabled="loading"
              >
              <p v-if="errors.codigo" class="text-red-500 text-xs mt-1.5 font-medium">{{ errors.codigo }}</p>
              <p class="text-xs text-slate-500 mt-1">Use el código de 6 dígitos que se le proporcionó al registrarse</p>
            </div>

            <!-- Nueva Contraseña -->
            <div class="mb-4">
              <label class="block text-sm font-semibold text-slate-700 mb-2">Nueva Contraseña</label>
              <input 
                v-model="nuevaPassword"
                type="password"
                class="form-input"
                :class="{ 'border-red-500 ring-2 ring-red-500/10': errors.nuevaPassword }"
                placeholder="••••••••"
                required
                :disabled="loading"
              >
              <p v-if="errors.nuevaPassword" class="text-red-500 text-xs mt-1.5 font-medium">{{ errors.nuevaPassword }}</p>
              <p class="text-xs text-slate-500 mt-1">Mínimo 8 caracteres</p>
            </div>

            <!-- Confirmar Nueva Contraseña -->
            <div class="mb-6">
              <label class="block text-sm font-semibold text-slate-700 mb-2">Confirmar Nueva Contraseña</label>
              <input 
                v-model="confirmarPassword"
                type="password"
                class="form-input"
                :class="{ 'border-red-500 ring-2 ring-red-500/10': errors.confirmarPassword }"
                placeholder="••••••••"
                required
                :disabled="loading"
              >
              <p v-if="errors.confirmarPassword" class="text-red-500 text-xs mt-1.5 font-medium">{{ errors.confirmarPassword }}</p>
            </div>

            <!-- Alerta de Éxito -->
            <div v-if="successMessage" class="mb-5 p-3.5 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-sm font-medium flex items-center space-x-2">
              <CheckCircle class="w-5 h-5 flex-shrink-0 text-emerald-500" />
              <span>{{ successMessage }}</span>
            </div>

            <!-- Alerta de Error -->
            <div v-if="errorMessage" class="mb-5 p-3.5 bg-red-50 border border-red-100 text-red-700 rounded-xl text-sm font-medium flex items-center space-x-2">
              <AlertCircle class="w-5 h-5 flex-shrink-0 text-red-500" />
              <span>{{ errorMessage }}</span>
            </div>

            <!-- Botones -->
            <div class="space-y-3">
              <button 
                type="submit"
                class="w-full bg-[#003087] text-white py-3 rounded-xl hover:bg-blue-800 transition-all font-bold shadow-md hover:shadow-lg flex items-center justify-center space-x-2 active:scale-95 disabled:opacity-50"
                :disabled="loading"
              >
                <span v-if="loading">Cambiando contraseña...</span>
                <template v-else>
                  <Key class="w-4 h-4" />
                  <span>Cambiar Contraseña</span>
                </template>
              </button>

              <button 
                type="button"
                @click="volverAlPasoAnterior"
                class="w-full border border-slate-300 text-slate-700 py-3 rounded-xl hover:bg-slate-50 transition-all font-semibold"
                :disabled="loading"
              >
                Cambiar Email
              </button>
            </div>
          </form>
        </div>

        <p class="mt-8 text-center text-sm text-slate-600">
          ¿Recordaste tu contraseña? 
          <router-link to="/login" class="text-[#003087] font-semibold hover:underline">
            Volver al login
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { Key, AlertCircle, CheckCircle, Mail } from 'lucide-vue-next';

export default {
  name: 'RecuperarPasswordView',
  components: {
    Key,
    AlertCircle,
    CheckCircle,
    Mail
  },
  data() {
    return {
      // Paso 1: Verificar email
      email: '',
      codigoSolicitado: false,
      // Paso 2: Cambiar contraseña
      codigo: '',
      nuevaPassword: '',
      confirmarPassword: '',
      errors: {},
      errorMessage: '',
      successMessage: '',
      loading: false
    }
  },
  methods: {
    // Validación para el paso 1 (email)
    validateEmailStep() {
      this.errors = {};

      if (!this.email.trim()) {
        this.errorMessage = 'El correo electrónico es obligatorio';
        return false;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.email.trim())) {
        this.errors.email = 'Introduce un correo electrónico válido.';
        return false;
      }

      this.errorMessage = '';
      return true;
    },

    // Validación para el paso 2 (cambio de contraseña)
    validatePasswordStep() {
      this.errors = {};
      const camposFaltantes = [];

      if (!this.codigo.trim()) camposFaltantes.push('código de verificación');
      if (!this.nuevaPassword) camposFaltantes.push('nueva contraseña');
      if (!this.confirmarPassword) camposFaltantes.push('confirmar contraseña');

      if (camposFaltantes.length > 0) {
        this.errorMessage = `Campos obligatorios faltantes: ${camposFaltantes.join(', ')}`;
        return false;
      }

      this.errorMessage = '';

      if (this.codigo.trim().length !== 6) {
        this.errors.codigo = 'El código debe tener 6 dígitos.';
      }

      if (this.nuevaPassword.length < 8) {
        this.errors.nuevaPassword = 'La nueva contraseña debe tener al menos 8 caracteres.';
      }

      if (this.nuevaPassword !== this.confirmarPassword) {
        this.errors.confirmarPassword = 'Las contraseñas no coinciden.';
      }

      return Object.keys(this.errors).length === 0;
    },

    // Paso 1: Verificar que el usuario existe y puede usar su código de registro
    async solicitarCodigoRecuperacion() {
      if (!this.validateEmailStep()) return;
      
      this.loading = true;
      this.errorMessage = '';
      
      try {
        const response = await fetch('/api/verification/generate-recovery', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: this.email.trim()
          })
        });
        
        const data = await response.json();
        
        if (data.success) {
          this.codigoSolicitado = true;
          this.successMessage = 'Puede proceder con el código que se le proporcionó al registrarse';
          setTimeout(() => this.successMessage = '', 6000);
        } else {
          this.errorMessage = data.message || 'Error al verificar la cuenta.';
        }
      } catch (error) {
        console.error('Error al verificar código de recuperación:', error);
        this.errorMessage = 'Error de conexión con el servidor.';
      } finally {
        this.loading = false;
      }
    },

    // Paso 2: Restablecer contraseña con código
    async restablecerContraseña() {
      if (!this.validatePasswordStep()) return;
      
      this.loading = true;
      this.errorMessage = '';
      
      try {
        const response = await fetch('/api/verification/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: this.email.trim(),
            codigo: this.codigo.trim(),
            nueva_contraseña: this.nuevaPassword
          })
        });
        
        const data = await response.json();
        
        if (data.success) {
          this.successMessage = data.message || 'Contraseña restablecida correctamente. Puedes iniciar sesión con tu nueva contraseña.';
          setTimeout(() => this.$router.push('/login'), 3000);
        } else {
          this.errorMessage = data.message || 'Error al restablecer la contraseña.';
        }
      } catch (error) {
        console.error('Error al restablecer contraseña:', error);
        this.errorMessage = 'Error de conexión con el servidor.';
      } finally {
        this.loading = false;
      }
    },

    // Volver al paso anterior
    volverAlPasoAnterior() {
      this.codigoSolicitado = false;
      this.codigo = '';
      this.nuevaPassword = '';
      this.confirmarPassword = '';
      this.errors = {};
      this.errorMessage = '';
      this.successMessage = '';
    }
  }
}
</script>