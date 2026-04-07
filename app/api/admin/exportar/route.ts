import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { calcularDiasArmazenado } from '@/lib/utils'

export async function GET() {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const itens = await prisma.item.findMany({
    orderBy: { dataEntrada: 'desc' },
    include: { cliente: { select: { numeroDeSuite: true, nomeCompleto: true } } },
  })

  const linhas = [
    ['Suite', 'Cliente', 'Descrição', 'Loja', 'Tracking', 'Status', 'Dias', 'Data Entrada'],
    ...itens.map((i) => [
      String(i.cliente.numeroDeSuite).padStart(3, '0'),
      i.cliente.nomeCompleto,
      `"${i.descricao.replace(/"/g, '""')}"`,
      i.lojaOrigem ?? '',
      i.trackingLoja ?? '',
      i.status,
      String(calcularDiasArmazenado(i.dataEntrada)),
      i.dataEntrada.toLocaleDateString('pt-BR'),
    ]),
  ]

  const csv = linhas.map((l) => l.join(',')).join('\n')

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="itens-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  })
}
