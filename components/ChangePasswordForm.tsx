'use client'

import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, KeyRound, RotateCcw, CheckCircle, XCircle } from 'lucide-react'

const FORBIDDEN_SEQUENCES = [
  '1234567890', '0123456789', '0987654321', '9876543210',
  '123456789', '012345678', '12345678', '1234567', '123456',
  '12345', '1234', '123',
  'qwerty', 'qwertyuiop', 'asdf', 'asdfghjkl', 'zxcv', 'zxcvbnm',
  '1qaz', '2wsx', '3edc',
  'abc', 'xyz', 'bcd', 'cde',
]

const containsSequence = (password: string): boolean => {
  const lower = password.toLowerCase()
  for (const seq of FORBIDDEN_SEQUENCES) {
    if (lower.includes(seq)) return true
  }
  return false
}

const PASSWORD_CRITERIA = [
  { key: 'length', label: 'Longitud mínima 8 caracteres', test: (p: string) => p.length >= 8 },
  { key: 'chars', label: 'Debe poseer una mayúscula, minúscula y un número', test: (p: string) => /[A-Z]/.test(p) && /[a-z]/.test(p) && /[0-9]/.test(p) },
  { key: 'symbol', label: 'Debe poseer al menos un símbolo (!@#$%^&*)', test: (p: string) => /[!@#$%^&*]/.test(p) },
  { key: 'pattern', label: 'Sin secuencia ni repeticiones', test: (p: string) => !containsSequence(p) && !/(.)\1{2,}/.test(p) },
]

interface ChangePasswordFormProps {
  onCancel?: () => void
  onSuccess?: () => void
  title?: string
  subtitle?: string
}

export function ChangePasswordForm({ 
  onCancel, 
  onSuccess,
  title = 'Cambiar Contraseña',
  subtitle = 'Actualiza tu contraseña de acceso'
}: ChangePasswordFormProps) {
  const router = useRouter()
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [generalError, setGeneralError] = useState('')
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const togglePassword = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }))
  }

  const validatedCriteria = useMemo(() => {
    return PASSWORD_CRITERIA.map(criteria => ({
      ...criteria,
      passed: criteria.test(formData.newPassword)
    }))
  }, [formData.newPassword])

  const validatePassword = (password: string): string[] => {
    const errors: string[] = []
    if (password.length < 8) errors.push('8+ caracteres')
    if (!/[A-Z]/.test(password)) errors.push('mayúscula')
    if (!/[a-z]/.test(password)) errors.push('minúscula')
    if (!/[0-9]/.test(password)) errors.push('número')
    if (!/[!@#$%^&*]/.test(password)) errors.push('símbolo')
    if (containsSequence(password)) errors.push('secuencia')
    if (/(.)\1{2,}/.test(password)) errors.push('repetición')
    return errors
  }

  const validateForm = () => {
    const newErrors = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }

    if (!formData.currentPassword.trim()) {
      newErrors.currentPassword = 'La contraseña actual es requerida'
    }

    if (!formData.newPassword.trim()) {
      newErrors.newPassword = 'La nueva contraseña es requerida'
    } else {
      const passwordErrors = validatePassword(formData.newPassword)
      if (passwordErrors.length > 0) {
        newErrors.newPassword = passwordErrors.join(', ')
      }
      if (formData.currentPassword === formData.newPassword) {
        newErrors.newPassword = 'La nueva contraseña debe ser diferente a la actual'
      }
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Debe confirmar la contraseña'
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden'
    }

    setErrors(newErrors)
    return !Object.values(newErrors).some(error => error !== '')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setGeneralError('')
    setShowErrorModal(false)

    if (!validateForm()) {
      return
    }

    const token = localStorage.getItem('auth_token')
    const userStr = localStorage.getItem('auth_user')
    
    if (!token || !userStr) {
      router.push('/login')
      return
    }

    let user
    try {
      user = JSON.parse(userStr)
    } catch {
      router.push('/login')
      return
    }

    setIsLoading(true)

    const passwordExpiryDays = parseInt(process.env.NEXT_PUBLIC_PASSWORD_EXPIRY_DAYS || '60')
    const now = new Date()
    const passwordExpiryDate = new Date(now.getTime() + passwordExpiryDays * 24 * 60 * 60 * 1000)

    try {
      const response = await fetch(`/api/users/${user.id_user}/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
          password_expiry_date: passwordExpiryDate.toISOString(),
          password_last_changed: now.toISOString(),
          updated_by: user.username,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        setErrorMessage(data.message || 'Error al cambiar la contraseña')
        setShowErrorModal(true)
        setIsLoading(false)
        return
      }

      setShowSuccessModal(true)
    } catch {
      setErrorMessage('Error al conectar con el servidor')
      setShowErrorModal(true)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelClick = () => {
    if (onCancel) {
      onCancel()
    } else {
      router.push('/login')
    }
  }

  const handleSuccessClick = () => {
    setShowSuccessModal(false)
    if (onSuccess) {
      onSuccess()
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <>
      <div className="flex flex-col items-center mb-8">
        <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 border border-white/20 shadow-2xl">
          <KeyRound className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white drop-shadow-lg">{title}</h1>
        <p className="text-white/70 mt-2">{subtitle}</p>
      </div>

      <div className="bg-card border border-border rounded-2xl p-8 shadow-2xl">
        {generalError && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm">
            {generalError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          <div>
            <label className="block text-sm font-medium mb-2">Contraseña Actual</label>
            <div className="relative">
              <input
                type={showPasswords.current ? 'text' : 'password'}
                value={formData.currentPassword}
                onChange={(e) => {
                  setFormData({ ...formData, currentPassword: e.target.value })
                  setErrors({ ...errors, currentPassword: '' })
                }}
                placeholder="Ingresa tu contraseña actual"
                className={`w-full px-4 py-3 pr-12 bg-secondary rounded-lg border ${
                  errors.currentPassword ? 'border-destructive focus:ring-destructive' : 'border-border focus:ring-primary'
                } focus:outline-none focus:ring-2`}
                required
              />
              <button
                type="button"
                onClick={() => togglePassword('current')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.currentPassword && (
              <p className="text-xs text-destructive mt-1">{errors.currentPassword}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Nueva Contraseña</label>
            <div className="relative">
              <input
                type={showPasswords.new ? 'text' : 'password'}
                value={formData.newPassword}
                onChange={(e) => {
                  setFormData({ ...formData, newPassword: e.target.value })
                  setErrors({ ...errors, newPassword: '' })
                }}
                placeholder="Ingresa tu nueva contraseña"
                className={`w-full px-4 py-3 pr-12 bg-secondary rounded-lg border ${
                  errors.newPassword ? 'border-destructive focus:ring-destructive' : 'border-border focus:ring-primary'
                } focus:outline-none focus:ring-2`}
                required
              />
              <button
                type="button"
                onClick={() => togglePassword('new')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.newPassword && (
              <p className="text-xs text-destructive mt-1">{errors.newPassword}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Repita Nueva Contraseña</label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => {
                  setFormData({ ...formData, confirmPassword: e.target.value })
                  setErrors({ ...errors, confirmPassword: '' })
                }}
                placeholder="Confirma tu nueva contraseña"
                className={`w-full px-4 py-3 pr-12 bg-secondary rounded-lg border ${
                  errors.confirmPassword ? 'border-destructive focus:ring-destructive' : 'border-border focus:ring-primary'
                } focus:outline-none focus:ring-2`}
                required
              />
              <button
                type="button"
                onClick={() => togglePassword('confirm')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-destructive mt-1">{errors.confirmPassword}</p>
            )}
            <div className="bg-muted/30 rounded-lg p-3 space-y-1.5 mt-2">
              <p className="text-xs font-medium text-muted-foreground mb-2">Requisitos de contraseña segura:</p>
              {validatedCriteria.map((criteria) => (
                <div key={criteria.key} className="flex items-center gap-2 text-xs">
                  {criteria.passed ? (
                    <CheckCircle className="w-3.5 h-3.5 text-green-600 dark:text-green-400 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-muted-foreground/50 flex-shrink-0" />
                  )}
                  <span className={criteria.passed ? 'text-green-700 dark:text-green-300' : 'text-muted-foreground/70'}>
                    {criteria.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleCancelClick}
              className="flex-1 py-3 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Cambiando...' : 'Cambiar Contraseña'}
            </button>
          </div>
        </form>
      </div>

      {showErrorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card border border-border rounded-2xl p-8 max-w-md mx-4 shadow-2xl">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                <RotateCcw className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-center text-foreground mb-4">
              Error al cambiar contraseña
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

      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card border border-border rounded-2xl p-8 max-w-md mx-4 shadow-2xl">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-center text-foreground mb-4">
              Contraseña cambiada
            </h2>
            <p className="text-center text-muted-foreground mb-6">
              Su contraseña ha sido cambiada correctamente.
            </p>
            <button
              onClick={handleSuccessClick}
              className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Aceptar
            </button>
          </div>
        </div>
      )}
    </>
  )
}