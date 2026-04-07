import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const inicioMes = new Date()
  inicioMes.setDate(1)
  inicioMes.setHours(0, 0, 0, 0)

  const limiteAlerta = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  const [
    totalClientes,
    itensEmArmazem,
    alertas,
    itensMes,
  ] = await Promise.all([
    prisma.cliente.count({ where: { status: 'ATIVA' } }),
    prisma.item.count({ where: { status: { in: ['RECEBIDO', 'EM_ARMAZEM'] } } }),
    prisma.item.count({
      where: {
        status: { in: ['RECEBIDO', 'EM_ARMAZEM'] },
        dataEntrada: { lte: limiteAlerta },
      },
    }),
    prisma.item.count({
      where: {
        status: { in: ['ENVIADO', 'ENTREGUE'] },
        dataEnvio: { gte: inicioMes },
      },
    }),
  ])

  return NextResponse.json({ totalClientes, itensEmArmazem, alertas, itensMes })
}
