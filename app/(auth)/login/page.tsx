'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, LayoutGrid, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showNoMenusModal, setShowNoMenusModal] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('noMenus') === 'true') {
      setShowNoMenusModal(true)
    }
  }, [])

  const checkMenusAndRedirect = async (token: string, user: any) => {
    try {
      const roleId = user.role?.id_role
      if (!roleId) {
        setShowNoMenusModal(true)
        return false
      }

      const res = await fetch(`http://localhost:3000/roles/${roleId}/menus`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      })

      if (!res.ok) {
        setShowNoMenusModal(true)
        return false
      }

      const data = await res.json()
      if (!data || data.length === 0) {
        setShowNoMenusModal(true)
        return false
      }

      return true
    } catch {
      setShowNoMenusModal(true)
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setShowErrorModal(false)
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        credentials: 'include',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: email, password }),
      })

      if (!response.ok) {
        const data = await response.json()
        setErrorMessage(data.message || 'Credenciales inválidas')
        setShowErrorModal(true)
        setIsLoading(false)
        return
      }

      const data = await response.json()

      const userState = data.user?.state
      const passwordExpiry = data.user?.password_expiry_date

      if (userState !== 'A' && userState !== 'F') {
        setErrorMessage(data.message || 'Usuario inactivo o eliminado')
        setShowErrorModal(true)
        setIsLoading(false)
        return
      }

      localStorage.setItem('auth_token', data.access_token)
      localStorage.setItem('auth_user', JSON.stringify(data.user))

      if (userState === 'F') {
        router.push('/change-password')
        return
      }

      if (userState === 'A' && passwordExpiry) {
        const expiryDate = new Date(passwordExpiry)
        if (expiryDate < new Date()) {
          router.push('/change-password')
          return
        }
      }

      const hasMenus = await checkMenusAndRedirect(data.access_token, data.user)
      
      if (hasMenus) {
        router.push('/dashboard')
        router.refresh()
      }
    } catch {
      setErrorMessage('Error al conectar con el servidor')
      setShowErrorModal(true)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    window.history.replaceState({}, '', '/login')
    setShowNoMenusModal(false)
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative" style={{
      backgroundImage: 'url(https://images.unsplash.com/photo-1557683316-973673baf926?w=1920&q=80)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30"></div>

      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 border border-white/20 shadow-2xl">
            <LayoutGrid className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white drop-shadow-lg">Base Web App</h1>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5 pt-2">
            <div>
              <label className="block text-sm font-medium mb-2">Usuario</label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ingresa tu usuario"
                className="w-full px-4 py-3 bg-secondary rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Contraseña</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingresa tu contraseña"
                  className="w-full px-4 py-3 pr-12 bg-secondary rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded border-border" />
                <span className="text-sm">Recordarme</span>
              </label>
              <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>
        </div>
      </div>

      {showNoMenusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card border border-border rounded-2xl p-8 max-w-md mx-4 shadow-2xl">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-center text-foreground mb-4">
              Sin acceso al sistema
            </h2>
            <p className="text-center text-muted-foreground mb-6">
              Su ROL no tiene menús asignados. Por favor, contacta al administrador del sistema para que te asigne los permisos correspondientes.
            </p>
            <button
              onClick={handleLogout}
              className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Aceptar
            </button>
          </div>
        </div>
      )}

      {showErrorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card border border-border rounded-2xl p-8 max-w-md mx-4 shadow-2xl">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-center text-foreground mb-4">
              Error de autenticación
            </h2>
            <p className="text-center text-muted-foreground mb-6">
              {errorMessage}
            </p>
            <button
              onClick={() => setShowErrorModal(false)}
              className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Aceptar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
