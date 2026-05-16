import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { lancamentoFuncionarioSchema } from '@/lib/validations/funcionario'

export async function POST(
  req: NextRequest,
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

  const body = await req.json()
  const parsed = lancamentoFuncionarioSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten(), message: 'Dados inválidos para registrar lançamento' }, { status: 400 })
  }

  const lancamento = await prisma.lancamentoFuncionario.create({
    data: {
      funcionarioId: params.id,
      tipo: parsed.data.tipo,
      dataReferencia: new Date(parsed.data.dataReferencia),
      valor: parsed.data.valor ?? undefined,
      horas: parsed.data.horas ?? undefined,
      quantidadeDias: parsed.data.quantidadeDias ?? undefined,
      arquivoAtestado: parsed.data.arquivoAtestado || undefined,
      descricao: parsed.data.descricao || undefined,
    },
  })

  return NextResponse.json(lancamento, { status: 201 })
}
