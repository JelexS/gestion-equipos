<template>
  <AdminLayout>
    <div class="form-header">
      <h1><i class="fas fa-laptop"></i> Registrar Nuevo Equipo</h1>
      <p>Complete todos los campos obligatorios (*)</p>
    </div>

    <form @submit.prevent="handleSubmit" class="inventory-form">
      <!-- Sección 1: Información Básica -->
      <fieldset class="form-section">
        <legend><i class="fas fa-info-circle"></i> Información General</legend>
        
        <div class="form-row">
          <div class="form-group">
            <label for="tipo">Tipo de equipo *</label>
            <select 
              id="tipo" 
              v-model="form.tipo"
              :class="{ 'error': errors.tipo }"
            >
              <option value="">Seleccione...</option>
              <option value="Laptop">Laptop</option>
              <option value="PC de Escritorio">Computadora de escritorio</option>
              <option value="Monitor">Monitor</option>
              <option value="Impresora">Impresora</option>
              <option value="Tablet">Tablet</option>
              <option value="Servidor">Servidor</option>
            </select>
            <div v-if="errors.tipo" class="error-message">{{ errors.tipo }}</div>
          </div>
          
          <div class="form-group">
            <label for="marca">Marca *</label>
            <input 
              type="text" 
              id="marca" 
              v-model="form.marca"
              :class="{ 'error': errors.marca }"
              placeholder="Ej: HP, Dell, Lenovo"
            >
            <div v-if="errors.marca" class="error-message">{{ errors.marca }}</div>
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label for="modelo">Modelo *</label>
            <input 
              type="text" 
              id="modelo" 
              v-model="form.modelo"
              :class="{ 'error': errors.modelo }"
              placeholder="Ej: EliteBook 840 G8"
            >
            <div v-if="errors.modelo" class="error-message">{{ errors.modelo }}</div>
          </div>
          
          <div class="form-group">
            <label for="serial">Número de serie *</label>
            <input 
              type="text" 
              id="serial" 
              v-model="form.serial"
              :class="{ 'error': errors.serial }"
              placeholder="Ej: ABC123XYZ789"
            >
            <div v-if="errors.serial" class="error-message">{{ errors.serial }}</div>
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label for="disponible">Disponible para asignación *</label>
            <select 
              id="disponible" 
              v-model="form.disponible"
              :class="{ 'error': errors.disponible }"
            >
              <option value="">Seleccione</option>
              <option value="si">Sí</option>
              <option value="no">No</option>
            </select>
            <div v-if="errors.disponible" class="error-message">{{ errors.disponible }}</div>
          </div>
          
          <div class="form-group" v-if="form.disponible === 'no'">
            <label for="ubicacion">Ubicación inicial</label>
            <input 
              type="text" 
              id="ubicacion" 
              v-model="form.ubicacion"
              placeholder="Ej: Fac. Ingeniería - Lab. 3"
            >
          </div>
        </div>
      </fieldset>

      <!-- Sección 2: Especificaciones Técnicas -->
      <fieldset class="form-section">
        <legend><i class="fas fa-microchip"></i> Especificaciones Técnicas</legend>
        
        <div class="form-row">
          <div class="form-group">
            <label for="procesador">Procesador</label>
            <input 
              type="text" 
              id="procesador" 
              v-model="form.procesador"
              placeholder="Ej: Intel Core i5-1135G7"
            >
          </div>
          
          <div class="form-group">
            <label for="ram">RAM (GB)</label>
            <input 
              type="number" 
              id="ram" 
              v-model="form.ram" 
              min="1"
              placeholder="8"
            >
          </div>
        </div>
        
        <div class="form-group">
          <label for="almacenamiento">Almacenamiento</label>
          <input 
            type="text" 
            id="almacenamiento" 
            v-model="form.almacenamiento"
            placeholder="Ej: 512GB SSD"
          >
        </div>
        
        <div class="form-group">
          <label for="observaciones">Observaciones adicionales</label>
          <textarea 
            id="observaciones" 
            v-model="form.observaciones"
            rows="3"
            placeholder="Información adicional sobre el equipo..."
          ></textarea>
        </div>
      </fieldset>

      <!-- Botones de acción -->
      <div class="form-actions">
        <button type="submit" class="btn btn-primary" :disabled="loading">
          <i class="fas fa-save"></i> 
          {{ loading ? 'Guardando...' : 'Guardar Equipo' }}
        </button>
        <button type="button" class="btn btn-secondary" @click="resetForm">
          <i class="fas fa-eraser"></i> Limpiar Formulario
        </button>
        <router-link to="/equipos/lista" class="btn btn-outline">
          <i class="fas fa-arrow-left"></i> Volver a Lista
        </router-link>
      </div>
    </form>

    <!-- Modal de éxito -->
    <div v-if="showSuccessModal" class="modal-overlay" @click="closeSuccessModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3><i class="fas fa-check-circle text-success"></i> Equipo Registrado</h3>
        </div>
        <div class="modal-body">
          <p>El equipo <strong>{{ lastCreatedEquipo?.id }}</strong> ha sido registrado exitosamente.</p>
          <div class="success-details">
            <p><strong>Tipo:</strong> {{ lastCreatedEquipo?.tipo }}</p>
            <p><strong>Marca:</strong> {{ lastCreatedEquipo?.marca }}</p>
            <p><strong>Modelo:</strong> {{ lastCreatedEquipo?.modelo }}</p>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary" @click="closeSuccessModal">
            Continuar
          </button>
          <router-link to="/equipos/lista" class="btn btn-secondary">
            Ver Lista de Equipos
          </router-link>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useEquiposStore } from '@/stores/equipos'
import AdminLayout from '@/components/layout/AdminLayout.vue'

const equiposStore = useEquiposStore()

const loading = ref(false)
const showSuccessModal = ref(false)
const lastCreatedEquipo = ref(null)

const form = reactive({
  tipo: '',
  marca: '',
  modelo: '',
  serial: '',
  disponible: '',
  ubicacion: '',
  procesador: '',
  ram: '',
  almacenamiento: '',
  observaciones: ''
})

const errors = reactive({
  tipo: '',
  marca: '',
  modelo: '',
  serial: '',
  disponible: ''
})

const validateForm = () => {
  // Reset errors
  Object.keys(errors).forEach(key => {
    errors[key] = ''
  })

  let isValid = true

  // Validaciones requeridas
  if (!form.tipo) {
    errors.tipo = 'Seleccione el tipo de equipo'
    isValid = false
  }

  if (!form.marca.trim()) {
    errors.marca = 'Ingrese la marca del equipo'
    isValid = false
  }

  if (!form.modelo.trim()) {
    errors.modelo = 'Ingrese el modelo del equipo'
    isValid = false
  }

  if (!form.serial.trim()) {
    errors.serial = 'Ingrese el número de serie'
    isValid = false
  } else if (!/^[A-Za-z0-9-]{5,}$/.test(form.serial.trim())) {
    errors.serial = 'El serial debe tener al menos 5 caracteres alfanuméricos'
    isValid = false
  }

  if (!form.disponible) {
    errors.disponible = 'Seleccione disponibilidad del equipo'
    isValid = false
  }

  // Verificar si el serial ya existe
  const existingEquipo = equiposStore.equipos.find(e => 
    e.serial.toLowerCase() === form.serial.trim().toLowerCase()
  )
  if (existingEquipo) {
    errors.serial = 'Ya existe un equipo con este número de serie'
    isValid = false
  }

  return isValid
}

const handleSubmit = async () => {
  if (!validateForm()) return

  loading.value = true

  try {
    // Preparar datos del equipo
    const equipoData = {
      tipo: form.tipo,
      marca: form.marca.trim(),
      modelo: form.modelo.trim(),
      serial: form.serial.trim(),
      disponible: form.disponible === 'si',
      estado: form.disponible === 'si' ? 'disponible' : 'asignado',
      ubicacion: form.disponible === 'si' ? 'Almacén Central' : (form.ubicacion || ''),
      procesador: form.procesador.trim(),
      ram: form.ram,
      almacenamiento: form.almacenamiento.trim(),
      observaciones: form.observaciones.trim()
    }

    // Guardar equipo
    const newEquipo = equiposStore.addEquipo(equipoData)
    
    lastCreatedEquipo.value = newEquipo
    showSuccessModal.value = true
    resetForm()
    
  } catch (error) {
    console.error('Error al registrar equipo:', error)
    alert('Error al registrar el equipo. Inténtelo nuevamente.')
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  Object.keys(form).forEach(key => {
    form[key] = ''
  })
  Object.keys(errors).forEach(key => {
    errors[key] = ''
  })
}

const closeSuccessModal = () => {
  showSuccessModal.value = false
  lastCreatedEquipo.value = null
}
</script>

<style scoped>
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

.inventory-form {
  max-width: 800px;
  margin: 0 auto;
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

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.form-row:last-child {
  margin-bottom: 0;
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

.error-message {
  color: var(--error);
  font-size: 12px;
  margin-top: 5px;
}

.form-actions {
  display: flex;
  gap: 15px;
  align-items: center;
  padding-top: 20px;
  border-top: 1px solid var(--border);
  margin-top: 30px;
}

.success-details {
  background-color: var(--bg);
  padding: 15px;
  border-radius: 6px;
  margin-top: 15px;
}

.success-details p {
  margin: 5px 0;
  color: var(--text);
}

.text-success {
  color: #28a745;
}

/* Responsivo */
@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .form-actions {
    flex-direction: column;
    align-items: stretch;
  }
  
  .form-actions .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>