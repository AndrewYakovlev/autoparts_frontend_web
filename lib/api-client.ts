// src/lib/api-client.ts
import { clientAuth } from "./auth"
import type {
  ApiError,
  ApiResponse,
  AuthResponse,
  RefreshTokenDto,
} from "@/types"

export class ApiClientError extends Error {
  statusCode: number
  error: string
  timestamp: string
  path: string

  constructor(apiError: ApiError) {
    super(apiError.message)
    this.name = "ApiClientError"
    this.statusCode = apiError.statusCode
    this.error = apiError.error
    this.timestamp = apiError.timestamp
    this.path = apiError.path
  }
}

class ApiClient {
  private baseURL: string
  private isRefreshing = false
  private refreshPromise: Promise<AuthResponse> | null = null

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
  }

  private async refreshTokens(): Promise<AuthResponse> {
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise
    }

    this.isRefreshing = true

    const refreshToken = clientAuth.getRefreshToken()
    if (!refreshToken) {
      throw new Error("No refresh token available")
    }

    this.refreshPromise = this.request<AuthResponse>("/auth/token/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken } as RefreshTokenDto),
      skipAuth: true,
    })

    try {
      const response = await this.refreshPromise

      // Update tokens
      clientAuth.setTokens(response)
      clientAuth.setUser({
        id: response.user.id,
        phone: response.user.phone,
        role: response.user.role as any,
        firstName: response.user.firstName,
        lastName: response.user.lastName,
        email: response.user.email,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      return response
    } finally {
      this.isRefreshing = false
      this.refreshPromise = null
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit & { skipAuth?: boolean } = {}
  ): Promise<T> {
    const { skipAuth = false, ...fetchOptions } = options

    const url = `${this.baseURL}/api/v1${endpoint}`
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...fetchOptions.headers,
    }

    // Add auth token if available and not skipped
    if (!skipAuth) {
      const token =
        clientAuth.getAccessToken() || clientAuth.getAnonymousToken()
      if (token) {
        headers["Authorization"] = `Bearer ${token}`
      }
    }

    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    })

    const responseData = await response.json()

    // Handle success response
    if (response.ok && responseData.success) {
      return responseData.data
    }

    // Handle API errors
    if (!response.ok) {
      // If unauthorized and we have a refresh token, try to refresh
      if (
        response.status === 401 &&
        !skipAuth &&
        clientAuth.getRefreshToken()
      ) {
        try {
          await this.refreshTokens()
          // Retry the original request with new token
          return this.request<T>(endpoint, options)
        } catch (refreshError) {
          // If refresh fails, clear tokens and throw
          clientAuth.clearTokens()
          throw new ApiClientError(responseData as ApiError)
        }
      }

      throw new ApiClientError(responseData as ApiError)
    }

    // Fallback for unexpected response format
    return responseData as T
  }

  // Public API methods
  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "GET" })
  }

  async post<T>(
    endpoint: string,
    data?: any,
    options?: RequestInit
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(
    endpoint: string,
    data?: any,
    options?: RequestInit
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" })
  }

  // Auth-specific methods that skip auth header
  async requestOtp(data: any): Promise<any> {
    return this.request("/auth/otp/request", {
      method: "POST",
      body: JSON.stringify(data),
      skipAuth: true,
    })
  }

  async verifyOtp(data: any): Promise<any> {
    return this.request("/auth/otp/verify", {
      method: "POST",
      body: JSON.stringify(data),
      skipAuth: true,
    })
  }

  async createAnonymousSession(data: any): Promise<any> {
    return this.request("/auth/anonymous", {
      method: "POST",
      body: JSON.stringify(data),
      skipAuth: true,
    })
  }
}

// Export singleton instance
export const apiClient = new ApiClient()
