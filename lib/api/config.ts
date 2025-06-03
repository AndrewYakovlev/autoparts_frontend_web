// lib/api/config.ts
export const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000",
  apiPrefix: "/api/v1/",
  timeout: 30000,
}

export const API_ENDPOINTS = {
  auth: {
    requestOtp: "/auth/otp/request",
    verifyOtp: "/auth/otp/verify",
    refreshToken: "/auth/token/refresh",
    createAnonymousSession: "/auth/anonymous",
    logout: "/auth/logout",
    logoutAll: "/auth/logout/all",
  },
  users: {
    profile: "/users/profile",
    list: "/users",
    stats: "/users/stats",
    byId: (id: string) => `/users/${id}`,
  },
}
