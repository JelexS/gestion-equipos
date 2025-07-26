import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useEquiposStore = defineStore('equipos', () => {
  const equipos = ref([])

  // Datos iniciales
  const equiposIniciales = [
    {
      id: 'ULEAM-IT-001',
      tipo: 'Laptop',
      marca: 'HP',
      modelo: 'ProBook 450 G8',
      serial: 'ABC123XYZ',
      estado: 'activo',
      ubicacion: 'Fac. Ingeniería - Lab. 3',
      responsable: 'Dr. Juan Pérez',
      disponible: false,
      procesador: 'Intel i5-1135G7',
      ram: '8',
      almacenamiento: '512GB SSD',
      fechaRegistro: '2023-01-15',
      fechaAsignacion: '2023-01-20',
      observaciones: 'Equipo para laboratorio de programación'
    },
    {
      id: 'ULEAM-IT-002',
      tipo: 'Monitor',
      marca: 'Dell',
      modelo: 'UltraSharp U2419H',
      serial: 'DEF456UVW',
      estado: 'en-mantenimiento',
      ubicacion: 'Fac. Arquitectura',
      responsable: 'Arq. María Gómez',
      disponible: false,
      procesador: '',
      ram: '',
      almacenamiento: '',
      fechaRegistro: '2023-02-10',
      fechaAsignacion: '2023-02-15',
      observaciones: 'Monitor para diseño CAD'
    },
    {
      id: 'ULEAM-IT-003',
      tipo: 'Laptop',
      marca: 'HP',
      modelo: 'EliteBook 840 G8',
      serial: 'GHI789XYZ',
      estado: 'disponible',
      ubicacion: 'Almacén Central',
      responsable: '',
      disponible: true,
      procesador: 'Intel i7-1165G7',
      ram: '16',
      almacenamiento: '1TB SSD',
      fechaRegistro: '2023-03-05',
      fechaAsignacion: '',
      observaciones: 'Equipo disponible para asignación'
    },
    {
      id: 'ULEAM-IT-004',
      tipo: 'PC de Escritorio',
      marca: 'Lenovo',
      modelo: 'ThinkCentre M75q',
      serial: 'JKL012ABC',
      estado: 'asignado',
      ubicacion: 'Fac. Medicina',
      responsable: 'Dr. Luis Vargas',
      disponible: false,
      procesador: 'AMD Ryzen 5 PRO',
      ram: '8',
      almacenamiento: '256GB SSD',
      fechaRegistro: '2023-03-20',
      fechaAsignacion: '2023-03-25',
      observaciones: 'PC para consulta médica'
    },
    {
      id: 'ULEAM-IT-005',
      tipo: 'Impresora',
      marca: 'Epson',
      modelo: 'WorkForce WF-2860',
      serial: 'MNO345DEF',
      estado: 'dañado',
      ubicacion: 'Fac. Administración',
      responsable: 'Lic. Ana Beltrán',
      disponible: false,
      procesador: '',
      ram: '',
      almacenamiento: '',
      fechaRegistro: '2023-04-01',
      fechaAsignacion: '2023-04-05',
      observaciones: 'Impresora dada de baja por daño irreparable'
    }
  ]

  // Computadas
  const equiposDisponibles = computed(() => 
    equipos.value.filter(e => e.disponible && e.estado === 'disponible')
  )

  const equiposPorEstado = computed(() => ({
    activo: equipos.value.filter(e => e.estado === 'activo').length,
    disponible: equipos.value.filter(e => e.estado === 'disponible').length,
    mantenimiento: equipos.value.filter(e => e.estado === 'en-mantenimiento').length,
    dañado: equipos.value.filter(e => e.estado === 'dañado').length,
    asignado: equipos.value.filter(e => e.estado === 'asignado').length
  }))

  // Acciones
  const initEquipos = () => {
    const savedEquipos = localStorage.getItem('uleam_equipos')
    if (savedEquipos) {
      equipos.value = JSON.parse(savedEquipos)
    } else {
      equipos.value = equiposIniciales
      saveToStorage()
    }
  }

  const saveToStorage = () => {
    localStorage.setItem('uleam_equipos', JSON.stringify(equipos.value))
  }

  const addEquipo = (equipo) => {
    const newEquipo = {
      ...equipo,
      id: generateId(),
      fechaRegistro: new Date().toISOString().split('T')[0],
      fechaAsignacion: '',
      responsable: '',
      ubicacion: equipo.disponible === 'si' ? 'Almacén Central' : equipo.ubicacion || ''
    }
    equipos.value.push(newEquipo)
    saveToStorage()
    return newEquipo
  }

  const updateEquipo = (id, updates) => {
    const index = equipos.value.findIndex(e => e.id === id)
    if (index !== -1) {
      equipos.value[index] = { ...equipos.value[index], ...updates }
      saveToStorage()
      return equipos.value[index]
    }
    return null
  }

  const deleteEquipo = (id) => {
    const index = equipos.value.findIndex(e => e.id === id)
    if (index !== -1) {
      equipos.value.splice(index, 1)
      saveToStorage()
      return true
    }
    return false
  }

  const asignarEquipos = (equipoIds, asignacion) => {
    const equiposAsignados = []
    
    equipoIds.forEach(id => {
      const equipo = equipos.value.find(e => e.id === id)
      if (equipo && equipo.disponible) {
        const updates = {
          estado: 'asignado',
          disponible: false,
          responsable: asignacion.responsable,
          ubicacion: asignacion.ubicacion,
          fechaAsignacion: asignacion.fecha,
          observaciones: asignacion.comentarios || equipo.observaciones
        }
        
        const updated = updateEquipo(id, updates)
        if (updated) {
          equiposAsignados.push(updated)
        }
      }
    })
    
    return equiposAsignados
  }

  const liberarEquipo = (id) => {
    return updateEquipo(id, {
      estado: 'disponible',
      disponible: true,
      responsable: '',
      ubicacion: 'Almacén Central',
      fechaAsignacion: ''
    })
  }

  const generateId = () => {
    const count = equipos.value.length + 1
    return `ULEAM-IT-${count.toString().padStart(3, '0')}`
  }

  const searchEquipos = (query) => {
    if (!query) return equipos.value
    
    const lowercaseQuery = query.toLowerCase()
    return equipos.value.filter(equipo =>
      equipo.id.toLowerCase().includes(lowercaseQuery) ||
      equipo.tipo.toLowerCase().includes(lowercaseQuery) ||
      equipo.marca.toLowerCase().includes(lowercaseQuery) ||
      equipo.modelo.toLowerCase().includes(lowercaseQuery) ||
      equipo.serial.toLowerCase().includes(lowercaseQuery) ||
      equipo.responsable.toLowerCase().includes(lowercaseQuery) ||
      equipo.ubicacion.toLowerCase().includes(lowercaseQuery)
    )
  }

  // Inicializar al cargar el store
  initEquipos()

  return {
    equipos,
    equiposDisponibles,
    equiposPorEstado,
    addEquipo,
    updateEquipo,
    deleteEquipo,
    asignarEquipos,
    liberarEquipo,
    searchEquipos,
    initEquipos
  }
})