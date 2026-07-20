import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const schema = z.object({ status: z.enum(['PENDENTE', 'COMPROVANTE_ENVIADO', 'PAGO', 'CANCELADA']).optional(), comprovanteUrl: z.string().min(1).optional() })

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const cobranca = await prisma.cobranca.findUnique({ where: { id: params.id } })
  if (!cobranca) return NextResponse.json({ error: 'Cobrança não encontrada' }, { status: 404 })
  const cliente = session.user.role === 'CLIENTE' ? await prisma.cliente.findFirst({ where: { usuarioId: session.user.id } }) : null
  if (cliente && cobranca.clienteId !== cliente.id) return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  const parsed = schema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  if (session.user.role === 'CLIENTE' && (!parsed.data.comprovanteUrl || parsed.data.status)) return NextResponse.json({ error: 'Cliente só pode enviar comprovante' }, { status: 403 })
  const data = session.user.role === 'CLIENTE'
    ? { comprovanteUrl: parsed.data.comprovanteUrl, status: 'COMPROVANTE_ENVIADO' as const }
    : { ...parsed.data, ...(parsed.data.status === 'PAGO' ? { pagoEm: new Date(), confirmadoEm: new Date() } : {}) }
  return NextResponse.json(await prisma.cobranca.update({ where: { id: params.id }, data }))
}
