<template>
  <UserLayout>
    <div class="user-dashboard">
      <div class="welcome-header">
        <div class="welcome-text">
          <h2>Mi Inventario Asignado</h2>
          <p>Equipos bajo su responsabilidad</p>
        </div>
        <div class="user-stats">
          <div class="stat-item">
            <span class="stat-number">{{ misEquipos.length }}</span>
            <span class="stat-label">Equipos Asignados</span>
          </div>
        </div>
      </div>

      <!-- Filtros -->
      <div class="filters-section">
        <div class="filter-group">
          <input 
            type="text" 
            v-model="searchTerm" 
            placeholder="Buscar equipos..."
            class="search-input"
          >
        </div>
        <div class="filter-group">
          <select v-model="filterTipo" class="filter-select">
            <option value="">Todos los tipos</option>
            <option value="Laptop">Laptop</option>
            <option value="PC de Escritorio">PC de Escritorio</option>
            <option value="Monitor">Monitor</option>
            <option value="Impresora">Impresora</option>
          </select>
        </div>
        <div class="filter-group">
          <select v-model="filterEstado" class="filter-select">
            <option value="">Todos los estados</option>
            <option value="activo">Activo</option>
            <option value="en-mantenimiento">En Mantenimiento</option>
          </select>
        </div>
      </div>

      <!-- Lista de Equipos -->
      <div class="equipos-grid" v-if="filteredEquipos.length > 0">
        <div 
          v-for="equipo in filteredEquipos" 
          :key="equipo.id"
          class="equipo-card"
          @click="showEquipoDetails(equipo)"
        >
          <div class="equipo-header">
            <div class="equipo-icon">
              <i :class="getEquipoIcon(equipo.tipo)"></i>
            </div>
            <div class="equipo-info">
              <h3>{{ equipo.id }}</h3>
              <p>{{ equipo.tipo }} {{ equipo.marca }} {{ equipo.modelo }}</p>
            </div>
            <div class="equipo-status">
              <span :class="'status-badge ' + equipo.estado">
                {{ getEstadoText(equipo.estado) }}
              </span>
            </div>
          </div>
          
          <div class="equipo-details">
            <div class="detail-item">
              <i class="fas fa-map-marker-alt"></i>
              <span>{{ equipo.ubicacion }}</span>
            </div>
            <div class="detail-item">
              <i class="fas fa-calendar"></i>
              <span>Asignado: {{ formatDate(equipo.fechaAsignacion) }}</span>
            </div>
            <div class="detail-item" v-if="equipo.serial">
              <i class="fas fa-barcode"></i>
              <span>{{ equipo.serial }}</span>
            </div>
          </div>

          <div class="equipo-actions">
            <button class="btn-outline" @click.stop="reportarProblema(equipo)">
              <i class="fas fa-exclamation-triangle"></i>
              Reportar Problema
            </button>
          </div>
        </div>
      </div>

      <!-- Mensaje cuando no hay equipos -->
      <div v-else class="no-equipos">
        <div class="no-equipos-icon">
          <i class="fas fa-laptop"></i>
        </div>
        <h3>{{ misEquipos.length === 0 ? 'No tienes equipos asignados' : 'No se encontraron equipos' }}</h3>
        <p>{{ misEquipos.length === 0 ? 'Contacta al administrador para la asignación de equipos.' : 'Intenta ajustar los filtros de búsqueda.' }}</p>
      </div>

      <!-- Modal de Detalles -->
      <div v-if="selectedEquipo" class="modal-overlay" @click="closeModal">
        <div class="modal-content equipo-modal" @click.stop>
          <div class="modal-header">
            <h3><i class="fas fa-laptop"></i> Detalles del Equipo</h3>
            <button class="close-btn" @click="closeModal">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <div class="equipo-details-full">
              <div class="detail-section">
                <h4>Información General</h4>
                <div class="detail-grid">
                  <div class="detail-item-full">
                    <label>ID: </label>
                    <span>{{ selectedEquipo.id }}</span>
                  </div>
                  <div class="detail-item-full">
                    <label>Tipo: </label>
                    <span>{{ selectedEquipo.tipo }}</span>
                  </div>
                  <div class="detail-item-full">
                    <label>Marca: </label>
                    <span>{{ selectedEquipo.marca }}</span>
                  </div>
                  <div class="detail-item-full">
                    <label>Modelo: </label>
                    <span>{{ selectedEquipo.modelo }}</span>
                  </div>
                  <div class="detail-item-full">
                    <label>Serial: </label>
                    <span>{{ selectedEquipo.serial }}</span>
                  </div>
                  <div class="detail-item-full">
                    <label>Estado: </label>
                    <span :class="'status-badge ' + selectedEquipo.estado">
                      {{ getEstadoText(selectedEquipo.estado) }}
                    </span>
                  </div>
                </div>
              </div>

              <div class="detail-section" v-if="selectedEquipo.procesador || selectedEquipo.ram || selectedEquipo.almacenamiento">
                <h4>Especificaciones Técnicas</h4>
                <div class="detail-grid">
                  <div class="detail-item-full" v-if="selectedEquipo.procesador">
                    <label>Procesador: </label>
                    <span>{{ selectedEquipo.procesador }}</span>
                  </div>
                  <div class="detail-item-full" v-if="selectedEquipo.ram">
                    <label>RAM: </label>
                    <span>{{ selectedEquipo.ram }} GB</span>
                  </div>
                  <div class="detail-item-full" v-if="selectedEquipo.almacenamiento">
                    <label>Almacenamiento: </label>
                    <span>{{ selectedEquipo.almacenamiento }}</span>
                  </div>
                </div>
              </div>

              <div class="detail-section">
                <h4>Información de Asignación</h4>
                <div class="detail-grid">
                  <div class="detail-item-full">
                    <label>Ubicación: </label>
                    <span>{{ selectedEquipo.ubicacion }}</span>
                  </div>
                  <div class="detail-item-full">
                    <label>Fecha de Asignación: </label>
                    <span>{{ formatDate(selectedEquipo.fechaAsignacion) }}</span>
                  </div>
                  <div class="detail-item-full" v-if="selectedEquipo.observaciones">
                    <label>Observaciones: </label>
                    <span>{{ selectedEquipo.observaciones }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-outline" @click="reportarProblema(selectedEquipo)">
              <i class="fas fa-exclamation-triangle"></i>
              Reportar Problema
            </button>
            <button class="btn-primary" @click="closeModal">
              Cerrar
            </button>
          </div>
        </div>
      </div>

      <!-- Modal Reportar Problema -->
      <div v-if="showReportModal" class="modal-overlay" @click="closeReportModal">
        <div class="modal-content report-modal" @click.stop>
          <div class="modal-header">
            <h3><i class="fas fa-exclamation-triangle"></i> Reportar Problema</h3>
            <button class="close-btn" @click="closeReportModal">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div class="modal-body">
            <form @submit.prevent="submitReport">
              <div class="form-group">
                <label>Equipo:</label>
                <input 
                  type="text" 
                  :value="reportEquipo?.id + ' - ' + reportEquipo?.tipo" 
                  class="form-control" 
                  readonly
                >
              </div>

              <div class="form-group">
                <label>Tipo de Problema: *</label>
                <select 
                  v-model="reportForm.tipo"
                  :class="{'form-control': true, 'is-invalid': reportErrors.tipo}"
                >
                  <option value="">Seleccionar...</option>
                  <option value="hardware">Problema de Hardware</option>
                  <option value="software">Problema de Software</option>
                  <option value="red">Problema de Red/Conectividad</option>
                  <option value="otro">Otro</option>
                </select>
                <span class="error-message" v-if="reportErrors.tipo">
                  {{ reportErrors.tipo }}
                </span>
              </div>

              <div class="form-group">
                <label>Descripción del Problema: *</label>
                <textarea 
                  v-model="reportForm.descripcion"
                  :class="{'form-control': true, 'is-invalid': reportErrors.descripcion}"
                  rows="4"
                  placeholder="Describe detalladamente el problema..."
                ></textarea>
                <div class="description-counter" :class="{ 'text-danger': reportForm.descripcion.length > 500 }">
                  {{ reportForm.descripcion.length }}/500
                </div>
                <span class="error-message" v-if="reportErrors.descripcion">
                  {{ reportErrors.descripcion }}
                </span>
              </div>

              <div class="form-group">
                <label>Urgencia: *</label>
                <select 
                  v-model="reportForm.urgencia"
                  :class="{'form-control': true, 'is-invalid': reportErrors.urgencia}"
                >
                  <option value="">Seleccionar...</option>
                  <option value="baja">Baja</option>
                  <option value="media">Media</option>
                  <option value="alta">Alta</option>
                  <option value="critica">Crítica</option>
                </select>
                <span class="error-message" v-if="reportErrors.urgencia">
                  {{ reportErrors.urgencia }}
                </span>
              </div>
            </form>
          </div>

          <div class="modal-footer">
            <button 
              class="btn-outline" 
              @click="closeReportModal"
              :disabled="isSubmitting"
            >
              Cancelar
            </button>
            <button 
              class="btn-primary" 
              @click="submitReport"
              :disabled="isSubmitting"
            >
              <i class="fas" :class="isSubmitting ? 'fa-spinner fa-spin' : 'fa-paper-plane'"></i>
              {{ isSubmitting ? 'Enviando...' : 'Enviar Reporte' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </UserLayout>
</template>

<script setup>
import { computed, ref, reactive } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useEquiposStore } from '@/stores/equipos'
import UserLayout from '@/components/layout/UserLayout.vue'

const authStore = useAuthStore()
const equiposStore = useEquiposStore()

const reportErrors = ref({})
const isSubmitting = ref(false)

// Estados reactivos
const searchTerm = ref('')
const filterTipo = ref('')
const filterEstado = ref('')
const selectedEquipo = ref(null)
const showReportModal = ref(false)
const reportEquipo = ref(null)

const reportForm = reactive({
  tipo: '',
  descripcion: '',
  urgencia: ''
})

// Reemplazar el computed property misEquipos con:
const misEquipos = computed(() => {
  if (!authStore.user) return []

  return equiposStore.equipos.filter(equipo => 
    // Verificar si el equipo está asignado al usuario actual
    equipo.responsable === authStore.user.id ||
    equipo.responsableId === authStore.user.id ||
    (equipo.estado === 'asignado' && equipo.responsable === authStore.user.email)
  )
})

const filteredEquipos = computed(() => {
  let equipos = misEquipos.value

  // Filtrar por término de búsqueda
  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase()
    equipos = equipos.filter(equipo =>
      equipo.id.toLowerCase().includes(term) ||
      equipo.tipo.toLowerCase().includes(term) ||
      equipo.marca.toLowerCase().includes(term) ||
      equipo.modelo.toLowerCase().includes(term) ||
      equipo.serial.toLowerCase().includes(term)
    )
  }

  // Filtrar por tipo
  if (filterTipo.value) {
    equipos = equipos.filter(equipo => equipo.tipo === filterTipo.value)
  }

  // Filtrar por estado
  if (filterEstado.value) {
    equipos = equipos.filter(equipo => equipo.estado === filterEstado.value)
  }

  return equipos
})


// Métodos
const getEquipoIcon = (tipo) => {
  const icons = {
    'Laptop': 'fas fa-laptop',
    'PC de Escritorio': 'fas fa-desktop',
    'Monitor': 'fas fa-tv',
    'Impresora': 'fas fa-print',
    'Tablet': 'fas fa-tablet-alt',
    'Servidor': 'fas fa-server'
  }
  return icons[tipo] || 'fas fa-laptop'
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
  if (!dateString) return 'No asignado'
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch (error) {
    return 'Fecha inválida'
  }
}
const showEquipoDetails = (equipo) => {
  selectedEquipo.value = equipo
}

const closeModal = () => {
  selectedEquipo.value = null
}

const reportarProblema = (equipo) => {
  reportEquipo.value = equipo
  showReportModal.value = true
  // Reset form
  reportForm.tipo = ''
  reportForm.descripcion = ''
  reportForm.urgencia = ''
}

const closeReportModal = () => {
  showReportModal.value = false
  reportEquipo.value = null
}

const submitReport = async () => {
  try {
    // Reset errors
    reportErrors.value = {}
    
    // Validate fields
    if (!reportForm.tipo) {
      reportErrors.value.tipo = 'Seleccione el tipo de problema'
    }

    if (!reportForm.descripcion) {
      reportErrors.value.descripcion = 'La descripción es requerida'
    } else if (reportForm.descripcion.length < 10) {
      reportErrors.value.descripcion = 'La descripción debe tener al menos 10 caracteres'
    } else if (reportForm.descripcion.length > 500) {
      reportErrors.value.descripcion = 'La descripción no debe exceder los 500 caracteres'
    }

    if (!reportForm.urgencia) {
      reportErrors.value.urgencia = 'Seleccione el nivel de urgencia'
    }

    // If there are errors, stop submission
    if (Object.keys(reportErrors.value).length > 0) {
      return
    }

    isSubmitting.value = true

    // Create report object
    const report = {
      id: `REP-${Date.now()}`,
      equipoId: reportEquipo.value.id,
      usuario: authStore.user.email,
      fecha: new Date().toISOString(),
      estado: 'pendiente',
      ...reportForm
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Save to localStorage
    const reports = JSON.parse(localStorage.getItem('uleam_reportes') || '[]')
    reports.push(report)
    localStorage.setItem('uleam_reportes', JSON.stringify(reports))

    // Show success message
    alert('Reporte enviado exitosamente. El equipo de soporte se pondrá en contacto contigo.')
    closeReportModal()
  } catch (error) {
    console.error('Error al enviar reporte:', error)
    alert('Error al enviar el reporte. Por favor, intente nuevamente.')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.user-dashboard {
  padding: 20px;
  background: #f5f7fa;
  min-height: calc(100vh - 60px);
}

/* Welcome Header Styles */
.welcome-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 20px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.welcome-text h2 {
  margin: 0;
  color: #2c3e50;
  font-size: 24px;
}

.welcome-text p {
  margin: 5px 0 0;
  color: #7f8c8d;
}

.user-stats {
  display: flex;
  gap: 20px;
}

.stat-item {
  text-align: center;
  padding: 10px 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.stat-number {
  display: block;
  font-size: 24px;
  font-weight: bold;
  color: var(--primary);
}

.stat-label {
  font-size: 14px;
  color: #6c757d;
}

/* Filters Section */
.filters-section {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.filter-group {
  flex: 1;
  min-width: 200px;
}

.search-input,
.filter-select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.search-input:focus,
.filter-select:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
}

/* Equipment Grid */
.equipos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.equipo-card {
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
}

.equipo-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.equipo-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
}

.equipo-icon {
  width: 40px;
  height: 40px;
  background: #f8f9fa;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary);
}

.equipo-info h3 {
  margin: 0;
  font-size: 16px;
  color: #2c3e50;
}

.equipo-info p {
  margin: 5px 0 0;
  font-size: 14px;
  color: #6c757d;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.activo { background: #28a745; color: white; }
.status-badge.en-mantenimiento { background: #ffc107; color: #000; }
.status-badge.dañado { background: #dc3545; color: white; }
.status-badge.asignado { background: #17a2b8; color: white; }

.equipo-details {
  margin: 15px 0;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
  color: #6c757d;
  font-size: 14px;
}

.detail-item i {
  width: 16px;
}

.equipo-actions {
  margin-top: 15px;
  display: flex;
  justify-content: flex-end;
}

.btn-outline {
  padding: 8px 16px;
  border: 1px solid var(--primary);
  background: transparent;
  color: var(--primary);
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.btn-outline:hover {
  background: var(--primary);
  color: white;
}

/* No Equipment Message */
.no-equipos {
  text-align: center;
  padding: 40px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.no-equipos-icon {
  font-size: 48px;
  color: #dee2e6;
  margin-bottom: 20px;
}

.no-equipos h3 {
  margin: 0;
  color: #2c3e50;
}

.no-equipos p {
  margin: 10px 0 0;
  color: #6c757d;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 10px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid #dee2e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #6c757d;
}

.modal-body {
  padding: 20px;
}

.modal-footer {
  padding: 20px;
  border-top: 1px solid #dee2e6;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* Report Form Styles */
.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.btn-primary {
  padding: 8px 16px;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Responsive Adjustments */
@media (max-width: 768px) {
  .welcome-header {
    flex-direction: column;
    text-align: center;
  }

  .user-stats {
    margin-top: 20px;
  }

  .filters-section {
    flex-direction: column;
  }

  .filter-group {
    width: 100%;
  }

  .equipos-grid {
    grid-template-columns: 1fr;
  }

  .modal-content {
    width: 95%;
    margin: 10px;
  }
}

/* Add to your existing <style scoped> section */

.form-control.is-invalid {
  border-color: #dc3545;
}

.error-message {
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 4px;
  display: block;
}

.description-counter {
  font-size: 0.75rem;
  color: #6c757d;
  text-align: right;
  margin-top: 4px;
}

.text-danger {
  color: #dc3545;
}

.btn-primary:disabled,
.btn-outline:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}
</style>