import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const schema = z.object({
  nome: z.string().min(2).max(40).optional(),
  ordem: z.number().int().min(0).optional(),
  ativo: z.boolean().optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const parsed = schema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  try {
    const antes = await prisma.shopCategoria.findUnique({ where: { id: params.id } })
    const cat = await prisma.shopCategoria.update({ where: { id: params.id }, data: parsed.data })
    if (antes && parsed.data.nome && parsed.data.nome !== antes.nome) {
      await prisma.produtoShop.updateMany({ where: { categoria: antes.nome }, data: { categoria: parsed.data.nome } })
    }
    return NextResponse.json(cat)
  } catch {
    return NextResponse.json({ error: 'Categoria não encontrada ou nome duplicado' }, { status: 400 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  await prisma.shopCategoria.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
