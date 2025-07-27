<template>
  <UserLayout>
    <div class="solicitud-view">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <h1><i class="fas fa-hand-holding"></i> Solicitud de Equipos</h1>
          <p>Solicite equipos adicionales o reemplazos</p>
        </div>
      </div>

      <!-- Formulario de Solicitud -->
      <div class="solicitud-form-container">
        <form @submit.prevent="enviarSolicitud" class="solicitud-form">
          <!-- Tipo de Solicitud -->
          <div class="form-group">
            <label>Tipo de Solicitud *</label>
            <select 
              v-model="solicitud.tipo"
              :class="{'form-control': true, 'is-invalid': errors.tipo}"
            >
              <option value="">Seleccione el tipo de solicitud...</option>
              <option value="nuevo">Equipo Nuevo</option>
              <option value="reemplazo">Reemplazo de Equipo</option>
              <option value="accesorio">Accesorio</option>
              <option value="temporal">Equipo Temporal</option>
            </select>
            <span class="error-message" v-if="errors.tipo">{{ errors.tipo }}</span>
          </div>

          <!-- Equipo/Accesorio Solicitado -->
          <div class="form-group">
            <label>¿Qué necesita? *</label>
            <select 
              v-model="solicitud.equipoSolicitado"
              :class="{'form-control': true, 'is-invalid': errors.equipoSolicitado}"
            >
              <option value="">Seleccione el equipo o accesorio...</option>
              <optgroup label="Equipos">
                <option value="laptop">Laptop</option>
                <option value="desktop">PC de Escritorio</option>
                <option value="monitor">Monitor</option>
                <option value="impresora">Impresora</option>
              </optgroup>
              <optgroup label="Accesorios">
                <option value="teclado">Teclado</option>
                <option value="mouse">Mouse</option>
                <option value="audifonos">Audífonos</option>
                <option value="webcam">Webcam</option>
              </optgroup>
            </select>
            <span class="error-message" v-if="errors.equipoSolicitado">
              {{ errors.equipoSolicitado }}
            </span>
          </div>

          <!-- En caso de reemplazo -->
          <div class="form-group" v-if="solicitud.tipo === 'reemplazo'">
            <label>Equipo a Reemplazar *</label>
            <select 
              v-model="solicitud.equipoActual"
              :class="{'form-control': true, 'is-invalid': errors.equipoActual}"
            >
              <option value="">Seleccione el equipo a reemplazar...</option>
              <option 
                v-for="equipo in misEquipos" 
                :key="equipo.id" 
                :value="equipo.id"
              >
                {{ equipo.id }} - {{ equipo.tipo }} {{ equipo.marca }}
              </option>
            </select>
            <span class="error-message" v-if="errors.equipoActual">
              {{ errors.equipoActual }}
            </span>
          </div>

          <!-- Justificación -->
          <div class="form-group">
            <label>Justificación *</label>
            <textarea 
              v-model="solicitud.justificacion"
              :class="{'form-control': true, 'is-invalid': errors.justificacion}"
              rows="4"
              placeholder="Explique por qué necesita este equipo..."
            ></textarea>
            <div class="char-counter" :class="{ 'text-danger': solicitud.justificacion.length > 500 }">
              {{ solicitud.justificacion.length }}/500
            </div>
            <span class="error-message" v-if="errors.justificacion">
              {{ errors.justificacion }}
            </span>
          </div>

          <!-- Tiempo requerido (para solicitudes temporales) -->
          <div class="form-group" v-if="solicitud.tipo === 'temporal'">
            <label>Tiempo Requerido *</label>
            <div class="tiempo-input">
              <input 
                type="number" 
                v-model="solicitud.tiempoCantidad"
                min="1"
                :class="{'form-control': true, 'is-invalid': errors.tiempoCantidad}"
              >
              <select 
                v-model="solicitud.tiempoUnidad"
                :class="{'form-control': true, 'is-invalid': errors.tiempoUnidad}"
              >
                <option value="dias">Días</option>
                <option value="semanas">Semanas</option>
                <option value="meses">Meses</option>
              </select>
            </div>
            <span class="error-message" v-if="errors.tiempo">{{ errors.tiempo }}</span>
          </div>

          <!-- Comentarios Adicionales -->
          <div class="form-group">
            <label>Comentarios Adicionales</label>
            <textarea 
              v-model="solicitud.comentarios"
              class="form-control"
              rows="3"
              placeholder="Información adicional que quiera proporcionar..."
            ></textarea>
          </div>

          <!-- Botones -->
          <div class="form-actions">
            <button 
              type="button" 
              class="btn btn-outline"
              @click="limpiarFormulario"
              :disabled="isSubmitting"
            >
              <i class="fas fa-times"></i> Cancelar
            </button>
            <button 
              type="submit" 
              class="btn btn-primary"
              :disabled="isSubmitting"
            >
              <i class="fas" :class="isSubmitting ? 'fa-spinner fa-spin' : 'fa-paper-plane'"></i>
              {{ isSubmitting ? 'Enviando...' : 'Enviar Solicitud' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </UserLayout>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useEquiposStore } from '@/stores/equipos'
import UserLayout from '@/components/layout/UserLayout.vue'

const authStore = useAuthStore()
const equiposStore = useEquiposStore()

const solicitud = reactive({
  tipo: '',
  equipoSolicitado: '',
  equipoActual: '',
  justificacion: '',
  tiempoCantidad: 1,
  tiempoUnidad: 'dias',
  comentarios: ''
})

const errors = ref({})
const isSubmitting = ref(false)

const misEquipos = computed(() => {
  if (!authStore.user) return []
  return equiposStore.equipos.filter(equipo => 
    equipo.responsable === authStore.user.id ||
    equipo.responsableId === authStore.user.id
  )
})

const validarFormulario = () => {
  errors.value = {}

  if (!solicitud.tipo) {
    errors.value.tipo = 'Seleccione un tipo de solicitud'
  }

  if (!solicitud.equipoSolicitado) {
    errors.value.equipoSolicitado = 'Seleccione qué necesita'
  }

  if (solicitud.tipo === 'reemplazo' && !solicitud.equipoActual) {
    errors.value.equipoActual = 'Seleccione el equipo a reemplazar'
  }

  if (!solicitud.justificacion.trim()) {
    errors.value.justificacion = 'La justificación es requerida'
  } else if (solicitud.justificacion.length < 50) {
    errors.value.justificacion = 'La justificación debe tener al menos 50 caracteres'
  } else if (solicitud.justificacion.length > 500) {
    errors.value.justificacion = 'La justificación no debe exceder los 500 caracteres'
  }

  if (solicitud.tipo === 'temporal') {
    if (!solicitud.tiempoCantidad || solicitud.tiempoCantidad < 1) {
      errors.value.tiempoCantidad = 'Ingrese un tiempo válido'
    }
    if (!solicitud.tiempoUnidad) {
      errors.value.tiempoUnidad = 'Seleccione la unidad de tiempo'
    }
  }

  return Object.keys(errors.value).length === 0
}

const enviarSolicitud = async () => {
  try {
    if (!validarFormulario()) {
      return
    }

    isSubmitting.value = true

    // Crear objeto de solicitud
    const nuevaSolicitud = {
      id: `SOL-${Date.now()}`,
      usuario: authStore.user.id,
      fecha: new Date().toISOString(),
      estado: 'pendiente',
      ...solicitud
    }

    // Guardar en localStorage
    const solicitudes = JSON.parse(localStorage.getItem('uleam_solicitudes') || '[]')
    solicitudes.push(nuevaSolicitud)
    localStorage.setItem('uleam_solicitudes', JSON.stringify(solicitudes))

    // Mostrar mensaje de éxito
    alert('Solicitud enviada exitosamente')
    limpiarFormulario()
  } catch (error) {
    console.error('Error al enviar solicitud:', error)
    alert('Error al enviar la solicitud. Por favor, intente nuevamente.')
  } finally {
    isSubmitting.value = false
  }
}

const limpiarFormulario = () => {
  Object.assign(solicitud, {
    tipo: '',
    equipoSolicitado: '',
    equipoActual: '',
    justificacion: '',
    tiempoCantidad: 1,
    tiempoUnidad: 'dias',
    comentarios: ''
  })
  errors.value = {}
}
</script>

<style scoped>
/* Estilos existentes */
.solicitud-view {
  padding: 20px;
  background: #f5f7fa;
  min-height: calc(100vh - 60px);
}

.page-header {
  background: white;
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.page-header h1 {
  margin: 0;
  font-size: 24px;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 10px;
}

.page-header p {
  margin: 5px 0 0;
  color: #6c757d;
}

.solicitud-form-container {
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #2c3e50;
}

.form-control {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.form-control:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
}

.form-control.is-invalid {
  border-color: #dc3545;
}

.error-message {
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 4px;
}

.tiempo-input {
  display: flex;
  gap: 10px;
}

.tiempo-input input {
  width: 100px;
}

.char-counter {
  text-align: right;
  font-size: 0.75rem;
  color: #6c757d;
  margin-top: 4px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 30px;
}

.btn {
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-outline {
  border: 1px solid var(--primary);
  background: transparent;
  color: var(--primary);
}

.btn-primary {
  background: var(--primary);
  border: none;
  color: white;
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .tiempo-input {
    flex-direction: column;
  }
  
  .tiempo-input input {
    width: 100%;
  }
}
</style>