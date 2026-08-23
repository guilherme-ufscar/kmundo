import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { freteTarifaSchema } from '@/lib/validations/frete'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const parsed = freteTarifaSchema.partial().safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  const data: Record<string, unknown> = { ...parsed.data }
  if ('caixaTipoId' in data && !data.caixaTipoId) data.caixaTipoId = null
  const tarifa = await prisma.freteTarifa.update({ where: { id: params.id }, data })
  return NextResponse.json(tarifa)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  await prisma.freteTarifa.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
