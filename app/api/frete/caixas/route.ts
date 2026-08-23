import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { freteCaixaSchema } from '@/lib/validations/frete'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const apenasAtivos = searchParams.get('todos') !== '1'
  const where = apenasAtivos ? { ativo: true } : undefined
  const caixas = await prisma.freteCaixaTipo.findMany({ where, orderBy: [{ ordem: 'asc' }, { nome: 'asc' }] })
  return NextResponse.json(caixas)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const parsed = freteCaixaSchema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  const caixa = await prisma.freteCaixaTipo.create({ data: parsed.data as never })
  return NextResponse.json(caixa, { status: 201 })
}
