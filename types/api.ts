// types/api.ts
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

export interface RequestOtpDto {
  phone: string
  deviceInfo?: {
    platform?: string
    version?: string
    browser?: string
  }
}

export interface RequestOtpResponseDto {
  message: string
  resendAfter: number
  code?: string
}

export interface VerifyOtpDto {
  phone: string
  code: string
  deviceInfo?: {
    platform?: string
    version?: string
    browser?: string
  }
}

export interface AuthResponseDto {
  accessToken: string
  refreshToken: string
  expiresIn: number
  tokenType: string
  user: {
    id: string
    phone: string
    role: UserRole
    firstName?: string | null
    lastName?: string | null
    email?: string | null
  }
}

export interface RefreshTokenDto {
  refreshToken: string
}

export interface CreateAnonymousSessionDto {
  deviceInfo?: {
    platform?: string
    version?: string
    browser?: string
  }
}

export interface AnonymousSessionResponseDto {
  sessionToken: string
  sessionId: string
  expiresIn: number
}

export enum UserRole {
  CUSTOMER = "CUSTOMER",
  MANAGER = "MANAGER",
  ADMIN = "ADMIN",
}

export interface UserResponseDto {
  id: string
  phone: string
  role: UserRole
  firstName?: string | null
  lastName?: string | null
  email?: string | null
  isActive: boolean
  lastLoginAt?: string | null
  createdAt: string
  updatedAt: string
}

export interface UpdateProfileDto {
  firstName?: string
  lastName?: string
  email?: string
}

export interface UpdateUserDto extends UpdateProfileDto {
  role?: UserRole
  isActive?: boolean
}

export interface CreateUserDto {
  phone: string
  role: UserRole
  firstName?: string
  lastName?: string
  email?: string
}

export interface UsersListResponseDto {
  data: UserResponseDto[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface UserRoleStatsDto {
  customer: number
  manager: number
  admin: number
}

export interface UserStatsResponseDto {
  total: number
  active: number
  inactive: number
  byRole: UserRoleStatsDto
  recentRegistrations: number
}

export interface GetUsersFilterDto {
  role?: UserRole
  isActive?: boolean
  search?: string
  page?: number
  limit?: number
  sortBy?: "createdAt" | "updatedAt" | "firstName" | "lastName" | "phone"
  sortOrder?: "asc" | "desc"
}
