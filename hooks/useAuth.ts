// hooks/useAuth.ts
import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { authService } from "@/lib/services/auth.service"
import { useAuthStore } from "@/stores/auth.store"
import { RequestOtpDto, VerifyOtpDto, ApiError } from "@/types/api"

export function useAuth() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user, isAuthenticated, clearAuth } = useAuthStore()

  const requestOtp = useCallback(async (data: RequestOtpDto) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await authService.requestOtp(data)
      return response
    } catch (err) {
      const apiError = err as ApiError
      setError(apiError.message || "Произошла ошибка при отправке кода")
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const verifyOtp = useCallback(
    async (data: VerifyOtpDto) => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await authService.verifyOtp(data)

        // Перенаправляем в зависимости от роли
        switch (response.user.role) {
          case "ADMIN":
          case "MANAGER":
            router.push("/admin")
            break
          default:
            router.push("/")
        }

        return response
      } catch (err) {
        const apiError = err as ApiError
        setError(apiError.message || "Неверный код подтверждения")
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [router]
  )

  const logout = useCallback(async () => {
    setIsLoading(true)

    try {
      await authService.logout()
      router.push("/login")
    } catch (err) {
      console.error("Logout error:", err)
    } finally {
      setIsLoading(false)
    }
  }, [router])

  return {
    isLoading,
    error,
    requestOtp,
    verifyOtp,
    logout,
    user,
    isAuthenticated,
  }
}
