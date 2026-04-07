import type { NextAuthConfig } from 'next-auth'

// Configuração mínima para o middleware (Edge Runtime)
// NÃO importa Prisma nem bcrypt — apenas valida o JWT
export const authConfig: NextAuthConfig = {
  trustHost: true,
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role: string }).role
        token.numeroDeSuite = (user as { numeroDeSuite: number | null }).numeroDeSuite
        token.nomeCompleto = (user as { nomeCompleto: string | null }).nomeCompleto
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub as string
        session.user.role = token.role as string
        session.user.numeroDeSuite = token.numeroDeSuite as number | null
        session.user.nomeCompleto = token.nomeCompleto as string | null
      }
      return session
    },
  },
  providers: [],
  session: {
    strategy: 'jwt',
  },
}
