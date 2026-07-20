import type { Prisma } from '@prisma/client'

type ClienteSessionUser = {
  id?: string | null
  email?: string | null
  numeroDeSuite?: number | null
}

export function clienteWhereFromSession(user: ClienteSessionUser): Prisma.ClienteWhereInput {
  const OR: Prisma.ClienteWhereInput[] = []
  if (user.id) OR.push({ usuarioId: user.id })
  if (user.numeroDeSuite) OR.push({ numeroDeSuite: user.numeroDeSuite })
  if (user.email) OR.push({ usuario: { email: user.email } })
  return OR.length ? { OR } : { id: '__sem_cliente__' }
}

export function clienteMatchesSession(cliente: { usuarioId: string; numeroDeSuite: number; usuario?: { email?: string | null } }, user: ClienteSessionUser) {
  return Boolean(
    (user.id && cliente.usuarioId === user.id) ||
    (user.numeroDeSuite && cliente.numeroDeSuite === user.numeroDeSuite) ||
    (user.email && cliente.usuario?.email === user.email)
  )
}
