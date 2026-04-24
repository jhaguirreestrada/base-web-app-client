'use client'

import React, { useState, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogOut, ChevronDown, ChevronRight, X, Loader2, AlertCircle } from 'lucide-react'
import { getIcon } from '@/app/utils/iconMap'
import { useRouter } from 'next/navigation'
import { ApiMenuItem, useMenus } from '@/app/hooks/useMenus'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  isCollapsed?: boolean
  onToggle?: () => void
}

interface MenuItemProps {
  item: ApiMenuItem
  level?: number
  isCollapsed?: boolean
  onItemClick?: () => void
}

const iconColors: Record<string, string> = {
  'layout-dashboard': 'text-blue-500',
  'settings': 'text-gray-500',
  'users': 'text-blue-500',
  'shield': 'text-indigo-500',
  'monitor': 'text-purple-500',
  'file-text': 'text-yellow-500',
  'table': 'text-green-500',
  'bar-chart': 'text-red-500',
}

function MenuItemComponent({ item, level = 0, isCollapsed = false, onItemClick }: MenuItemProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const itemRef = useRef<HTMLDivElement>(null)
  
  const hasChildren = item.children && item.children.length > 0
  const isActive = item.path ? pathname === item.path : false
  const showTooltip = isCollapsed && level === 0 && hoveredItem === item.name
  
  const iconColor = iconColors[item.icon || ''] || 'text-gray-500'

  const getTooltipPosition = () => {
    if (itemRef.current) {
      const rect = itemRef.current.getBoundingClientRect()
      return { top: rect.top, left: rect.right + 8 }
    }
    return { top: 0, left: 72 }
  }

  const handleButtonClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isCollapsed) {
      setIsOpen(!isOpen)
    }
    if (onItemClick) onItemClick()
  }

  const handleLinkClick = (e: React.MouseEvent) => {
    if (onItemClick) onItemClick()
  }

  const handleChildClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (onItemClick) onItemClick()
  }

  return (
    <div 
      className="relative mb-1"
      ref={itemRef}
      onMouseEnter={() => {
        if (isCollapsed && level === 0) {
          setHoveredItem(item.name)
        }
      }}
      onMouseLeave={() => {
        if (isCollapsed && level === 0) {
          setHoveredItem(null)
        }
      }}
    >
      {item.path ? (
        <Link
          href={`/dashboard${item.path}`}
          onClick={handleLinkClick}
          className={`flex items-center rounded-lg transition-colors hover:bg-accent ${isActive && !isCollapsed ? 'bg-accent' : ''} ${isCollapsed && level === 0 ? 'w-12 h-12 justify-center' : 'px-4 py-3'}`}
        >
          {item.icon && (
            <span className={iconColor}>
              {getIcon(item.icon)}
            </span>
          )}
          {!isCollapsed && <span className={`text-sm font-medium ${!item.icon ? 'ml-0' : 'ml-3'}`}>{item.name}</span>}
        </Link>
      ) : (
        <button
          onClick={handleButtonClick}
          className={`flex items-center w-full rounded-lg transition-colors hover:bg-accent ${isCollapsed && level === 0 ? 'w-12 h-12 justify-center' : 'px-4 py-3'}`}
        >
          {item.icon && (
            <span className={iconColor}>
              {getIcon(item.icon)}
            </span>
          )}
          {!isCollapsed && (
            <>
              <span className={`text-sm font-medium flex-1 text-left ${!item.icon ? 'ml-0' : 'ml-3'}`}>{item.name}</span>
              {hasChildren && (
                isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
              )}
            </>
          )}
        </button>
      )}

      {showTooltip && (
        <div 
          className="fixed z-[100] bg-card border border-border rounded-lg shadow-xl p-4 min-w-[220px]"
          style={getTooltipPosition()}
          onMouseEnter={() => setHoveredItem(item.name)}
          onMouseLeave={() => setHoveredItem(null)}
        >
          <p className="font-semibold text-sm mb-3 pb-2 border-b border-border text-foreground">{item.name}</p>
          {hasChildren ? (
            <div className="space-y-1 ml-4">
              {item.children!.map((child, idx) => (
                <Link
                  key={idx}
                  href={child.path ? `/dashboard${child.path}` : '#'}
                  onClick={handleLinkClick}
                  className="flex items-center py-2 px-2 text-sm text-foreground rounded transition-colors hover:text-primary"
                >
                  {child.icon && (
                    <>
                      {getIcon(child.icon)}
                      <span className="ml-2">{child.name}</span>
                    </>
                  )}
                  {!child.icon && <span>{child.name}</span>}
                </Link>
              ))}
            </div>
          ) : item.path && (
            <div className="space-y-1">
              <Link
                href={`/dashboard${item.path}`}
                onClick={handleLinkClick}
                className="flex items-center py-2 px-2 text-sm text-foreground rounded transition-colors hover:text-primary"
              >
                {item.name}
              </Link>
            </div>
          )}
        </div>
      )}

      {hasChildren && isOpen && !isCollapsed && (
        <div className="mt-1 ml-8">
          {item.children!.map((child, index) => (
            <MenuItemComponent 
              key={index} 
              item={child} 
              level={level + 1} 
              isCollapsed={isCollapsed}
              onItemClick={onItemClick}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function Sidebar({ isOpen, onClose, isCollapsed = false, onToggle }: SidebarProps) {
  const router = useRouter()
  const { menus, isLoading, error, noMenus } = useMenus()

  const handleLogout = async () => {
    sessionStorage.setItem('reset_login_modals', 'true')
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch (e) {
      console.error('Logout error:', e)
    }
    router.push('/login')
    router.refresh()
  }

  const handleItemClick = () => {
    if (window.innerWidth < 1024) {
      onClose()
    }
  }

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-full bg-card border-r border-border transition-all duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} ${isCollapsed ? 'w-16' : 'w-64'}`}
      >
        <div className="flex items-center justify-between h-16 px-2 border-b border-border">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            {!isCollapsed && <span className="font-semibold text-lg">Admin Base</span>}
          </Link>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-accent transition-colors lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-2 overflow-y-auto h-[calc(100vh-140px)]">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="ml-2 text-sm text-muted-foreground">Cargando menús...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-8 text-center px-4">
              <AlertCircle className="w-8 h-8 text-red-500 mb-2" />
              <p className="text-sm text-muted-foreground">Error al cargar menús</p>
              <p className="text-xs text-muted-foreground mt-1">{error}</p>
            </div>
          ) : noMenus ? (
            <div className="flex flex-col items-center justify-center py-8 text-center px-4">
              <AlertCircle className="w-8 h-8 text-amber-500 mb-2" />
              <p className="text-sm text-muted-foreground">No tienes menús asignados</p>
              <p className="text-xs text-muted-foreground mt-1">Contacta al administrador</p>
            </div>
          ) : (
            menus.map((item, index) => (
              <MenuItemComponent 
                key={item.id_menu} 
                item={item} 
                isCollapsed={isCollapsed}
                onItemClick={handleItemClick}
              />
            ))
          )}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-2 border-t border-border bg-card">
          <button
            onClick={handleLogout}
            className={`flex items-center rounded-lg transition-colors text-primary hover:bg-accent w-full ${isCollapsed ? 'w-12 h-12 justify-center' : 'px-4 py-3'}`}
          >
            <LogOut className="w-5 h-5" />
            {!isCollapsed && <span className="ml-3 text-sm font-medium">Cerrar Sesión</span>}
          </button>
        </div>
      </aside>
    </>
  )
}
