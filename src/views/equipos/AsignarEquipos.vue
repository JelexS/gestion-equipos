<template>
  <AdminLayout>

    <div class="form-header">
      <h1><i class="fas fa-exchange-alt"></i> Asignar Equipos</h1>
      <p>Complete todos los campos obligatorios (*)</p>
    </div>
      
      <!-- Formulario de asignación -->
      <form @submit.prevent="asignarEquipo" class="form-asignacion">

        <fieldset class="form-section">
          <legend><i class="fas fa-user-tag"></i> Datos de Asignación</legend>
        <!-- Equipos a asignar -->
        <div class="form-group">
          <label>Equipos a asignar: *</label>
          <div class="equipos-selector">
            <div class="selected-equipos" 
                 :class="{ 'error-border': errors.equipos }"
                 v-if="equiposSeleccionados.length > 0">
              <div v-for="equipoId in equiposSeleccionados" 
                  :key="equipoId" 
                  class="equipo-tag">
                {{ getEquipoInfo(equipoId) }}
                <button type="button" 
                        class="remove-equipo" 
                        @click="removeEquipo(equipoId)">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
            <select v-model="equipoTemporal" 
                    :class="{'form-control': true, 'error': errors.equipos}"
                    @change="addEquipo">
              <option value="">Seleccione equipos...</option>
              <option v-for="equipo in equiposDisponiblesFiltrados" 
                      :key="equipo.id" 
                      :value="equipo.id">
                {{ equipo.id }} - {{ equipo.tipo }} {{ equipo.marca }} {{ equipo.modelo }}
              </option>
            </select>
            <span class="error-message" v-if="errors.equipos">
              {{ errors.equipos }}
            </span>
          </div>
        </div>

        <!-- Responsable -->
        <div class="form-group">
          <label>Responsable: *</label>
          <select v-model="asignacion.responsable" 
                  :class="{'form-control': true, 'error': errors.responsable}">
            <option value="" disabled>Seleccione un responsable</option>
            <option v-for="usuario in usuarios" 
                    :key="usuario.id" 
                    :value="usuario.nombres + ' ' + usuario.apellidos">
              {{ usuario.nombres }} {{ usuario.apellidos }} - {{ usuario.rol }}
            </option>
          </select>
          <span class="error-message" v-if="errors.responsable">
            {{ errors.responsable }}
          </span>
        </div>

        <!-- Ubicación -->
        <div class="form-group">
          <label>Ubicación física: *</label>
          <input type="text" 
                 v-model="asignacion.ubicacion"  
                 :class="{'form-control': true, 'error': errors.ubicacion}"
                 placeholder="Ej: Facultad de Ingeniería - Lab 101">
          <span class="error-message" v-if="errors.ubicacion">
            {{ errors.ubicacion }}
          </span>
        </div>

        <!-- Fecha de asignación -->
        <div class="form-group">
          <label>Fecha de asignación: *</label>
          <input type="date" 
                v-model="asignacion.fechaAsignacion" 
                :class="{'form-control': true, 'error': errors.fechaAsignacion}"
                :min="fechaMinima">
          <span class="error-message" v-if="errors.fechaAsignacion">
            {{ errors.fechaAsignacion }}
          </span>
        </div>

        <!-- Observaciones -->
        <div class="form-group">
          <label>Observaciones:</label>
          <textarea v-model="asignacion.observaciones" 
                    class="form-control"
                    rows="3"
                    placeholder="Observaciones adicionales sobre la asignación"></textarea>
        </div>

        <!-- Botones -->
        <div class="form-actions">
          <button type="submit" class="btn btn-primary">Asignar Equipo</button>
          <button type="button" @click="limpiarFormulario" class="btn btn-secondary">Limpiar</button>
        </div>

        </fieldset>

      </form>

      <!-- Mensaje de éxito/error -->
      <div v-if="mensaje" :class="['alert', mensaje.tipo === 'error' ? 'alert-danger' : 'alert-success']">
        {{ mensaje.texto }}
      </div>
    
  </AdminLayout>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useEquiposStore } from '@/stores/equipos'
import { useUsuariosStore } from '@/stores/usuarios'
import AdminLayout from '@/components/layout/AdminLayout.vue'

const equiposStore = useEquiposStore()
const usuariosStore = useUsuariosStore()

// Estado del formulario
const equiposSeleccionados = ref([])
const equipoTemporal = ref('')
const asignacion = ref({
  responsable: '',
  ubicacion: '',
  fechaAsignacion: '',
  observaciones: ''
})
const mensaje = ref(null)
const errors = ref({})

// Computed properties
const equiposDisponiblesFiltrados = computed(() => {
  return equiposStore.equipos.filter(equipo => 
    (equipo.estado === 'disponible' || equipo.estado === 'activo') &&
    !equiposSeleccionados.value.includes(equipo.id)
  )
})

const getEquipoInfo = (equipoId) => {
  const equipo = equiposStore.equipos.find(e => e.id === equipoId)
  return equipo ? `${equipo.id} - ${equipo.tipo}` : equipoId
}

const addEquipo = () => {
  if (equipoTemporal.value && !equiposSeleccionados.value.includes(equipoTemporal.value)) {
    equiposSeleccionados.value.push(equipoTemporal.value)
    equipoTemporal.value = ''
  }
}
const removeEquipo = (equipoId) => {
  equiposSeleccionados.value = equiposSeleccionados.value.filter(id => id !== equipoId)
}
const usuarios = computed(() => {
  return usuariosStore.usuarios
})

const fechaMinima = computed(() => {
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0) // Reset time to start of day
  return hoy.toISOString().split('T')[0]
})

// Métodos
const asignarEquipo = async () => {
  try {
    // Reset errors
    errors.value = {}
    let hasErrors = false

    // Validate equipments
    if (equiposSeleccionados.value.length === 0) {
      errors.value.equipos = 'Debe seleccionar al menos un equipo'
      hasErrors = true
    }

    // Validate responsible
    if (!asignacion.value.responsable) {
      errors.value.responsable = 'Debe seleccionar un responsable'
      hasErrors = true
    }

    // Validate location
    if (!asignacion.value.ubicacion?.trim()) {
      errors.value.ubicacion = 'La ubicación es requerida'
      hasErrors = true
    }
     // Validate fecha asignación
    if (!asignacion.value.fechaAsignacion) {
      errors.value.fechaAsignacion = 'La fecha de asignación es requerida'
      hasErrors = true
    } else {
      const fechaSeleccionada = new Date(asignacion.value.fechaAsignacion)
      const hoy = new Date()
      hoy.setHours(0, 0, 0, 0)
      
      if (fechaSeleccionada < hoy) {
        errors.value.fechaAsignacion = 'La fecha no puede ser anterior a hoy'
        hasErrors = true
      }
    }
    if (hasErrors) {
      return
    }

    // Asignar múltiples equipos
    const results = await Promise.all(
      equiposSeleccionados.value.map(equipoId => 
        equiposStore.updateEquipo(equipoId, {
          estado: 'asignado',
          responsable: asignacion.value.responsable,
          ubicacion: asignacion.value.ubicacion,
          fechaAsignacion: asignacion.value.fechaAsignacion,
          observaciones: asignacion.value.observaciones
        })
      )
    )

    if (results.every(success => success)) {
      mensaje.value = {
        tipo: 'success',
        texto: `${equiposSeleccionados.value.length} equipos asignados correctamente`
      }
      limpiarFormulario()
    } else {
      throw new Error('Error al asignar algunos equipos')
    }
  } catch (error) {
    mensaje.value = {
      tipo: 'error',
      texto: error.message
    }
  }
}

const limpiarFormulario = () => {
  errors.value = {}
  equiposSeleccionados.value = []
  equipoTemporal.value = ''
  asignacion.value = {
    responsable: '',
    ubicacion: '',
    fechaAsignacion: '',
    observaciones: ''
  }
}
</script>

<style scoped>
.form-asignacion {
  max-width: 800px;
  margin: 0 auto;
  background: #f9f9f9;
  border-radius: 8px;
}
.form-header {
  margin-bottom: 30px;
}

.form-header h1 {
  color: var(--primary);
  margin-bottom: 10px;
  font-size: 28px;
}

.form-header p {
  color: var(--text-light);
  margin: 0;
}

.form-section {
  background: white;
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 25px;
  margin-bottom: 25px;
}

.form-section legend {
  color: var(--primary);
  font-weight: 600;
  font-size: 16px;
  padding: 0 10px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 8px;
  color: var(--text);
  font-weight: 500;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(42, 157, 143, 0.1);
}

.form-group input.error,
.form-group select.error {
  border-color: var(--error);
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}
.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
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
  padding: 10px;
  border-radius: 4px;
}

.alert-success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.alert-danger {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}



.equipos-selector {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.selected-equipos {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px;
  border: 1px solid var(--border);
  border-radius: 6px;
  min-height: 45px;
}

.equipo-tag {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  background: var(--primary);
  color: white;
  border-radius: 4px;
  font-size: 14px;
}

.remove-equipo {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 2px;
  display: flex;
  align-items: center;
  opacity: 0.8;
}

.remove-equipo:hover {
  opacity: 1;
}

.selected-count {
  margin-top: 5px;
  font-size: 14px;
  color: var(--text-light);
}

.form-control.error {
  border-color: var(--error, #dc3545);
}

.error-border {
  border-color: var(--error, #dc3545);
}

.error-message {
  color: var(--error, #dc3545);
  font-size: 0.875rem;
  margin-top: 4px;
  display: block;
}

.form-group {
  margin-bottom: 20px;
}

.form-control:focus.error {
  box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1);
}
</style>