'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { Sidebar } from '@/components/layout/Sidebar'
import { SessionWarningModal } from '@/components/SessionWarningModal'
import { useSessionTimeout } from '@/app/hooks/useSessionTimeout'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [noMenus, setNoMenus] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    const userStr = localStorage.getItem('auth_user')
    
    if (!token || !userStr) {
      router.push('/login')
      return
    }

    try {
      const user = JSON.parse(userStr)
      const roleId = user?.role?.id_role
      
      if (!roleId) {
        router.push('/login?noMenus=true')
        return
      }

      fetch(`http://localhost:3000/roles/${roleId}/menus`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      })
      .then(res => res.json())
      .then(data => {
        if (!data || data.length === 0) {
          router.push('/login?noMenus=true')
        }
      })
      .catch(() => {
        router.push('/login?noMenus=true')
      })
    } catch {
      router.push('/login')
    }
  }, [router])

  const handleLogout = useCallback(async () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      })
    } catch (error) {
      console.error('Logout error:', error)
    }
    router.push('/login')
  }, [router])

  const { showWarning, remainingTime, extendSession, logout } = useSessionTimeout(handleLogout)

  return (
    <div className="min-h-screen bg-background">
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <Navbar 
        onMenuClick={() => setSidebarOpen(true)} 
        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        sidebarCollapsed={sidebarCollapsed}
      />
      
      <main className={`pt-16 transition-all duration-300 ${sidebarCollapsed ? 'pl-16' : 'pl-64'}`}>
        <div className="p-6">
          {children}
        </div>
      </main>

      <SessionWarningModal
        show={showWarning}
        remainingTime={remainingTime}
        onExtend={extendSession}
        onLogout={logout}
      />
    </div>
  )
}
