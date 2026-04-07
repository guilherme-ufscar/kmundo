import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { calcularDiasArmazenado, getCorArmazenagem } from '@/lib/utils'
import { Package, Clock, Truck } from 'lucide-react'
import { SuiteCard } from '@/components/cliente/SuiteCard'
import { StorageBadge } from '@/components/cliente/StorageBadge'

const statusLabel: Record<string, string> = {
  RECEBIDO: 'Pagamento Feito',
  EM_ARMAZEM: 'Comprado',
  EM_ENVIO: 'No armazem',
  ENVIADO: 'Enviado',
  ENTREGUE: 'Entregue',
}

const statusColors: Record<string, string> = {
  RECEBIDO: '#3B82F6',
  EM_ARMAZEM: '#FF6B9D',
  EM_ENVIO: '#F59E0B',
  ENVIADO: '#8B5CF6',
  ENTREGUE: '#22C55E',
}

export default async function DashboardPage() {
  const session = await auth()
  const cliente = await prisma.cliente.findFirst({
    where: { usuario: { id: session!.user!.id } },
    include: {
      itens: {
        orderBy: { dataEntrada: 'desc' },
        take: 5,
      },
    },
  })

  if (!cliente) return null

  await prisma.item.count({ where: { clienteId: cliente.id } })
  const emArmazem = await prisma.item.count({ where: { clienteId: cliente.id, status: { in: ['RECEBIDO', 'EM_ARMAZEM'] } } })
  const emEnvio = await prisma.item.count({ where: { clienteId: cliente.id, status: { in: ['EM_ENVIO', 'ENVIADO'] } } })
  const entregues = await prisma.item.count({ where: { clienteId: cliente.id, status: 'ENTREGUE' } })

  const primeiroNome = cliente.nomeCompleto.split(' ')[0]

  return (
    <div className="p-4 sm:p-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold" style={{ color: '#1A1A2E' }}>
          Olá, {primeiroNome} ✨
        </h1>
        <p style={{ color: '#6B7280' }}>Bem-vinda de volta ao seu painel</p>
      </div>

      {/* Suite Card */}
      <SuiteCard numeroDeSuite={cliente.numeroDeSuite} nomeCliente={cliente.nomeCompleto} />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-4 sm:mt-6 mb-6 sm:mb-8">
        <div className="bg-white rounded-2xl p-5" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium" style={{ color: '#6B7280' }}>Comprado</span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#FFF1F5' }}>
              <Package className="w-4 h-4" style={{ color: '#FF6B9D' }} />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold" style={{ color: '#1A1A2E' }}>{emArmazem}</p>
          <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>itens aguardando envio</p>
        </div>

        <div className="bg-white rounded-2xl p-5" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium" style={{ color: '#6B7280' }}>Em Trânsito</span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#FFFBEB' }}>
              <Truck className="w-4 h-4" style={{ color: '#F59E0B' }} />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold" style={{ color: '#1A1A2E' }}>{emEnvio}</p>
          <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>itens a caminho</p>
        </div>

        <div className="bg-white rounded-2xl p-5" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium" style={{ color: '#6B7280' }}>Entregues</span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#F0FDF4' }}>
              <Clock className="w-4 h-4" style={{ color: '#22C55E' }} />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold" style={{ color: '#1A1A2E' }}>{entregues}</p>
          <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>total recebidos</p>
        </div>
      </div>

      {/* Recent Items */}
      <div className="bg-white rounded-2xl" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="font-semibold" style={{ color: '#1A1A2E' }}>Itens Recentes</h2>
          <a href="/meus-itens" className="text-sm font-medium hover:opacity-80" style={{ color: '#FF6B9D' }}>
            Ver todos →
          </a>
        </div>

        {cliente.itens.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-12 h-12 mx-auto mb-3" style={{ color: '#E5E7EB' }} />
            <p className="font-medium" style={{ color: '#6B7280' }}>Nenhum item ainda</p>
            <p className="text-sm mt-1" style={{ color: '#9CA3AF' }}>
              Seus pacotes aparecerão aqui quando chegarem ao armazém
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: '#F9FAFB' }}>
                <th className="text-left px-6 py-3 text-xs font-medium uppercase tracking-wide" style={{ color: '#9CA3AF' }}>Item</th>
                <th className="text-left px-6 py-3 text-xs font-medium uppercase tracking-wide" style={{ color: '#9CA3AF' }}>Loja</th>
                <th className="text-left px-6 py-3 text-xs font-medium uppercase tracking-wide" style={{ color: '#9CA3AF' }}>Entrada</th>
                <th className="text-left px-6 py-3 text-xs font-medium uppercase tracking-wide" style={{ color: '#9CA3AF' }}>Dias</th>
                <th className="text-left px-6 py-3 text-xs font-medium uppercase tracking-wide" style={{ color: '#9CA3AF' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {cliente.itens.map((item) => {
                const dias = calcularDiasArmazenado(item.dataEntrada)
                const cor = getCorArmazenagem(dias)
                return (
                  <tr key={item.id} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-sm" style={{ color: '#1A1A2E' }}>{item.descricao}</p>
                      {item.trackingLoja && (
                        <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>{item.trackingLoja}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm" style={{ color: '#6B7280' }}>{item.lojaOrigem ?? '—'}</td>
                    <td className="px-6 py-4 text-sm" style={{ color: '#6B7280' }}>
                      {new Date(item.dataEntrada).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4">
                      <StorageBadge dias={dias} cor={cor} />
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium text-white" style={{ background: statusColors[item.status] }}>
                        {statusLabel[item.status]}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </div>
  )
}
