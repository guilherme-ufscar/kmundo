import NextAuth from 'next-auth'
import { authConfig } from '@/lib/auth.config'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const { auth } = NextAuth(authConfig)

export default auth((req: NextRequest & { auth: { user?: { role?: string } } | null }) => {
  const { nextUrl } = req
  const session = req.auth
  const isLoggedIn = !!session

  const isAuthPage =
    nextUrl.pathname.startsWith('/login') ||
    nextUrl.pathname.startsWith('/cadastro')
  const isAdminPage = nextUrl.pathname.startsWith('/admin')
  const isClientePage =
    nextUrl.pathname.startsWith('/dashboard') ||
    nextUrl.pathname.startsWith('/meus-itens') ||
    nextUrl.pathname.startsWith('/perfil')

  if (isAuthPage && isLoggedIn) {
    if (session?.user?.role === 'ADMIN') {
      return NextResponse.redirect(new URL('/admin/dashboard', nextUrl))
    }
    return NextResponse.redirect(new URL('/dashboard', nextUrl))
  }

  if (isAdminPage) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/login', nextUrl))
    }
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', nextUrl))
    }
  }

  if (isClientePage && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
