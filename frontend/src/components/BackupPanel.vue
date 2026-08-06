<template>
  <div class="space-y-6">
    <!-- Toast de notificaciones -->
    <div v-if="toastMsg" :class="['p-3.5 rounded-xl text-sm font-medium transition', 
      toastType === 'ok' ? 'bg-emerald-50 border border-emerald-100 text-emerald-700' : 'bg-red-50 border border-red-100 text-red-700']">
      {{ toastMsg }}
    </div>

    <!-- Sección de Exportación -->
    <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
      <h3 class="text-lg font-bold text-slate-900">📤 Exportar Datos</h3>
      <p class="text-sm text-slate-600">Descarga tus datos en PDF o JSON para análisis o respaldo</p>

      <!-- Grid de botones de exportación -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Usuarios PDF -->
        <button
          @click="exportarDatos('usuarios', 'pdf')"
          :disabled="exportando"
          class="flex flex-col items-center justify-center gap-2 p-4 border-2 border-slate-200 rounded-xl hover:border-[#003087] hover:bg-blue-50 transition disabled:opacity-50"
        >
          <span class="text-2xl">👥</span>
          <span class="font-semibold text-sm text-slate-900">Usuarios</span>
          <span class="text-xs text-slate-500">PDF</span>
        </button>

        <!-- Reservas PDF -->
        <button
          @click="exportarDatos('reservas', 'pdf')"
          :disabled="exportando"
          class="flex flex-col items-center justify-center gap-2 p-4 border-2 border-slate-200 rounded-xl hover:border-[#003087] hover:bg-blue-50 transition disabled:opacity-50"
        >
          <span class="text-2xl">📅</span>
          <span class="font-semibold text-sm text-slate-900">Reservas</span>
          <span class="text-xs text-slate-500">PDF</span>
        </button>

        <!-- Espacios PDF -->
        <button
          @click="exportarDatos('espacios', 'pdf')"
          :disabled="exportando"
          class="flex flex-col items-center justify-center gap-2 p-4 border-2 border-slate-200 rounded-xl hover:border-[#003087] hover:bg-blue-50 transition disabled:opacity-50"
        >
          <span class="text-2xl">🏢</span>
          <span class="font-semibold text-sm text-slate-900">Espacios</span>
          <span class="text-xs text-slate-500">PDF</span>
        </button>

        <!-- Backup Completo JSON -->
        <button
          @click="exportarDatos('completo', 'json')"
          :disabled="exportando"
          class="flex flex-col items-center justify-center gap-2 p-4 border-2 border-emerald-200 rounded-xl hover:border-emerald-600 hover:bg-emerald-50 transition disabled:opacity-50"
        >
          <span class="text-2xl">💾</span>
          <span class="font-semibold text-sm text-slate-900">Backup</span>
          <span class="text-xs text-emerald-600 font-bold">Completo</span>
        </button>
      </div>

      <!-- Exportaciones adicionales JSON -->
      <div class="border-t border-slate-100 pt-4">
        <p class="text-xs font-semibold text-slate-600 uppercase mb-3">Exportaciones JSON adicionales</p>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            @click="exportarDatos('usuarios', 'json')"
            :disabled="exportando"
            class="px-3 py-2 text-sm font-semibold text-[#003087] border border-[#003087] rounded-lg hover:bg-blue-50 transition disabled:opacity-50"
          >
            Usuarios JSON
          </button>
          <button
            @click="exportarDatos('reservas', 'json')"
            :disabled="exportando"
            class="px-3 py-2 text-sm font-semibold text-[#003087] border border-[#003087] rounded-lg hover:bg-blue-50 transition disabled:opacity-50"
          >
            Reservas JSON
          </button>
          <button
            @click="exportarDatos('espacios', 'json')"
            :disabled="exportando"
            class="px-3 py-2 text-sm font-semibold text-[#003087] border border-[#003087] rounded-lg hover:bg-blue-50 transition disabled:opacity-50"
          >
            Espacios JSON
          </button>
        </div>
      </div>
    </div>

    <!-- Sección de Restauración -->
    <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
      <h3 class="text-lg font-bold text-slate-900">📥 Restaurar Backup</h3>
      <p class="text-sm text-slate-600">Carga un archivo JSON previamente descargado para restaurar datos</p>

      <!-- Drop zone para subir archivo -->
      <div
        @click="$refs.inputArchivo.click()"
        @dragover.prevent
        @drop.prevent="onDropArchivo"
        class="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center cursor-pointer transition hover:border-[#003087] hover:bg-blue-50"
      >
        <div v-if="!archivoSeleccionado" class="space-y-2">
          <p class="text-sm font-semibold text-slate-700">📎 Haz clic o arrastra un archivo JSON</p>
          <p class="text-xs text-slate-500">Solo se aceptan archivos JSON válidos</p>
        </div>
        <div v-else class="space-y-2">
          <p class="text-sm font-semibold text-slate-900">✓ {{ archivoSeleccionado.name }}</p>
          <p class="text-xs text-slate-500">{{ (archivoSeleccionado.size / 1024).toFixed(2) }} KB</p>
          <button
            @click.stop="quitarArchivo"
            class="text-xs text-red-600 hover:text-red-700 font-semibold mt-2"
          >
            Cambiar archivo
          </button>
        </div>
      </div>

      <input
        ref="inputArchivo"
        type="file"
        accept=".json"
        @change="onChangeArchivo"
        class="hidden"
      />

      <!-- Error o mensaje -->
      <div v-if="restaurarError" class="p-3 bg-red-50 border border-red-100 text-red-700 rounded-lg text-sm">
        {{ restaurarError }}
      </div>

      <!-- Botón restaurar -->
      <button
        v-if="archivoSeleccionado"
        @click="mostrarConfirmacionRestauracion = true"
        :disabled="restaurando"
        class="w-full bg-emerald-600 text-white font-bold py-2.5 rounded-lg hover:bg-emerald-700 transition disabled:opacity-50"
      >
        {{ restaurando ? 'Restaurando...' : '🔄 Restaurar Backup' }}
      </button>
    </div>

    <!-- Modal de confirmación de restauración -->
    <div v-if="mostrarConfirmacionRestauracion && archivoSeleccionado" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full space-y-4">
        <h3 class="text-lg font-bold text-slate-900">⚠️ Confirmar Restauración</h3>
        <p class="text-slate-600 text-sm">
          Estás a punto de restaurar datos desde <strong>{{ archivoSeleccionado.name }}</strong>. 
          Esta acción importará registros que no existan en el sistema. ¿Deseas continuar?
        </p>

        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
          ⚠️ Los registros existentes no serán sobrescritos, solo se importarán los nuevos.
        </div>

        <div class="flex gap-3">
          <button
            @click="mostrarConfirmacionRestauracion = false"
            class="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition"
          >
            Cancelar
          </button>
          <button
            @click="realizarRestauracion"
            :disabled="restaurando"
            class="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition disabled:opacity-50"
          >
            {{ restaurando ? 'Restaurando...' : 'Confirmar' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BackupPanel',
  data() {
    return {
      exportando: false,
      restaurando: false,
      archivoSeleccionado: null,
      mostrarConfirmacionRestauracion: false,
      toastMsg: '',
      toastType: 'ok',
      restaurarError: ''
    };
  },
  methods: {
    async exportarDatos(tipo, formato) {
      this.exportando = true;
      try {
        const endpoint = `/api/admin/backup/${tipo}/${formato}`;
        const response = await fetch(endpoint, {
          credentials: 'include'
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Error al exportar datos');
        }

        // Crear blob y descargar
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = this.generarNombreArchivo(tipo, formato);
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        this.mostrarToast(`✓ ${tipo.charAt(0).toUpperCase() + tipo.slice(1)} exportado correctamente`, 'ok');
      } catch (error) {
        console.error('Error exportando:', error);
        this.mostrarToast(error.message || 'Error al exportar datos', 'error');
      } finally {
        this.exportando = false;
      }
    },

    generarNombreArchivo(tipo, formato) {
      const timestamp = new Date().toISOString().slice(0, 10);
      const ext = formato === 'pdf' ? 'pdf' : 'json';
      return `${tipo}_${timestamp}.${ext}`;
    },

    onChangeArchivo(e) {
      const file = e.target.files[0];
      if (file) {
        this.validarArchivo(file);
      }
    },

    onDropArchivo(e) {
      const file = e.dataTransfer.files[0];
      if (file) {
        this.validarArchivo(file);
      }
    },

    validarArchivo(file) {
      if (!file.name.endsWith('.json')) {
        this.restaurarError = 'Solo se aceptan archivos JSON (.json)';
        return;
      }

      if (file.size > 50 * 1024 * 1024) {
        this.restaurarError = 'El archivo no puede superar 50 MB';
        return;
      }

      this.archivoSeleccionado = file;
      this.restaurarError = '';
    },

    quitarArchivo() {
      this.archivoSeleccionado = null;
      this.restaurarError = '';
      this.$refs.inputArchivo.value = '';
    },

    async realizarRestauracion() {
      if (!this.archivoSeleccionado) return;

      this.restaurando = true;
      this.restaurarError = '';

      try {
        const formData = new FormData();
        formData.append('archivo', this.archivoSeleccionado);

        const response = await fetch('/api/admin/backup/restaurar', {
          method: 'POST',
          credentials: 'include',
          body: formData
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Error al restaurar backup');
        }

        this.mostrarToast(`✓ ${data.message}`, 'ok');
        this.mostrarConfirmacionRestauracion = false;
        this.quitarArchivo();
      } catch (error) {
        console.error('Error restaurando:', error);
        this.restaurarError = error.message || 'Error al restaurar backup';
      } finally {
        this.restaurando = false;
      }
    },

    mostrarToast(msg, tipo) {
      this.toastMsg = msg;
      this.toastType = tipo;
      setTimeout(() => {
        this.toastMsg = '';
      }, 4000);
    }
  }
};
</script>

<style scoped>
/* Estilos específicos si es necesario */
</style>
