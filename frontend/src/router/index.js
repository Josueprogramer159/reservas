import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import DashboardView from '../views/DashboardView.vue'
import AdminLoginView from '../views/AdminLoginView.vue'
import AdminDashboardView from '../views/AdminDashboardView.vue'
import SpaceDetailView from '../views/SpaceDetailView.vue'
import GuestDashboardView from '../views/GuestDashboardView.vue'
import RecuperarPasswordView from '../views/RecuperarPasswordView.vue'
import AdminReportesView from '../views/AdminReportesView.vue'
import { reactive } from 'vue'

// Estado de sesión reactivo y compartido
export const authState = reactive({
  user: null,
  admin: null,
  isInitialized: false,

  async checkAuth() {
    try {
      // 1. Probar si hay sesión de usuario activa
      const userRes = await fetch('/api/auth/profile');
      if (userRes.ok) {
        const data = await userRes.json();
        if (data.success) {
          this.user = data.user;
          this.admin = null;
          this.isInitialized = true;
          return { role: 'user', data: data.user };
        }
      }
    } catch (error) {
      console.error('Error verificando sesión de usuario:', error);
    }

    try {
      // 2. Probar si hay sesión de administrador activa
      const adminRes = await fetch('/api/admin/profile');
      if (adminRes.ok) {
        const data = await adminRes.json();
        if (data.success) {
          this.admin = data.admin;
          this.user = null;
          this.isInitialized = true;
          return { role: 'admin', data: data.admin };
        }
      }
    } catch (error) {
      console.error('Error verificando sesión de administrador:', error);
    }

    // Sin sesión activa
    this.user = null;
    this.admin = null;
    this.isInitialized = true;
    return { role: null, data: null };
  },

  logoutUser() {
    this.user = null;
  },

  logoutAdmin() {
    this.admin = null;
  }
});

const routes = [
  { 
    path: '/', 
    name: 'Home', 
    component: HomeView 
  },
  { 
    path: '/login', 
    name: 'Login', 
    component: LoginView,
    meta: { guestOnly: true }
  },
  { 
    path: '/register', 
    name: 'Register', 
    component: RegisterView,
    meta: { guestOnly: true }
  },
  { 
    path: '/dashboard', 
    name: 'Dashboard', 
    component: DashboardView,
    meta: { requiresAuth: true, role: 'user' }
  },
  {
    path: '/espacios/:id',
    name: 'SpaceDetail',
    component: SpaceDetailView
  },
  { 
    path: '/admin-login', 
    name: 'AdminLogin', 
    component: AdminLoginView,
    meta: { guestOnly: true }
  },
  { 
    path: '/admin-dashboard', 
    name: 'AdminDashboard', 
    component: AdminDashboardView,
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/invitado',
    name: 'GuestDashboard',
    component: GuestDashboardView
  },
  {
    path: '/recuperar-password',
    name: 'RecuperarPassword',
    component: RecuperarPasswordView,
    meta: { guestOnly: true }
  },
  {
    path: '/admin-reportes',
    name: 'AdminReportes',
    component: AdminReportesView,
    meta: { requiresAuth: true, role: 'admin' }
  },
  // Redirección para cualquier ruta no coincidente
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Guardián global de navegación
router.beforeEach(async (to, from, next) => {
  const { role } = await authState.checkAuth();

  if (to.matched.some(record => record.meta.requiresAuth)) {
    const requiredRole = to.meta.role;
    if (!role) {
      // Redirigir al inicio de sesión correspondiente si no está autenticado
      next(requiredRole === 'admin' ? '/admin-login' : '/login');
    } else if (role !== requiredRole) {
      // Redirigir si tiene sesión pero no del rol requerido
      next(role === 'admin' ? '/admin-dashboard' : '/dashboard');
    } else {
      next(); // Permitir el acceso
    }
  } else if (to.matched.some(record => record.meta.guestOnly)) {
    if (role) {
      // Redirigir al panel correspondiente si ya está autenticado
      next(role === 'admin' ? '/admin-dashboard' : '/dashboard');
    } else {
      next(); // Permitir el acceso a login/register
    }
  } else {
    next(); // Permitir el acceso a rutas públicas (Home)
  }
});

export default router;
