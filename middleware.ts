// src/middleware.ts
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { Role } from "@/types"

const PUBLIC_PATHS = ["/auth/login", "/auth/register"]
const ADMIN_PATHS = ["/admin"]
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"

async function createAnonymousSession(request: NextRequest) {
  try {
    const response = await fetch(`${API_URL}/api/v1/auth/anonymous`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        deviceInfo: {
          userAgent: request.headers.get("user-agent"),
          platform: "web",
        },
      }),
    })

    if (response.ok) {
      const data = await response.json()
      return data.data.sessionToken
    }
  } catch (error) {
    console.error("Failed to create anonymous session:", error)
  }
  return null
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const response = NextResponse.next()

  // Get tokens from cookies
  const accessToken = request.cookies.get("access_token")?.value
  const anonymousToken = request.cookies.get("anonymous_token")?.value
  const userCookie = request.cookies.get("user")?.value

  let user = null
  if (userCookie) {
    try {
      user = JSON.parse(userCookie)
    } catch {
      // Invalid user cookie
    }
  }

  // If no token at all, create anonymous session
  if (
    !accessToken &&
    !anonymousToken &&
    !PUBLIC_PATHS.some(path => pathname.startsWith(path))
  ) {
    const newAnonymousToken = await createAnonymousSession(request)
    if (newAnonymousToken) {
      response.cookies.set("anonymous_token", newAnonymousToken, {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: "/",
      })
    }
  }

  // Check admin panel access
  if (pathname.startsWith("/admin")) {
    if (!user || ![Role.ADMIN, Role.MANAGER].includes(user.role)) {
      // Redirect to login with return URL
      const url = new URL("/auth/login", request.url)
      url.searchParams.set("returnUrl", pathname)
      return NextResponse.redirect(url)
    }
  }

  // Redirect authenticated managers/admins from public paths to admin
  if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
    if (user && [Role.ADMIN, Role.MANAGER].includes(user.role)) {
      return NextResponse.redirect(new URL("/admin", request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
