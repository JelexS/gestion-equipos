import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Vistas del sistema
import Login from '@/views/LoginView.vue'
import Dashboard from '@/views/DashboardView.vue'
import RegistrarEquipo from '@/views/equipos/RegistrarEquipo.vue'
import ListaEquipos from '@/views/equipos/ListaEquipos.vue'
import AsignarEquipos from '@/views/equipos/AsignarEquipos.vue'
import Mantenimiento from '@/views/mantenimientos/MantenimientoView.vue'
import NuevoUsuario from '@/views/usuarios/NuevoUsuario.vue'
import ListaUsuarios from '@/views/usuarios/ListaUsuarios.vue'

// Vista para usuarios normales
import InventarioUsuario from '@/views/usuario/InventarioUsuario.vue'
import SolicitudEquipos from '@/views/usuario/SolicitudEquipos.vue'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'LoginView',
    component: Login,
    meta: { requiresGuest: true }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/inventario-usuario',
    name: 'InventarioUsuario',
    component: InventarioUsuario,
    meta: { requiresAuth: true }
  },
  {
  path: '/solicitud-equipos',
  name: 'SolicitudEquipos',
  component: SolicitudEquipos,
  meta: { requiresAuth: true }
  },
  {
    path: '/equipos/registrar',
    name: 'RegistrarEquipo',
    component: RegistrarEquipo,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/equipos/lista',
    name: 'ListaEquipos',
    component: ListaEquipos,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/equipos/asignar',
    name: 'AsignarEquipos',
    component: AsignarEquipos,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/mantenimientos',
    name: 'Mantenimiento',
    component: Mantenimiento,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/usuarios/nuevo',
    name: 'NuevoUsuario',
    component: NuevoUsuario,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/usuarios/lista',
    name: 'ListaUsuarios',
    component: ListaUsuarios,
    meta: { requiresAuth: true, requiresAdmin: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Guard de autenticación
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    // Si está autenticado y trata de ir al login, redirigir según rol
    if (authStore.user.rol === 'admin') {
      next('/dashboard')
    } else {
      next('/inventario-usuario')
    }
  } else if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.meta.requiresAdmin && authStore.user?.rol !== 'admin') {
    next('/inventario-usuario')
  } else {
    next()
  }
})

export default router