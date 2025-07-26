import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUsuariosStore = defineStore('usuarios', () => {
  const usuarios = ref([])

  // Usuarios iniciales
  const usuariosIniciales = [
    {
      id: 'USER-042',
      nombres: 'María Fernanda',
      apellidos: 'González Méndez',
      cedula: '1234567890',
      telefono: '0987654321',
      email: 'mgonzalez@uleam.edu.ec',
      password: '123456',
      rol: 'tecnico',
      facultad: 'Facultad de Ingeniería',
      estado: 'activo',
      fechaCreacion: '2023-05-15',
      ultimoAcceso: '2023-05-20T14:30:00'
    },
    {
      id: 'USER-043',
      nombres: 'Carlos Alberto',
      apellidos: 'Rodríguez Silva',
      cedula: '0987654321',
      telefono: '0999888777',
      email: 'crodriguez@uleam.edu.ec',
      password: '123456',
      rol: 'docente',
      facultad: 'Facultad de Medicina',
      estado: 'activo',
      fechaCreacion: '2023-04-10',
      ultimoAcceso: '2023-05-19T10:15:00'
    },
    {
      id: 'USER-044',
      nombres: 'Ana Patricia',
      apellidos: 'López Vera',
      cedula: '1122334455',
      telefono: '0966555444',
      email: 'alopez@uleam.edu.ec',
      password: '123456',
      rol: 'invitado',
      facultad: 'Facultad de Administración',
      estado: 'inactivo',
      fechaCreacion: '2023-03-25',
      ultimoAcceso: '2023-04-15T16:45:00'
    }
  ]

  // Computadas
  const usuariosActivos = computed(() => 
    usuarios.value.filter(u => u.estado === 'activo')
  )

  const usuariosPorRol = computed(() => ({
    admin: usuarios.value.filter(u => u.rol === 'admin').length,
    tecnico: usuarios.value.filter(u => u.rol === 'tecnico').length,
    docente: usuarios.value.filter(u => u.rol === 'docente').length,
    invitado: usuarios.value.filter(u => u.rol === 'invitado').length
  }))

  // Acciones
  const initUsuarios = () => {
    const savedUsuarios = localStorage.getItem('uleam_usuarios')
    if (savedUsuarios) {
      usuarios.value = JSON.parse(savedUsuarios)
    } else {
      usuarios.value = usuariosIniciales
      saveToStorage()
    }
  }

  const saveToStorage = () => {
    localStorage.setItem('uleam_usuarios', JSON.stringify(usuarios.value))
  }

  const addUsuario = (usuario) => {
    try {
      const newUsuario = {
        ...usuario,
        id: generateId(),
        fechaCreacion: new Date().toISOString().split('T')[0],
        ultimoAcceso: null,
        estado: 'activo'
      }
      usuarios.value.push(newUsuario)
      saveToStorage()
      return true
    } catch (error) {
      console.error('Error al agregar usuario:', error)
      return false
    }
  }

  const updateUsuario = (id, updates) => {
    const index = usuarios.value.findIndex(u => u.id === id)
    if (index !== -1) {
      usuarios.value[index] = { ...usuarios.value[index], ...updates }
      saveToStorage()
      return usuarios.value[index]
    }
    return null
  }

  const deleteUsuario = (id) => {
    const index = usuarios.value.findIndex(u => u.id === id)
    if (index !== -1) {
      usuarios.value.splice(index, 1)
      saveToStorage()
      return true
    }
    return false
  }

  const toggleUsuarioEstado = (id) => {
    const usuario = usuarios.value.find(u => u.id === id)
    if (usuario) {
      const newEstado = usuario.estado === 'activo' ? 'inactivo' : 'activo'
      return updateUsuario(id, { estado: newEstado })
    }
    return null
  }

  const generateId = () => {
    const count = usuarios.value.length + 1
    return `USER-${(count + 100).toString().padStart(3, '0')}`
  }

  const searchUsuarios = (query) => {
    if (!query) return usuarios.value
    
    const lowercaseQuery = query.toLowerCase()
    return usuarios.value.filter(usuario =>
      usuario.id.toLowerCase().includes(lowercaseQuery) ||
      usuario.nombres.toLowerCase().includes(lowercaseQuery) ||
      usuario.apellidos.toLowerCase().includes(lowercaseQuery) ||
      usuario.email.toLowerCase().includes(lowercaseQuery) ||
      usuario.cedula.includes(lowercaseQuery) ||
      usuario.facultad.toLowerCase().includes(lowercaseQuery)
    )
  }

  const validateEmail = (email) => {
    const existingUser = usuarios.value.find(u => u.email === email)
    return !existingUser
  }

  const validateCedula = (cedula) => {
    const existingUser = usuarios.value.find(u => u.cedula === cedula)
    return !existingUser
  }

  const updateLastAccess = (email) => {
    const usuario = usuarios.value.find(u => u.email === email)
    if (usuario) {
      updateUsuario(usuario.id, { 
        ultimoAcceso: new Date().toISOString() 
      })
    }
  }

  // Inicializar al cargar el store
  initUsuarios()

  return {
    usuarios,
    usuariosActivos,
    usuariosPorRol,
    addUsuario,
    updateUsuario,
    deleteUsuario,
    toggleUsuarioEstado,
    searchUsuarios,
    validateEmail,
    validateCedula,
    updateLastAccess,
    initUsuarios
  }
}
)