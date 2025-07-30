<template>
  <div class="login-container">
    <div class="login-card">
      <h1>Bienvenido</h1>
      <p class="subtitle">Sistema de Inventario<br>de Equipos Informáticos</p>
      
      <form @submit.prevent="handleLogin">
        <div class="input-group">
          <label for="email">Correo institucional</label>
          <input 
            type="text" 
            id="email" 
            v-model="form.email"
            placeholder="correo@uleam.edu.ec"
            :class="{ 'error': errors.email }"
          >
          <div v-if="errors.email" class="error-text">{{ errors.email }}</div>
        </div>
        
        <div class="input-group">
          <label for="password">Contraseña</label>
          <input 
            type="password" 
            id="password" 
            v-model="form.password"
            placeholder="••••••••"
            :class="{ 'error': errors.password }"
          >
          <div v-if="errors.password" class="error-text">{{ errors.password }}</div>
        </div>
        
        <div class="remember-forgot">
          <a href="#" class="forgot-password">¿Olvidó su contraseña?</a>
        </div>
        
        <div class="divider"></div>
        
        <button 
          type="submit" 
          class="login-button"
          :disabled="loading"
        >
          {{ loading ? 'INGRESANDO...' : 'INICIAR SESIÓN' }}
        </button>
        
        <div v-if="loginError" class="error-message">
          {{ loginError }}
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(false)
const loginError = ref('')

const form = reactive({
  email: '',
  password: ''
})

const errors = reactive({
  email: '',
  password: ''
})

const validateForm = () => {
  // Reset errors
  errors.email = ''
  errors.password = ''
  
  let isValid = true
  
  // Email validation
  if (!form.email) {
    errors.email = 'El correo es requerido'
    isValid = false
  } else if (!/^[^\s@]+@uleam\.edu\.ec$/.test(form.email)) {
    errors.email = 'Debe ingresar un correo @uleam.edu.ec válido'
    isValid = false
  }
  
  // Password validation
  if (!form.password) {
    errors.password = 'La contraseña es requerida'
    isValid = false
  } else if (form.password.length < 6) {
    errors.password = 'La contraseña debe tener al menos 6 caracteres'
    isValid = false
  }
  
  return isValid
}

const handleLogin = async () => {
  if (!validateForm()) return
  
  loading.value = true
  loginError.value = ''
  
  try {
    await authStore.login(form.email, form.password)
    
    // Redirigir según el rol
    if (authStore.user.rol === 'admin') {
      router.push('/dashboard')
    } else {
      router.push('/inventario-usuario')
    }
  } catch (error) {
    loginError.value = error.message
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-card {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 400px;
}

h1 {
  text-align: center;
  color: var(--primary);
  margin-bottom: 10px;
  font-size: 28px;
  font-weight: 600;
}

.subtitle {
  text-align: center;
  color: var(--text-light);
  margin-bottom: 30px;
  line-height: 1.4;
}

.input-group {
  margin-bottom: 20px;
}

.input-group label {
  display: block;
  margin-bottom: 8px;
  color: var(--text);
  font-weight: 500;
}

.input-group input {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 6px;
  font-size: 16px;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.input-group input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(42, 157, 143, 0.1);
}

.input-group input.error {
  border-color: var(--error);
}

.error-text {
  color: var(--error);
  font-size: 14px;
  margin-top: 5px;
}

.remember-forgot {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
}

.forgot-password {
  color: var(--primary);
  text-decoration: none;
  font-size: 14px;
}

.forgot-password:hover {
  text-decoration: underline;
}

.divider {
  height: 1px;
  background-color: var(--border);
  margin: 20px 0;
}

.login-button {
  width: 100%;
  background-color: var(--primary);
  color: white;
  border: none;
  padding: 14px;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.login-button:hover:not(:disabled) {
  background-color: var(--primary-dark);
}

.login-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.error-message {
  background-color: #fee;
  color: var(--error);
  padding: 12px;
  border-radius: 6px;
  margin-top: 15px;
  text-align: center;
  font-size: 14px;
}

.demo-credentials {
  margin-top: 30px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 6px;
  border-left: 4px solid var(--primary);
}

.demo-credentials h4 {
  margin: 0 0 10px 0;
  color: var(--primary);
  font-size: 14px;
}

.demo-credentials p {
  margin: 5px 0;
  font-size: 13px;
  color: var(--text-light);
}
</style>