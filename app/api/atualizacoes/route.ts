import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { atualizacaoSchema } from '@/lib/validations/atualizacao'
import { enviarEmailAtualizacao } from '@/lib/email'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const busca = searchParams.get('busca')?.trim() ?? ''
  const arquivada = searchParams.get('arquivada')
  const where: Record<string, unknown> = {}
  if (arquivada === 'true') where['arquivada'] = true
  else if (arquivada === 'false') where['arquivada'] = false
  if (busca) where['titulo'] = { contains: busca, mode: 'insensitive' }

  const atualizacoes = await prisma.atualizacao.findMany({
    where,
    include: { _count: { select: { leituras: true } } },
    orderBy: { publicadaEm: 'desc' },
  })

  // Para cliente, incluir se já leu
  if (session.user.role === 'CLIENTE') {
    const cliente = await prisma.cliente.findFirst({ where: { usuarioId: session.user.id } })
    if (cliente) {
      const leituras = await prisma.leituraAtualizacao.findMany({ where: { clienteId: cliente.id } })
      const lidoSet = new Set(leituras.map(l => l.atualizacaoId))
      return NextResponse.json(atualizacoes.map(a => ({ ...a, lida: lidoSet.has(a.id) })))
    }
  }

  return NextResponse.json(atualizacoes)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const body = await req.json()
  const parsed = atualizacaoSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const atualizacao = await prisma.atualizacao.create({
    data: {
      titulo: parsed.data.titulo,
      conteudo: parsed.data.conteudo,
      arquivada: parsed.data.arquivada ?? false,
      publicadaEm: new Date(),
    },
  })

  // Envio automático de e-mail para todos os clientes (não bloqueia resposta)
  if (!atualizacao.arquivada) {
    enviarEmailAtualizacao({ titulo: atualizacao.titulo, conteudo: atualizacao.conteudo, id: atualizacao.id }).catch(console.error)
  }

  return NextResponse.json(atualizacao, { status: 201 })
}
