<template>
  <button 
    @click="toggleFavorite"
    :class="['favorito-btn', { 'is-favorito': isFavorito }]"
    :aria-label="isFavorito ? 'Quitar de favoritos' : 'Agregar a favoritos'"
  >
    <Heart :size="24" :fill="isFavorito ? 'currentColor' : 'none'" />
  </button>
</template>

<script>
import { Heart } from 'lucide-vue-next';
import { ref, watch } from 'vue';

export default {
  components: {
    Heart
  },
  props: {
    espacioId: {
      type: [String, Number],
      required: true
    },
    esFavorito: {
      type: Boolean,
      default: false
    }
  },
  emits: ['toggle'],
  setup(props, { emit }) {
    const isFavorito = ref(props.esFavorito);
    const isLoading = ref(false);

    watch(() => props.esFavorito, (newVal) => {
      isFavorito.value = newVal;
    });

    const toggleFavorite = async () => {
      if (isLoading.value) return;

      try {
        isLoading.value = true;

        if (isFavorito.value) {
          // Quitar de favoritos - DELETE /api/usuario/favoritos/:espacioId
          await fetch(`/api/usuario/favoritos/${props.espacioId}`, {
            method: 'DELETE',
            credentials: 'include'
          });
        } else {
          // Agregar a favoritos - POST /api/usuario/favoritos/:espacioId
          await fetch(`/api/usuario/favoritos/${props.espacioId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
          });
        }

        isFavorito.value = !isFavorito.value;
        emit('toggle', {
          espacioId: props.espacioId,
          esFavorito: isFavorito.value,
          message: isFavorito.value ? 'Agregado a favoritos' : 'Removido de favoritos'
        });
      } catch (error) {
        console.error('Error al cambiar favorito:', error);
      } finally {
        isLoading.value = false;
      }
    };

    return {
      isFavorito,
      toggleFavorite
    };
  }
};
</script>

<style scoped>
.favorito-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
  color: #999;
}

.favorito-btn:hover {
  background-color: #f0f0f0;
  color: #ff6b6b;
}

.favorito-btn.is-favorito {
  color: #ff6b6b;
}

.favorito-btn.is-favorito:hover {
  background-color: #ffe0e0;
}
</style>
