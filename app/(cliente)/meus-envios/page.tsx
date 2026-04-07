import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Package, Truck, Plus, ChevronRight } from 'lucide-react'

const statusLabel: Record<string, string> = {
  AGUARDANDO_CONFIRMACAO: 'Aguardando confirmação',
  CONFIRMADO: 'Confirmado',
  PAGO: 'Pago',
  ENVIADO: 'Enviado',
  ENTREGUE: 'Entregue',
}

const statusColors: Record<string, string> = {
  AGUARDANDO_CONFIRMACAO: '#F59E0B',
  CONFIRMADO: '#3B82F6',
  PAGO: '#8B5CF6',
  ENVIADO: '#FF6B9D',
  ENTREGUE: '#22C55E',
}

const metodoLabel: Record<string, string> = {
  FEDEX: 'FedEx',
  EMS: 'EMS',
  ENVIO_EM_GRUPO: 'Envio em Grupo',
}

export default async function MeusEnviosPage() {
  const session = await auth()
  const cliente = await prisma.cliente.findFirst({
    where: { usuario: { id: session!.user!.id } },
  })

  if (!cliente) return null

  const envios = await prisma.envio.findMany({
    where: { clienteId: cliente.id },
    include: {
      itens: { include: { item: { select: { descricao: true } } } },
    },
    orderBy: { criadoEm: 'desc' },
  })

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#1A1A2E' }}>Meus Envios</h1>
          <p style={{ color: '#6B7280' }}>Acompanhe suas solicitações de envio</p>
        </div>
        <Link href="/meus-envios/novo">
          <button
            className="flex items-center gap-2 px-4 h-11 rounded-xl font-medium text-white text-sm"
            style={{ background: 'linear-gradient(135deg, #FF6B9D, #FF4D8D)' }}
          >
            <Plus className="w-4 h-4" />
            Solicitar Envio
          </button>
        </Link>
      </div>

      {envios.length === 0 ? (
        <div
          className="bg-white rounded-2xl p-12 flex flex-col items-center justify-center gap-3"
          style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
        >
          <Truck className="w-12 h-12" style={{ color: '#E5E7EB' }} />
          <p className="font-medium" style={{ color: '#1A1A2E' }}>Nenhum envio solicitado ainda</p>
          <p className="text-sm" style={{ color: '#9CA3AF' }}>Clique em &quot;Solicitar Envio&quot; para começar</p>
        </div>
      ) : (
        <div className="space-y-4">
          {envios.map((envio) => (
            <Link key={envio.id} href={`/meus-envios/${envio.id}`}>
              <div
                className="bg-white rounded-2xl p-5 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer"
                style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: '#FFF1F5' }}
                >
                  <Package className="w-5 h-5" style={{ color: '#FF6B9D' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm" style={{ color: '#1A1A2E' }}>
                      {metodoLabel[envio.metodoEnvio]}
                    </span>
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-white"
                      style={{ background: statusColors[envio.status] }}
                    >
                      {statusLabel[envio.status]}
                    </span>
                    {envio.confirmadoCliente && (
                      <span
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{ background: '#F0FDF4', color: '#16A34A' }}
                      >
                        Confirmado ✓
                      </span>
                    )}
                  </div>
                  <p className="text-xs truncate" style={{ color: '#9CA3AF' }}>
                    {envio.itens.length} {envio.itens.length === 1 ? 'item' : 'itens'} ·{' '}
                    {envio.itens.map((i) => i.item.descricao).join(', ')}
                  </p>
                  <p className="text-xs mt-1" style={{ color: '#D1D5DB' }}>
                    {new Date(envio.criadoEm).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </p>
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
