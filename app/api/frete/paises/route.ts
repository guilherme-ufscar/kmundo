import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { fretePaisSchema } from '@/lib/validations/frete'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const apenasAtivos = searchParams.get('todos') !== '1'
  const where = apenasAtivos ? { ativo: true } : undefined
  const paises = await prisma.fretePais.findMany({ where, orderBy: [{ ordem: 'asc' }, { nome: 'asc' }] })
  return NextResponse.json(paises)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const body = await req.json()
  const parsed = fretePaisSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  try {
    const pais = await prisma.fretePais.create({ data: parsed.data })
    return NextResponse.json(pais, { status: 201 })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : ''
    if (msg.includes('Unique constraint') || msg.includes('codigo')) return NextResponse.json({ error: 'Código já existe' }, { status: 409 })
    throw e
  }
}
