// contexts/AuthContext.tsx
'use client'

import { createContext, useContext, ReactNode, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '@/lib/services/auth.service'
import { syncAuthWithCookies } from '@/lib/utils/auth-cookie-sync'
import { setupApiInterceptor } from '@/lib/api/interceptor'

interface AuthContextType {
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()

  useEffect(() => {
    // Настраиваем перехватчик API
    setupApiInterceptor()

    // Синхронизируем auth состояние с cookies
    const unsubscribe = syncAuthWithCookies()

    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [])

  const logout = async () => {
    try {
      await authService.logout()
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return <AuthContext.Provider value={{ logout }}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}
