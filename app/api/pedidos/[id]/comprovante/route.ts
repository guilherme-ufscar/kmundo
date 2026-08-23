import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { clienteWhereFromSession } from '@/lib/cliente-session'
import { saveUpload } from '@/lib/files'

export const dynamic = 'force-dynamic'

// Cliente envia comprovante de PAGAMENTO -> armazena + muda para AGUARDANDO_CONFIRMACAO
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const pedido = await prisma.pedidoCompra.findUnique({ where: { id: params.id } })
  if (!pedido) return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 })

  // Checar ownership se for cliente
  if (session.user.role !== 'ADMIN') {
    const cliente = await prisma.cliente.findFirst({ where: clienteWhereFromSession(session.user) })
    if (!cliente || pedido.clienteId !== cliente.id) return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  const form = await req.formData()
  const file = form.get('file') as File | null
  const tipo = (form.get('tipo') as string) || 'pagamento' // 'pagamento' | 'compra'

  if (!file || !(file instanceof File) || file.size === 0) return NextResponse.json({ error: 'Envie um arquivo' }, { status: 400 })

  // Validar tipo: cliente só pode enviar pagamento; admin pode enviar ambos
  if (tipo === 'compra' && session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Apenas admin pode enviar comprovante de compra' }, { status: 403 })
  if (!['pagamento', 'compra'].includes(tipo)) return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 })

  try {
    const folder = `pedidos/${pedido.id}/${tipo}`
    const url = await saveUpload(file, folder, 10 * 1024 * 1024)

    const data: Record<string, unknown> = {}
    if (tipo === 'pagamento') {
      data.comprovantePagamentoUrl = url
      data.comprovanteEnviadoEm = new Date()
      // Auto transição para AGUARDANDO_CONFIRMACAO se ainda não for pago/comprado/cancelado
      if (!['PAGO', 'COMPRADO', 'CANCELADO', 'AGUARDANDO_CONFIRMACAO'].includes(pedido.status)) {
        data.status = 'AGUARDANDO_CONFIRMACAO'
      } else if (pedido.status === 'AGUARDANDO_PAGAMENTO') {
        data.status = 'AGUARDANDO_CONFIRMACAO'
      }
    } else {
      data.comprovanteCompraUrl = url
    }

    const atualizado = await prisma.pedidoCompra.update({ where: { id: pedido.id }, data })

    return NextResponse.json({
      ok: true,
      url,
      status: atualizado.status,
      message: tipo === 'pagamento' ? 'Comprovante recebido! Vamos verificar o pagamento e confirmar assim que cair. Aguarde.' : 'Comprovante de compra salvo.',
    })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Erro ao salvar' }, { status: 400 })
  }
}
