'use client'

import Link from 'next/link'
import { Home, ArrowLeft, AlertTriangle, RefreshCw } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isPulsing, setIsPulsing] = useState(true)

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

  useEffect(() => {
    const interval = setInterval(() => setIsPulsing(p => !p), 1500)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute w-96 h-96 bg-destructive/10 rounded-full blur-3xl transition-transform duration-300 ease-out"
          style={{
            transform: `translate(${mousePosition.x * 2}px, ${mousePosition.y * 2}px)`,
            top: '20%',
            right: '20%'
          }}
        />
        <div 
          className="absolute w-96 h-96 bg-secondary/20 rounded-full blur-3xl transition-transform duration-300 ease-out"
          style={{
            transform: `translate(${mousePosition.x * -1.5}px, ${mousePosition.y * -1.5}px)`,
            bottom: '20%',
            left: '20%'
          }}
        />
        
        {/* Floating shapes */}
        <div className="absolute top-1/4 right-1/4 w-4 h-4 bg-destructive/30 rounded-full animate-pulse" />
        <div className="absolute top-1/3 left-1/3 w-6 h-6 bg-destructive/20 rounded-full animate-pulse delay-75" />
        <div className="absolute bottom-1/3 right-1/3 w-3 h-3 bg-destructive/40 rounded-full animate-pulse delay-150" />
      </div>

      {/* Content */}
      <div 
        className="relative z-10 text-center px-4 max-w-lg"
        style={{
          transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`,
          transition: 'transform 0.1s ease-out'
        }}
      >
        {/* 500 Number with animation */}
        <div className="relative inline-block mb-8">
          <h1 className="text-[150px] md:text-[200px] font-bold text-destructive/10 leading-none select-none">
            500
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`
              w-32 h-32 md:w-48 md:h-48 
              bg-gradient-to-br from-destructive to-destructive/60 
              rounded-full flex items-center justify-center shadow-lg
              ${isPulsing ? 'animate-bounce scale-110' : 'scale-100'}
              transition-all duration-500
            `}>
              <AlertTriangle className="w-16 h-16 md:w-20 md:h-20 text-white" />
            </div>
          </div>
        </div>

        {/* Message */}
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          Error interno del servidor
        </h2>
        <p className="text-lg text-muted-foreground mb-4">
          Algo salió mal en nuestro servidor. Estamos trabajando para solucionarlo lo antes posible.
        </p>
        
        {error?.digest && (
          <p className="text-sm text-muted-foreground/70 mb-8 font-mono bg-secondary/50 px-4 py-2 rounded-lg inline-block">
            Error: {error.digest}
          </p>
        )}

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={reset}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all duration-200 hover:scale-105 hover:shadow-lg"
          >
            <RefreshCw className="w-5 h-5" />
            Intentar de nuevo
          </button>
          <Link 
            href="/"
            className="flex items-center gap-2 px-6 py-3 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-all duration-200 border border-border"
          >
            <Home className="w-5 h-5" />
            Volver al inicio
          </Link>
        </div>

        {/* Decorative elements */}
        <div className="mt-12 flex items-center justify-center gap-2 text-sm text-muted-foreground/50">
          <div className="w-2 h-2 bg-destructive/30 rounded-full animate-ping" />
          <span>Error interno del servidor</span>
          <div className="w-2 h-2 bg-destructive/30 rounded-full animate-ping delay-75" />
        </div>
      </div>
    </div>
  )
}
