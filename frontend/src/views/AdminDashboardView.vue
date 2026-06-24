<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
    <!-- Cabecera del Dashboard Admin -->
    <div class="bg-slate-900 rounded-3xl p-8 shadow-xl text-white mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6 border border-slate-800">
      <div class="flex items-center space-x-4">
        <div class="w-16 h-16 rounded-2xl bg-yellow-500 text-slate-950 flex items-center justify-center font-bold text-2xl shadow-lg shadow-yellow-500/10">
          AD
        </div>
        <div>
          <h1 class="text-2xl font-extrabold tracking-tight">Panel de Administración</h1>
          <p class="text-xs text-slate-400 font-semibold tracking-wider uppercase mt-1">Administrador: {{ state.admin?.nombre }}</p>
        </div>
      </div>
      <button @click="handleLogout" class="flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-3 rounded-xl transition duration-200 text-sm shadow-md active:scale-95">
        <LogOut class="w-4 h-4" />
        <span>Salir del Panel</span>
      </button>
    </div>

    <!-- Indicadores / Estadísticas -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center space-x-4">
        <div class="p-4 bg-blue-50 text-[#003087] rounded-xl">
          <Users class="w-6 h-6" />
        </div>
        <div>
          <h4 class="text-slate-400 font-semibold text-xs uppercase">Usuarios Registrados</h4>
          <p class="text-2xl font-extrabold text-slate-900 mt-1">{{ users.length }}</p>
        </div>
      </div>
      
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center space-x-4">
        <div class="p-4 bg-yellow-50 text-[#FFB800] rounded-xl">
          <ShieldCheck class="w-6 h-6" />
        </div>
        <div>
          <h4 class="text-slate-400 font-semibold text-xs uppercase">Administradores</h4>
          <p class="text-2xl font-extrabold text-slate-900 mt-1">{{ admins.length }}</p>
        </div>
      </div>

      <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center space-x-4">
        <div class="p-4 bg-emerald-50 text-emerald-600 rounded-xl">
          <CalendarCheck class="w-6 h-6" />
        </div>
        <div>
          <h4 class="text-slate-400 font-semibold text-xs uppercase">Reservas Activas</h4>
          <p class="text-2xl font-extrabold text-slate-900 mt-1">2</p>
        </div>
      </div>
    </div>

    <!-- Sección de Tablas de la Base de Datos -->
    <div class="space-y-10">
      <!-- Tabla Usuarios -->
      <div class="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <h3 class="text-lg font-bold text-slate-900 mb-6 flex items-center space-x-2">
          <Users class="w-5 h-5 text-[#003087]" />
          <span>Listado de Usuarios Registrados</span>
        </h3>
        
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-slate-100 text-slate-400 text-xs uppercase font-semibold">
                <th class="py-3 px-4">ID</th>
                <th class="py-3 px-4">Nombre</th>
                <th class="py-3 px-4">Email</th>
                <th class="py-3 px-4">Fecha de Registro</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in users" :key="user.id" class="border-b border-slate-50 hover:bg-slate-50/50 transition duration-150 text-sm text-slate-700">
                <td class="py-3.5 px-4 font-semibold text-slate-900">#{{ user.id }}</td>
                <td class="py-3.5 px-4">{{ user.nombre }}</td>
                <td class="py-3.5 px-4 text-[#003087] font-medium">{{ user.email }}</td>
                <td class="py-3.5 px-4 text-slate-500">{{ formatDate(user.fecha_registro) }}</td>
              </tr>
              <tr v-if="users.length === 0">
                <td colspan="4" class="py-8 text-center text-slate-400 font-medium">Ningún usuario registrado aún.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Tabla Administradores -->
      <div class="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <h3 class="text-lg font-bold text-slate-900 mb-6 flex items-center space-x-2">
          <ShieldCheck class="w-5 h-5 text-[#FFB800]" />
          <span>Administradores del Sistema</span>
        </h3>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-slate-100 text-slate-400 text-xs uppercase font-semibold">
                <th class="py-3 px-4">ID</th>
                <th class="py-3 px-4">Nombre</th>
                <th class="py-3 px-4">Email</th>
                <th class="py-3 px-4">Rol</th>
                <th class="py-3 px-4">Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="admin in admins" :key="admin.id" class="border-b border-slate-50 hover:bg-slate-50/50 transition duration-150 text-sm text-slate-700">
                <td class="py-3.5 px-4 font-semibold text-slate-900">#{{ admin.id }}</td>
                <td class="py-3.5 px-4">{{ admin.nombre }}</td>
                <td class="py-3.5 px-4 text-[#003087] font-medium">{{ admin.email }}</td>
                <td class="py-3.5 px-4"><span class="px-2 py-0.5 rounded bg-slate-100 font-semibold text-xs text-slate-600 uppercase">{{ admin.rol }}</span></td>
                <td class="py-3.5 px-4">
                  <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold" :class="admin.activo ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'">
                    <span class="w-1.5 h-1.5 rounded-full" :class="admin.activo ? 'bg-emerald-500' : 'bg-red-500'"></span>
                    {{ admin.activo ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Users, ShieldCheck, CalendarCheck, LogOut } from 'lucide-vue-next';
import { authState } from '../router';

export default {
  name: 'AdminDashboardView',
  components: {
    Users,
    ShieldCheck,
    CalendarCheck,
    LogOut
  },
  data() {
    return {
      state: authState,
      users: [],
      admins: []
    }
  },
  mounted() {
    this.fetchDashboardData();
  },
  methods: {
    async fetchDashboardData() {
      try {
        const response = await fetch('/api/admin/dashboard-data', {
          headers: { 'Content-Type': 'application/json' }
        });
        const data = await response.json();
        if (data.success) {
          this.users = data.usuarios || [];
          this.admins = data.administradores || [];
        }
      } catch (error) {
        console.error('Error al intentar obtener los datos del panel de administrador:', error);
      }
    },
    formatDate(dateString) {
      if (!dateString) return '';
      const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
      return new Date(dateString).toLocaleDateString('es-ES', options);
    },
    async handleLogout() {
      try {
        const response = await fetch('/api/admin/logout', { 
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        const data = await response.json();
        if (data.success) {
          this.state.logoutAdmin();
          this.$router.push('/');
        }
      } catch (error) {
        console.error('Error al intentar cerrar la sesión del administrador:', error);
      }
    }
  }
}
</script>
