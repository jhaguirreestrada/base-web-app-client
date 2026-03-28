'use client'

import React from 'react'
import { Clock, LogOut } from 'lucide-react'

interface SessionWarningModalProps {
  show: boolean
  remainingTime: number
  onExtend: () => void
  onLogout: () => void
}

export function SessionWarningModal({
  show,
  remainingTime,
  onExtend,
  onLogout,
}: SessionWarningModalProps) {
  if (!show) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      
      <div className="relative bg-card border border-border rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="text-center">
          <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-amber-600 dark:text-amber-400" />
          </div>
          
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Sesión por expirar
          </h2>
          
          <p className="text-muted-foreground mb-6">
            Tu sesión expirará en{' '}
            <span className="font-bold text-amber-600 dark:text-amber-400">
              {remainingTime} segundos
            </span>
          </p>

          <div className="divider my-6" />

          <div className="space-y-3">
            <button
              onClick={onExtend}
              className="w-full py-3 px-6 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors"
            >
              Extender sesión
            </button>
            
            <button
              onClick={onLogout}
              className="w-full py-3 px-6 bg-secondary text-secondary-foreground rounded-xl font-medium hover:bg-secondary/80 transition-colors border border-border flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
