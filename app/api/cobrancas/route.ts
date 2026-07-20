import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { clienteWhereFromSession } from '@/lib/cliente-session'
import { z } from 'zod'

const schema = z.object({
  clienteId: z.string(), envioId: z.string().optional(), solicitacaoId: z.string().optional(),
  descricao: z.string().min(3), valor: z.number().positive(), moeda: z.string().default('BRL'),
  chavePix: z.string().optional(), copiaEColaPix: z.string().optional(),
})

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const cliente = session.user.role === 'CLIENTE' ? await prisma.cliente.findFirst({ where: clienteWhereFromSession(session.user) }) : null
  const cobrancas = await prisma.cobranca.findMany({
    where: cliente ? { clienteId: cliente.id } : undefined,
    include: { cliente: { select: { nomeCompleto: true, numeroDeSuite: true } }, notaFiscal: true, envio: { select: { id: true } }, solicitacao: { select: { id: true, tipo: true } } },
    orderBy: { criadoEm: 'desc' },
  })
  return NextResponse.json(cobrancas)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const parsed = schema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  const data = parsed.data
  const cobranca = await prisma.cobranca.create({ data })
  if (data.envioId) await prisma.eventoEnvio.create({ data: { envioId: data.envioId, titulo: 'Cobrança gerada', descricao: `${data.descricao}: ${data.moeda} ${data.valor.toFixed(2)}` } })
  return NextResponse.json(cobranca, { status: 201 })
}
