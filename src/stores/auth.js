import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const isAuthenticated = computed(() => !!user.value)

  // Cargar usuario desde localStorage al inicializar
  const initAuth = () => {
    const savedUser = localStorage.getItem('uleam_user')
    if (savedUser) {
      user.value = JSON.parse(savedUser)
    }
  }

  const login = async (email, password) => {
    try {
      // Simulación de autenticación
      const users = JSON.parse(localStorage.getItem('uleam_usuarios') || '[]')
      
      // Usuario admin por defecto
      const defaultAdmin = {
        id: 'admin',
        nombres: 'Administrador',
        apellidos: 'del Sistema',
        email: 'admin@uleam.edu.ec',
        password: '123456',
        rol: 'admin',
        facultad: 'Administración',
        estado: 'activo'
      }

      // Buscar usuario
      let foundUser = users.find(u => u.email === email && u.password === password)
      
      // Si no existe y es el admin por defecto, usar credenciales por defecto
      if (!foundUser && email === 'admin@uleam.edu.ec' && password === '123456') {
        foundUser = defaultAdmin
      }

      if (!foundUser) {
        throw new Error('Credenciales incorrectas')
      }

      if (foundUser.estado === 'inactivo') {
        throw new Error('Usuario inactivo')
      }


      return true
    } catch (error) {
      throw new Error(error.message || 'Error al iniciar sesión')
    }
  }

  const logout = () => {
    user.value = null
    localStorage.removeItem('uleam_user')
  }

  const updateUser = (userData) => {
    user.value = { ...user.value, ...userData }
    localStorage.setItem('uleam_user', JSON.stringify(user.value))
  }

  // Inicializar al cargar el store
  initAuth()

  return {
    user,
    isAuthenticated,
    login,
    logout,
    updateUser,
    initAuth
  }
})