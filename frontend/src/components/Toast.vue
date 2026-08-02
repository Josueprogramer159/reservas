<template>
  <Teleport to="body">
    <div v-if="visible" class="fixed bottom-4 right-4 z-[9999] animate-slide-in">
      <div :class="{
        'bg-blue-500': tipo === 'info',
        'bg-green-500': tipo === 'success',
        'bg-red-500': tipo === 'error',
        'bg-yellow-500': tipo === 'warning'
      }" class="text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 max-w-sm">
        <div v-if="tipo === 'success'" class="text-xl">✓</div>
        <div v-else-if="tipo === 'error'" class="text-xl">✕</div>
        <div v-else-if="tipo === 'info'" class="text-xl">ℹ</div>
        <div v-else class="text-xl">⚠</div>
        <p class="text-sm font-medium">{{ mensaje }}</p>
      </div>
    </div>
  </Teleport>
</template>

<script>
export default {
  name: 'Toast',
  data() {
    return {
      visible: false,
      mensaje: '',
      tipo: 'info',
      timeoutId: null
    };
  },
  methods: {
    mostrar(mensaje, tipo = 'info', duracion = 3000) {
      this.mensaje = mensaje;
      this.tipo = tipo;
      this.visible = true;
      
      if (this.timeoutId) clearTimeout(this.timeoutId);
      
      this.timeoutId = setTimeout(() => {
        this.visible = false;
      }, duracion);
    }
  }
};
</script>

<style scoped>
@keyframes slide-in {
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.animate-slide-in {
  animation: slide-in 0.3s ease-out;
}
</style>
