import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { enviarEmailAtualizacao } from '@/lib/email'

export const dynamic = 'force-dynamic'

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const atualizacao = await prisma.atualizacao.findUnique({ where: { id: params.id } })
  if (!atualizacao) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })
  await enviarEmailAtualizacao({ titulo: atualizacao.titulo, conteudo: atualizacao.conteudo, id: atualizacao.id })
  return NextResponse.json({ ok: true })
}
