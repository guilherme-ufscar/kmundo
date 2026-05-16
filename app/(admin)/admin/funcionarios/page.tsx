import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { BriefcaseBusiness, ChevronRight } from 'lucide-react'

const statusLabel: Record<string, string> = {
  ATIVO: 'Ativo',
  INATIVO: 'Inativo',
}

const statusColors: Record<string, string> = {
  ATIVO: '#22C55E',
  INATIVO: '#EF4444',
}

export default async function AdminFuncionariosPage() {
  const funcionarios = await prisma.funcionario.findMany({
    include: { _count: { select: { lancamentos: true } } },
    orderBy: { nomeCompleto: 'asc' },
  })

  return (
    <div className="p-4 sm:p-8">
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold" style={{ color: '#1A1A2E' }}>Funcionários</h1>
          <p style={{ color: '#6B7280' }}>{funcionarios.length} funcionário(s) encontrado(s)</p>
        </div>
        <Link href="/admin/funcionarios/novo" className="px-4 py-2 rounded-xl text-sm font-semibold text-white" style={{ background: 'linear-gradient(135deg, #FF6B9D, #FF4D8D)' }}>
          Novo funcionário
        </Link>
      </div>

      {funcionarios.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <BriefcaseBusiness className="w-12 h-12 mx-auto mb-3" style={{ color: '#E5E7EB' }} />
          <p className="font-medium" style={{ color: '#1A1A2E' }}>Nenhum funcionário cadastrado</p>
        </div>
      ) : (
        <div className="space-y-3">
          {funcionarios.map((funcionario) => (
            <Link key={funcionario.id} href={`/admin/funcionarios/${funcionario.id}`}>
              <div className="bg-white rounded-2xl p-5 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#FFF1F5' }}>
                  <BriefcaseBusiness className="w-5 h-5" style={{ color: '#FF6B9D' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-medium text-sm" style={{ color: '#1A1A2E' }}>{funcionario.nomeCompleto}</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-white" style={{ background: statusColors[funcionario.status] }}>
                      {statusLabel[funcionario.status]}
                    </span>
                  </div>
                  <div className="text-xs" style={{ color: '#9CA3AF' }}>
                    {funcionario.cargo ?? 'Sem cargo'} · {funcionario._count.lancamentos} lançamento(s)
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
