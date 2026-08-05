import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const schema = z.object({
  nome: z.string().min(2).optional(),
  descricao: z.string().optional().nullable(),
  precoEstimado: z.number().min(0).optional().nullable(),
  moeda: z.string().optional(),
  imagemUrl: z.string().optional().nullable(),
  urlProduto: z.string().optional().nullable(),
  ativo: z.boolean().optional(),
  ordem: z.number().int().optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const parsed = schema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  return NextResponse.json(await prisma.produtoShop.update({ where: { id: params.id }, data: parsed.data }))
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  await prisma.produtoShop.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
