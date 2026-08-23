import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { clienteWhereFromSession } from '@/lib/cliente-session'

export const dynamic = 'force-dynamic'

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const cliente = await prisma.cliente.findFirst({ where: clienteWhereFromSession(session.user) })
  if (!cliente) return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 })

  const atualizacao = await prisma.atualizacao.findUnique({ where: { id: params.id } })
  if (!atualizacao) return NextResponse.json({ error: 'Atualização não encontrada' }, { status: 404 })

  const leitura = await prisma.leituraAtualizacao.upsert({
    where: { atualizacaoId_clienteId: { atualizacaoId: params.id, clienteId: cliente.id } },
    update: { confirmadoEm: new Date() },
    create: { atualizacaoId: params.id, clienteId: cliente.id },
  })

  return NextResponse.json({ ok: true, confirmadoEm: leitura.confirmadoEm })
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  if (session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })

  const leituras = await prisma.leituraAtualizacao.findMany({
    where: { atualizacaoId: params.id },
    include: { cliente: { select: { nomeCompleto: true, numeroDeSuite: true, usuario: { select: { email: true } } } } },
    orderBy: { confirmadoEm: 'desc' },
  })

  const totalClientes = await prisma.cliente.count()
  const confirmaram = leituras.length
  const pendentes = await prisma.cliente.findMany({
    where: { id: { notIn: leituras.map(l => l.clienteId) } },
    select: { nomeCompleto: true, numeroDeSuite: true, usuario: { select: { email: true } } },
  })

  return NextResponse.json({ totalClientes, confirmaram, pendentesCount: pendentes.length, leituras, pendentes })
}
