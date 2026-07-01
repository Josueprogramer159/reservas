<template>
  <div class="min-h-screen flex flex-col justify-between bg-[#f8fafc] text-slate-800">
    <!-- Mostrar la barra de navegación global solo en páginas públicas e inicio de sesión -->
    <Navbar v-if="!isDashboard" />
    
    <main class="flex-grow flex flex-col">
      <router-view></router-view>
    </main>
    
    <!-- Mostrar el pie de página global solo en páginas públicas e inicio de sesión -->
    <Footer v-if="!isDashboard" />
  </div>
</template>

<script>
import Navbar from './components/Navbar.vue';
import Footer from './components/Footer.vue';

export default {
  name: 'App',
  components: {
    Navbar,
    Footer
  },
  computed: {
    isDashboard() {
      const rutasSinNav = ['/dashboard', '/admin-dashboard', '/invitado', '/admin-reportes'];
      return (this.$route.meta && this.$route.meta.requiresAuth === true) ||
             rutasSinNav.includes(this.$route.path);
    }
  }
}
</script>
