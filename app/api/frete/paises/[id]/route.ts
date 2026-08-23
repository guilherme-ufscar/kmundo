import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { fretePaisSchema } from '@/lib/validations/frete'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const body = await req.json()
  const parsed = fretePaisSchema.partial().safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  const data: Record<string, unknown> = { ...parsed.data }
  if (typeof data.codigo === 'string') data.codigo = (data.codigo as string).toUpperCase().trim()
  const pais = await prisma.fretePais.update({ where: { id: params.id }, data })
  return NextResponse.json(pais)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  await prisma.fretePais.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
