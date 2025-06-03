// components/ProtectedRoute.tsx
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/stores/auth.store"
import { UserRole } from "@/types/api"
import { Loading } from "./Loading"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRoles?: UserRole[]
}

export function ProtectedRoute({
  children,
  requiredRoles = [],
}: ProtectedRouteProps) {
  const router = useRouter()
  const { isAuthenticated, user } = useAuthStore()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    // Даем время для загрузки данных из localStorage
    const checkAuth = async () => {
      await new Promise(resolve => setTimeout(resolve, 100))

      if (!isAuthenticated) {
        router.push("/login")
        return
      }

      if (requiredRoles.length > 0 && user) {
        if (!requiredRoles.includes(user.role)) {
          router.push("/")
          return
        }
      }

      setIsChecking(false)
    }

    checkAuth()
  }, [isAuthenticated, user, requiredRoles, router])

  if (isChecking) {
    return <Loading />
  }

  if (!isAuthenticated) {
    return null
  }

  if (requiredRoles.length > 0 && user && !requiredRoles.includes(user.role)) {
    return null
  }

  return <>{children}</>
}
