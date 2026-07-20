import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { clienteWhereFromSession } from '@/lib/cliente-session'
import { z } from 'zod'

const schema = z.object({ clienteId: z.string(), tracking: z.string().min(3), lojaOrigem: z.string().optional(), comprovanteCompraUrl: z.string().min(1), fotoEtiquetaUrl: z.string().min(1), observacoes: z.string().optional(), itemId: z.string().optional() })

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const cliente = session.user.role === 'CLIENTE' ? await prisma.cliente.findFirst({ where: clienteWhereFromSession(session.user) }) : null
  return NextResponse.json(await prisma.caixaRecebida.findMany({ where: cliente ? { clienteId: cliente.id } : undefined, include: { cliente: { select: { nomeCompleto: true, numeroDeSuite: true } }, item: true, solicitacoes: true }, orderBy: { recebidoEm: 'desc' } }))
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const parsed = schema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  try { return NextResponse.json(await prisma.caixaRecebida.create({ data: parsed.data }), { status: 201 }) }
  catch { return NextResponse.json({ error: 'Já existe uma caixa com este rastreamento para esta suíte' }, { status: 409 }) }
}
