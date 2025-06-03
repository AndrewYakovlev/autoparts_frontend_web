// lib/api/interceptor.ts
import { useAuthStore } from '@/stores/auth.store'
import { authService } from '@/lib/services/auth.service'
import { API_CONFIG } from './config'

interface RequestConfig extends RequestInit {
  _retry?: boolean
}

// Обертка для fetch с перехватчиком
export async function fetchWithInterceptor(
  url: string,
  config: RequestConfig = {}
): Promise<Response> {
  const response = await fetch(url, config)

  // Если получили 401 и это не повторный запрос
  if (response.status === 401 && !config._retry) {
    const { refreshToken, clearAuth } = useAuthStore.getState()

    if (refreshToken) {
      try {
        // Пытаемся обновить токен
        await authService.refreshToken({ refreshToken })

        // Повторяем оригинальный запрос с новым токеном
        const newAccessToken = useAuthStore.getState().accessToken
        if (newAccessToken && config.headers) {
          const headers = new Headers(config.headers)
          headers.set('Authorization', `Bearer ${newAccessToken}`)

          return fetchWithInterceptor(url, {
            ...config,
            headers,
            _retry: true,
          })
        }
      } catch (error) {
        // Если не удалось обновить токен, очищаем авторизацию
        clearAuth()

        // Редирект на страницу логина
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
      }
    } else {
      // Если нет refresh токена, очищаем авторизацию
      clearAuth()

      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    }
  }

  return response
}

// Функция для установки перехватчика в глобальный fetch
export function setupApiInterceptor() {
  if (typeof window === 'undefined') return

  const originalFetch = window.fetch

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url

    // Применяем перехватчик только к нашему API
    if (url.startsWith(API_CONFIG.baseURL)) {
      return fetchWithInterceptor(url, init)
    }

    // Для остальных запросов используем оригинальный fetch
    return originalFetch(input, init)
  }
}
