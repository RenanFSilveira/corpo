import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  const { password } = await req.json()
  const AUTH_PASSWORD = process.env.AUTH_PASSWORD
  const SESSION_SECRET = process.env.SESSION_SECRET

  if (!AUTH_PASSWORD || !SESSION_SECRET) {
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
  }

  if (password !== AUTH_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Store the opaque SESSION_SECRET — never the password itself
  const cookieStore = await cookies()
  cookieStore.set('auth_token', SESSION_SECRET, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  })

  return NextResponse.json({ ok: true })
}

export async function DELETE() {
  const cookieStore = await cookies()
  cookieStore.delete('auth_token')
  return NextResponse.json({ ok: true })
}
