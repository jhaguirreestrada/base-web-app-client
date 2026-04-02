'use client'

import Link from 'next/link'
import { Home, ArrowLeft, AlertTriangle, RefreshCw, WifiOff } from 'lucide-react'
import { useState, useEffect } from 'react'

interface ServerErrorProps {
  message?: string
  title?: string
  onRetry?: () => void
  showBackButton?: boolean
}

const NETWORK_ERRORS = [
  'Failed to fetch',
  'Network request failed',
  'NetworkError',
  'fetch failed',
  'net::ERR_CONNECTION_REFUSED',
  'net::ERR_CONNECTION_RESET',
  'net::FETCH_FAILED',
]

export default function ServerError({ 
  message = 'No se pudo conectar con el servidor', 
  title = 'Error de conexión',
  onRetry,
  showBackButton = true
}: ServerErrorProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)
  const [isRetrying, setIsRetrying] = useState(false)

  const isNetworkError = NETWORK_ERRORS.some(err => 
    message.toLowerCase().includes(err.toLowerCase())
  )

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 20 - 10,
        y: (e.clientY / window.innerHeight) * 20 - 10
      })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const handleRetry = async () => {
    if (!onRetry) return
    setIsRetrying(true)
    try {
      await onRetry()
    } finally {
      setIsRetrying(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden p-8">
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute w-96 h-96 bg-destructive/10 rounded-full blur-3xl transition-transform duration-300 ease-out"
          style={{
            transform: `translate(${mousePosition.x * 2}px, ${mousePosition.y * 2}px)`,
            top: '20%',
            left: '20%'
          }}
        />
        <div 
          className="absolute w-96 h-96 bg-secondary/20 rounded-full blur-3xl transition-transform duration-300 ease-out"
          style={{
            transform: `translate(${mousePosition.x * -1.5}px, ${mousePosition.y * -1.5}px)`,
            bottom: '20%',
            right: '20%'
          }}
        />
        <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-destructive/30 rounded-full animate-pulse" />
        <div className="absolute top-1/3 right-1/3 w-6 h-6 bg-destructive/20 rounded-full animate-pulse delay-75" />
        <div className="absolute bottom-1/3 left-1/3 w-3 h-3 bg-destructive/40 rounded-full animate-pulse delay-150" />
      </div>

      <div 
        className="relative z-10 text-center px-4 max-w-lg"
        style={{
          transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`,
          transition: 'transform 0.1s ease-out'
        }}
      >
        <div 
          className="relative inline-block mb-8"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <h1 className="text-[150px] md:text-[200px] font-bold text-destructive/10 leading-none select-none">
            500
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 md:w-48 md:h-48 bg-gradient-to-br from-destructive to-destructive/60 rounded-full flex items-center justify-center shadow-lg animate-bounce">
              {isNetworkError ? (
                <WifiOff className="w-16 h-16 md:w-20 md:h-20 text-white" />
              ) : (
                <AlertTriangle className="w-16 h-16 md:w-20 md:h-20 text-white" />
              )}
            </div>
          </div>
        </div>

        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          {title}
        </h2>
        <p className="text-lg text-muted-foreground mb-4">
          {isNetworkError 
            ? 'El servidor no está disponible o la conexión ha fallado. Por favor, intenta más tarde.'
            : 'Algo salió mal al procesar tu solicitud. Estamos trabajando para solucionarlo.'}
        </p>

        {message && isNetworkError && (
          <p className="text-sm text-muted-foreground/70 mb-8 font-mono bg-secondary/50 px-4 py-2 rounded-lg inline-block">
            {message}
          </p>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {onRetry && (
            <button 
              onClick={handleRetry}
              disabled={isRetrying}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all duration-200 hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <RefreshCw className={`w-5 h-5 ${isRetrying ? 'animate-spin' : ''}`} />
              {isRetrying ? 'Reintentando...' : 'Intentar de nuevo'}
            </button>
          )}
          <Link 
            href="/"
            className="flex items-center gap-2 px-6 py-3 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-all duration-200 border border-border"
          >
            <Home className="w-5 h-5" />
            Volver al inicio
          </Link>
          {showBackButton && (
            <button 
              onClick={() => window.history.back()}
              className="flex items-center gap-2 px-6 py-3 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-all duration-200 border border-border"
            >
              <ArrowLeft className="w-5 h-5" />
              Volver atrás
            </button>
          )}
        </div>

        <div className="mt-12 flex items-center justify-center gap-2 text-sm text-muted-foreground/50">
          <div className="w-2 h-2 bg-destructive/30 rounded-full animate-ping" />
          <span>{isNetworkError ? 'Servidor no disponible' : 'Error interno del servidor'}</span>
          <div className="w-2 h-2 bg-destructive/30 rounded-full animate-ping delay-75" />
        </div>
      </div>
    </div>
  )
}
