import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { freteTarifaSchema } from '@/lib/validations/frete'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const paisId = searchParams.get('paisId')
  const caixaTipoId = searchParams.get('caixaTipoId')
  const apenasAtivos = searchParams.get('todos') !== '1'
  const where: Record<string, unknown> = {}
  if (paisId) where.paisId = paisId
  if (caixaTipoId) where.caixaTipoId = caixaTipoId
  if (apenasAtivos) where.ativo = true
  const tarifas = await prisma.freteTarifa.findMany({
    where,
    include: { pais: { select: { nome: true, codigo: true } }, caixaTipo: { select: { nome: true } } },
    orderBy: [{ paisId: 'asc' }, { pesoMin: 'asc' }],
  })
  return NextResponse.json(tarifas)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const parsed = freteTarifaSchema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  const tarifa = await prisma.freteTarifa.create({ data: { ...parsed.data, caixaTipoId: parsed.data.caixaTipoId || null } })
  return NextResponse.json(tarifa, { status: 201 })
}
