import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { atualizacaoSchema } from '@/lib/validations/atualizacao'

export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const atualizacao = await prisma.atualizacao.findUnique({
    where: { id: params.id },
    include: { _count: { select: { leituras: true } } },
  })
  if (!atualizacao) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })
  return NextResponse.json(atualizacao)
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const body = await req.json()
  const parsed = atualizacaoSchema.partial().safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  const atualizacao = await prisma.atualizacao.update({ where: { id: params.id }, data: parsed.data })
  return NextResponse.json(atualizacao)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  await prisma.atualizacao.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
