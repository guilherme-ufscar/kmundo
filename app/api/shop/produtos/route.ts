import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const schema = z.object({
  nome: z.string().min(2),
  descricao: z.string().optional(),
  precoEstimado: z.number().min(0).optional(),
  moeda: z.string().default('BRL'),
  imagemUrl: z.string().optional(),
  urlProduto: z.string().optional(),
  ativo: z.boolean().default(true),
  ordem: z.number().int().default(0),
})

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const apenasAtivos = session.user.role !== 'ADMIN' || searchParams.get('todos') !== '1'
  const produtos = await prisma.produtoShop.findMany({
    where: apenasAtivos ? { ativo: true } : undefined,
    orderBy: [{ ordem: 'asc' }, { criadoEm: 'desc' }],
  })
  return NextResponse.json(produtos)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const parsed = schema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  return NextResponse.json(await prisma.produtoShop.create({ data: parsed.data }), { status: 201 })
}
