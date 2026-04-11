import { prisma } from '@/lib/prisma'
import { calcularDiasArmazenado, getCorArmazenagem } from '@/lib/utils'
import Link from 'next/link'
import { Plus, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StorageBadge } from '@/components/cliente/StorageBadge'
import { ItensFiltros } from '@/components/admin/ItensFiltros'
import { ExportarCSVButton } from '@/components/admin/ExportarCSVButton'

const statusLabel: Record<string, string> = {
  RECEBIDO: 'Pagamento Feito',
  EM_ARMAZEM: 'Comprado',
  EM_ENVIO: 'No armazem',
  PREPARANDO_ENVIO: 'Preparando para o envio',
  ENVIADO: 'Enviado',
  ENTREGUE: 'Entregue',
}

const statusColors: Record<string, string> = {
  RECEBIDO: '#3B82F6',
  EM_ARMAZEM: '#FF6B9D',
  EM_ENVIO: '#F59E0B',
  PREPARANDO_ENVIO: '#F97316',
  ENVIADO: '#8B5CF6',
  ENTREGUE: '#22C55E',
}

const LIMITE = 20

interface SearchParams {
  busca?: string
  status?: string
  pagina?: string
}

export default async function AdminItensPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const busca = searchParams.busca ?? ''
  const status = searchParams.status ?? ''
  const pagina = parseInt(searchParams.pagina ?? '1')

  const where: Record<string, unknown> = {}

  if (busca) {
    where['OR'] = [
      { descricao: { contains: busca, mode: 'insensitive' } },
      { lojaOrigem: { contains: busca, mode: 'insensitive' } },
      { trackingLoja: { contains: busca, mode: 'insensitive' } },
      {
        cliente: {
          OR: [
            { nomeCompleto: { contains: busca, mode: 'insensitive' } },
          ],
        },
      },
    ]
  }

  if (status) where['status'] = status

  const [itens, total] = await Promise.all([
    prisma.item.findMany({
      where,
      orderBy: { dataEntrada: 'desc' },
      include: { cliente: { select: { numeroDeSuite: true, nomeCompleto: true } } },
      skip: (pagina - 1) * LIMITE,
      take: LIMITE,
    }),
    prisma.item.count({ where }),
  ])

  const totalPaginas = Math.ceil(total / LIMITE)

  return (
    <div className="p-4 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold" style={{ color: '#1A1A2E' }}>Itens no Armazém</h1>
          <p style={{ color: '#6B7280' }}>{total} itens encontrados</p>
        </div>
        <div className="flex items-center gap-3">
          <ExportarCSVButton />
          <Link href="/admin/itens/novo">
            <Button className="flex items-center gap-2 font-semibold text-white rounded-xl" style={{ background: 'linear-gradient(135deg, #FF6B9D, #FF4D8D)', borderRadius: '10px' }}>
              <Plus className="w-4 h-4" />
              Registrar Item
            </Button>
          </Link>
        </div>
      </div>

      <ItensFiltros buscaInicial={busca} statusInicial={status} />

      <div className="bg-white rounded-2xl mt-4" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        {itens.length === 0 ? (
          <div className="p-16 text-center">
            <Package className="w-16 h-16 mx-auto mb-4" style={{ color: '#E5E7EB' }} />
            <p className="font-semibold text-lg" style={{ color: '#6B7280' }}>Nenhum item encontrado</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ background: '#F9FAFB' }}>
                    {['Suite', 'Cliente', 'Descrição', 'Loja', 'Entrada', 'Dias', 'Status', ''].map((h) => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-medium uppercase tracking-wide" style={{ color: '#9CA3AF' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {itens.map((item) => {
                    const dias = calcularDiasArmazenado(item.dataEntrada)
                    const cor = getCorArmazenagem(dias)
                    return (
                      <tr key={item.id} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <td className="px-5 py-4">
                          <span className="font-mono font-bold text-sm" style={{ color: '#FF6B9D' }}>
                            #{String(item.cliente.numeroDeSuite).padStart(3, '0')}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm font-medium" style={{ color: '#1A1A2E' }}>{item.cliente.nomeCompleto}</td>
                        <td className="px-5 py-4 text-sm" style={{ color: '#374151' }}>{item.descricao}</td>
                        <td className="px-5 py-4 text-sm" style={{ color: '#6B7280' }}>{item.lojaOrigem ?? '—'}</td>
                        <td className="px-5 py-4 text-sm" style={{ color: '#6B7280' }}>
                          {new Date(item.dataEntrada).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-5 py-4">
                          <StorageBadge dias={dias} cor={cor} />
                        </td>
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium text-white" style={{ background: statusColors[item.status] }}>
                            {statusLabel[item.status]}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <Link href={`/admin/itens/${item.id}`} className="text-xs font-medium hover:opacity-80" style={{ color: '#FF6B9D' }}>
                            Ver →
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {totalPaginas > 1 && (
              <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
                <p className="text-sm" style={{ color: '#9CA3AF' }}>
                  Página {pagina} de {totalPaginas}
                </p>
                <div className="flex gap-2">
                  {pagina > 1 && (
                    <Link
                      href={`?busca=${busca}&status=${status}&pagina=${pagina - 1}`}
                      className="px-3 py-1.5 rounded-lg text-sm font-medium border hover:bg-gray-50"
                      style={{ color: '#374151', borderColor: '#E5E7EB' }}
                    >
                      ← Anterior
                    </Link>
                  )}
                  {pagina < totalPaginas && (
                    <Link
                      href={`?busca=${busca}&status=${status}&pagina=${pagina + 1}`}
                      className="px-3 py-1.5 rounded-lg text-sm font-medium border hover:bg-gray-50"
                      style={{ color: '#374151', borderColor: '#E5E7EB' }}
                    >
                      Próxima →
                    </Link>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
