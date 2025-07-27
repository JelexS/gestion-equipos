import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useEquiposStore } from './equipos'

export const useMantenimientosStore = defineStore('mantenimientos', () => {
  const mantenimientos = ref([])
  const equiposStore = useEquiposStore()

  // Datos iniciales de ejemplo
  const mantenimientosIniciales = [
    {
      id: 'MANT-001',
      equipoId: 'ULEAM-IT-002',
      tipo: 'correctivo',
      descripcion: 'Pantalla presenta fallas intermitentes',
      tecnicoId: 'USER-042',
      fechaCreacion: '2023-05-15',
      fechaEstimada: '2023-05-20',
      fechaFinalizacion: null,
      prioridad: 'alta',
      estado: 'pendiente',
      costoEstimado: 150.00,
      costoFinal: null,
      observaciones: 'Se requiere reemplazo de panel LCD'
    }
  ]

  // Computadas
  const mantenimientosPendientes = computed(() => 
    mantenimientos.value.filter(m => m.estado === 'pendiente')
  )

  const mantenimientosPorEstado = computed(() => ({
    pendiente: mantenimientos.value.filter(m => m.estado === 'pendiente').length,
    enProceso: mantenimientos.value.filter(m => m.estado === 'en-proceso').length,
    completado: mantenimientos.value.filter(m => m.estado === 'completado').length,
    cancelado: mantenimientos.value.filter(m => m.estado === 'cancelado').length
  }))

  const mantenimientosPorPrioridad = computed(() => ({
    baja: mantenimientos.value.filter(m => m.prioridad === 'baja').length,
    media: mantenimientos.value.filter(m => m.prioridad === 'media').length,
    alta: mantenimientos.value.filter(m => m.prioridad === 'alta').length,
    urgente: mantenimientos.value.filter(m => m.prioridad === 'urgente').length
  }))

  // Acciones
  const initMantenimientos = () => {
    const savedMantenimientos = localStorage.getItem('uleam_mantenimientos')
    if (savedMantenimientos) {
      mantenimientos.value = JSON.parse(savedMantenimientos)
    } else {
      mantenimientos.value = mantenimientosIniciales
      saveToStorage()
    }
  }

  const saveToStorage = () => {
    localStorage.setItem('uleam_mantenimientos', JSON.stringify(mantenimientos.value))
  }

  const generateId = () => {
    const count = mantenimientos.value.length + 1
    return `MANT-${count.toString().padStart(3, '0')}`
  }

  const agregarMantenimiento = async (mantenimiento) => {
    try {
    // Validate required fields
      if (!mantenimiento.equipoId || !mantenimiento.tipo || !mantenimiento.descripcion) {
        throw new Error('Faltan campos requeridos')
      }

      // Crear nuevo registro de mantenimiento
      const nuevoMantenimiento = {
        ...mantenimiento,
        id: generateId(),
        estado: 'pendiente',
        fechaCreacion: new Date().toISOString(),
        fechaFinalizacion: null,
        costoFinal: null
      }

      // Actualizar estado del equipo
      await equiposStore.updateEquipo(mantenimiento.equipoId, {
        estado: 'en-mantenimiento',
        disponible: false
      })

      mantenimientos.value.push(nuevoMantenimiento)
      saveToStorage()
      return true
    } catch (error) {
      console.error('Error al agregar mantenimiento:', error)
      return false
    }
  }

  const actualizarMantenimiento = (id, updates) => {
    const index = mantenimientos.value.findIndex(m => m.id === id)
    if (index !== -1) {
      const mantenimientoActualizado = { 
        ...mantenimientos.value[index], 
        ...updates 
      }
      
      mantenimientos.value[index] = mantenimientoActualizado

      // Si el mantenimiento se completa, actualizar el equipo
      if (updates.estado === 'completado') {
        equiposStore.updateEquipo(mantenimientoActualizado.equipoId, {
          estado: 'activo',
          disponible: true
        })
      }

      saveToStorage()
      return mantenimientoActualizado
    }
    return null
  }

  const eliminarMantenimiento = (id) => {
    const index = mantenimientos.value.findIndex(m => m.id === id)
    if (index !== -1) {
      mantenimientos.value.splice(index, 1)
      saveToStorage()
      return true
    }
    return false
  }

  const getMantenimientosPorEquipo = (equipoId) => {
    return mantenimientos.value
      .filter(m => m.equipoId === equipoId)
      .sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion))
  }

  const buscarMantenimientos = (query) => {
    if (!query) return mantenimientos.value
    
    const lowercaseQuery = query.toLowerCase()
    return mantenimientos.value.filter(mantenimiento =>
      mantenimiento.id.toLowerCase().includes(lowercaseQuery) ||
      mantenimiento.descripcion.toLowerCase().includes(lowercaseQuery) ||
      mantenimiento.estado.toLowerCase().includes(lowercaseQuery)
    )
  }

  // Inicializar al cargar el store
  initMantenimientos()

  return {
    mantenimientos,
    mantenimientosPendientes,
    mantenimientosPorEstado,
    mantenimientosPorPrioridad,
    agregarMantenimiento,
    actualizarMantenimiento,
    eliminarMantenimiento,
    getMantenimientosPorEquipo,
    buscarMantenimientos,
    initMantenimientos
  }
})