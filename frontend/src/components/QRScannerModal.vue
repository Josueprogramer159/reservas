<template>
  <div v-if="mostrar" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
    <div class="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-lg w-full overflow-hidden">
      <div class="h-1.5 bg-[#003087]"></div>
      <div class="p-6">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-bold text-slate-900">Escanear Código QR</h3>
          <button @click="cerrar" class="text-slate-400 hover:text-slate-600">
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Estado de carga -->
        <div v-if="cargando" class="text-center py-8">
          <Loader2 class="w-8 h-8 text-[#003087] animate-spin mx-auto mb-3" />
          <p class="text-sm text-slate-600">Inicializando cámara...</p>
        </div>

        <!-- Error -->
        <div v-else-if="error" class="p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm font-medium mb-4">
          {{ error }}
        </div>

        <!-- Scanner -->
        <div v-else>
          <div id="qr-scanner" class="w-full rounded-xl overflow-hidden border-2 border-slate-200 mb-4 bg-black" style="min-height: 300px;"></div>

          <!-- Instrucciones -->
          <div class="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
            <p class="text-xs text-blue-900 leading-relaxed">
              📱 Apunta la cámara hacia el código QR de tu reserva. El escaneo se completará automáticamente cuando se detecte el código.
            </p>
          </div>

          <!-- Alternativa: Ingreso manual -->
          <div class="border-t border-slate-200 pt-4">
            <p class="text-xs font-semibold text-slate-500 mb-2 uppercase">O ingresa el código manualmente:</p>
            <div class="flex gap-2">
              <input
                v-model="codigoManual"
                type="text"
                placeholder="Pega el código QR aquí"
                @keyup.enter="procesarCodigoManual"
                class="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#003087]"
              />
              <button
                @click="procesarCodigoManual"
                :disabled="procesando"
                class="px-4 py-2 bg-[#003087] text-white font-semibold rounded-lg text-sm hover:bg-blue-800 transition active:scale-95 disabled:opacity-50"
              >
                {{ procesando ? 'Verificando...' : 'Verificar' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Botones de acción -->
        <div class="flex space-x-3 mt-6 pt-6 border-t border-slate-100">
          <button
            @click="cerrar"
            class="flex-1 border border-slate-200 text-slate-700 font-semibold py-2.5 rounded-xl text-sm hover:bg-slate-50 transition active:scale-95"
          >
            Cancelar
          </button>
        </div>

        <!-- Resultado exitoso -->
        <div v-if="resultadoExitoso" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div class="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-md w-full overflow-hidden">
            <div class="h-1.5 bg-emerald-500"></div>
            <div class="p-8 text-center">
              <CheckCircle class="w-12 h-12 text-emerald-500 mx-auto mb-4" />
              <h3 class="text-lg font-bold text-slate-900 mb-2">¡Asistencia Registrada!</h3>
              <p class="text-sm text-slate-600 mb-6">{{ mensajeExito }}</p>
              <button
                @click="finalizarExito"
                class="w-full bg-emerald-500 text-white font-semibold py-2.5 rounded-lg hover:bg-emerald-600 transition active:scale-95"
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Html5Qrcode } from 'html5-qrcode';
import { Loader2, X, CheckCircle } from 'lucide-vue-next';

export default {
  name: 'QRScannerModal',
  components: {
    Loader2,
    X,
    CheckCircle
  },
  props: {
    mostrar: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      scanner: null,
      cargando: true,
      error: '',
      procesando: false,
      codigoManual: '',
      resultadoExitoso: false,
      mensajeExito: '',
      yaEscaneado: false
    };
  },
  watch: {
    mostrar(newVal) {
      if (newVal) {
        this.$nextTick(() => {
          this.inicializarScanner();
        });
      } else {
        this.detenerScanner();
      }
    }
  },
  methods: {
    async inicializarScanner() {
      try {
        this.cargando = true;
        this.error = '';

        if (this.scanner) {
          await this.scanner.stop();
        }

        this.scanner = new Html5Qrcode('qr-scanner');

        const config = {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        };

        await this.scanner.start(
          { facingMode: 'environment' },
          config,
          (decodedText) => {
            if (!this.yaEscaneado && !this.procesando) {
              this.yaEscaneado = true;
              this.procesarCodigoQR(decodedText);
            }
          },
          (error) => {
            // Errores de decodificación silenciosos (normales durante escaneo)
            if (error && !error.includes('No MultiFormat Readers')) {
              console.debug('Info de escaneo:', error);
            }
          }
        );

        this.cargando = false;
      } catch (err) {
        this.cargando = false;
        this.error = 'No se pudo acceder a la cámara. Verifica los permisos.';
        console.error('Error inicializando scanner:', err);
      }
    },
    async detenerScanner() {
      if (this.scanner) {
        try {
          await this.scanner.stop();
          this.scanner.clear();
          this.scanner = null;
        } catch (err) {
          console.error('Error deteniendo scanner:', err);
        }
      }
      this.yaEscaneado = false;
    },
    async procesarCodigoQR(codigoQR) {
      this.procesando = true;
      this.error = '';

      try {
        const response = await fetch('/api/asistencias/escanear', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include', // Incluir cookies de sesión
          body: JSON.stringify({ qrData: codigoQR })
        });

        const data = await response.json();

        if (data.success) {
          this.mensajeExito = data.message;
          this.resultadoExitoso = true;
          if (this.scanner) {
            await this.detenerScanner();
          }
        } else {
          this.error = data.message || 'Error al registrar la asistencia';
          this.yaEscaneado = false;
          // Reintentar escaneo
          if (this.scanner && !this.scanner.getState()?.isScanning) {
            await this.inicializarScanner();
          }
        }
      } catch (err) {
        this.error = 'Error de conexión al registrar la asistencia';
        this.yaEscaneado = false;
        console.error('Error:', err);
      } finally {
        this.procesando = false;
      }
    },
    procesarCodigoManual() {
      if (this.codigoManual.trim()) {
        this.procesarCodigoQR(this.codigoManual);
        this.codigoManual = '';
      }
    },
    cerrar() {
      this.detenerScanner();
      this.$emit('cerrar');
    },
    finalizarExito() {
      this.$emit('asistencia-registrada');
      this.cerrar();
    }
  },
  beforeUnmount() {
    this.detenerScanner();
  }
};
</script>

<style scoped>
#qr-scanner {
  background-color: #000000;
}
</style>
