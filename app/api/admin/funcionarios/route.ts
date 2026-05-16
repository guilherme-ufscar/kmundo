import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { funcionarioSchema } from '@/lib/validations/funcionario'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const busca = searchParams.get('busca') ?? ''

  const funcionarios = await prisma.funcionario.findMany({
    where: busca
      ? {
          OR: [
            { nomeCompleto: { contains: busca, mode: 'insensitive' } },
            { email: { contains: busca, mode: 'insensitive' } },
            { cargo: { contains: busca, mode: 'insensitive' } },
          ],
        }
      : undefined,
    include: { lancamentos: true },
    orderBy: { nomeCompleto: 'asc' },
  })

  return NextResponse.json(funcionarios)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const body = await req.json()
  const parsed = funcionarioSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten(), message: 'Dados inválidos para cadastrar funcionário' }, { status: 400 })
  }

  const funcionario = await prisma.funcionario.create({
    data: {
      nomeCompleto: parsed.data.nomeCompleto,
      email: parsed.data.email || undefined,
      telefone: parsed.data.telefone || undefined,
      cargo: parsed.data.cargo || undefined,
      dataAdmissao: parsed.data.dataAdmissao ? new Date(parsed.data.dataAdmissao) : undefined,
      salarioBase: parsed.data.salarioBase ?? undefined,
      status: parsed.data.status ?? 'ATIVO',
      observacoes: parsed.data.observacoes || undefined,
    },
    include: { lancamentos: true },
  })

  return NextResponse.json(funcionario, { status: 201 })
}
