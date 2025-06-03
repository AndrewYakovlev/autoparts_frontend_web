// lib/services/user.service.ts
import { apiClient } from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/api/config'
import {
  UserResponseDto,
  UpdateProfileDto,
  UpdateUserDto,
  CreateUserDto,
  UsersListResponseDto,
  UserStatsResponseDto,
  GetUsersFilterDto,
} from '@/types/api'

class UserService {
  async getProfile(): Promise<UserResponseDto> {
    return apiClient.get<UserResponseDto>(API_ENDPOINTS.users.profile)
  }

  async updateProfile(data: UpdateProfileDto): Promise<UserResponseDto> {
    return apiClient.put<UserResponseDto>(API_ENDPOINTS.users.profile, data)
  }

  async getUsers(params?: GetUsersFilterDto): Promise<UsersListResponseDto> {
    return apiClient.get<UsersListResponseDto>(API_ENDPOINTS.users.list, params)
  }

  async getUserById(id: string): Promise<UserResponseDto> {
    return apiClient.get<UserResponseDto>(API_ENDPOINTS.users.byId(id))
  }

  async createUser(data: CreateUserDto): Promise<UserResponseDto> {
    return apiClient.post<UserResponseDto>(API_ENDPOINTS.users.list, data)
  }

  async updateUser(id: string, data: UpdateUserDto): Promise<UserResponseDto> {
    return apiClient.put<UserResponseDto>(API_ENDPOINTS.users.byId(id), data)
  }

  async deleteUser(id: string): Promise<void> {
    return apiClient.delete<void>(API_ENDPOINTS.users.byId(id))
  }

  async getUserStats(): Promise<UserStatsResponseDto> {
    return apiClient.get<UserStatsResponseDto>(API_ENDPOINTS.users.stats)
  }
}

export const userService = new UserService()
