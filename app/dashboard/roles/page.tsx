'use client'

import { useState, useEffect } from 'react'
import { Pencil, Trash2, Plus } from 'lucide-react'

interface Role {
  id_role: number
  name: string
  description: string
  created_by: string
  created_at: string
  updated_by: string | null
  updated_at: string | null
}

function formatDate(dateString: string | null): string {
  if (!dateString) return '-'
  const date = new Date(dateString)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

function getTokenFromStorage(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('auth_token')
}

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null
  return null
}

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRoles = async () => {
      const accessToken = getTokenFromStorage()
      if (!accessToken) {
        setIsLoading(false)
        return
      }

      try {
        const res = await fetch('http://localhost:3000/roles', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          }
        })

        if (!res.ok) {
          throw new Error('Error al cargar los roles')
        }

        const data = await res.json()
        setRoles(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setIsLoading(false)
      }
    }

    fetchRoles()
  }, [])

  const handleEdit = (id: number) => {
  }

  const handleDelete = (id: number) => {
  }

  const handleAddRole = () => {
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-red-500 p-4">Error: {error}</div>
    )
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
                <th className="px-4 py-3 text-sm font-medium text-left">Nombre</th>
                <th className="px-4 py-3 text-sm font-medium text-left">Descripción</th>
                <th className="px-4 py-3 text-sm font-medium text-center">Fecha Creación</th>
                <th className="px-4 py-3 text-sm font-medium text-center">Fecha Actualización</th>
                <th className="px-4 py-3 text-sm font-medium text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role, index) => (
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
                        onClick={() => handleEdit(role.id_role)}
                        className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(role.id_role)}
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

      <div className="flex justify-end mt-4">
        <button
          onClick={handleAddRole}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Agregar Rol
        </button>
      </div>
    </div>
  )
}