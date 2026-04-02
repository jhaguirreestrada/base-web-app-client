'use client'

import { useState, useEffect } from 'react'
import { Pencil, Trash2, Plus, X, Check, AlertTriangle, ArrowUp, ArrowDown } from 'lucide-react'
import ServerError from '@/components/ui/ServerError'

interface Role {
  id_role: number
  name: string
  description: string
  created_by: string
  created_at: string
  updated_by: string | null
  updated_at: string | null
}

interface FormData {
  name: string
  description: string
  created_at: string
  created_by: string
  updated_at: string
  updated_by: string
}

interface FormErrors {
  name: string
  description: string
}

function formatDate(dateString: string | null): string {
  if (!dateString) return '-'
  const date = new Date(dateString)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

function formatDateTime(dateString: string | null): string {
  if (!dateString) return '-'
  const date = new Date(dateString)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`
}

function getTokenFromStorage(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('auth_token')
}

function getUserFromStorage(): { username: string } | null {
  if (typeof window === 'undefined') return null
  const userStr = localStorage.getItem('auth_user')
  if (!userStr) return null
  try {
    return JSON.parse(userStr)
  } catch {
    return null
  }
}

const initialFormData: FormData = {
  name: '',
  description: '',
  created_at: '',
  created_by: '',
  updated_at: '',
  updated_by: '',
}

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [showModal, setShowModal] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [errors, setErrors] = useState<FormErrors>({ name: '', description: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null)
  
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const [sortField, setSortField] = useState<keyof Role | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [total, setTotal] = useState(0)
  const pageSize = parseInt(process.env.NEXT_PUBLIC_PAGE_SIZE || '10')
  const [visiblePages, setVisiblePages] = useState<number[]>([1, 2, 3, 4, 5])

  const calculateVisiblePages = (current: number, total: number): number[] => {
    const pagesToShow = 5
    let start = Math.max(1, current - Math.floor(pagesToShow / 2))
    let end = Math.min(total, start + pagesToShow - 1)
    
    if (end - start + 1 < pagesToShow) {
      start = Math.max(1, end - pagesToShow + 1)
    }
    
    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
  }

  const fetchRoles = async (page: number = 1) => {
    const accessToken = getTokenFromStorage()
    if (!accessToken) {
      setIsLoading(false)
      return
    }

    try {
      const res = await fetch(`http://localhost:3000/roles?page=${page}&limit=${pageSize}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        }
      })

      if (!res.ok) {
        throw new Error('Error al cargar los roles')
      }

      const data = await res.json()
      setRoles(data.data)
      setTotal(data.total)
      setTotalPages(data.totalPages)
      setCurrentPage(data.page)
      setVisiblePages(calculateVisiblePages(data.page, data.totalPages))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchRoles(1)
  }, [pageSize])
  const handleSort = (field: keyof Role) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const sortedRoles = [...roles].sort((a, b) => {
    if (!sortField) return 0
    const aValue = a[sortField]
    const bValue = b[sortField]
    if (aValue === null || aValue === undefined) return 1
    if (bValue === null || bValue === undefined) return -1
    const comparison = String(aValue).localeCompare(String(bValue))
    return sortDirection === 'asc' ? comparison : -comparison
  })

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchRoles(newPage)
      setVisiblePages(calculateVisiblePages(newPage, totalPages))
    }
  }

  const handleFirstPage = () => {
    fetchRoles(1)
    setVisiblePages(calculateVisiblePages(1, totalPages))
  }

  const handleLastPage = () => {
    fetchRoles(totalPages)
    setVisiblePages(calculateVisiblePages(totalPages, totalPages))
  }

  const handlePrevPage = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1
      fetchRoles(newPage)
      setVisiblePages(calculateVisiblePages(newPage, totalPages))
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      const newPage = currentPage + 1
      fetchRoles(newPage)
      setVisiblePages(calculateVisiblePages(newPage, totalPages))
    }
  }

  const handleEdit = (role: Role) => {
    setSelectedRole(role)
    setIsEditing(true)
    setFormData({
      name: role.name,
      description: role.description,
      created_at: formatDateTime(role.created_at),
      created_by: role.created_by,
      updated_at: formatDateTime(role.updated_at),
      updated_by: role.updated_by || '',
    })
    setErrors({ name: '', description: '' })
    setShowModal(true)
  }

  const handleDelete = (role: Role) => {
    setRoleToDelete(role)
    setShowDeleteModal(true)
  }

  const handleConfirmDelete = async () => {
    if (!roleToDelete) return
    
    const token = getTokenFromStorage()
    if (!token) return
    
    try {
      const res = await fetch(`http://localhost:3000/roles/${roleToDelete.id_role}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      })
      
      if (res.ok) {
        const newTotal = total - 1
        setTotal(newTotal)
        const newTotalPages = Math.ceil(newTotal / pageSize)
        setTotalPages(newTotalPages)
        let newPage = currentPage
        if (currentPage > newTotalPages && newTotalPages > 0) {
          newPage = newTotalPages
        }
        fetchRoles(newPage)
        setSuccessMessage('Rol eliminado correctamente')
        setShowSuccessModal(true)
      } else {
        const errorData = await res.json().catch(() => ({}))
        setErrorMessage(errorData.message || 'Error al eliminar el rol')
        setShowErrorModal(true)
      }
    } catch (err) {
      setErrorMessage('Error de conexión. Por favor, intente más tarde.')
      setShowErrorModal(true)
    }
    
    setShowDeleteModal(false)
    setRoleToDelete(null)
  }

  const handleAddRole = () => {
    setSelectedRole(null)
    setIsEditing(false)
    setFormData({
      name: '',
      description: '',
      created_at: '-',
      created_by: '',
      updated_at: '-',
      updated_by: '',
    })
    setErrors({ name: '', description: '' })
    setShowModal(true)
  }

  const handleCancel = () => {
    setShowModal(false)
    setErrors({ name: '', description: '' })
    setFormData(initialFormData)
  }

  const handleSubmit = async () => {
    const newErrors: FormErrors = { name: '', description: '' }
    if (!formData.name.trim()) newErrors.name = 'Este campo es requerido'
    if (!formData.description.trim()) newErrors.description = 'Este campo es requerido'
    
    if (newErrors.name || newErrors.description) {
      setErrors(newErrors)
      return
    }
    
    setIsSubmitting(true)
    const token = getTokenFromStorage()
    const user = getUserFromStorage()
    
    if (!token || !user) {
      setIsSubmitting(false)
      return
    }
    
    try {
      if (isEditing && selectedRole) {
        const res = await fetch(`http://localhost:3000/roles/${selectedRole.id_role}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: formData.name,
            description: formData.description,
            updated_by: user.username,
          }),
        })
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}))
          setErrorMessage(errorData.message || 'Error al modificar el rol')
          setShowErrorModal(true)
          setIsSubmitting(false)
          return
        }
        
        const now = new Date().toISOString()
        setRoles(roles.map(r => 
          r.id_role === selectedRole.id_role 
            ? { ...r, name: formData.name, description: formData.description, updated_by: user.username, updated_at: now }
            : r
        ))
        setSuccessMessage('Rol modificado correctamente')
        setShowSuccessModal(true)
      } else {
        const res = await fetch('http://localhost:3000/roles', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: formData.name,
            description: formData.description,
            created_by: user.username,
          }),
        })
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}))
          setErrorMessage(errorData.message || 'Error al agregar el rol')
          setShowErrorModal(true)
          setIsSubmitting(false)
          return
        }
        
        const newRole = await res.json()
        fetchRoles(1)
        setSuccessMessage('Rol agregado correctamente')
        setShowSuccessModal(true)
      }
      
      setShowModal(false)
    } catch (err) {
      setErrorMessage('Error de conexión. Por favor, intente más tarde.')
      setShowErrorModal(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (error) {
    return <ServerError message={error} onRetry={() => fetchRoles(1)} showBackButton={false} />
  }

  return (
    <div>
      <div className="mb-6 ml-2">
        <h1 className="text-2xl font-bold text-foreground">Roles</h1>
        <p className="text-muted-foreground mt-1">Mantenedor de Roles</p>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-secondary border-b border-border">
                <th 
                  className="px-4 py-3 text-sm font-medium text-left cursor-pointer hover:bg-secondary/50"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-1">
                    Nombre
                    {sortField === 'name' && (sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />)}
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-sm font-medium text-left cursor-pointer hover:bg-secondary/50"
                  onClick={() => handleSort('description')}
                >
                  <div className="flex items-center gap-1">
                    Descripción
                    {sortField === 'description' && (sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />)}
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-sm font-medium text-center cursor-pointer hover:bg-secondary/50"
                  onClick={() => handleSort('created_at')}
                >
                  <div className="flex items-center justify-center gap-1">
                    Fecha Creación
                    {sortField === 'created_at' && (sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />)}
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-sm font-medium text-center cursor-pointer hover:bg-secondary/50"
                  onClick={() => handleSort('updated_at')}
                >
                  <div className="flex items-center justify-center gap-1">
                    Fecha Actualización
                    {sortField === 'updated_at' && (sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />)}
                  </div>
                </th>
                <th className="px-4 py-3 text-sm font-medium text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {sortedRoles.map((role, index) => (
                <tr 
                  key={role.id_role} 
                  className={`border-b border-border ${index % 2 === 0 ? 'bg-secondary/30' : 'bg-background'}`}
                >
                  <td className="px-4 py-3 text-sm font-medium">{role.name}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{role.description}</td>
                  <td className="px-4 py-3 text-sm text-center">{formatDate(role.created_at)}</td>
                  <td className="px-4 py-3 text-sm text-center">{formatDate(role.updated_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(role)}
                        className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(role)}
                        className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

       <div className="flex items-center justify-between mt-4">
        <span className="text-sm text-muted-foreground">
          Mostrando {roles.length} de {total} registros
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={handleFirstPage}
            disabled={currentPage === 1}
            className="w-8 h-8 border border-border flex items-center justify-center text-sm hover:bg-secondary hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
          >
            «
          </button>
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="w-8 h-8 border border-border flex items-center justify-center text-sm hover:bg-secondary hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
          >
            ‹
          </button>
          {visiblePages.map(page => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`w-8 h-8 border border-border flex items-center justify-center text-sm hover:bg-secondary hover:text-foreground transition-colors ${
                currentPage === page ? 'bg-secondary font-bold' : ''
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={handleNextPage}
            disabled={currentPage >= totalPages}
            className="w-8 h-8 border border-border flex items-center justify-center text-sm hover:bg-secondary hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
          >
            ›
          </button>
          <button
            onClick={handleLastPage}
            disabled={currentPage === totalPages || totalPages === 0}
            className="w-8 h-8 border border-border flex items-center justify-center text-sm hover:bg-secondary hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
          >
            »
          </button>
        </div>
      </div>

      <div className="flex justify-start mt-4">
        <button
          onClick={handleAddRole}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Agregar Rol
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-xl p-6 max-w-lg w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {isEditing ? 'Modificar Rol' : 'Agregar Rol'}
              </h2>
              <button
                onClick={handleCancel}
                className="p-2 text-muted-foreground hover:text-foreground rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value })
                    setErrors({ ...errors, name: '' })
                  }}
                  className={`w-full px-4 py-2 bg-secondary rounded-lg border ${
                    errors.name ? 'border-red-500 focus:ring-red-500' : 'border-border focus:ring-primary'
                  } focus:outline-none focus:ring-2`}
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Descripción <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => {
                    setFormData({ ...formData, description: e.target.value })
                    setErrors({ ...errors, description: '' })
                  }}
                  rows={3}
                  className={`w-full px-4 py-2 bg-secondary rounded-lg border ${
                    errors.description ? 'border-red-500 focus:ring-red-500' : 'border-border focus:ring-primary'
                  } focus:outline-none focus:ring-2 resize-none`}
                />
                {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Fecha Creación</label>
                  <input
                    type="text"
                    value={formData.created_at}
                    disabled
                    className="w-full px-4 py-2 bg-secondary/50 rounded-lg border border-border cursor-not-allowed opacity-50 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Usuario Creación</label>
                  <input
                    type="text"
                    value={formData.created_by}
                    disabled
                    className="w-full px-4 py-2 bg-secondary/50 rounded-lg border border-border cursor-not-allowed opacity-50 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Fecha Modificación</label>
                  <input
                    type="text"
                    value={formData.updated_at}
                    disabled
                    className="w-full px-4 py-2 bg-secondary/50 rounded-lg border border-border cursor-not-allowed opacity-50 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Usuario Modificación</label>
                  <input
                    type="text"
                    value={formData.updated_by}
                    disabled
                    className="w-full px-4 py-2 bg-secondary/50 rounded-lg border border-border cursor-not-allowed opacity-50 text-sm"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Guardando...' : (isEditing ? 'Modificar' : 'Agregar')}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-xl p-6 max-w-sm w-full mx-4">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Confirmar eliminación</h3>
              <p className="text-muted-foreground mb-6">
                ¿Está seguro de eliminar el rol <strong>{roleToDelete?.name}</strong>?
              </p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => {
                    setShowDeleteModal(false)
                    setRoleToDelete(null)
                  }}
                  className="flex-1 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-green-500 rounded-xl p-6 max-w-sm w-full mx-4">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
                <Check className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Éxito</h3>
              <p className="text-muted-foreground mb-6">{successMessage}</p>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}

      {showErrorModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-red-500 rounded-xl p-6 max-w-sm w-full mx-4">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mb-4">
                <X className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Error</h3>
              <p className="text-muted-foreground mb-6">{errorMessage}</p>
              <button
                onClick={() => setShowErrorModal(false)}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
