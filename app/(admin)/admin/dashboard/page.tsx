import { prisma } from '@/lib/prisma'
import { Users, Package, AlertTriangle, TrendingUp } from 'lucide-react'

export default async function AdminDashboardPage() {
  const [
    totalClientes,
    clientesAtivas,
    totalItens,
    itensEmArmazem,
    itensCriticos,
    novosHoje,
  ] = await Promise.all([
    prisma.cliente.count(),
    prisma.cliente.count({ where: { status: 'ATIVA' } }),
    prisma.item.count(),
    prisma.item.count({ where: { status: { in: ['RECEBIDO', 'EM_ARMAZEM'] } } }),
    prisma.item.count({
      where: {
        status: { in: ['RECEBIDO', 'EM_ARMAZEM'] },
        dataEntrada: { lte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
      },
    }),
    prisma.item.count({
      where: {
        criadoEm: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
    }).catch(() => 0),
  ])

  const metricas = [
    { label: 'Clientes Ativas', valor: clientesAtivas, total: totalClientes, icon: Users, cor: '#FF6B9D', bg: '#FFF1F5' },
    { label: 'Itens em Armazém', valor: itensEmArmazem, total: totalItens, icon: Package, cor: '#C77DFF', bg: '#FAF5FF' },
    { label: 'Armazenagem Crítica', valor: itensCriticos, total: null, icon: AlertTriangle, cor: '#EF4444', bg: '#FEF2F2' },
    { label: 'Novos Hoje', valor: novosHoje, total: null, icon: TrendingUp, cor: '#22C55E', bg: '#F0FDF4' },
  ]

  const itensRecentes = await prisma.item.findMany({
    orderBy: { dataEntrada: 'desc' },
    take: 10,
    include: { cliente: { select: { numeroDeSuite: true, nomeCompleto: true } } },
  })

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

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-5 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold" style={{ color: '#1A1A2E' }}>Dashboard</h1>
        <p style={{ color: '#6B7280' }}>Visão geral do armazém</p>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-5 sm:mb-8">
        {metricas.map(({ label, valor, total, icon: Icon, cor, bg }) => (
          <div key={label} className="bg-white rounded-2xl p-3 sm:p-5" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <div className="flex items-start justify-between mb-2 sm:mb-3">
              <span className="text-xs sm:text-sm font-medium leading-tight pr-1" style={{ color: '#6B7280' }}>{label}</span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: bg }}>
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: cor }} />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold" style={{ color: '#1A1A2E' }}>{valor}</p>
            {total !== null && (
              <p className="text-xs mt-1 hidden sm:block" style={{ color: '#9CA3AF' }}>de {total} total</p>
            )}
          </div>
        ))}
      </div>

      {/* Itens recentes */}
      <div className="bg-white rounded-2xl" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="font-semibold" style={{ color: '#1A1A2E' }}>Itens Recentes</h2>
          <a href="/admin/itens" className="text-sm font-medium hover:opacity-80" style={{ color: '#FF6B9D' }}>
            Ver todos →
          </a>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: '#F9FAFB' }}>
                <th className="text-left px-6 py-3 text-xs font-medium uppercase tracking-wide" style={{ color: '#9CA3AF' }}>Suite</th>
                <th className="text-left px-6 py-3 text-xs font-medium uppercase tracking-wide" style={{ color: '#9CA3AF' }}>Cliente</th>
                <th className="text-left px-6 py-3 text-xs font-medium uppercase tracking-wide" style={{ color: '#9CA3AF' }}>Item</th>
                <th className="text-left px-6 py-3 text-xs font-medium uppercase tracking-wide" style={{ color: '#9CA3AF' }}>Entrada</th>
                <th className="text-left px-6 py-3 text-xs font-medium uppercase tracking-wide" style={{ color: '#9CA3AF' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {itensRecentes.map((item) => (
                <tr key={item.id} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-mono font-bold text-sm" style={{ color: '#FF6B9D' }}>
                      #{String(item.cliente.numeroDeSuite).padStart(3, '0')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium" style={{ color: '#1A1A2E' }}>{item.cliente.nomeCompleto}</td>
                  <td className="px-6 py-4 text-sm" style={{ color: '#6B7280' }}>{item.descricao}</td>
                  <td className="px-6 py-4 text-sm" style={{ color: '#6B7280' }}>
                    {new Date(item.dataEntrada).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium text-white" style={{ background: statusColors[item.status] }}>
                      {statusLabel[item.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
