// src/types/index.ts
export enum Role {
  CUSTOMER = "CUSTOMER",
  MANAGER = "MANAGER",
  ADMIN = "ADMIN",
}

export interface User {
  id: string
  phone: string
  role: Role
  firstName?: string
  lastName?: string
  email?: string
  isActive: boolean
  lastLoginAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
  tokenType: string
}

export interface AuthResponse extends AuthTokens {
  user: {
    id: string
    phone: string
    role: string
    firstName?: string
    lastName?: string
    email?: string
  }
}

export interface RequestOtpDto {
  phone: string
  deviceInfo?: Record<string, any>
}

export interface RequestOtpResponse {
  message: string
  resendAfter: number
  code?: string
}

export interface VerifyOtpDto {
  phone: string
  code: string
  deviceInfo?: Record<string, any>
}

export interface RefreshTokenDto {
  refreshToken: string
}

export interface CreateAnonymousSessionDto {
  deviceInfo?: Record<string, any>
}

export interface AnonymousSessionResponse {
  sessionToken: string
  sessionId: string
  expiresIn: number
}

export interface UpdateProfileDto {
  firstName?: string
  lastName?: string
  email?: string
}

export interface UpdateUserDto extends UpdateProfileDto {
  role?: Role
  isActive?: boolean
}

export interface CreateUserDto {
  phone: string
  role: Role
  firstName?: string
  lastName?: string
  email?: string
}

export interface GetUsersFilterDto {
  role?: Role
  isActive?: boolean
  search?: string
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

export interface UsersListResponse {
  data: User[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  timestamp: string
  path: string
}

export interface ApiError {
  statusCode: number
  message: string
  error: string
  timestamp: string
  path: string
}

export interface UserStats {
  total: number
  active: number
  inactive: number
  byRole: {
    customer: number
    manager: number
    admin: number
  }
  recentRegistrations: number
}
