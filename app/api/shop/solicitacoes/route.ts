import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { clienteWhereFromSession } from '@/lib/cliente-session'
import { z } from 'zod'

const schema = z.object({
  produtoId: z.string(),
  quantidade: z.number().int().min(1).max(99).default(1),
  variacao: z.string().optional(),
  observacoes: z.string().optional(),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== 'CLIENTE') return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
  const parsed = schema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const cliente = await prisma.cliente.findFirst({ where: clienteWhereFromSession(session.user) })
  if (!cliente) return NextResponse.json({ error: 'Cliente nao encontrada' }, { status: 404 })

  const produto = await prisma.produtoShop.findFirst({ where: { id: parsed.data.produtoId, ativo: true } })
  if (!produto) return NextResponse.json({ error: 'Produto indisponivel' }, { status: 404 })

  const pedido = await prisma.pedidoCompra.create({
    data: {
      clienteId: cliente.id,
      observacoesCliente: parsed.data.observacoes,
      valorTotal: produto.precoEstimado ? produto.precoEstimado * parsed.data.quantidade : undefined,
      moeda: produto.moeda,
      itens: {
        create: [{
          produtoShopId: produto.id,
          nomeProduto: produto.nome,
          urlProduto: produto.urlProduto,
          quantidade: parsed.data.quantidade,
          variacao: parsed.data.variacao,
          observacoes: parsed.data.observacoes,
        }],
      },
    },
  })

  return NextResponse.json(pedido, { status: 201 })
}
