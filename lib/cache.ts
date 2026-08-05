import { unstable_cache } from 'next/cache'
import { prisma } from './prisma'
import { clienteWhereFromSession } from './cliente-session'

type ClienteSessionUser = {
  id?: string | null
  email?: string | null
  numeroDeSuite?: number | null
}

/**
 * Cache de dados do dashboard do cliente.
 * Revalida a cada 30 segundos — suficiente para não parecer stale,
 * mas evita bater no banco a cada navegação.
 */
export async function getClienteDashboard(user: ClienteSessionUser) {
  const cliente = await prisma.cliente.findFirst({
    where: clienteWhereFromSession(user),
    include: {
      itens: {
        orderBy: { dataEntrada: 'desc' },
        take: 5,
      },
    },
  })

  if (!cliente) return null

  const [emArmazem, emEnvio, entregues] = await Promise.all([
    prisma.item.count({ where: { clienteId: cliente.id, status: { in: ['RECEBIDO', 'EM_ARMAZEM'] } } }),
    prisma.item.count({ where: { clienteId: cliente.id, status: { in: ['EM_ENVIO', 'ENVIADO'] } } }),
    prisma.item.count({ where: { clienteId: cliente.id, status: 'ENTREGUE' } }),
  ])

  return { cliente, emArmazem, emEnvio, entregues }
}

/**
 * Cache de métricas do admin dashboard.
 * Revalida a cada 60 segundos.
 */
export const getAdminDashboard = unstable_cache(
  async () => {
    const [
      totalClientes,
      clientesAtivas,
      totalItens,
      itensEmArmazem,
      itensCriticos,
      novosHoje,
    ] = await Promise.all([
      prisma.cliente.count(),
      prisma.cliente.count({ where: { status: 'ATIVA' } }),
      prisma.item.count(),
      prisma.item.count({ where: { status: { in: ['RECEBIDO', 'EM_ARMAZEM'] } } }),
      prisma.item.count({
        where: {
          status: { in: ['RECEBIDO', 'EM_ARMAZEM'] },
          dataEntrada: { lte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
        },
      }),
      prisma.item.count({
        where: {
          criadoEm: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        },
      }).catch(() => 0),
    ])

    const itensRecentes = await prisma.item.findMany({
      orderBy: { dataEntrada: 'desc' },
      take: 10,
      include: { cliente: { select: { numeroDeSuite: true, nomeCompleto: true } } },
    })

    return { totalClientes, clientesAtivas, totalItens, itensEmArmazem, itensCriticos, novosHoje, itensRecentes }
  },
  ['admin-dashboard'],
  { revalidate: 60, tags: ['admin-dashboard'] }
)

/**
 * Cache de itens do cliente.
 * Revalida a cada 30 segundos.
 */
export async function getClienteItens(user: ClienteSessionUser) {
    const cliente = await prisma.cliente.findFirst({
      where: clienteWhereFromSession(user),
    })

    if (!cliente) return null

    const itens = await prisma.item.findMany({
      where: { clienteId: cliente.id },
      orderBy: { dataEntrada: 'desc' },
    })

    return { cliente, itens }
}

/**
 * Cache de envios do cliente.
 * Revalida a cada 30 segundos.
 */
export async function getClienteEnvios(user: ClienteSessionUser) {
  const cliente = await prisma.cliente.findFirst({
    where: clienteWhereFromSession(user),
  })

  if (!cliente) return null

  const envios = await prisma.envio.findMany({
    where: { clienteId: cliente.id },
    include: {
      itens: { include: { item: { select: { descricao: true } } } },
    },
    orderBy: { criadoEm: 'desc' },
  })

  return { cliente, envios }
}
