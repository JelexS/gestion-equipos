<template>
  <AdminLayout>
    <div class="mantenimiento-view">
      <div class="page-header">
        <h1><i class="fas fa-tools"></i> Mantenimiento de Equipos</h1>
      </div>

      <!-- Formulario de Mantenimiento -->
      <form @submit.prevent="registrarMantenimiento" class="maintenance-form">
        <div class="form-section">
          <h2><i class="fas fa-clipboard-list"></i> Registro de Mantenimiento</h2>

          <!-- Selector de Equipo -->
          <div class="form-group">
            <label>Equipo: *</label>
            <select 
              v-model="mantenimiento.equipoId"
              :class="{ 'error': errors.equipoId }"
              @change="loadEquipoDetails">
              <option value="">Seleccione un equipo</option>
              <option v-for="equipo in equipos" 
                      :key="equipo.id" 
                      :value="equipo.id">
                {{ equipo.id }} - {{ equipo.tipo }} {{ equipo.marca }} {{ equipo.modelo }}
              </option>
            </select>
            <span class="error-message" v-if="errors.equipoId">{{ errors.equipoId }}</span>
          </div>

          <!-- Detalles del Equipo Seleccionado -->
          <div v-if="equipoSeleccionado" class="equipo-details">
            <p><strong>Estado actual:</strong> {{ equipoSeleccionado.estado }}</p>
            <p><strong>Último mantenimiento:</strong> {{ ultimoMantenimiento || 'Sin registros' }}</p>
          </div>

          <!-- Tipo de Mantenimiento -->
          <div class="form-group">
            <label>Tipo de Mantenimiento: *</label>
            <select 
              v-model="mantenimiento.tipo"
              :class="{ 'error': errors.tipo }">
              <option value="">Seleccione el tipo</option>
              <option value="preventivo">Preventivo</option>
              <option value="correctivo">Correctivo</option>
              <option value="emergencia">Emergencia</option>
            </select>
            <span class="error-message" v-if="errors.tipo">{{ errors.tipo }}</span>
          </div>

          <!-- Descripción del Problema -->
          <div class="form-group">
            <label>Descripción del Problema: *</label>
            <textarea 
              v-model="mantenimiento.descripcion"
              :class="{ 'error': errors.descripcion }"
              rows="4"
              placeholder="Detalle el problema o trabajo a realizar"></textarea>
            <span class="error-message" v-if="errors.descripcion">{{ errors.descripcion }}</span>
          </div>

          <!-- Técnico Responsable -->
          <div class="form-group">
            <label>Técnico Responsable: *</label>
            <select 
              v-model="mantenimiento.tecnicoId"
              :class="{ 'error': errors.tecnicoId }">
              <option value="">Seleccione un técnico</option>
              <option v-for="tecnico in tecnicos" 
                      :key="tecnico.id" 
                      :value="tecnico.id">
                {{ tecnico.nombres }} {{ tecnico.apellidos }}
              </option>
            </select>
            <span class="error-message" v-if="errors.tecnicoId">{{ errors.tecnicoId }}</span>
          </div>

          <!-- Fecha Estimada -->
          <div class="form-group">
            <label>Fecha Estimada de Finalización: *</label>
            <input 
              type="date" 
              v-model="mantenimiento.fechaEstimada"
              :class="{ 'error': errors.fechaEstimada }"
              :min="fechaMinima">
            <span class="error-message" v-if="errors.fechaEstimada">{{ errors.fechaEstimada }}</span>
          </div>

          <!-- Prioridad -->
          <div class="form-group">
            <label>Prioridad: *</label>
            <select 
              v-model="mantenimiento.prioridad"
              :class="{ 'error': errors.prioridad }">
              <option value="">Seleccione la prioridad</option>
              <option value="baja">Baja</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
              <option value="urgente">Urgente</option>
            </select>
            <span class="error-message" v-if="errors.prioridad">{{ errors.prioridad }}</span>
          </div>

          <!-- Costo Estimado -->
          <div class="form-group">
            <label>Costo Estimado:</label>
            <input 
              type="number" 
              v-model="mantenimiento.costoEstimado"
              :class="{ 'error': errors.costoEstimado }"
              step="0.01"
              min="0">
            <span class="error-message" v-if="errors.costoEstimado">{{ errors.costoEstimado }}</span>
          </div>

          <!-- Observaciones -->
          <div class="form-group">
            <label>Observaciones Adicionales:</label>
            <textarea 
              v-model="mantenimiento.observaciones"
              rows="3"
              placeholder="Observaciones adicionales sobre el mantenimiento"></textarea>
          </div>

          <!-- Botones de Acción -->
          <div class="form-actions">
            <button type="submit" class="btn btn-primary">
              <i class="fas fa-save"></i> Registrar Mantenimiento
            </button>
            <button type="button" @click="limpiarFormulario" class="btn btn-secondary">
              <i class="fas fa-times"></i> Limpiar
            </button>
          </div>
        </div>
      </form>

      <!-- Mensaje de éxito/error -->
      <div v-if="mensaje" :class="['alert', `alert-${mensaje.tipo}`]">
        {{ mensaje.texto }}
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useEquiposStore } from '@/stores/equipos'
import { useUsuariosStore } from '@/stores/usuarios'
import { useMantenimientosStore } from '@/stores/mantenimientos'
import AdminLayout from '@/components/layout/AdminLayout.vue'

const equiposStore = useEquiposStore()
const usuariosStore = useUsuariosStore()
const mantenimientosStore = useMantenimientosStore()

// Estado del formulario
const mantenimiento = ref({
  equipoId: '',
  tipo: '',
  descripcion: '',
  tecnicoId: '',
  fechaEstimada: '',
  prioridad: '',
  costoEstimado: '',
  observaciones: '',
  estado: 'pendiente'
})

const errors = ref({})
const mensaje = ref(null)
const equipoSeleccionado = ref(null)
const ultimoMantenimiento = ref(null)

// Computed properties
const equipos = computed(() => equiposStore.equipos)
const tecnicos = computed(() => 
  usuariosStore.usuarios.filter(u => u.rol === 'tecnico' && u.estado === 'activo')
)

const fechaMinima = computed(() => {
  const hoy = new Date()
  return hoy.toISOString().split('T')[0]
})


// Métodos
const loadEquipoDetails = () => {
  if (mantenimiento.value.equipoId) {
    equipoSeleccionado.value = equipos.value.find(e => e.id === mantenimiento.value.equipoId)
    // Cargar último mantenimiento
    const mantenimientos = mantenimientosStore.getMantenimientosPorEquipo(mantenimiento.value.equipoId)
    if (mantenimientos.length > 0) {
      ultimoMantenimiento.value = formatDate(mantenimientos[0].fechaCreacion)
    }
  } else {
    equipoSeleccionado.value = null
    ultimoMantenimiento.value = null
  }
}

const validarFormulario = () => {
  errors.value = {}

  if (!mantenimiento.value.equipoId) {
    errors.value.equipoId = 'Seleccione un equipo'
  }

  if (!mantenimiento.value.tipo) {
    errors.value.tipo = 'Seleccione el tipo de mantenimiento'
  }

  if (!mantenimiento.value.descripcion?.trim()) {
    errors.value.descripcion = 'La descripción es requerida'
  } else if (mantenimiento.value.descripcion.length < 10) {
    errors.value.descripcion = 'La descripción debe tener al menos 10 caracteres'
  }

  if (!mantenimiento.value.tecnicoId) {
    errors.value.tecnicoId = 'Seleccione un técnico'
  }

  if (!mantenimiento.value.fechaEstimada) {
    errors.value.fechaEstimada = 'Seleccione una fecha estimada'
  } else if (new Date(mantenimiento.value.fechaEstimada) < new Date()) {
    errors.value.fechaEstimada = 'La fecha no puede ser anterior a hoy'
  }

  if (!mantenimiento.value.prioridad) {
    errors.value.prioridad = 'Seleccione la prioridad'
  }

  if (mantenimiento.value.costoEstimado && mantenimiento.value.costoEstimado < 0) {
    errors.value.costoEstimado = 'El costo no puede ser negativo'
  }

  return Object.keys(errors.value).length === 0
}

const registrarMantenimiento = async () => {
  try {
    if (!validarFormulario()) {
      throw new Error('Por favor, corrija los errores en el formulario')
    }

    const success = await mantenimientosStore.agregarMantenimiento({
      ...mantenimiento.value,
      fechaCreacion: new Date().toISOString(),
      estado: 'pendiente'
    })

    if (success) {
      mensaje.value = {
        tipo: 'success',
        texto: 'Mantenimiento registrado exitosamente'
      }
      limpiarFormulario()
    } else {
      throw new Error('Error al registrar el mantenimiento')
    }
  } catch (error) {
    mensaje.value = {
      tipo: 'error',
      texto: error.message
    }
  }
}

const limpiarFormulario = () => {
  mantenimiento.value = {
    equipoId: '',
    tipo: '',
    descripcion: '',
    tecnicoId: '',
    fechaEstimada: '',
    prioridad: '',
    costoEstimado: '',
    observaciones: '',
    estado: 'pendiente'
  }
  errors.value = {}
  equipoSeleccionado.value = null
  ultimoMantenimiento.value = null
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<style scoped>
.mantenimiento-view {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 30px;
}

.maintenance-form {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-section {
  margin-bottom: 30px;
}

.form-group {
  margin-bottom: 20px;
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

.form-group input.error,
.form-group select.error,
.form-group textarea.error {
  border-color: #dc3545;
}

.error-message {
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 5px;
}

.equipo-details {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 4px;
  margin: 15px 0;
}

.form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--primary);
  color: white;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.alert {
  margin-top: 20px;
  padding: 15px;
  border-radius: 4px;
  text-align: center;
}

.alert-success {
  background: #d4edda;
  color: #155724;
}

.alert-error {
  background: #f8d7da;
  color: #721c24;
}
</style>