import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { calcularDiasArmazenado, getCorArmazenagem } from '@/lib/utils'
import { Package } from 'lucide-react'
import Link from 'next/link'
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

export default async function MeusItensPage() {
  const session = await auth()
  const cliente = await prisma.cliente.findFirst({
    where: { usuario: { id: session!.user!.id } },
  })

  if (!cliente) return null

  const itens = await prisma.item.findMany({
    where: { clienteId: cliente.id },
    orderBy: { dataEntrada: 'desc' },
  })

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold" style={{ color: '#1A1A2E' }}>Meus Itens</h1>
        <p style={{ color: '#6B7280' }}>{itens.length} {itens.length === 1 ? 'item' : 'itens'} no total</p>
      </div>

      <div className="bg-white rounded-2xl" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        {itens.length === 0 ? (
          <div className="p-8 sm:p-16 text-center">
            <Package className="w-16 h-16 mx-auto mb-4" style={{ color: '#E5E7EB' }} />
            <p className="font-semibold text-lg" style={{ color: '#6B7280' }}>Nenhum item ainda</p>
            <p className="text-sm mt-2" style={{ color: '#9CA3AF' }}>
              Seus pacotes aparecerão aqui quando chegarem ao armazém
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ background: '#F9FAFB' }}>
                    <th className="text-left px-6 py-3 text-xs font-medium uppercase tracking-wide" style={{ color: '#9CA3AF' }}>Descrição</th>
                    <th className="text-left px-6 py-3 text-xs font-medium uppercase tracking-wide" style={{ color: '#9CA3AF' }}>Loja</th>
                    <th className="text-left px-6 py-3 text-xs font-medium uppercase tracking-wide" style={{ color: '#9CA3AF' }}>Tracking</th>
                    <th className="text-left px-6 py-3 text-xs font-medium uppercase tracking-wide" style={{ color: '#9CA3AF' }}>Entrada</th>
                    <th className="text-left px-6 py-3 text-xs font-medium uppercase tracking-wide" style={{ color: '#9CA3AF' }}>Armazenagem</th>
                    <th className="text-left px-6 py-3 text-xs font-medium uppercase tracking-wide" style={{ color: '#9CA3AF' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {itens.map((item) => {
                    const dias = calcularDiasArmazenado(item.dataEntrada)
                    const cor = getCorArmazenagem(dias)
                    return (
                      <tr key={item.id} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <Link href={`/meus-itens/${item.id}`} className="hover:opacity-80 transition-opacity">
                            <p className="font-medium text-sm" style={{ color: '#FF6B9D' }}>{item.descricao}</p>
                          </Link>
                          {item.observacoes && (
                            <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>{item.observacoes}</p>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm" style={{ color: '#6B7280' }}>{item.lojaOrigem ?? '—'}</td>
                        <td className="px-6 py-4 text-sm font-mono" style={{ color: '#6B7280' }}>{item.trackingLoja ?? '—'}</td>
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
          </>
        )}
      </div>
    </div>
  )
}
