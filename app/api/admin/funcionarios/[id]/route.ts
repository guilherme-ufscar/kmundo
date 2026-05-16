import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { funcionarioSchema } from '@/lib/validations/funcionario'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const funcionario = await prisma.funcionario.findUnique({
    where: { id: params.id },
    include: { lancamentos: { orderBy: { dataReferencia: 'desc' } } },
  })

  if (!funcionario) {
    return NextResponse.json({ error: 'Funcionário não encontrado' }, { status: 404 })
  }

  return NextResponse.json(funcionario)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const existente = await prisma.funcionario.findUnique({ where: { id: params.id } })
  if (!existente) {
    return NextResponse.json({ error: 'Funcionário não encontrado' }, { status: 404 })
  }

  const body = await req.json()
  const parsed = funcionarioSchema.partial().safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten(), message: 'Dados inválidos para atualizar funcionário' }, { status: 400 })
  }

  const funcionario = await prisma.funcionario.update({
    where: { id: params.id },
    data: {
      nomeCompleto: parsed.data.nomeCompleto,
      email: parsed.data.email === '' ? null : parsed.data.email,
      telefone: parsed.data.telefone === '' ? null : parsed.data.telefone,
      cargo: parsed.data.cargo === '' ? null : parsed.data.cargo,
      dataAdmissao: parsed.data.dataAdmissao ? new Date(parsed.data.dataAdmissao) : parsed.data.dataAdmissao === '' ? null : undefined,
      salarioBase: parsed.data.salarioBase,
      status: parsed.data.status,
      observacoes: parsed.data.observacoes === '' ? null : parsed.data.observacoes,
    },
    include: { lancamentos: { orderBy: { dataReferencia: 'desc' } } },
  })

  return NextResponse.json(funcionario)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const funcionario = await prisma.funcionario.findUnique({ where: { id: params.id } })
  if (!funcionario) {
    return NextResponse.json({ error: 'Funcionário não encontrado' }, { status: 404 })
  }

  await prisma.funcionario.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
