import { NextRequest, NextResponse } from 'next/server'

const SESSION_SECRET = process.env.SESSION_SECRET

const PUBLIC_PATHS = ['/api/auth', '/login', '/_next', '/favicon.ico', '/manifest.json', '/icons', '/sw.js']

export function middleware(req: NextRequest) {
  if (!SESSION_SECRET) return NextResponse.next()

  const { pathname } = req.nextUrl

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  const cookie = req.cookies.get('auth_token')
  if (cookie?.value === SESSION_SECRET) {
    return NextResponse.next()
  }

  const loginUrl = req.nextUrl.clone()
  loginUrl.pathname = '/login'
  loginUrl.searchParams.set('from', pathname)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
