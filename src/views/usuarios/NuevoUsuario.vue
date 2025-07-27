<template>
  <AdminLayout>
    <div class="form-header">
      <h1><i class="fas fa-user-plus"></i> Nuevo Usuario</h1>
      <p>Complete todos los campos obligatorios (*)</p>
    </div>

    <form @submit.prevent="guardarUsuario" class="inventory-form">
      <!-- Sección 1: Información Personal -->
      <fieldset>
        <legend><i class="fas fa-id-card"></i> Información Personal</legend>

        <div class="form-group">
          <label for="nombres">Nombres *</label>
          <input 
            type="text" 
            id="nombres" 
            v-model="usuario.nombres"
            :class="{ 'error': errors.nombres }"
            @input="validarNombre">
          <div v-if="errors.nombres" class="error-message">{{ errors.nombres }}</div>
        </div>

        <div class="form-group">
          <label for="apellidos">Apellidos *</label>
          <input 
            type="text" 
            id="apellidos" 
            v-model="usuario.apellidos"
            :class="{ 'error': errors.apellidos }"
            @input="validarApellidos">
          <div v-if="errors.apellidos" class="error-message">{{ errors.apellidos }}</div>
        </div>

        <div class="form-group">
          <label for="cedula">Cédula *</label>
          <input 
            type="text" 
            id="cedula" 
            v-model="usuario.cedula"
            :class="{ 'error': errors.cedula }"
            @input="validarCedula"
            maxlength="10">
          <div v-if="errors.cedula" class="error-message">{{ errors.cedula }}</div>
        </div>

        <div class="form-group">
          <label for="telefono">Teléfono</label>
          <input 
            type="tel" 
            id="telefono" 
            v-model="usuario.telefono"
            @input="validarTelefono"
            maxlength="10">
          <div v-if="errors.telefono" class="error-message">{{ errors.telefono }}</div>
        </div>
      </fieldset>

      <!-- Sección 2: Información de Cuenta -->
      <fieldset>
        <legend><i class="fas fa-user-shield"></i> Información de Cuenta</legend>

        <div class="form-group">
          <label for="email">Correo Institucional *</label>
          <input 
            type="email" 
            id="email" 
            v-model="usuario.email"
            :class="{ 'error': errors.email }"
            @input="validarEmail">
          <div v-if="errors.email" class="error-message">{{ errors.email }}</div>
        </div>

        <div class="form-group">
          <label for="rol">Rol *</label>
          <select 
            id="rol" 
            v-model="usuario.rol"
            :class="{ 'error': errors.rol }"
            @change="validarRol">
            <option value="" disabled>Seleccione un rol...</option>
            <option value="admin">Administrador</option>
            <option value="tecnico">Técnico</option>
            <option value="docente">Docente</option>
            <option value="invitado">Invitado</option>
          </select>
          <div v-if="errors.rol" class="error-message">{{ errors.rol }}</div>
        </div>

        <div class="form-group">
          <label for="facultad">Facultad/Departamento</label>
          <select 
            id="facultad" 
            v-model="usuario.facultad">
            <option value="" disabled>Sin asignar</option>
            <option v-for="facultad in facultades" 
                    :key="facultad.id" 
                    :value="facultad.nombre">
              {{ facultad.nombre }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="password">Contraseña *</label>
          <input 
            type="password" 
            id="password" 
            v-model="usuario.password"
            :class="{ 'error': errors.password }"
            @input="validarPassword">
          <div class="password-strength">
            <div :class="['strength-meter', passwordStrengthClass]"></div>
          </div>
          <div v-if="errors.password" class="error-message">{{ errors.password }}</div>
        </div>

        <div class="form-group">
          <label for="confirmPassword">Confirmar Contraseña *</label>
          <input 
            type="password" 
            id="confirmPassword" 
            v-model="confirmPassword"
            :class="{ 'error': errors.confirmPassword }"
            @input="validarConfirmPassword">
          <div v-if="errors.confirmPassword" class="error-message">{{ errors.confirmPassword }}</div>
        </div>

        <!-- Acciones del Formulario -->
        <div class="form-actions">
          <button type="button" class="btn btn-secondary" @click="cancelar">
            <i class="fas fa-times"></i> Cancelar
          </button>
          <button type="submit" class="btn btn-primary">
            <i class="fas fa-save"></i> Guardar Usuario
          </button>
        </div>
      </fieldset>
    </form>

    <!-- Mensaje de éxito/error -->
    <div v-if="mensaje" :class="['alert', `alert-${mensaje.tipo}`]">
      {{ mensaje.texto }}
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUsuariosStore } from '@/stores/usuarios'
import AdminLayout from '@/components/layout/AdminLayout.vue'

const router = useRouter()
const usuariosStore = useUsuariosStore()

// Estado del formulario
const usuario = ref({
  nombres: '',
  apellidos: '',
  cedula: '',
  telefono: '',
  email: '',
  rol: '',
  facultad: '',
  password: '',
})

const confirmPassword = ref('')
const errors = ref({})
const mensaje = ref(null)

// Lista de facultades (podría venir de un store)
const facultades = ref([
  { id: 'ingenieria', nombre: 'Facultad de Ingeniería' },
  { id: 'medicina', nombre: 'Facultad de Medicina' },
  { id: 'administracion', nombre: 'Facultad de Administración' }
])

// Validaciones
const validarNombre = () => {
  if (!usuario.value.nombres.trim()) {
    errors.value.nombres = 'El nombre es requerido'
  } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,50}$/.test(usuario.value.nombres)) {
    errors.value.nombres = 'Ingrese un nombre válido'
  } else {
    delete errors.value.nombres
  }
}

const validarApellidos = () => {
  if (!usuario.value.apellidos.trim()) {
    errors.value.apellidos = 'Los apellidos son requeridos'
  } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,50}$/.test(usuario.value.apellidos)) {
    errors.value.apellidos = 'Ingrese apellidos válidos'
  } else {
    delete errors.value.apellidos
  }
}

const validarCedula = () => {
  if (!usuario.value.cedula) {
    errors.value.cedula = 'La cédula es requerida'
  } else if (!/^\d{10}$/.test(usuario.value.cedula)) {
    errors.value.cedula = 'La cédula debe tener 10 dígitos'
  } else {
    delete errors.value.cedula
  }
}

const validarTelefono = () => {
  if (usuario.value.telefono && !/^\d{10}$/.test(usuario.value.telefono)) {
    errors.value.telefono = 'El teléfono debe tener 10 dígitos'
  } else {
    delete errors.value.telefono
  }
}

const validarEmail = () => {
  const institucionalRegex = /^[a-zA-Z0-9._-]+@uleam\.edu\.ec$/
  if (!usuario.value.email) {
    errors.value.email = 'El correo es requerido'
  } else if (!institucionalRegex.test(usuario.value.email)) {
    errors.value.email = 'Debe ser un correo institucional (@uleam.edu.ec)'
  } else {
    delete errors.value.email
  }
}

const validarRol = () => {
  if (!usuario.value.rol) {
    errors.value.rol = 'Seleccione un rol'
  } else {
    delete errors.value.rol
  }
}

const validarPassword = () => {
  const password = usuario.value.password
  if (!password) {
    errors.value.password = 'La contraseña es requerida'
  } else if (password.length < 8) {
    errors.value.password = 'La contraseña debe tener al menos 8 caracteres'
  } else if (!/[A-Z]/.test(password)) {
    errors.value.password = 'Debe incluir al menos una mayúscula'
  } else if (!/[a-z]/.test(password)) {
    errors.value.password = 'Debe incluir al menos una minúscula'
  } else if (!/[0-9]/.test(password)) {
    errors.value.password = 'Debe incluir al menos un número'
  } else {
    delete errors.value.password
  }
}

const validarConfirmPassword = () => {
  if (usuario.value.password !== confirmPassword.value) {
    errors.value.confirmPassword = 'Las contraseñas no coinciden'
  } else {
    delete errors.value.confirmPassword
  }
}

// Computed properties
const isFormValid = computed(() => {
  return !Object.keys(errors.value).length &&
         usuario.value.nombres &&
         usuario.value.apellidos &&
         usuario.value.cedula &&
         usuario.value.email &&
         usuario.value.rol &&
         usuario.value.password &&
         confirmPassword.value === usuario.value.password
})

const passwordStrengthClass = computed(() => {
  const password = usuario.value.password
  if (!password) return ''
  if (password.length < 8) return 'weak'
  if (/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])/.test(password)) return 'strong'
  if (/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/.test(password)) return 'medium'
  return 'weak'
})

// Métodos
const guardarUsuario = async () => {
  try {
    // Validar todos los campos antes de guardar
    validarNombre()
    validarApellidos()
    validarCedula()
    validarEmail()
    validarRol()
    validarPassword()
    validarConfirmPassword()

    if (!isFormValid.value) {
      throw new Error('Por favor, complete todos los campos requeridos correctamente')
    }

    // Crear el usuario
    const nuevoUsuario = {
      ...usuario.value,
      id: Date.now().toString(),
      fechaCreacion: new Date().toISOString()
    }

    const success = await usuariosStore.addUsuario(nuevoUsuario)

    if (success) {
      mensaje.value = {
        tipo: 'success',
        texto: 'Usuario creado exitosamente'
      }
      setTimeout(() => {
        router.push('/usuarios/lista')
      }, 2000)
    } else {
      throw new Error('Error al crear el usuario')
    }
  } catch (error) {
    mensaje.value = {
      tipo: 'error',
      texto: error.message
    }
  }
}

const cancelar = () => {
  router.push('/usuarios/lista')
}
</script>

<style scoped>
.inventory-form {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.form-header {
  margin-bottom: 30px;
  text-align: center;
}

fieldset {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

legend {
  color: var(--primary);
  font-weight: bold;
  padding: 0 10px;
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
.form-group select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-group input.error,
.form-group select.error {
  border-color: #dc3545;
}

.error-message {
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 5px;
}

.password-strength {
  margin-top: 5px;
  height: 4px;
  background: #eee;
  border-radius: 2px;
}

.strength-meter {
  height: 100%;
  border-radius: 2px;
  transition: width 0.3s ease;
}

.strength-meter.weak { 
  width: 33%;
  background: #dc3545;
}

.strength-meter.medium {
  width: 66%;
  background: #ffc107;
}

.strength-meter.strong {
  width: 100%;
  background: #28a745;
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
  padding: 10px;
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