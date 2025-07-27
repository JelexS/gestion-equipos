<template>
  <AdminLayout>
    <div class="welcome-header">
      <div class="welcome-text">
        <h2>Bienvenido, {{ authStore.user?.nombres }}</h2>
        <p>Panel de control del sistema de inventario ULEAM</p>
      </div>
      <div class="date-display">
        <i class="far fa-calendar-alt"></i> {{ currentDate }}
      </div>
    </div>
    
    <!-- Tarjetas de Acceso Rápido -->
    <div class="quick-access">
      <div class="quick-card" @click="navigateTo('/equipos/registrar')">
        <div class="icon">
          <i class="fas fa-plus-circle"></i>
        </div>
        <h3>Registrar Equipo</h3>
        <p>Agregar nuevo equipo al sistema de inventario</p>
      </div>
      
      <div class="quick-card" @click="navigateTo('/equipos/lista')">
        <div class="icon">
          <i class="fas fa-list-ol"></i>
        </div>
        <h3>Ver Inventario</h3>
        <p>Listado completo de equipos registrados</p>
      </div>
      
      <div class="quick-card" @click="navigateTo('/usuarios/nuevo')">
        <div class="icon">
          <i class="fas fa-user-plus"></i>
        </div>
        <h3>Crear Usuario</h3>
        <p>Registrar nuevos usuarios en el sistema</p>
      </div>
      
      <div class="quick-card" @click="navigateTo('/mantenimientos')">
        <div class="icon">
          <i class="fas fa-clipboard-list"></i>
        </div>
        <h3>Agregar Mantenimiento</h3>
        <p>Aplicar mantenimiento a equipos de ser necesario</p>
      </div>
    </div>
    
    <!-- Estadísticas Rápidas -->
    <div class="stats-section">
      <h3 class="section-title">
        <i class="fas fa-chart-line"></i> Estadísticas del Inventario
      </h3>
      
      <div class="stats-grid">
        <div class="stat-card">
          <h4>Equipos Activos</h4>
          <div class="value">{{ stats.activo }}</div>
        </div>
        
        <div class="stat-card">
          <h4>Disponibles</h4>
          <div class="value">{{ stats.disponible }}</div>
        </div>
        
        <div class="stat-card">
          <h4>En Mantenimiento</h4>
          <div class="value">{{ stats.mantenimiento }}</div>
        </div>
        
        <div class="stat-card">
          <h4>Equipos Dañados</h4>
          <div class="value">{{ stats.dañado }}</div>
        </div>
      </div>
    </div>

    <!-- Equipos Recientes -->
    <div class="recent-section">
      <h3 class="section-title">
        <i class="fas fa-history"></i> Equipos Registrados Recientemente
      </h3>
      
      <div class="recent-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Tipo</th>
              <th>Marca</th>
              <th>Modelo</th>
              <th>Estado</th>
              <th>Fecha Registro</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="equipo in recentEquipos" :key="equipo.id">
              <td>{{ equipo.id }}</td>
              <td>{{ equipo.tipo }}</td>
              <td>{{ equipo.marca }}</td>
              <td>{{ equipo.modelo }}</td>
              <td>
                <span :class="'status-badge ' + equipo.estado">
                  {{ getEstadoText(equipo.estado) }}
                </span>
              </td>
              <td>{{ formatDate(equipo.fechaRegistro) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useEquiposStore } from '@/stores/equipos'
import AdminLayout from '@/components/layout/AdminLayout.vue'

const router = useRouter()
const authStore = useAuthStore()
const equiposStore = useEquiposStore()

const currentDate = computed(() => {
  return new Date().toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
})

const stats = computed(() => equiposStore.equiposPorEstado)

const recentEquipos = computed(() => {
  return equiposStore.equipos
    .slice()
    .sort((a, b) => new Date(b.fechaRegistro) - new Date(a.fechaRegistro))
    .slice(0, 5)
})

const navigateTo = (path) => {
  router.push(path)
}

const getEstadoText = (estado) => {
  const estados = {
    'activo': 'Activo',
    'disponible': 'Disponible',
    'en-mantenimiento': 'En Mantenimiento',
    'dañado': 'Dañado',
    'asignado': 'Asignado'
  }
  return estados[estado] || estado
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('es-ES')
}

onMounted(() => {
  // Asegurar que los datos estén cargados
  equiposStore.initEquipos()
})
</script>

<style scoped>
.welcome-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.welcome-text h2 {
  color: var(--secondary);
  margin: 0;
  font-size: 24px;
}

.welcome-text p {
  color: var(--text-light);
  margin: 5px 0 0;
  font-size: 14px;
}

.date-display {
  background-color: white;
  padding: 10px 15px;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  font-size: 14px;
}

/* Tarjetas de Acceso Rápido */
.quick-access {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.quick-card {
  background-color: var(--card-bg);
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s;
  cursor: pointer;
  border-top: 3px solid var(--primary);
}

.quick-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.quick-card h3 {
  margin: 0 0 10px;
  color: var(--primary);
  font-size: 16px;
}

.quick-card p {
  margin: 0;
  color: var(--text-light);
  font-size: 13px;
  line-height: 1.4;
}

.quick-card .icon {
  background-color: rgba(42, 157, 143, 0.1);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 15px;
  color: var(--primary);
}

/* Sección de Estadísticas */
.stats-section {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  margin-bottom: 30px;
}

.section-title {
  color: var(--secondary);
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 18px;
  display: flex;
  align-items: center;
}

.section-title i {
  margin-right: 10px;
  color: var(--primary);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
}

.stat-card {
  background-color: var(--bg);
  border-radius: 6px;
  padding: 15px;
  text-align: center;
}

.stat-card h4 {
  margin: 0 0 5px;
  color: var(--text-light);
  font-size: 13px;
  font-weight: 500;
}

.stat-card .value {
  font-size: 24px;
  font-weight: 600;
  color: var(--primary);
}

/* Sección de Equipos Recientes */
.recent-section {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.recent-table {
  overflow-x: auto;
}

.recent-table table {
  width: 100%;
  border-collapse: collapse;
}

.recent-table th,
.recent-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid var(--border);
}

.recent-table th {
  background-color: var(--bg);
  font-weight: 600;
  color: var(--text);
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.activo {
  background-color: #d4edda;
  color: #155724;
}

.status-badge.disponible {
  background-color: #cce5ff;
  color: #004085;
}

.status-badge.en-mantenimiento {
  background-color: #fff3cd;
  color: #856404;
}

.status-badge.dañado {
  background-color: #f8d7da;
  color: #721c24;
}

.status-badge.asignado {
  background-color: #e2e3e5;
  color: #383d41;
}
</style>