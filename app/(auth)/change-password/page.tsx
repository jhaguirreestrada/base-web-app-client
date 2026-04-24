'use client'

import { ChangePasswordForm } from '@/components/ChangePasswordForm'
import { useRouter } from 'next/navigation'

export default function ChangePasswordPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative" style={{
      backgroundImage: 'url(https://images.unsplash.com/photo-1557683316-973673baf926?w=1920&q=80)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30"></div>

      <div className="relative z-10 w-full max-w-md mx-4">
        <ChangePasswordForm 
          onCancel={() => router.push('/login')}
          onSuccess={() => {
            router.push('/dashboard')
            router.refresh()
          }}
        />
      </div>
    </div>
  )
}