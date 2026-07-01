<template>
  <div class="min-h-[85vh] flex items-center justify-center bg-[#f8fafc] px-4 py-12">
    <div class="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
      <div class="h-1.5 bg-[#003087]"></div>

      <div class="p-8">

        <!-- PASO 1: Verificar correo -->
        <div v-if="paso === 1">
          <div class="text-center mb-8">
            <div class="w-14 h-14 rounded-2xl bg-blue-50 text-[#003087] flex items-center justify-center mx-auto mb-4">
              <KeyRound class="w-7 h-7" />
            </div>
            <h2 class="text-2xl font-bold text-slate-900">Recuperar Contraseña</h2>
            <p class="text-sm text-slate-500 mt-1.5">Ingresa tu correo y te permitiremos restablecer tu contraseña</p>
          </div>

          <div v-if="errorMsg" class="mb-5 p-3.5 bg-red-50 border border-red-100 text-red-700 rounded-xl text-sm font-medium flex items-center gap-2">
            <AlertCircle class="w-5 h-5 flex-shrink-0" /><span>{{ errorMsg }}</span>
          </div>

          <form @submit.prevent="verificarCorreo">
            <div class="mb-5">
              <label class="block text-sm font-semibold text-slate-700 mb-2">Correo Electrónico</label>
              <input
                v-model="email"
                type="email"
                class="form-input"
                placeholder="tu@email.com"
                required
              >
            </div>
            <button
              type="submit"
              :disabled="loading"
              class="w-full bg-[#003087] text-white py-3 rounded-xl hover:bg-blue-800 transition font-bold shadow-md flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              <Loader2 v-if="loading" class="w-4 h-4 animate-spin" />
              <span>{{ loading ? 'Verificando...' : 'Verificar Correo' }}</span>
            </button>
          </form>
        </div>

        <!-- PASO 2: Nueva contraseña -->
        <div v-if="paso === 2">
          <div class="text-center mb-8">
            <div class="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <ShieldCheck class="w-7 h-7" />
            </div>
            <h2 class="text-2xl font-bold text-slate-900">Nueva Contraseña</h2>
            <p class="text-sm text-slate-500 mt-1.5">Hola <span class="font-semibold text-slate-700">{{ nombreUsuario }}</span>, establece tu nueva contraseña</p>
          </div>

          <div v-if="errorMsg" class="mb-5 p-3.5 bg-red-50 border border-red-100 text-red-700 rounded-xl text-sm font-medium flex items-center gap-2">
            <AlertCircle class="w-5 h-5 flex-shrink-0" /><span>{{ errorMsg }}</span>
          </div>

          <form @submit.prevent="restablecerPassword">
            <div class="mb-4">
              <label class="block text-sm font-semibold text-slate-700 mb-2">Nueva Contraseña</label>
              <input
                v-model="password"
                type="password"
                class="form-input"
                :class="{ 'border-red-500 ring-2 ring-red-500/10': errores.password }"
                placeholder="Mínimo 8 caracteres"
                required
              >
              <p v-if="errores.password" class="text-red-500 text-xs mt-1.5 font-medium">{{ errores.password }}</p>
            </div>
            <div class="mb-6">
              <label class="block text-sm font-semibold text-slate-700 mb-2">Confirmar Contraseña</label>
              <input
                v-model="confirmPassword"
                type="password"
                class="form-input"
                :class="{ 'border-red-500 ring-2 ring-red-500/10': errores.confirm }"
                placeholder="Repite tu nueva contraseña"
                required
              >
              <p v-if="errores.confirm" class="text-red-500 text-xs mt-1.5 font-medium">{{ errores.confirm }}</p>
            </div>

            <!-- Indicador de seguridad -->
            <div class="mb-5">
              <div class="flex justify-between text-xs text-slate-400 mb-1">
                <span>Seguridad de la contraseña</span>
                <span :class="seguridadColor">{{ seguridadLabel }}</span>
              </div>
              <div class="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div class="h-full rounded-full transition-all duration-300" :class="seguridadBarColor" :style="{ width: seguridadAncho }"></div>
              </div>
            </div>

            <button
              type="submit"
              :disabled="loading"
              class="w-full bg-[#003087] text-white py-3 rounded-xl hover:bg-blue-800 transition font-bold shadow-md flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              <Loader2 v-if="loading" class="w-4 h-4 animate-spin" />
              <span>{{ loading ? 'Actualizando...' : 'Restablecer Contraseña' }}</span>
            </button>
          </form>
        </div>

        <!-- PASO 3: Éxito -->
        <div v-if="paso === 3" class="text-center py-4 space-y-5">
          <div class="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle class="w-9 h-9" />
          </div>
          <div>
            <h2 class="text-2xl font-bold text-slate-900">¡Contraseña Actualizada!</h2>
            <p class="text-sm text-slate-500 mt-2">Tu contraseña fue restablecida correctamente. Ya puedes iniciar sesión con tus nuevas credenciales.</p>
          </div>
          <router-link
            to="/login"
            class="inline-flex items-center gap-2 bg-[#003087] text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-800 transition text-sm active:scale-95"
          >
            <LogIn class="w-4 h-4" />
            Ir al Inicio de Sesión
          </router-link>
        </div>

        <!-- Link volver al login (pasos 1 y 2) -->
        <p v-if="paso !== 3" class="mt-6 text-center text-sm text-slate-500">
          <router-link to="/login" class="text-[#003087] font-semibold hover:underline">
            ← Volver al inicio de sesión
          </router-link>
        </p>

      </div>
    </div>
  </div>
</template>

<script>
import { KeyRound, AlertCircle, ShieldCheck, CheckCircle, LogIn, Loader2 } from 'lucide-vue-next';

export default {
  name: 'RecuperarPasswordView',
  components: { KeyRound, AlertCircle, ShieldCheck, CheckCircle, LogIn, Loader2 },
  data() {
    return {
      paso: 1,
      email: '',
      nombreUsuario: '',
      password: '',
      confirmPassword: '',
      errores: {},
      errorMsg: '',
      loading: false
    };
  },
  computed: {
    seguridadNivel() {
      const p = this.password;
      if (!p) return 0;
      let score = 0;
      if (p.length >= 8) score++;
      if (p.length >= 12) score++;
      if (/[A-Z]/.test(p)) score++;
      if (/[0-9]/.test(p)) score++;
      if (/[^A-Za-z0-9]/.test(p)) score++;
      return score;
    },
    seguridadLabel() {
      const labels = ['', 'Muy débil', 'Débil', 'Regular', 'Buena', 'Fuerte'];
      return labels[this.seguridadNivel] || '';
    },
    seguridadColor() {
      const colors = ['', 'text-red-500', 'text-orange-500', 'text-yellow-500', 'text-blue-500', 'text-emerald-500'];
      return colors[this.seguridadNivel] || '';
    },
    seguridadBarColor() {
      const colors = ['', 'bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-blue-400', 'bg-emerald-500'];
      return colors[this.seguridadNivel] || '';
    },
    seguridadAncho() {
      return `${(this.seguridadNivel / 5) * 100}%`;
    }
  },
  methods: {
    async verificarCorreo() {
      this.errorMsg = '';
      if (!this.email.trim()) {
        this.errorMsg = 'El correo electrónico es obligatorio.'; return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.email)) {
        this.errorMsg = 'El formato del correo electrónico no es válido.'; return;
      }
      this.loading = true;
      try {
        const res = await fetch('/api/auth/verificar-correo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: this.email })
        });
        const data = await res.json();
        if (data.success) {
          this.nombreUsuario = data.nombre;
          this.paso = 2;
        } else {
          this.errorMsg = data.message;
        }
      } catch {
        this.errorMsg = 'Error de conexión con el servidor.';
      } finally {
        this.loading = false;
      }
    },
    async restablecerPassword() {
      this.errorMsg = '';
      this.errores = {};

      if (!this.password) { this.errores.password = 'La contraseña es obligatoria.'; return; }
      if (this.password.length < 8) { this.errores.password = 'Debe tener al menos 8 caracteres.'; return; }
      if (!this.confirmPassword) { this.errores.confirm = 'Debes confirmar la contraseña.'; return; }
      if (this.password !== this.confirmPassword) { this.errores.confirm = 'Las contraseñas no coinciden.'; return; }

      this.loading = true;
      try {
        const res = await fetch('/api/auth/restablecer-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: this.email, password: this.password, confirmPassword: this.confirmPassword })
        });
        const data = await res.json();
        if (data.success) {
          this.paso = 3;
        } else {
          this.errorMsg = data.message;
        }
      } catch {
        this.errorMsg = 'Error de conexión con el servidor.';
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>
