import { prisma } from '@/lib/prisma'
import { Users } from 'lucide-react'
import Link from 'next/link'
import { ClientesFiltros } from '@/components/admin/ClientesFiltros'

const statusLabel: Record<string, string> = {
  PENDENTE: 'Pendente',
  ATIVA: 'Ativa',
  SUSPENSA: 'Suspensa',
}

const statusColors: Record<string, string> = {
  PENDENTE: '#F59E0B',
  ATIVA: '#22C55E',
  SUSPENSA: '#EF4444',
}

const LIMITE = 20

interface SearchParams {
  busca?: string
  status?: string
  pagina?: string
}

export default async function AdminClientesPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const busca = searchParams.busca ?? ''
  const status = searchParams.status ?? ''
  const pagina = parseInt(searchParams.pagina ?? '1')

  const where = {
    ...(busca && {
      OR: [
        { nomeCompleto: { contains: busca, mode: 'insensitive' as const } },
        { usuario: { email: { contains: busca, mode: 'insensitive' as const } } },
      ],
    }),
    ...(status && { status: status as 'PENDENTE' | 'ATIVA' | 'SUSPENSA' }),
  }

  const [clientes, total] = await Promise.all([
    prisma.cliente.findMany({
      where,
      include: { usuario: { select: { email: true } }, _count: { select: { itens: true } } },
      orderBy: { numeroDeSuite: 'asc' },
      skip: (pagina - 1) * LIMITE,
      take: LIMITE,
    }),
    prisma.cliente.count({ where }),
  ])

  const totalPaginas = Math.ceil(total / LIMITE)

  return (
    <div className="p-4 sm:p-8">
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold" style={{ color: '#1A1A2E' }}>Clientes</h1>
          <p style={{ color: '#6B7280' }}>{total} clientes encontradas</p>
        </div>
      </div>

      <ClientesFiltros buscaInicial={busca} statusInicial={status} />

      <div className="bg-white rounded-2xl mt-4" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        {clientes.length === 0 ? (
          <div className="p-8 sm:p-16 text-center">
            <Users className="w-16 h-16 mx-auto mb-4" style={{ color: '#E5E7EB' }} />
            <p className="font-semibold text-lg" style={{ color: '#6B7280' }}>Nenhuma cliente encontrada</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ background: '#F9FAFB' }}>
                    {['Suite', 'Nome', 'Email', 'País', 'Itens', 'Status', 'Cadastro', ''].map((h) => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-medium uppercase tracking-wide" style={{ color: '#9CA3AF' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {clientes.map((cliente) => (
                    <tr key={cliente.id} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-4">
                        <span className="font-mono font-bold text-sm" style={{ color: '#FF6B9D' }}>
                          #{String(cliente.numeroDeSuite).padStart(3, '0')}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-medium text-sm" style={{ color: '#1A1A2E' }}>{cliente.nomeCompleto}</td>
                      <td className="px-5 py-4 text-sm" style={{ color: '#6B7280' }}>{cliente.usuario.email}</td>
                      <td className="px-5 py-4 text-sm" style={{ color: '#6B7280' }}>{cliente.pais}</td>
                      <td className="px-5 py-4 text-sm font-medium" style={{ color: '#374151' }}>{cliente._count.itens}</td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium text-white" style={{ background: statusColors[cliente.status] }}>
                          {statusLabel[cliente.status]}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm" style={{ color: '#6B7280' }}>
                        {new Date(cliente.criadoEm).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-5 py-4">
                        <Link href={`/admin/clientes/${cliente.id}`} className="text-xs font-medium hover:opacity-80" style={{ color: '#FF6B9D' }}>
                          Ver →
                        </Link>
                      </td>
                    </tr>
                  ))}
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
