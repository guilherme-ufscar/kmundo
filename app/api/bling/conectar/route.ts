import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { randomBytes } from 'crypto'

export async function GET() {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') return NextResponse.redirect(new URL('/login', process.env.NEXTAUTH_URL))
  const clientId = process.env.BLING_CLIENT_ID
  if (!clientId) return NextResponse.json({ error: 'BLING_CLIENT_ID não configurado' }, { status: 500 })
  const state = randomBytes(24).toString('base64url')
  const url = new URL('https://www.bling.com.br/Api/v3/oauth/authorize')
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('client_id', clientId)
  url.searchParams.set('state', state)
  const response = NextResponse.redirect(url)
  response.cookies.set('bling_oauth_state', state, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 600, path: '/api/bling' })
  return response
}
