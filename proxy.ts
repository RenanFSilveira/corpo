import { NextRequest, NextResponse } from 'next/server'

const AUTH_PASSWORD = process.env.AUTH_PASSWORD

const PUBLIC_PATHS = ['/api/auth', '/login', '/_next', '/favicon.ico', '/manifest.json', '/icons']

export function proxy(req: NextRequest) {
  if (!AUTH_PASSWORD) return NextResponse.next()

  const { pathname } = req.nextUrl

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  const cookie = req.cookies.get('auth_token')
  if (cookie?.value === AUTH_PASSWORD) {
    return NextResponse.next()
  }

  if (pathname === '/login') return NextResponse.next()

  const loginUrl = req.nextUrl.clone()
  loginUrl.pathname = '/login'
  loginUrl.searchParams.set('from', pathname)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
