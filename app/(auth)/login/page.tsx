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
  const [showForcedChangeModal, setShowForcedChangeModal] = useState(false)
  const [showExpiredPasswordModal, setShowExpiredPasswordModal] = useState(false)
  const [showPasswordWarningModal, setShowPasswordWarningModal] = useState(false)
  const [daysUntilExpiry, setDaysUntilExpiry] = useState(0)
  const [showBlockedModal, setShowBlockedModal] = useState(false)
  const [loginAttempts, setLoginAttempts] = useState(0)
  const [failedUserId, setFailedUserId] = useState<number | null>(null)
  const [blockErrorMessage, setBlockErrorMessage] = useState('')
  const [showBlockErrorModal, setShowBlockErrorModal] = useState(false)

  const getDaysUntilExpiry = (expiryDate: string): number => {
    const expiry = new Date(expiryDate)
    const now = new Date()
    const diffTime = expiry.getTime() - now.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const handleProceedToChangePassword = () => {
    router.push('/change-password')
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('noMenus') === 'true') {
      setShowNoMenusModal(true)
    }

    if (sessionStorage.getItem('reset_login_modals') === 'true') {
      sessionStorage.removeItem('reset_login_modals')
      setShowNoMenusModal(false)
      setShowErrorModal(false)
      setShowForcedChangeModal(false)
      setShowExpiredPasswordModal(false)
      setShowBlockedModal(false)
      setLoginAttempts(0)
      const failedUser = localStorage.getItem('failed_login_username')
      if (failedUser) {
        localStorage.removeItem(`login_attempts_${failedUser}`)
        localStorage.removeItem('failed_login_username')
      }
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
        setIsLoading(false)
        
        switch (data.codeError) {
          case 1:
            setErrorMessage(data.message || 'Credenciales inválidas')
            await handleLoginFailure(email)
            break
          case 2:
            setErrorMessage(data.message || 'Usuario no encontrado')
            setShowErrorModal(true)
            break
          case 3:
            setErrorMessage(data.message || 'Usuario eliminado')
            setShowErrorModal(true)
            break
          case 4:
            setErrorMessage(data.message || 'Usuario bloqueado')
            setShowErrorModal(true)
            break
          default:
            setErrorMessage(data.message || 'Error al iniciar sesión')
            setShowErrorModal(true)
        }
        return
      }

      const data = await response.json()

      const userState = data.user?.state
      const passwordExpiry = data.user?.password_expiry_date

      localStorage.setItem('auth_token', data.access_token)
      localStorage.setItem('auth_user', JSON.stringify(data.user))

      const warningDays = parseInt(process.env.NEXT_PUBLIC_PASSWORD_WARNING_DAYS || '5')

      if (userState === 'F') {
        setShowForcedChangeModal(true)
        setIsLoading(false)
        return
      }

      if (userState === 'A' && passwordExpiry) {
        const expiryDate = new Date(passwordExpiry)
        if (expiryDate <= new Date()) {
          setShowExpiredPasswordModal(true)
          setIsLoading(false)
          return
        }
        
        const days = getDaysUntilExpiry(passwordExpiry)
        if (days > 0 && days <= warningDays) {
          setDaysUntilExpiry(days)
          setShowPasswordWarningModal(true)
          setIsLoading(false)
          return
        } else {
          const hasMenus = await checkMenusAndRedirect(data.access_token, data.user)
          
          if (hasMenus) {
            router.push('/dashboard')
            router.refresh()
          }
        }
      }

      if (!passwordExpiry) {
        const hasMenus = await checkMenusAndRedirect(data.access_token, data.user)
        
        if (hasMenus) {
          router.push('/dashboard')
          router.refresh()
        }
      }
    } catch {
      setShowErrorModal(true)
      setErrorMessage('Error al conectar con el servidor')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    
    const failedUser = localStorage.getItem('failed_login_username')
    if (failedUser) {
      localStorage.removeItem(`login_attempts_${failedUser}`)
      localStorage.removeItem('failed_login_username')
    }
    
    window.history.replaceState({}, '', '/login')
    setShowNoMenusModal(false)
    setShowBlockedModal(false)
    setShowPasswordWarningModal(false)
    setLoginAttempts(0)
  }

  const blockUser = async (username: string): Promise<boolean> => {
    try {
      const res = await fetch('http://localhost:3000/users/block', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      })
      
      if (res.ok) {
        return true
      }
      
      const errorData = await res.json()
      setBlockErrorMessage(errorData.message)
      return false
    } catch (error) {
      setBlockErrorMessage('Error al conectar con el servidor')
      return false
    }
  }

  const getAttemptsForUsername = (username: string): number => {
    const key = `login_attempts_${username}`
    return parseInt(localStorage.getItem(key) || '0', 10)
  }

  const setAttemptsForUsername = (username: string, attempts: number) => {
    const key = `login_attempts_${username}`
    if (attempts === 0) {
      localStorage.removeItem(key)
    } else {
      localStorage.setItem(key, attempts.toString())
    }
  }

  const handleLoginFailure = (username: string) => {
    const currentAttempts = getAttemptsForUsername(username)
    const newAttempts = currentAttempts + 1
    
    setAttemptsForUsername(username, newAttempts)
    localStorage.setItem('failed_login_username', username)
    setLoginAttempts(newAttempts)
    
    if (newAttempts >= 3) {
      blockUser(username).then((blocked) => {
        if (blocked) {
          setShowBlockedModal(true)
        } else {
          setShowBlockErrorModal(true)
        }
        setAttemptsForUsername(username, 0)
        localStorage.removeItem('failed_login_username')
        setLoginAttempts(0)
      })
    } else {
      setShowErrorModal(true)
    }
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

            <div className="flex justify-end">
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
              onClick={() => {
                setShowErrorModal(false)
              }}
              className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Aceptar
            </button>
          </div>
        </div>
      )}

      {showForcedChangeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card border border-border rounded-2xl p-8 max-w-md mx-4 shadow-2xl">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-center text-foreground mb-4">
              Cambio de contraseña requerido
            </h2>
            <p className="text-center text-muted-foreground mb-6">
              Su contraseña debe ser cambiada. Por favor, proceda a modificar su contraseña para continuar.
            </p>
            <button
              onClick={handleProceedToChangePassword}
              className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Proceder
            </button>
          </div>
        </div>
      )}

      {showExpiredPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card border border-border rounded-2xl p-8 max-w-md mx-4 shadow-2xl">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-center text-foreground mb-4">
              Contraseña expirada
            </h2>
            <p className="text-center text-muted-foreground mb-6">
              Su contraseña ha vencido. Debe cambiarla para continuar.
            </p>
            <button
              onClick={handleProceedToChangePassword}
              className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Proceder
            </button>
          </div>
        </div>
      )}

      {showPasswordWarningModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card border border-border rounded-2xl p-8 max-w-md mx-4 shadow-2xl">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-center text-foreground mb-4">
              Contraseña por vencer
            </h2>
            <p className="text-center text-muted-foreground mb-6">
              Su contraseña vencerá en {daysUntilExpiry === 1 ? '1 día' : `${daysUntilExpiry} días`}. Le recomendamos cambiarla pronto.
            </p>
              <button
                onClick={() => {
                  setShowPasswordWarningModal(false)
                  router.push('/dashboard')
                  router.refresh()
                }}
                className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Continuar
            </button>
          </div>
        </div>
      )}

      {showBlockedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card border border-border rounded-2xl p-8 max-w-md mx-4 shadow-2xl">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-center text-foreground mb-4">
              Usuario bloqueado
            </h2>
            <p className="text-center text-muted-foreground mb-6">
              Usuario bloqueado. Contacte al administrador.
            </p>
            <button
              onClick={() => {
                setShowBlockedModal(false)
                setLoginAttempts(0)
                router.push('/login')
                router.refresh()
              }}
              className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Aceptar
            </button>
          </div>
        </div>
      )}

      {showBlockErrorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card border border-border rounded-2xl p-8 max-w-md mx-4 shadow-2xl">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-center text-foreground mb-4">
              Error
            </h2>
            <p className="text-center text-muted-foreground mb-6">
              {blockErrorMessage}
            </p>
            <button
              onClick={() => {
                setShowBlockErrorModal(false)
                setLoginAttempts(0)
                router.push('/login')
                router.refresh()
              }}
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
