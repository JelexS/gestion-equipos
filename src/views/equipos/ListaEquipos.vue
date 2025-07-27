<template>
  <AdminLayout>
    <div class="table-header">
      <h1><i class="fas fa-laptop"></i> Lista de Equipos</h1>
      <div class="table-actions">
        <input 
          type="text" 
          v-model="searchTerm"
          placeholder="Buscar equipos..."
          class="search-input"
        >
        <select v-model="filterEstado" class="filter-select">
          <option value="">Todos los estados</option>
          <option value="activo">Activo</option>
          <option value="disponible">Disponible</option>
          <option value="asignado">Asignado</option>
          <option value="en-mantenimiento">En Mantenimiento</option>
          <option value="dañado">Dañado</option>
        </select>
        <button class="btn btn-secondary" @click="exportarDatos">
          <i class="fas fa-file-export"></i> Exportar
        </button>
        <router-link to="/equipos/registrar" class="btn btn-primary">
          <i class="fas fa-plus"></i> Nuevo Equipo
        </router-link>
      </div>
    </div>

    <div class="stats-summary">
      <div class="stat-item">
        <span class="stat-number">{{ equiposFiltrados.length }}</span>
        <span class="stat-label">Equipos Mostrados</span>
      </div>
      <div class="stat-item">
        <span class="stat-number">{{ equiposStore.equiposPorEstado.activo }}</span>
        <span class="stat-label">Activos</span>
      </div>
      <div class="stat-item">
        <span class="stat-number">{{ equiposStore.equiposPorEstado.disponible }}</span>
        <span class="stat-label">Disponibles</span>
      </div>
      <div class="stat-item">
        <span class="stat-number">{{ equiposStore.equiposPorEstado.mantenimiento }}</span>
        <span class="stat-label">En Mantenimiento</span>
      </div>
    </div>

    <div class="table-responsive">
      <table class="equipos-table">
        <thead>
          <tr>
            <th @click="sortBy('id')" class="sortable">
              ID <i :class="getSortIcon('id')"></i>
            </th>
            <th @click="sortBy('tipo')" class="sortable">
              Tipo <i :class="getSortIcon('tipo')"></i>
            </th>
            <th @click="sortBy('marca')" class="sortable">
              Marca <i :class="getSortIcon('marca')"></i>
            </th>
            <th @click="sortBy('modelo')" class="sortable">
              Modelo <i :class="getSortIcon('modelo')"></i>
            </th>
            <th>Serial</th>
            <th @click="sortBy('estado')" class="sortable">
              Estado <i :class="getSortIcon('estado')"></i>
            </th>
            <th>Ubicación</th>
            <th>Responsable</th>
            <th class="actions-col">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="equipo in paginatedEquipos" :key="equipo.id" class="equipo-row">
            <td class="equipo-id">{{ equipo.id }}</td>
            <td>
              <div class="tipo-cell">
                <i :class="getEquipoIcon(equipo.tipo)"></i>
                {{ equipo.tipo }}
              </div>
            </td>
            <td>{{ equipo.marca }}</td>
            <td>{{ equipo.modelo }}</td>
            <td class="serial-cell">{{ equipo.serial }}</td>
            <td>
              <span :class="'status-badge ' + equipo.estado">
                {{ getEstadoText(equipo.estado) }}
              </span>
            </td>
            <td class="ubicacion-cell">{{ equipo.ubicacion || 'Sin asignar' }}</td>
            <td class="responsable-cell">{{ equipo.responsable || 'Sin asignar' }}</td>
            <td class="actions">
              <button 
                class="btn-icon view-btn" 
                @click="verDetalles(equipo)" 
                title="Ver detalles"
              >
                <i class="fas fa-eye"></i>
              </button>
              <button 
                class="btn-icon edit-btn" 
                @click="editarEquipo(equipo)" 
                title="Editar"
              >
                <i class="fas fa-edit"></i>
              </button>
              <button 
                class="btn-icon delete-btn" 
                @click="confirmarEliminacion(equipo)" 
                title="Eliminar"
              >
                <i class="fas fa-trash-alt"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Paginación -->
    <div class="pagination" v-if="totalPages > 1">
      <button 
        class="btn btn-outline btn-small" 
        @click="currentPage--" 
        :disabled="currentPage === 1"
      >
        <i class="fas fa-chevron-left"></i> Anterior
      </button>
      
      <span class="page-info">
        Página {{ currentPage }} de {{ totalPages }} 
        ({{ equiposFiltrados.length }} equipos)
      </span>
      
      <button 
        class="btn btn-outline btn-small" 
        @click="currentPage++" 
        :disabled="currentPage === totalPages"
      >
        Siguiente <i class="fas fa-chevron-right"></i>
      </button>
    </div>

    <!-- Modal de Detalles -->
    <div v-if="selectedEquipo" class="modal-overlay" @click="cerrarModal">
      <div class="modal-content equipo-details-modal" @click.stop>
        <div class="modal-header">
          <h3><i class="fas fa-laptop"></i> Detalles del Equipo</h3>
          <button class="close-btn" @click="cerrarModal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="equipo-details-grid">
            <div class="detail-section">
              <h4>Información General</h4>
              <div class="detail-row">
                <span class="label">ID:</span>
                <span class="value">{{ selectedEquipo.id }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Tipo:</span>
                <span class="value">{{ selectedEquipo.tipo }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Marca:</span>
                <span class="value">{{ selectedEquipo.marca }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Modelo:</span>
                <span class="value">{{ selectedEquipo.modelo }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Serial:</span>
                <span class="value">{{ selectedEquipo.serial }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Estado:</span>
                <span :class="'status-badge ' + selectedEquipo.estado">
                  {{ getEstadoText(selectedEquipo.estado) }}
                </span>
              </div>
            </div>

            <div class="detail-section" v-if="selectedEquipo.procesador || selectedEquipo.ram || selectedEquipo.almacenamiento">
              <h4>Especificaciones</h4>
              <div class="detail-row" v-if="selectedEquipo.procesador">
                <span class="label">Procesador:</span>
                <span class="value">{{ selectedEquipo.procesador }}</span>
              </div>
              <div class="detail-row" v-if="selectedEquipo.ram">
                <span class="label">RAM:</span>
                <span class="value">{{ selectedEquipo.ram }} GB</span>
              </div>
              <div class="detail-row" v-if="selectedEquipo.almacenamiento">
                <span class="label">Almacenamiento:</span>
                <span class="value">{{ selectedEquipo.almacenamiento }}</span>
              </div>
            </div>

            <div class="detail-section">
              <h4>Asignación</h4>
              <div class="detail-row">
                <span class="label">Ubicación:</span>
                <span class="value">{{ selectedEquipo.ubicacion || 'Sin asignar' }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Responsable:</span>
                <span class="value">{{ selectedEquipo.responsable || 'Sin asignar' }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Fecha Registro:</span>
                <span class="value">{{ formatDate(selectedEquipo.fechaRegistro) }}</span>
              </div>
              <div class="detail-row" v-if="selectedEquipo.fechaAsignacion">
                <span class="label">Fecha Asignación:</span>
                <span class="value">{{ formatDate(selectedEquipo.fechaAsignacion) }}</span>
              </div>
            </div>
          </div>
          
          <div class="detail-section full-width" v-if="selectedEquipo.observaciones">
            <h4>Observaciones</h4>
            <p class="observaciones">{{ selectedEquipo.observaciones }}</p>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" @click="editarEquipo(selectedEquipo)">
            <i class="fas fa-edit"></i> Editar
          </button>
          <button class="btn btn-primary" @click="cerrarModal">
            Cerrar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de Confirmación de Eliminación -->
    <div v-if="equipoToDelete" class="modal-overlay" @click="cancelarEliminacion">
      <div class="modal-content delete-modal" @click.stop>
        <div class="modal-header">
          <h3><i class="fas fa-exclamation-triangle text-error"></i> Confirmar Eliminación</h3>
        </div>
        <div class="modal-body">
          <p>¿Está seguro que desea eliminar el equipo <strong>{{ equipoToDelete.id }}</strong>?</p>
          <div class="delete-warning">
            <p><strong>{{ equipoToDelete.tipo }} {{ equipoToDelete.marca }} {{ equipoToDelete.modelo }}</strong></p>
            <p class="warning-text">Esta acción no se puede deshacer.</p>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" @click="cancelarEliminacion">
            Cancelar
          </button>
          <button class="btn btn-danger" @click="eliminarEquipo">
            <i class="fas fa-trash-alt"></i> Eliminar
          </button>
        </div>
      </div>
    </div>

        <!-- Add this modal before closing AdminLayout -->
    <div v-if="editingEquipo" class="modal-overlay" @click="cancelarEdicion">
      <div class="modal-content edit-modal" @click.stop>
        <div class="modal-header">
          <h3><i class="fas fa-edit"></i> Editar Equipo</h3>
          <button class="close-btn" @click="cancelarEdicion">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <form @submit.prevent="guardarEdicion" class="edit-form">
            <!-- Estado -->
            <div class="form-group">
              <label>Estado:</label>
              <select v-model="editingEquipo.estado" class="form-control">
                <option value="activo">Activo</option>
                <option value="disponible">Disponible</option>
                <option value="en-mantenimiento">En Mantenimiento</option>
                <option value="dañado">Dañado</option>
                <option value="asignado">Asignado</option>
              </select>
            </div>

            <!-- Ubicación -->
            <div class="form-group">
              <label>Ubicación:</label>
              <input 
                type="text" 
                v-model="editingEquipo.ubicacion" 
                class="form-control"
                placeholder="Ingrese la ubicación">
            </div>

            <!-- Responsable -->
            <div class="form-group">
              <label>Responsable:</label>
              <div class="responsable-control">
                <input 
                  type="text" 
                  v-model="editingEquipo.responsable" 
                  class="form-control"
                  placeholder="Seleccione o limpie el responsable"
                  disabled>
                <button 
                  type="button" 
                  class="btn btn-outline btn-small"
                  @click="liberarEquipo"
                  v-if="editingEquipo.responsable">
                  <i class="fas fa-user-minus"></i> Quitar Responsable
                </button>
              </div>
            </div>

            <!-- Observaciones -->
            <div class="form-group">
              <label>Observaciones:</label>
              <textarea 
                v-model="editingEquipo.observaciones" 
                class="form-control"
                rows="3"
                placeholder="Agregue observaciones sobre el equipo"></textarea>
            </div>
          </form>
        </div>

        <div class="modal-footer">
          <button class="btn btn-outline" @click="cancelarEdicion">
            Cancelar
          </button>
          <button class="btn btn-primary" @click="guardarEdicion">
            <i class="fas fa-save"></i> Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

import { useEquiposStore } from '@/stores/equipos'
import AdminLayout from '@/components/layout/AdminLayout.vue'


const equiposStore = useEquiposStore()

// Estados reactivos
const searchTerm = ref('')
const filterEstado = ref('')
const currentPage = ref(1)
const itemsPerPage = 10
const selectedEquipo = ref(null)
const equipoToDelete = ref(null)
const sortField = ref('id')
const sortDirection = ref('asc')

// Computed properties
const equiposFiltrados = computed(() => {
  let equipos = [...equiposStore.equipos]

  // Filtrar por búsqueda
  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase()
    equipos = equipos.filter(equipo =>
      equipo.id.toLowerCase().includes(term) ||
      equipo.tipo.toLowerCase().includes(term) ||
      equipo.marca.toLowerCase().includes(term) ||
      equipo.modelo.toLowerCase().includes(term) ||
      equipo.serial.toLowerCase().includes(term) ||
      (equipo.responsable && equipo.responsable.toLowerCase().includes(term)) ||
      (equipo.ubicacion && equipo.ubicacion.toLowerCase().includes(term))
    )
  }

  // Filtrar por estado
  if (filterEstado.value) {
    equipos = equipos.filter(equipo => equipo.estado === filterEstado.value)
  }

  // Ordenar
  equipos.sort((a, b) => {
    const aVal = a[sortField.value] || ''
    const bVal = b[sortField.value] || ''
    
    if (sortDirection.value === 'asc') {
      return aVal.toString().localeCompare(bVal.toString())
    } else {
      return bVal.toString().localeCompare(aVal.toString())
    }
  })

  return equipos
})

const totalPages = computed(() => 
  Math.ceil(equiposFiltrados.value.length / itemsPerPage)
)

const paginatedEquipos = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return equiposFiltrados.value.slice(start, end)
})

// Watchers
watch([searchTerm, filterEstado], () => {
  currentPage.value = 1
})

// Métodos
const sortBy = (field) => {
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortDirection.value = 'asc'
  }
}

const getSortIcon = (field) => {
  if (sortField.value !== field) return 'fas fa-sort'
  return sortDirection.value === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down'
}

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
  if (!dateString) return 'No disponible'
  return new Date(dateString).toLocaleDateString('es-ES')
}

const verDetalles = (equipo) => {
  selectedEquipo.value = equipo
}

// Add to existing refs
const editingEquipo = ref(null)

// Replace the existing editarEquipo method
const editarEquipo = (equipo) => {
  editingEquipo.value = { ...equipo }
  selectedEquipo.value = null
}

// Add these new methods
const cancelarEdicion = () => {
  editingEquipo.value = null
}

const liberarEquipo = () => {
  if (editingEquipo.value) {
    editingEquipo.value.responsable = null
    editingEquipo.value.estado = 'disponible'
  }
}

const guardarEdicion = async () => {
  try {
    if (!editingEquipo.value) return

    const success = await equiposStore.updateEquipo(editingEquipo.value.id, {
      estado: editingEquipo.value.estado,
      ubicacion: editingEquipo.value.ubicacion,
      responsable: editingEquipo.value.responsable,
      observaciones: editingEquipo.value.observaciones
    })

    if (success) {
      alert('Equipo actualizado exitosamente')
      cancelarEdicion()
    } else {
      throw new Error('Error al actualizar el equipo')
    }
  } catch (error) {
    alert(error.message)
  }
}
const confirmarEliminacion = (equipo) => {
  equipoToDelete.value = equipo
}

const eliminarEquipo = () => {
  if (equipoToDelete.value) {
    const success = equiposStore.deleteEquipo(equipoToDelete.value.id)
    if (success) {
      alert('Equipo eliminado exitosamente')
    } else {
      alert('Error al eliminar el equipo')
    }
    cancelarEliminacion()
  }
}

const cancelarEliminacion = () => {
  equipoToDelete.value = null
}

const cerrarModal = () => {
  selectedEquipo.value = null
}

const exportarDatos = () => {
  try {
    const csvContent = generateCSV(equiposFiltrados.value)
    downloadCSV(csvContent, 'equipos_uleam.csv')
    alert('Datos exportados exitosamente')
  } catch (error) {
    alert('Error al exportar datos')
  }
}

const generateCSV = (data) => {
  const headers = ['ID', 'Tipo', 'Marca', 'Modelo', 'Serial', 'Estado', 'Ubicación', 'Responsable', 'Fecha Registro']
  const rows = data.map(equipo => [
    equipo.id,
    equipo.tipo,
    equipo.marca,
    equipo.modelo,
    equipo.serial,
    getEstadoText(equipo.estado),
    equipo.ubicacion || 'Sin asignar',
    equipo.responsable || 'Sin asignar',
    formatDate(equipo.fechaRegistro)
  ])
  
  return [headers, ...rows].map(row => 
    row.map(field => `"${field}"`).join(',')
  ).join('\n')
}

const downloadCSV = (content, filename) => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
</script>

<style scoped>
.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  flex-wrap: wrap;
  gap: 20px;
}

.table-header h1 {
  color: var(--primary);
  margin: 0;
  font-size: 28px;
}

.table-actions {
  display: flex;
  gap: 15px;
  align-items: center;
  flex-wrap: wrap;
}

.search-input {
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: 6px;
  width: 250px;
  font-size: 14px;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: 6px;
  font-size: 14px;
  min-width: 150px;
}

.stats-summary {
  display: flex;
  gap: 20px;
  margin-bottom: 25px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.stat-item {
  text-align: center;
  flex: 1;
}

.stat-number {
  display: block;
  font-size: 24px;
  font-weight: 600;
  color: var(--primary);
}

.stat-label {
  display: block;
  font-size: 12px;
  color: var(--text-light);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.table-responsive {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  overflow-x: auto;
  margin-bottom: 20px;
}

.equipos-table {
  width: 100%;
  border-collapse: collapse;
}

.equipos-table th {
  background-color: var(--bg);
  padding: 15px 12px;
  text-align: left;
  font-weight: 600;
  color: var(--text);
  border-bottom: 2px solid var(--border);
}

.equipos-table th.sortable {
  cursor: pointer;
  transition: background-color 0.2s;
}

.equipos-table th.sortable:hover {
  background-color: var(--light-gray);
}

.equipos-table th.sortable i {
  margin-left: 5px;
  color: var(--text-light);
  font-size: 12px;
}

.equipos-table td {
  padding: 12px;
  border-bottom: 1px solid var(--border);
  vertical-align: middle;
}

.equipo-row {
  transition: background-color 0.2s;
}

.equipo-row:hover {
  background-color: rgba(42, 157, 143, 0.05);
}

.equipo-id {
  font-weight: 600;
  color: var(--primary);
}

.tipo-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tipo-cell i {
  color: var(--primary);
  width: 16px;
}

.serial-cell {
  font-family: 'Courier New', monospace;
  font-size: 13px;
  color: var(--text-light);
}

.ubicacion-cell,
.responsable-cell {
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.actions {
  white-space: nowrap;
}

.actions-col {
  width: 120px;
}

.actions .btn-icon {
  margin-right: 5px;
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.page-info {
  color: var(--text-light);
  font-size: 14px;
}

/* Modal de detalles */
.equipo-details-modal {
  max-width: 700px;
}

.equipo-details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 25px;
  margin-bottom: 20px;
}

.detail-section {
  background-color: var(--bg);
  padding: 20px;
  border-radius: 6px;
}

.detail-section.full-width {
  grid-column: 1 / -1;
}

.detail-section h4 {
  margin: 0 0 15px;
  color: var(--primary);
  font-size: 16px;
  border-bottom: 2px solid rgba(42, 157, 143, 0.1);
  padding-bottom: 8px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding: 8px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.detail-row:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.detail-row .label {
  font-weight: 600;
  color: var(--text-light);
  font-size: 14px;
}

.detail-row .value {
  color: var(--text);
  font-size: 14px;
  text-align: right;
}

.observaciones {
  color: var(--text);
  line-height: 1.6;
  margin: 0;
  padding: 15px;
  background: white;
  border-radius: 4px;
  border-left: 4px solid var(--primary);
}

/* Modal de eliminación */
.delete-modal {
  max-width: 400px;
}

.delete-warning {
  background-color: #fff3cd;
  padding: 15px;
  border-radius: 6px;
  margin-top: 15px;
  border-left: 4px solid #ffc107;
}

.warning-text {
  color: #856404;
  font-weight: 500;
  margin: 5px 0 0;
}

.text-error {
  color: var(--error);
}

/* Responsive */
@media (max-width: 768px) {
  .table-header {
    flex-direction: column;
    align-items: stretch;
  }

  .table-actions {
    justify-content: center;
    flex-wrap: wrap;
  }

  .search-input {
    width: 100%;
    max-width: 300px;
  }

  .stats-summary {
    flex-direction: column;
    gap: 15px;
  }

  .stat-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    text-align: left;
  }

  .equipos-table {
    font-size: 14px;
  }

  .equipos-table th,
  .equipos-table td {
    padding: 8px 6px;
  }

  .ubicacion-cell,
  .responsable-cell {
    max-width: 100px;
  }

  .equipo-details-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }

  .pagination {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .table-responsive {
    overflow-x: scroll;
  }

  .equipos-table {
    min-width: 800px;
  }
}


.edit-modal {
  max-width: 500px;
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: var(--text);
}

.form-control {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: 6px;
  font-size: 14px;
}

.form-control:disabled {
  background-color: #f5f5f5;
}

.responsable-control {
  display: flex;
  gap: 10px;
  align-items: center;
}

textarea.form-control {
  resize: vertical;
  min-height: 80px;
}

.btn-small {
  padding: 4px 8px;
  font-size: 12px;
}
</style>
