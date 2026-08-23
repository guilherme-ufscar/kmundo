import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const schema = z.object({
  nome: z.string().min(2, 'Nome mínimo 2').max(40),
  ordem: z.number().int().min(0).default(0),
  ativo: z.boolean().default(true),
})

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const apenasAtivas = searchParams.get('todas') !== '1'
  const categorias = await prisma.shopCategoria.findMany({
    where: apenasAtivas ? { ativo: true } : undefined,
    orderBy: [{ ordem: 'asc' }, { nome: 'asc' }],
  })
  return NextResponse.json(categorias)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const parsed = schema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  try {
    const cat = await prisma.shopCategoria.create({ data: parsed.data })
    return NextResponse.json(cat, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Categoria já existe' }, { status: 409 })
  }
}
