import 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      role: string
      numeroDeSuite: number | null
      nomeCompleto: string | null
    }
  }

  interface User {
    id: string
    email: string
    role: string
    numeroDeSuite: number | null
    nomeCompleto: string | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string
    numeroDeSuite: number | null
    nomeCompleto: string | null
  }
}
