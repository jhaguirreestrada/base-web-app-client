'use client'

import React, { useState, useEffect, useRef } from 'react'
import { 
  Search, 
  Bell, 
  Menu,
  LayoutGrid, 
  Moon, 
  Sun, 
  Key,
  LogOut,
  User,
  ChevronDown,
  PanelLeftClose,
  PanelLeft,
  MessageCircle,
  X,
  Send,
  Bot
} from 'lucide-react'
import { useTheme } from 'next-themes'
import Link from 'next/link'

interface NavbarProps {
  onMenuClick: () => void
  onToggleSidebar?: () => void
  sidebarCollapsed?: boolean
}

interface Message {
  id: number
  role: 'user' | 'assistant'
  content: string
}

export function Navbar({ onMenuClick, onToggleSidebar, sidebarCollapsed = false }: NavbarProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [showCreateMenu, setShowCreateMenu] = useState(false)
  const [showChatModal, setShowChatModal] = useState(false)
  const [chatInput, setChatInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, role: 'assistant', content: '¡Hola! Soy tu asistente de IA. ¿En qué puedo ayudarte hoy?' }
  ])
  
  const createMenuRef = useRef<HTMLDivElement>(null)
  const notificationsRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (createMenuRef.current && !createMenuRef.current.contains(event.target as Node)) {
        setShowCreateMenu(false)
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfile(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  const handleSendMessage = () => {
    if (!chatInput.trim()) return

    const userMessage: Message = {
      id: messages.length + 1,
      role: 'user',
      content: chatInput
    }

    setMessages(prev => [...prev, userMessage])
    setChatInput('')

    setTimeout(() => {
      const assistantMessage: Message = {
        id: messages.length + 2,
        role: 'assistant',
        content: 'Gracias por tu mensaje. Soy un asistente de IA de demostración. En una implementación real, aquí me conectaría a un servicio de IA como OpenAI, Claude, u otro proveedor para generar respuestas personalizadas.'
      }
      setMessages(prev => [...prev, assistantMessage])
    }, 1000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage()
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      })
    } catch (error) {
      console.error('Logout error:', error)
    }
    window.location.href = '/login'
  }

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-background border-b border-border">
        <div className="flex items-center justify-between h-full px-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <LayoutGrid className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-lg hidden md:block">Aplicación Base</span>
            </Link>
            <button
              onClick={onMenuClick}
              className="p-2 rounded-lg hover:bg-accent transition-colors lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            <button
              onClick={onToggleSidebar}
              className="hidden lg:flex p-2 rounded-lg hover:bg-accent transition-colors"
              title={sidebarCollapsed ? 'Expandir menú' : 'Contraer menú'}
            >
              {sidebarCollapsed ? (
                <PanelLeft className="w-5 h-5" />
              ) : (
                <PanelLeftClose className="w-5 h-5" />
              )}
            </button>
            
            <form className="hidden md:flex items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  className="pl-10 pr-4 py-2 bg-secondary rounded-lg text-sm w-96 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </form>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative hidden md:block" ref={createMenuRef}>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowCreateMenu(!showCreateMenu)
                }}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                + Nuevo
                <ChevronDown className="w-4 h-4" />
              </button>
              
              {showCreateMenu && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-lg shadow-lg py-2">
                  <div className="px-4 py-2 text-xs text-muted-foreground uppercase">Proyectos</div>
                  <Link 
                    href="#" 
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-accent transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                      <span className="text-xs">DS</span>
                    </div>
                    <span className="text-sm">Desarrollo de Software</span>
                  </Link>
                </div>
              )}
            </div>

            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-lg hover:bg-accent transition-colors"
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>
            )}

            <div className="relative" ref={notificationsRef}>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowNotifications(!showNotifications)
                }}
                className="p-2 rounded-lg hover:bg-accent transition-colors relative"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-lg shadow-lg">
                  <div className="p-4 border-b border-border">
                    <h3 className="font-semibold">Notificaciones</h3>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    <div className="p-4 border-b border-border hover:bg-accent transition-colors cursor-pointer">
                      <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                          <Bell className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Evento hoy</p>
                          <p className="text-xs text-muted-foreground">Recordatorio: tienes un evento hoy</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="relative" ref={profileRef}>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowProfile(!showProfile)
                }}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                  <span className="text-sm font-medium">HK</span>
                </div>
                <span className="hidden md:block text-sm font-medium">Henry Klein</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              
              {showProfile && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-lg shadow-lg py-2">
                  <div className="px-4 py-2 border-b border-border">
                    <p className="font-medium">Perfil</p>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowChatModal(true)
                    }}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-accent transition-colors w-full text-left"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-sm">Asistente virtual</span>
                  </button>
                  <Link 
                    href="#" 
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-accent transition-colors"
                  >
                    <Key className="w-4 h-4" />
                    <span className="text-sm">Cambio de contraseña</span>
                  </Link>
                  <Link 
                    href="#" 
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-accent transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span className="text-sm">Cuenta</span>
                  </Link>
                  <div className="border-t border-border mt-2 pt-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation()
                        handleLogout()
                      }}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-accent transition-colors text-primary w-full text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="text-sm">Cerrar sesión</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {showChatModal && (
        <div className="fixed inset-0 z-[100] flex items-end justify-end p-4">
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowChatModal(false)}
          />
          <div className="relative w-full max-w-md h-[500px] bg-card border border-border rounded-xl shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold">Asistente Virtual</h3>
              </div>
              <button 
                onClick={() => setShowChatModal(false)}
                className="p-2 hover:bg-accent rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.role === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-secondary text-secondary-foreground'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <div className="p-4 border-t border-border">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Escribe tu mensaje..."
                  className="flex-1 px-4 py-2 bg-secondary rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
                <button
                  onClick={handleSendMessage}
                  className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
