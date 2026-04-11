import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { notificarClienteStatusItem } from '@/lib/email'

const patchItemSchema = z.object({
  status: z.enum(['RECEBIDO', 'EM_ARMAZEM', 'EM_ENVIO', 'PREPARANDO_ENVIO', 'ENVIADO', 'ENTREGUE']).optional(),
  descricao: z.string().min(1).max(255).optional(),
  lojaOrigem: z.string().optional(),
  trackingLoja: z.string().optional(),
  observacoes: z.string().optional(),
  fotos: z.array(z.string()).optional(),
  dataEntrada: z.string().datetime().optional(),
  dataEnvio: z.string().datetime().optional(),
  dataEntrega: z.string().datetime().optional(),
})

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const item = await prisma.item.findUnique({
    where: { id: params.id },
    include: { cliente: { include: { usuario: { select: { email: true } } } } },
  })

  if (!item) {
    return NextResponse.json({ error: 'Item não encontrado' }, { status: 404 })
  }

  if (session.user.role === 'CLIENTE') {
    const cliente = await prisma.cliente.findFirst({
      where: { usuario: { id: session.user.id } },
    })
    if (!cliente || item.clienteId !== cliente.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
    }
  }

  return NextResponse.json(item)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const item = await prisma.item.findUnique({ where: { id: params.id } })
  if (!item) {
    return NextResponse.json({ error: 'Item não encontrado' }, { status: 404 })
  }

  await prisma.$transaction(async (tx) => {
    await tx.itemEnvio.deleteMany({ where: { itemId: params.id } })
    await tx.item.delete({ where: { id: params.id } })
  })

  return NextResponse.json({ ok: true })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const item = await prisma.item.findUnique({ where: { id: params.id } })
  if (!item) {
    return NextResponse.json({ error: 'Item não encontrado' }, { status: 404 })
  }

  const body = await req.json()
  const parsed = patchItemSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const data: Record<string, unknown> = { ...parsed.data }
  if (parsed.data.dataEntrada) data.dataEntrada = new Date(parsed.data.dataEntrada)
  if (parsed.data.dataEnvio) data.dataEnvio = new Date(parsed.data.dataEnvio)
  if (parsed.data.dataEntrega) data.dataEntrega = new Date(parsed.data.dataEntrega)

  // Quando item chega no armazém, registra a data de entrada automaticamente
  if (parsed.data.status === 'EM_ARMAZEM' && item.status !== 'EM_ARMAZEM' && !parsed.data.dataEntrada) {
    data.dataEntrada = new Date()
  }

  const atualizado = await prisma.item.update({
    where: { id: params.id },
    data,
    include: { cliente: { include: { usuario: { select: { email: true } } } } },
  })

  if (parsed.data.status && parsed.data.status !== item.status) {
    notificarClienteStatusItem({
      emailCliente: atualizado.cliente.usuario.email,
      nomeCliente: atualizado.cliente.nomeCompleto,
      suite: atualizado.cliente.numeroDeSuite,
      descricao: atualizado.descricao,
      novoStatus: parsed.data.status,
      itemId: atualizado.id,
    }).catch(console.error)
  }

  return NextResponse.json(atualizado)
}
