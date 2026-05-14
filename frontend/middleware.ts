import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PROTECTED_PREFIX = '/dashboard'
const AUTH_COOKIE = 'access_token'

const PUBLIC_ONLY_ROUTES = ['/login', '/onboarding']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get(AUTH_COOKIE)?.value

  const isProtected = pathname.startsWith(PROTECTED_PREFIX)
  const isPublicOnly = PUBLIC_ONLY_ROUTES.some((r) => pathname.startsWith(r))

  // No token → block dashboard access
  if (isProtected && !token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Has token → skip login/onboarding, send to dashboard
  if (isPublicOnly && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/onboarding'],
}
