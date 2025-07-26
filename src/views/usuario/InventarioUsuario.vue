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
                    <label>ID:</label>
                    <span>{{ selectedEquipo.id }}</span>
                  </div>
                  <div class="detail-item-full">
                    <label>Tipo:</label>
                    <span>{{ selectedEquipo.tipo }}</span>
                  </div>
                  <div class="detail-item-full">
                    <label>Marca:</label>
                    <span>{{ selectedEquipo.marca }}</span>
                  </div>
                  <div class="detail-item-full">
                    <label>Modelo:</label>
                    <span>{{ selectedEquipo.modelo }}</span>
                  </div>
                  <div class="detail-item-full">
                    <label>Serial:</label>
                    <span>{{ selectedEquipo.serial }}</span>
                  </div>
                  <div class="detail-item-full">
                    <label>Estado:</label>
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
                    <label>Procesador:</label>
                    <span>{{ selectedEquipo.procesador }}</span>
                  </div>
                  <div class="detail-item-full" v-if="selectedEquipo.ram">
                    <label>RAM:</label>
                    <span>{{ selectedEquipo.ram }} GB</span>
                  </div>
                  <div class="detail-item-full" v-if="selectedEquipo.almacenamiento">
                    <label>Almacenamiento:</label>
                    <span>{{ selectedEquipo.almacenamiento }}</span>
                  </div>
                </div>
              </div>

              <div class="detail-section">
                <h4>Información de Asignación</h4>
                <div class="detail-grid">
                  <div class="detail-item-full">
                    <label>Ubicación:</label>
                    <span>{{ selectedEquipo.ubicacion }}</span>
                  </div>
                  <div class="detail-item-full">
                    <label>Fecha de Asignación:</label>
                    <span>{{ formatDate(selectedEquipo.fechaAsignacion) }}</span>
                  </div>
                  <div class="detail-item-full" v-if="selectedEquipo.observaciones">
                    <label>Observaciones:</label>
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

      <!-- Modal de Reporte de Problema -->
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
                <input type="text" :value="reportEquipo?.id + ' - ' + reportEquipo?.tipo" readonly>
              </div>
              <div class="form-group">
                <label>Tipo de Problema:</label>
                <select v-model="reportForm.tipo" required>
                  <option value="">Seleccionar...</option>
                  <option value="hardware">Problema de Hardware</option>
                  <option value="software">Problema de Software</option>
                  <option value="red">Problema de Red/Conectividad</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
              <div class="form-group">
                <label>Descripción del Problema:</label>
                <textarea 
                  v-model="reportForm.descripcion" 
                  rows="4" 
                  placeholder="Describe detalladamente el problema..."
                  required
                ></textarea>
              </div>
              <div class="form-group">
                <label>Urgencia:</label>
                <select v-model="reportForm.urgencia" required>
                  <option value="">Seleccionar...</option>
                  <option value="baja">Baja</option>
                  <option value="media">Media</option>
                  <option value="alta">Alta</option>
                  <option value="critica">Crítica</option>
                </select>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button class="btn-outline" @click="closeReportModal">
              Cancelar
            </button>
            <button class="btn-primary" @click="submitReport" :disabled="!canSubmitReport">
              <i class="fas fa-paper-plane"></i>
              Enviar Reporte
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

// Computed properties
const misEquipos = computed(() => {
  const userName = `${authStore.user?.nombres} ${authStore.user?.apellidos}`
  return equiposStore.equipos.filter(equipo => 
    equipo.responsable === userName || 
    equipo.responsable.includes(authStore.user?.nombres) ||
    equipo.responsable.includes(authStore.user?.apellidos)
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

const canSubmitReport = computed(() => {
  return reportForm.tipo && reportForm.descripcion && reportForm.urgencia
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
  return new Date(dateString).toLocaleDateString('es-ES')
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

const submitReport = () => {
  if (!canSubmitReport.value) return

  // Simulación de envío de reporte
  const report = {
    equipoId: reportEquipo.value.id,
    usuario: authStore.user.email,
    fecha: new Date().toISOString(),
    ...reportForm
  }

  // Guardar en localStorage (simulación)
  const reports = JSON.parse(localStorage.getItem('uleam_reportes') || '[]')
  reports.push(report)
  localStorage.setItem('uleam_reportes', JSON.stringify(reports))

  alert('Reporte enviado exitosamente. El equipo de soporte se pondrá en contacto contigo.')
  closeReportModal()
}
</script>