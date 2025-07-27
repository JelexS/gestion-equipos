<template>
  <div class="admin-layout">
    <!-- Navegación Superior -->
    <nav class="top-nav">
      <div class="logo-container">
        <img src="../../assets/img/logo-uleam.png" alt="Logo ULEAM" class="logo">
        <span class="logo-text">Sistema de Inventario</span>
      </div>
      
      <div class="user-menu">
          <div class="user-info">
            <span class="user-name">{{ authStore.user?.nombres }} {{ authStore.user?.apellidos }}</span>
          <span class="user-role">{{ getRoleName(authStore.user?.rol) }}</span>
        </div>
        <div class="user-avatar">{{ userInitial }}</div>
        <button class="logout-btn" @click="handleLogout">
          <i class="fas fa-sign-out-alt"></i> Cerrar sesión
        </button>
      </div>
    </nav>

    <!-- Panel Lateral -->
    <aside class="sidebar">
      <div class="menu-title">Menú Principal</div>
      <router-link to="/dashboard" class="menu-item" active-class="active">
        <i class="fas fa-tachometer-alt"></i> Dashboard
      </router-link>
      
      <div class="menu-title">Gestión de Equipos</div>
      <router-link to="/equipos/registrar" class="menu-item" active-class="active">
        <i class="fas fa-plus-circle"></i> Registrar Equipo
      </router-link>
      <router-link to="/equipos/lista" class="menu-item" active-class="active">
        <i class="fas fa-list"></i> Lista de Equipos
      </router-link>
      <router-link to="/equipos/asignar" class="menu-item" active-class="active">
        <i class="fas fa-exchange-alt"></i> Asignar Equipos
      </router-link>
      
      <div class="menu-title">Mantenimiento</div>
      <router-link to="/mantenimientos" class="menu-item" active-class="active">
        <i class="fas fa-tools"></i> Mantenimiento
      </router-link>
      
      <div class="menu-title">Gestión de Usuarios</div>
      <router-link to="/usuarios/nuevo" class="menu-item" active-class="active">
        <i class="fas fa-user-plus"></i> Nuevo Usuario
      </router-link>
      <router-link to="/usuarios/lista" class="menu-item" active-class="active">
        <i class="fas fa-users"></i> Lista de Usuarios
      </router-link>
    </aside>

    <!-- Contenido Principal -->
    <main class="main-content">
      <slot />
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const userInitial = computed(() => {
  return authStore.user?.nombres?.charAt(0)?.toUpperCase() || 'U'
})

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

const getRoleName = (role) => {
  switch (role) {
    case 'admin':
      return 'Administrador'
    case 'user':
      return 'Usuario'
    default:
      return 'Invitado'
  }
}
</script>

<style scoped>
.admin-layout {
  height: 100vh;
  overflow: hidden;
}

/* Navbar Superior */
.top-nav {
  background-color: rgb(107, 202, 191);
  height: 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 25px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  position: fixed;
  width: 100%;
  top: 0;
  z-index: 100;
}

.logo-container {
  display: flex;
  align-items: center;
}

.logo {
  height: 40px;
  margin-right: 10px;
}

.logo-text {
  font-weight: 600;
  color: var(--secondary);
}

.user-menu {
  display: flex;
  align-items: center;
  padding-right: 3%;
  gap: 15px;
}
.user-info {
  display: flex;
  flex-direction: column;
  text-align: right;
}
.user-name {
  font-weight: 600;
  color: var(--secondary);
  font-size: 14px;
}

.user-role {
  font-size: 12px;
  color: var(--text-light);
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: var(--primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
  font-weight: bold;
}

.logout-btn {
  background: none;
  border: none;
  color: var(--text-light);
  cursor: pointer;
  display: flex;
  align-items: center;
  font-size: 14px;
}

.logout-btn:hover {
  color: var(--primary);
}

/* Panel Lateral */
.sidebar {
  width: 250px;
  background-color: white;
  position: fixed;
  height: 100%;
  top: 60px;
  left: 0;
  box-shadow: 2px 0 4px rgba(0, 0, 0, 0.05);
  padding: 20px 0;
  overflow-y: auto;
}

.menu-title {
  color: var(--text-light);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 1px;
  padding: 0 25px;
  margin-bottom: 15px;
  font-weight: 600;
}

.menu-item {
  padding: 12px 25px;
  display: flex;
  align-items: center;
  color: var(--text-light);
  text-decoration: none;
  transition: all 0.2s;
}

.menu-item:hover,
.menu-item.active {
  background-color: rgba(42, 157, 143, 0.1);
  color: var(--primary);
  border-left: 3px solid var(--primary);
}

.menu-item i {
  margin-right: 10px;
  width: 20px;
  text-align: center;
}

/* Contenido Principal */
.main-content {
  margin-left: 250px;
  margin-top: 60px;
  padding: 25px;
  height: calc(100vh - 60px);
  overflow-y: auto;
}
</style>