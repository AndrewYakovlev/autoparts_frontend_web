// lib/utils/auth-cookie-sync.ts
import { useAuthStore } from "@/stores/auth.store"

// Синхронизация состояния auth с cookies для SSR
export function syncAuthWithCookies() {
  if (typeof window === "undefined") return

  // Подписываемся на изменения store
  const unsubscribe = useAuthStore.subscribe(state => {
    // Сохраняем минимальную информацию в cookie для middleware
    const cookieData = {
      state: {
        isAuthenticated: state.isAuthenticated,
        userRole: state.user?.role,
      },
    }

    if (state.isAuthenticated) {
      document.cookie = `auth-storage=${JSON.stringify(
        cookieData
      )}; path=/; max-age=86400; samesite=lax`
    } else {
      // Удаляем cookie при logout
      document.cookie =
        "auth-storage=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    }
  })

  return unsubscribe
}
