<template>
  <footer class="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- Columna de Identidad -->
        <div class="space-y-4">
          <div class="flex items-center space-x-2">
            <div class="bg-[#003087] text-[#FFB800] p-1.5 rounded-lg font-bold text-sm">UTC</div>
            <span class="text-white font-bold text-lg tracking-tight">ReservaUTC</span>
          </div>
          <p class="text-sm leading-relaxed text-slate-400">
            Plataforma oficial de reservas para laboratorios de cómputo, canchas multideportivas y salas de conferencias de la Universidad UTC. Optimiza el uso de recursos educativos de forma ágil y transparente.
          </p>
        </div>
        <!-- Columna de Enlaces -->
        <div>
          <h4 class="text-white font-semibold text-sm uppercase tracking-wider">Enlaces Rápidos</h4>
          <ul class="mt-4 space-y-2.5 text-sm">
            <li>
              <router-link to="/" class="hover:text-[#FFB800] transition-colors duration-200">Página de Inicio</router-link>
            </li>
            <li>
              <router-link to="/login" class="hover:text-[#FFB800] transition-colors duration-200">Reserva de Espacios</router-link>
            </li>
            <li>
              <router-link to="/register" class="hover:text-[#FFB800] transition-colors duration-200">Crear una Cuenta</router-link>
            </li>
            <li>
              <router-link to="/admin-login" class="hover:text-[#FFB800] transition-colors duration-200">Portal de Administradores</router-link>
            </li>
          </ul>
        </div>
        <!-- Columna de Contacto -->
        <div>
          <h4 class="text-white font-semibold text-sm uppercase tracking-wider">Soporte Técnico</h4>
          <p class="mt-4 text-sm leading-relaxed text-slate-400">
            Universidad Tecnológica UTC<br>
            Campus Principal - Dirección de Tecnología<br>
            Correo: <span class="text-white">soporte@utc.edu</span><br>
            Horario: Lunes a Viernes (08:00 - 18:00)
          </p>
        </div>
      </div>
      <div class="mt-12 pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
        <p>&copy; {{ currentYear }} ReservaUTC. Todos los derechos reservados. Diseñado para la comunidad universitaria UTC.</p>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'Footer',
  computed: {
    currentYear() {
      return new Date().getFullYear();
    }
  }
}
</script>
