import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { atualizarPedidoCompraAdminSchema } from '@/lib/validations/pedido-compra'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const pedido = await prisma.pedidoCompra.findUnique({
    where: { id: params.id },
    include: {
      cliente: { select: { id: true, nomeCompleto: true, numeroDeSuite: true } },
      itens: true,
    },
  })

  if (!pedido) {
    return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 })
  }

  if (session.user.role !== 'ADMIN') {
    const cliente = await prisma.cliente.findFirst({ where: { usuario: { id: session.user.id } } })
    if (!cliente || pedido.clienteId !== cliente.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
    }
  }

  return NextResponse.json(pedido)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const pedido = await prisma.pedidoCompra.findUnique({ where: { id: params.id } })
  if (!pedido) {
    return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 })
  }

  await prisma.pedidoCompra.delete({ where: { id: params.id } })
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

  const pedido = await prisma.pedidoCompra.findUnique({ where: { id: params.id } })
  if (!pedido) {
    return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 })
  }

  const body = await req.json()
  const parsed = atualizarPedidoCompraAdminSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten(), message: 'Dados inválidos para atualizar pedido' }, { status: 400 })
  }

  const data: Record<string, unknown> = {
    ...parsed.data,
    linkCartao: parsed.data.linkCartao || null,
  }

  if (parsed.data.dataLimitePagamento) {
    data.dataLimitePagamento = new Date(parsed.data.dataLimitePagamento)
  }

  if (parsed.data.pagoEm) {
    data.pagoEm = new Date(parsed.data.pagoEm)
  }

  const atualizado = await prisma.pedidoCompra.update({
    where: { id: params.id },
    data,
    include: {
      cliente: { select: { id: true, nomeCompleto: true, numeroDeSuite: true } },
      itens: true,
    },
  })

  return NextResponse.json(atualizado)
}
