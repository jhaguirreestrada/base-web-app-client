'use client'

import { ChangePasswordForm } from '@/components/ChangePasswordForm'
import { useRouter } from 'next/navigation'

export default function ChangePasswordPage() {
  const router = useRouter()

  return (
    <div className="p-6">
      <div className="max-w-md mx-auto">
        <ChangePasswordForm 
          onCancel={() => router.push('/dashboard')}
          onSuccess={() => {
            router.push('/dashboard')
            router.refresh()
          }}
        />
      </div>
    </div>
  )
}