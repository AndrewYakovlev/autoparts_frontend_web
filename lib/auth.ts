// src/lib/auth.ts
import { getCookie, setCookie, deleteCookie } from "cookies-next";
import { cookies } from "next/headers";
import type { AuthTokens, User } from "@/types";
import { Role } from "@/types";

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const ANONYMOUS_TOKEN_KEY = "anonymous_token";
const USER_KEY = "user";

// Cookie options
const cookieOptions = {
  httpOnly: false, // Делаем false для доступа на клиенте
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

// Client-side token management
export const clientAuth = {
  setTokens: (tokens: AuthTokens) => {
    setCookie(ACCESS_TOKEN_KEY, tokens.accessToken, {
      ...cookieOptions,
      maxAge: tokens.expiresIn,
    });
    setCookie(REFRESH_TOKEN_KEY, tokens.refreshToken, {
      ...cookieOptions,
      maxAge: 90 * 24 * 60 * 60, // 90 days
    });
  },

  setAnonymousToken: (token: string, expiresIn: number) => {
    setCookie(ANONYMOUS_TOKEN_KEY, token, {
      ...cookieOptions,
      maxAge: expiresIn,
    });
  },

  setUser: (user: User | null) => {
    if (user) {
      setCookie(USER_KEY, JSON.stringify(user), cookieOptions);
    } else {
      deleteCookie(USER_KEY);
    }
  },

  getAccessToken: (): string | null => {
    return getCookie(ACCESS_TOKEN_KEY) as string | null;
  },

  getRefreshToken: (): string | null => {
    return getCookie(REFRESH_TOKEN_KEY) as string | null;
  },

  getAnonymousToken: (): string | null => {
    return getCookie(ANONYMOUS_TOKEN_KEY) as string | null;
  },

  getUser: (): User | null => {
    const userCookie = getCookie(USER_KEY) as string | null;
    if (!userCookie) return null;
    try {
      return JSON.parse(userCookie);
    } catch {
      return null;
    }
  },

  clearTokens: () => {
    deleteCookie(ACCESS_TOKEN_KEY);
    deleteCookie(REFRESH_TOKEN_KEY);
    deleteCookie(USER_KEY);
  },

  clearAll: () => {
    deleteCookie(ACCESS_TOKEN_KEY);
    deleteCookie(REFRESH_TOKEN_KEY);
    deleteCookie(ANONYMOUS_TOKEN_KEY);
    deleteCookie(USER_KEY);
  },
};

// Server-side token management
export const serverAuth = {
  getAccessToken: async (): Promise<string | null> => {
    const cookieStore = await cookies();
    return cookieStore.get(ACCESS_TOKEN_KEY)?.value || null;
  },

  getRefreshToken: async (): Promise<string | null> => {
    const cookieStore = await cookies();
    return cookieStore.get(REFRESH_TOKEN_KEY)?.value || null;
  },

  getAnonymousToken: async (): Promise<string | null> => {
    const cookieStore = await cookies();
    return cookieStore.get(ANONYMOUS_TOKEN_KEY)?.value || null;
  },

  getUser: async (): Promise<User | null> => {
    const cookieStore = await cookies();
    const userCookie = cookieStore.get(USER_KEY)?.value;
    if (!userCookie) return null;
    try {
      return JSON.parse(userCookie);
    } catch {
      return null;
    }
  },

  setTokens: async (tokens: AuthTokens) => {
    const cookieStore = await cookies();
    cookieStore.set(ACCESS_TOKEN_KEY, tokens.accessToken, {
      ...cookieOptions,
      maxAge: tokens.expiresIn,
    });
    cookieStore.set(REFRESH_TOKEN_KEY, tokens.refreshToken, {
      ...cookieOptions,
      maxAge: 90 * 24 * 60 * 60, // 90 days
    });
  },

  setAnonymousToken: async (token: string, expiresIn: number) => {
    const cookieStore = await cookies();
    cookieStore.set(ANONYMOUS_TOKEN_KEY, token, {
      ...cookieOptions,
      maxAge: expiresIn,
    });
  },

  clearTokens: async () => {
    const cookieStore = await cookies();
    cookieStore.delete(ACCESS_TOKEN_KEY);
    cookieStore.delete(REFRESH_TOKEN_KEY);
    cookieStore.delete(USER_KEY);
  },
};

// Check if user has required role
export const hasRole = (user: User | null, roles: string[]): boolean => {
  if (!user) return false;
  return roles.includes(user.role);
};

// Check if user is authenticated
export const isAuthenticated = (user: User | null): boolean => {
  return user !== null;
};

// Check if user can access admin panel
export const canAccessAdminPanel = (user: User | null): boolean => {
  return hasRole(user, [Role.ADMIN, Role.MANAGER]);
};
