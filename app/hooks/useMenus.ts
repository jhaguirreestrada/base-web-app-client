'use client'

import { useState, useEffect } from 'react'

export interface ApiMenuItem {
  id_menu: number
  name: string
  path: string | null
  icon: string | null
  display_order: number
  children: ApiMenuItem[]
}

interface UseMenusReturn {
  menus: ApiMenuItem[]
  isLoading: boolean
  error: string | null
  noMenus: boolean
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

function getTokenFromStorage(): string | null {
  if (typeof window === 'undefined') {
    return null
  }
  const token = localStorage.getItem('auth_token')
  return token
}

function getUserFromStorage(): { id_user?: number; role?: { id_role: number; name: string } } | null {
  if (typeof window === 'undefined') return null
  const userStr = localStorage.getItem('auth_user')
  if (!userStr) return null
  try {
    const user = JSON.parse(userStr)
    return user
  } catch {
    return null
  }
}

export function useMenus(): UseMenusReturn {
  const [menus, setMenus] = useState<ApiMenuItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [noMenus, setNoMenus] = useState(false)

  useEffect(() => {
    
    const fetchMenus = async () => {
      
      const accessToken = getTokenFromStorage()
      const user = getUserFromStorage()
      
      
      if (!accessToken) {
        setNoMenus(true)
        setIsLoading(false)
        return
      }
      
      if (!user?.role?.id_role) {
        setNoMenus(true)
        setIsLoading(false)
        return
      }

      const roleId = user.role.id_role

      try {
        const url = `${API_BASE_URL}/roles/${roleId}/menus`
        
        const res = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          }
        })
        
        
        if (!res.ok) {
          throw new Error(`Error HTTP: ${res.status}`)
        }
        
        const data = await res.json()
        
        if (!data || data.length === 0) {
          setNoMenus(true)
        } else {
          setMenus(data)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
        setNoMenus(true)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMenus()
  }, [])

  return { menus, isLoading, error, noMenus }
}
