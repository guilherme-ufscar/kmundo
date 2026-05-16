import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ShoppingBag, ChevronRight } from 'lucide-react'

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

export default async function AdminPedidosPage() {
  const pedidos = await prisma.pedidoCompra.findMany({
    include: {
      cliente: { select: { nomeCompleto: true, numeroDeSuite: true } },
      itens: true,
    },
    orderBy: { criadoEm: 'desc' },
  })

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold" style={{ color: '#1A1A2E' }}>Pedidos de compra</h1>
        <p style={{ color: '#6B7280' }}>{pedidos.length} pedido(s) encontrado(s)</p>
      </div>

      {pedidos.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <ShoppingBag className="w-12 h-12 mx-auto mb-3" style={{ color: '#E5E7EB' }} />
          <p className="font-medium" style={{ color: '#1A1A2E' }}>Nenhum pedido encontrado</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pedidos.map((pedido) => (
            <Link key={pedido.id} href={`/admin/pedidos/${pedido.id}`}>
              <div className="bg-white rounded-2xl p-5 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#FFF1F5' }}>
                  <ShoppingBag className="w-5 h-5" style={{ color: '#FF6B9D' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-medium text-sm" style={{ color: '#1A1A2E' }}>
                      Suite #{String(pedido.cliente.numeroDeSuite).padStart(3, '0')} — {pedido.cliente.nomeCompleto}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-white" style={{ background: statusColors[pedido.status] }}>
                      {statusLabel[pedido.status]}
                    </span>
                  </div>
                  <div className="text-xs" style={{ color: '#9CA3AF' }}>
                    {pedido.itens.length} item(ns) · {new Date(pedido.criadoEm).toLocaleDateString('pt-BR')}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 shrink-0" style={{ color: '#D1D5DB' }} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
