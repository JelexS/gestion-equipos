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
                  <!-- Selector de equipo -->
        <div class="form-group">
          <label>Equipo a asignar: *</label>
          <select v-model="equipoSeleccionado" class="form-control">
            <option value="" disabled>Seleccione un equipo</option>
            <option v-for="equipo in equiposDisponibles" 
                    :key="equipo.id" 
                    :value="equipo.id">
              {{ equipo.id }} - {{ equipo.tipo }} {{ equipo.marca }} {{ equipo.modelo }}
            </option>
          </select>
        </div>

        <!-- Responsable -->
        <div class="form-group">
          <label>Responsable: *</label>
          <select v-model="asignacion.responsable" class="form-control">
            <option value="" disabled>Seleccione un responsable</option>
            <option v-for="usuario in usuarios" 
                    :key="usuario.id" 
                    :value="usuario.id">
              {{ usuario.nombres }} {{ usuario.apellidos }}
            </option>
          </select>
        </div>

        <!-- Ubicación -->
        <div class="form-group">
          <label>Ubicación física:</label>
          <input type="text" 
                 v-model="asignacion.ubicacion"  
                 class="form-control"
                 placeholder="Ej: Facultad de Ingeniería - Lab 101">
        </div>

        <!-- Fecha de asignación -->
        <div class="form-group">
          <label>Fecha de asignación:</label>
          <input type="date" 
                 v-model="asignacion.fechaAsignacion" 
                 
                 class="form-control"
                 :min="fechaMinima">
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
const equipoSeleccionado = ref('')
const asignacion = ref({
  responsable: '',
  ubicacion: '',
  fechaAsignacion: '',
  observaciones: ''
})
const mensaje = ref(null)

// Computed properties
const equiposDisponibles = computed(() => {
  return equiposStore.equipos.filter(equipo => 
    equipo.estado === 'disponible' || equipo.estado === 'activo'
  )
})

const usuarios = computed(() => {
  return usuariosStore.usuarios
})

const fechaMinima = computed(() => {
  const hoy = new Date()
  return hoy.toISOString().split('T')[0]
})

// Métodos
const asignarEquipo = async () => {
  try {
    // Validaciones
    if (!equipoSeleccionado.value || !asignacion.value.responsable) {
      throw new Error('Debe seleccionar un equipo y un responsable')
    }

    if (!asignacion.value.ubicacion.trim()) {
      throw new Error('La ubicación es requerida')
    }

    // Actualizar el equipo
    const success = equiposStore.updateEquipo(equipoSeleccionado.value, {
      estado: 'asignado',
      responsable: asignacion.value.responsable,
      ubicacion: asignacion.value.ubicacion,
      fechaAsignacion: asignacion.value.fechaAsignacion,
      observaciones: asignacion.value.observaciones
    })

    if (success) {
      mensaje.value = {
        tipo: 'success',
        texto: 'Equipo asignado correctamente'
      }
      limpiarFormulario()
    } else {
      throw new Error('Error al asignar el equipo')
    }
  } catch (error) {
    mensaje.value = {
      tipo: 'error',
      texto: error.message
    }
  }
}

const limpiarFormulario = () => {
  equipoSeleccionado.value = ''
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
</style>