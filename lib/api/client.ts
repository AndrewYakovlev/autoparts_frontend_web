// lib/api/client.ts
import { API_CONFIG } from './config'
import { ApiResponse, ApiError } from '@/types/api'
import { useAuthStore } from '@/stores/auth.store'
import { fetchWithInterceptor } from './interceptor'

class ApiClient {
	private baseURL: string
	private headers: HeadersInit = {
		'Content-Type': 'application/json',
	}

	constructor() {
		this.baseURL = API_CONFIG.baseURL + API_CONFIG.apiPrefix
	}

	private getAuthHeaders(): HeadersInit {
		if (typeof window === 'undefined') return {}

		const token = useAuthStore.getState().accessToken
		if (token) {
			return { Authorization: `Bearer ${token}` }
		}
		return {}
	}

	private async handleResponse<T>(response: Response): Promise<T> {
		if (!response.ok) {
			const error: ApiError = await response.json()
			throw error
		}

		// Для 204 No Content возвращаем пустой объект
		if (response.status === 204) {
			return {} as T
		}

		const data: ApiResponse<T> = await response.json()
		return data.data
	}

	async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
		const url = new URL(this.baseURL + endpoint)

		if (params) {
			Object.keys(params).forEach((key) => {
				if (params[key] !== undefined && params[key] !== null) {
					url.searchParams.append(key, params[key].toString())
				}
			})
		}

		const response = await fetchWithInterceptor(url.toString(), {
			method: 'GET',
			headers: {
				...this.headers,
				...this.getAuthHeaders(),
			},
		})

		return this.handleResponse<T>(response)
	}

	async post<T>(endpoint: string, data?: any): Promise<T> {
		const response = await fetchWithInterceptor(this.baseURL + endpoint, {
			method: 'POST',
			headers: {
				...this.headers,
				...this.getAuthHeaders(),
			},
			body: JSON.stringify(data),
		})

		return this.handleResponse<T>(response)
	}

	async put<T>(endpoint: string, data?: any): Promise<T> {
		const response = await fetchWithInterceptor(this.baseURL + endpoint, {
			method: 'PUT',
			headers: {
				...this.headers,
				...this.getAuthHeaders(),
			},
			body: JSON.stringify(data),
		})

		return this.handleResponse<T>(response)
	}

	async delete<T>(endpoint: string): Promise<T> {
		const response = await fetchWithInterceptor(this.baseURL + endpoint, {
			method: 'DELETE',
			headers: {
				...this.headers,
				...this.getAuthHeaders(),
			},
		})

		return this.handleResponse<T>(response)
	}
}

export const apiClient = new ApiClient()
