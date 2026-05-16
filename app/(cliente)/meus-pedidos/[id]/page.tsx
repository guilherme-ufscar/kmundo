import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ShoppingBag } from 'lucide-react'

const statusLabel: Record<string, string> = {
  AGUARDANDO_REVISAO: 'Aguardando revisão',
  AGUARDANDO_PAGAMENTO: 'Aguardando pagamento',
  PAGO: 'Pago',
  COMPRADO: 'Comprado',
  CANCELADO: 'Cancelado',
}

const statusColors: Record<string, string> = {
  AGUARDANDO_REVISAO: '#F59E0B',
  AGUARDANDO_PAGAMENTO: '#8B5CF6',
  PAGO: '#3B82F6',
  COMPRADO: '#22C55E',
  CANCELADO: '#EF4444',
}

export default async function PedidoDetalhePage({ params }: { params: { id: string } }) {
  const session = await auth()
  const cliente = await prisma.cliente.findFirst({ where: { usuario: { id: session!.user!.id } } })
  if (!cliente) notFound()

  const pedido = await prisma.pedidoCompra.findFirst({
    where: { id: params.id, clienteId: cliente.id },
    include: { itens: true },
  })

  if (!pedido) notFound()

  const whatsappHref = pedido.whatsappRecepcao
    ? `https://wa.me/${pedido.whatsappRecepcao.replace(/\D/g, '')}`
    : null

  return (
    <div className="p-4 sm:p-8 max-w-4xl">
      <Link href="/meus-pedidos" className="inline-flex items-center gap-2 text-sm font-medium mb-6 hover:opacity-70 transition-opacity" style={{ color: '#FF6B9D' }}>
        <ArrowLeft className="w-4 h-4" />
        Voltar para meus pedidos
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#1A1A2E' }}>Pedido de compra</h1>
          <p style={{ color: '#6B7280' }}>Criado em {new Date(pedido.criadoEm).toLocaleDateString('pt-BR')}</p>
        </div>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white" style={{ background: statusColors[pedido.status] }}>
          {statusLabel[pedido.status]}
        </span>
      </div>

      <div className="bg-white rounded-2xl p-6 mb-5" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <h2 className="font-semibold mb-4" style={{ color: '#1A1A2E' }}>Itens do pedido</h2>
        <div className="space-y-3">
          {pedido.itens.map((item) => (
            <div key={item.id} className="rounded-xl p-4" style={{ background: '#F9FAFB' }}>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#FFF1F5' }}>
                  <ShoppingBag className="w-4 h-4" style={{ color: '#FF6B9D' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm" style={{ color: '#1A1A2E' }}>{item.nomeProduto}</p>
                  <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>Quantidade: {item.quantidade}{item.variacao ? ` · ${item.variacao}` : ''}</p>
                  {item.urlProduto && (
                    <a href={item.urlProduto} target="_blank" rel="noopener noreferrer" className="text-xs mt-1 inline-block hover:underline" style={{ color: '#FF6B9D' }}>
                      Abrir link do produto
                    </a>
                  )}
                  {item.observacoes && <p className="text-sm mt-2" style={{ color: '#6B7280' }}>{item.observacoes}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {(pedido.valorTotal || pedido.chavePix || pedido.qrCodePix || pedido.linkCartao || pedido.whatsappRecepcao) && (
        <div className="bg-white rounded-2xl p-6 mb-5" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <h2 className="font-semibold mb-4" style={{ color: '#1A1A2E' }}>Pagamento</h2>
          {pedido.valorTotal && (
            <p className="text-lg font-bold mb-4" style={{ color: '#FF6B9D' }}>
              {pedido.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} {pedido.moeda}
            </p>
          )}
          {pedido.dataLimitePagamento && (
            <p className="text-sm mb-4" style={{ color: '#EF4444' }}>
              Data limite: {new Date(pedido.dataLimitePagamento).toLocaleDateString('pt-BR')}
            </p>
          )}
          {pedido.qrCodePix && (
            <div className="mb-4">
              <p className="text-sm font-medium mb-2" style={{ color: '#374151' }}>QR Code Pix</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={pedido.qrCodePix} alt="QR Code Pix" className="w-56 max-w-full rounded-xl border" style={{ borderColor: '#E5E7EB' }} />
            </div>
          )}
          {pedido.chavePix && (
            <div className="mb-4">
              <p className="text-sm font-medium mb-1" style={{ color: '#374151' }}>Chave Pix</p>
              <div className="rounded-xl px-4 py-3 font-mono text-sm break-all" style={{ background: '#F9FAFB', color: '#1A1A2E' }}>{pedido.chavePix}</div>
            </div>
          )}
          {pedido.instrucoesPix && <p className="text-sm mb-4" style={{ color: '#6B7280' }}>{pedido.instrucoesPix}</p>}
          {(pedido.linkCartao || whatsappHref) && (
            <div className="flex flex-wrap gap-3">
              {pedido.linkCartao && <a href={pedido.linkCartao} target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-xl text-sm font-semibold text-white" style={{ background: 'linear-gradient(135deg, #FF6B9D, #FF4D8D)' }}>Pagar por link</a>}
              {whatsappHref && <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-xl text-sm font-semibold" style={{ background: '#F0FDF4', color: '#16A34A' }}>Falar com a recepção no WhatsApp</a>}
            </div>
          )}
        </div>
      )}

      {(pedido.observacoesCliente || pedido.observacoesAdmin) && (
        <div className="bg-white rounded-2xl p-6" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <h2 className="font-semibold mb-4" style={{ color: '#1A1A2E' }}>Observações</h2>
          {pedido.observacoesCliente && (
            <div className="mb-4">
              <p className="text-xs uppercase tracking-wide mb-1" style={{ color: '#9CA3AF' }}>Enviado por você</p>
              <p className="text-sm" style={{ color: '#374151' }}>{pedido.observacoesCliente}</p>
            </div>
          )}
          {pedido.observacoesAdmin && (
            <div>
              <p className="text-xs uppercase tracking-wide mb-1" style={{ color: '#9CA3AF' }}>Equipe</p>
              <p className="text-sm" style={{ color: '#374151' }}>{pedido.observacoesAdmin}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
