import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createSchema = z.object({ caixaId: z.string().optional(), tipo: z.enum(['UNBOXING', 'FOTO_VIDEO', 'MEDICAO', 'REEMBALAGEM', 'OUTRO']), descricao: z.string().optional() })
const patchSchema = z.object({ status: z.enum(['SOLICITADO', 'EM_ANDAMENTO', 'CONCLUIDO', 'CANCELADO']).optional(), fotoUrls: z.array(z.string().min(1)).optional(), videoUrl: z.string().min(1).optional(), peso: z.number().positive().optional(), largura: z.number().positive().optional(), altura: z.number().positive().optional(), comprimento: z.number().positive().optional(), descricao: z.string().optional() })

async function clienteDaSessao(userId: string) { return prisma.cliente.findFirst({ where: { usuarioId: userId } }) }

export async function GET() {
  const session = await auth(); if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const cliente = session.user.role === 'CLIENTE' ? await clienteDaSessao(session.user.id) : null
  return NextResponse.json(await prisma.solicitacaoServico.findMany({ where: cliente ? { clienteId: cliente.id } : undefined, include: { caixa: { select: { tracking: true } }, cliente: { select: { nomeCompleto: true, numeroDeSuite: true } } }, orderBy: { criadoEm: 'desc' } }))
}

export async function POST(req: NextRequest) {
  const session = await auth(); if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const parsed = createSchema.safeParse(await req.json()); if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  const cliente = await clienteDaSessao(session.user.id)
  if (!cliente) return NextResponse.json({ error: 'Cliente não encontrada' }, { status: 404 })
  if (parsed.data.caixaId) { const caixa = await prisma.caixaRecebida.findFirst({ where: { id: parsed.data.caixaId, clienteId: cliente.id } }); if (!caixa) return NextResponse.json({ error: 'Caixa inválida' }, { status: 400 }) }
  return NextResponse.json(await prisma.solicitacaoServico.create({ data: { ...parsed.data, clienteId: cliente.id } }), { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const session = await auth(); if (!session || session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const body = await req.json() as { id?: string } & z.infer<typeof patchSchema>
  if (!body.id) return NextResponse.json({ error: 'id obrigatório' }, { status: 400 })
  const parsed = patchSchema.safeParse(body); if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  return NextResponse.json(await prisma.solicitacaoServico.update({ where: { id: body.id }, data: { ...parsed.data, ...(parsed.data.status === 'CONCLUIDO' ? { concluidoEm: new Date() } : {}) } }))
}
