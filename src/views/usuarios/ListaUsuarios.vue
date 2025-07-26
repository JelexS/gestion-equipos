<template>
  <AdminLayout>
    <div class="lista-usuarios">
      <!-- Header con título y acciones -->
      <div class="page-header">
        <h1><i class="fas fa-users"></i> Lista de Usuarios</h1>
        <div class="header-actions">
          <router-link to="/usuarios/nuevo" class="btn btn-primary">
            <i class="fas fa-user-plus"></i> Nuevo Usuario
          </router-link>
        </div>
      </div>

      <!-- Filtros y búsqueda -->
      <div class="filters">
        <div class="search-box">
          <input 
            type="text" 
            v-model="searchTerm" 
            placeholder="Buscar por nombre, cédula o email..."
            class="form-control">
          <i class="fas fa-search"></i>
        </div>
        <select v-model="filterRol" class="form-control">
          <option value="">Todos los roles</option>
          <option value="admin">Administrador</option>
          <option value="tecnico">Técnico</option>
          <option value="docente">Docente</option>
          <option value="invitado">Invitado</option>
        </select>
        <select v-model="filterEstado" class="form-control">
          <option value="">Todos los estados</option>
          <option value="activo">Activo</option>
          <option value="inactivo">Inactivo</option>
        </select>
      </div>

      <!-- Tabla de usuarios -->
      <div class="table-responsive">
        <table class="table">
          <thead>
            <tr>
              <th @click="sortBy('id')">
                ID 
                <i :class="getSortIcon('id')"></i>
              </th>
              <th @click="sortBy('nombres')">
                Nombres 
                <i :class="getSortIcon('nombres')"></i>
              </th>
              <th @click="sortBy('cedula')">
                Cédula 
                <i :class="getSortIcon('cedula')"></i>
              </th>
              <th @click="sortBy('email')">
                Email 
                <i :class="getSortIcon('email')"></i>
              </th>
              <th @click="sortBy('rol')">
                Rol 
                <i :class="getSortIcon('rol')"></i>
              </th>
              <th @click="sortBy('facultad')">
                Facultad 
                <i :class="getSortIcon('facultad')"></i>
              </th>
              <th @click="sortBy('estado')">
                Estado 
                <i :class="getSortIcon('estado')"></i>
              </th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="usuario in paginatedUsers" :key="usuario.id">
              <td>{{ usuario.id }}</td>
              <td>{{ usuario.nombres }} {{ usuario.apellidos }}</td>
              <td>{{ usuario.cedula }}</td>
              <td>{{ usuario.email }}</td>
              <td>
                <span :class="['badge', `badge-${usuario.rol}`]">
                  {{ getRolText(usuario.rol) }}
                </span>
              </td>
              <td>{{ usuario.facultad }}</td>
              <td>
                <span :class="['status-badge', usuario.estado]">
                  {{ usuario.estado === 'activo' ? 'Activo' : 'Inactivo' }}
                </span>
              </td>
              <td class="actions">
                <button @click="verDetalles(usuario)" class="btn-icon" title="Ver detalles">
                  <i class="fas fa-eye"></i>
                </button>
                <button @click="editarUsuario(usuario)" class="btn-icon" title="Editar">
                  <i class="fas fa-edit"></i>
                </button>
                <button @click="toggleEstado(usuario)" class="btn-icon" :title="usuario.estado === 'activo' ? 'Desactivar' : 'Activar'">
                  <i :class="usuario.estado === 'activo' ? 'fas fa-user-slash' : 'fas fa-user-check'"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Paginación -->
      <div class="pagination">
        <button 
          @click="currentPage--" 
          :disabled="currentPage === 1"
          class="btn btn-secondary">
          <i class="fas fa-chevron-left"></i>
        </button>
        <span>Página {{ currentPage }} de {{ totalPages }}</span>
        <button 
          @click="currentPage++" 
          :disabled="currentPage === totalPages"
          class="btn btn-secondary">
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>

      <!-- Modal de detalles -->
      <div v-if="selectedUser" class="modal">
        <div class="modal-content">
          <h2>Detalles del Usuario</h2>
          <div class="user-details">
            <p><strong>ID:</strong> {{ selectedUser.id }}</p>
            <p><strong>Nombre completo:</strong> {{ selectedUser.nombres }} {{ selectedUser.apellidos }}</p>
            <p><strong>Cédula:</strong> {{ selectedUser.cedula }}</p>
            <p><strong>Email:</strong> {{ selectedUser.email }}</p>
            <p><strong>Teléfono:</strong> {{ selectedUser.telefono || 'No registrado' }}</p>
            <p><strong>Rol:</strong> {{ getRolText(selectedUser.rol) }}</p>
            <p><strong>Facultad:</strong> {{ selectedUser.facultad }}</p>
            <p><strong>Estado:</strong> {{ selectedUser.estado === 'activo' ? 'Activo' : 'Inactivo' }}</p>
            <p><strong>Fecha de creación:</strong> {{ formatDate(selectedUser.fechaCreacion) }}</p>
            <p><strong>Último acceso:</strong> {{ formatDate(selectedUser.ultimoAcceso) }}</p>
          </div>
          <div class="modal-actions">
            <button @click="selectedUser = null" class="btn btn-secondary">Cerrar</button>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUsuariosStore } from '@/stores/usuarios'
import AdminLayout from '@/components/layout/AdminLayout.vue'

const router = useRouter()
const usuariosStore = useUsuariosStore()

// Estado
const searchTerm = ref('')
const filterRol = ref('')
const filterEstado = ref('')
const currentPage = ref(1)
const itemsPerPage = 10
const selectedUser = ref(null)
const sortField = ref('id')
const sortDirection = ref('asc')

// Computed properties
const filteredUsers = computed(() => {
  let users = [...usuariosStore.usuarios]

  // Filtrar por término de búsqueda
  if (searchTerm.value) {
    const search = searchTerm.value.toLowerCase()
    users = users.filter(user => 
      user.nombres.toLowerCase().includes(search) ||
      user.apellidos.toLowerCase().includes(search) ||
      user.cedula.includes(search) ||
      user.email.toLowerCase().includes(search)
    )
  }

  // Filtrar por rol
  if (filterRol.value) {
    users = users.filter(user => user.rol === filterRol.value)
  }

  // Filtrar por estado
  if (filterEstado.value) {
    users = users.filter(user => user.estado === filterEstado.value)
  }

  // Ordenar
  users.sort((a, b) => {
    let compareA = a[sortField.value]
    let compareB = b[sortField.value]

    if (typeof compareA === 'string') {
      compareA = compareA.toLowerCase()
      compareB = compareB.toLowerCase()
    }

    if (compareA < compareB) return sortDirection.value === 'asc' ? -1 : 1
    if (compareA > compareB) return sortDirection.value === 'asc' ? 1 : -1
    return 0
  })

  return users
})

const totalPages = computed(() => 
  Math.ceil(filteredUsers.value.length / itemsPerPage)
)

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredUsers.value.slice(start, end)
})

// Methods
const sortBy = (field) => {
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortDirection.value = 'asc'
  }
}

const getSortIcon = (field) => {
  if (sortField.value !== field) return 'fas fa-sort'
  return sortDirection.value === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down'
}

const getRolText = (rol) => {
  const roles = {
    'admin': 'Administrador',
    'tecnico': 'Técnico',
    'docente': 'Docente',
    'invitado': 'Invitado'
  }
  return roles[rol] || rol
}

const formatDate = (date) => {
  if (!date) return 'No disponible'
  return new Date(date).toLocaleString('es-ES')
}

const verDetalles = (usuario) => {
  selectedUser.value = usuario
}

const editarUsuario = (usuario) => {
  router.push(`/usuarios/editar/${usuario.id}`)
}

const toggleEstado = async (usuario) => {
  const success = await usuariosStore.toggleUsuarioEstado(usuario.id)
  if (success) {
    // Actualizar la lista
    usuariosStore.initUsuarios()
  }
}

// Watchers
watch([searchTerm, filterRol, filterEstado], () => {
  currentPage.value = 1
})
</script>

<style scoped>
.lista-usuarios {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.filters {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.search-box {
  position: relative;
  flex: 1;
}

.search-box i {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
}

.table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

.table th {
  cursor: pointer;
  padding: 12px;
  background: #f5f5f5;
  text-align: left;
}

.table td {
  padding: 12px;
  border-bottom: 1px solid #eee;
}

.badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.85em;
}

.badge-admin { background: #dc3545; color: white; }
.badge-tecnico { background: #17a2b8; color: white; }
.badge-docente { background: #28a745; color: white; }
.badge-invitado { background: #6c757d; color: white; }

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.85em;
}

.status-badge.activo { 
  background: #28a745; 
  color: white; 
}

.status-badge.inactivo { 
  background: #dc3545; 
  color: white; 
}

.actions {
  display: flex;
  gap: 8px;
}

.btn-icon {
  padding: 6px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background: transparent;
}

.btn-icon:hover {
  background: #f0f0f0;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-top: 20px;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  max-width: 500px;
  width: 90%;
}

.user-details {
  margin: 20px 0;
}

.modal-actions {
  text-align: right;
  margin-top: 20px;
}

@media (max-width: 768px) {
  .filters {
    flex-direction: column;
  }
  
  .table-responsive {
    overflow-x: auto;
  }
}
</style>