// lib/services/auth.service.ts
import { apiClient } from "@/lib/api/client"
import { API_ENDPOINTS } from "@/lib/api/config"
import { useAuthStore } from "@/stores/auth.store"
import {
  RequestOtpDto,
  RequestOtpResponseDto,
  VerifyOtpDto,
  AuthResponseDto,
  RefreshTokenDto,
  CreateAnonymousSessionDto,
  AnonymousSessionResponseDto,
} from "@/types/api"

class AuthService {
  async requestOtp(data: RequestOtpDto): Promise<RequestOtpResponseDto> {
    return apiClient.post<RequestOtpResponseDto>(
      API_ENDPOINTS.auth.requestOtp,
      data
    )
  }

  async verifyOtp(data: VerifyOtpDto): Promise<AuthResponseDto> {
    const response = await apiClient.post<AuthResponseDto>(
      API_ENDPOINTS.auth.verifyOtp,
      data
    )

    // Сохраняем в zustand store
    useAuthStore.getState().setAuth({
      user: {
        ...response.user,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
    })

    return response
  }

  async refreshToken(data: RefreshTokenDto): Promise<AuthResponseDto> {
    const response = await apiClient.post<AuthResponseDto>(
      API_ENDPOINTS.auth.refreshToken,
      data
    )

    // Обновляем токены в store
    useAuthStore.getState().setAuth({
      user: {
        ...response.user,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
    })

    return response
  }

  async createAnonymousSession(
    data?: CreateAnonymousSessionDto
  ): Promise<AnonymousSessionResponseDto> {
    return apiClient.post<AnonymousSessionResponseDto>(
      API_ENDPOINTS.auth.createAnonymousSession,
      data
    )
  }

  async logout(refreshToken?: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.auth.logout)

    // Очищаем store
    useAuthStore.getState().clearAuth()
  }

  async logoutAll(): Promise<void> {
    await apiClient.post(API_ENDPOINTS.auth.logoutAll)

    // Очищаем store
    useAuthStore.getState().clearAuth()
  }
}

export const authService = new AuthService()
