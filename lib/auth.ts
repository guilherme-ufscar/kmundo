import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { compare } from 'bcryptjs'
import { prisma } from './prisma'
import { z } from 'zod'
import { authConfig } from './auth.config'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null

        const { email, password } = parsed.data

        const usuario = await prisma.usuario.findUnique({
          where: { email },
          include: { cliente: true },
        })

        if (!usuario) return null

        const senhaValida = await compare(password, usuario.senha)
        if (!senhaValida) return null

        return {
          id: usuario.id,
          email: usuario.email,
          role: usuario.role,
          numeroDeSuite: usuario.cliente?.numeroDeSuite ?? null,
          nomeCompleto: usuario.cliente?.nomeCompleto ?? null,
        }
      },
    }),
  ],
})
