// middleware.ts
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Пути, требующие авторизации
const protectedPaths = ["/admin", "/profile"]

// Пути только для неавторизованных
const authPaths = ["/login"]

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Проверяем наличие токена в cookies (zustand persist сохраняет в localStorage)
  // Для SSR нужно дополнительно сохранять в cookies
  const authCookie = request.cookies.get("auth-storage")
  let isAuthenticated = false

  if (authCookie) {
    try {
      const authData = JSON.parse(authCookie.value)
      isAuthenticated = authData.state?.isAuthenticated || false
    } catch {
      isAuthenticated = false
    }
  }

  // Проверка защищенных маршрутов
  const isProtectedPath = protectedPaths.some(p => path.startsWith(p))
  if (isProtectedPath && !isAuthenticated) {
    const url = new URL("/login", request.url)
    url.searchParams.set("from", path)
    return NextResponse.redirect(url)
  }

  // Проверка маршрутов только для неавторизованных
  const isAuthPath = authPaths.some(p => path.startsWith(p))
  if (isAuthPath && isAuthenticated) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
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
