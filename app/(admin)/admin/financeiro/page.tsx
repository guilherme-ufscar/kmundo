import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { CobrancasAdmin } from '@/components/admin/CobrancasAdmin'

export default async function FinanceiroAdminPage() {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') redirect('/login')
  const [cobrancas, servicos] = await Promise.all([
    prisma.cobranca.findMany({
      include: { cliente: { select: { nomeCompleto: true, numeroDeSuite: true } }, notaFiscal: true, envio: { select: { id: true, metodoEnvio: true } }, solicitacao: { select: { id: true, tipo: true, status: true } } },
      orderBy: { criadoEm: 'desc' },
    }),
    prisma.solicitacaoServico.findMany({
      include: { cliente: { select: { nomeCompleto: true, numeroDeSuite: true } }, caixa: { select: { tracking: true } }, cobrancas: { include: { notaFiscal: true } } },
      orderBy: { criadoEm: 'desc' },
      take: 60,
    }),
  ])

  return (
    <div className="p-4 sm:p-8 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: '#1A1A2E' }}>Financeiro</h1>
        <p className="text-sm" style={{ color: '#6B7280' }}>Pagamentos, comprovantes, servicos e notas fiscais por suite.</p>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">
        <CobrancasAdmin cobrancas={cobrancas} />
        <aside className="bg-white border border-gray-100 rounded-lg p-4 h-fit">
          <h2 className="font-semibold mb-3" style={{ color: '#1A1A2E' }}>Servicos solicitados</h2>
          <div className="space-y-3">
            {servicos.map(servico => (
              <div key={servico.id} className="rounded-lg bg-gray-50 p-3 text-sm">
                <p className="font-medium" style={{ color: '#1A1A2E' }}>{servico.tipo.replaceAll('_', ' ')} - {servico.status.replaceAll('_', ' ')}</p>
                <p className="text-xs" style={{ color: '#6B7280' }}>Suite #{String(servico.cliente.numeroDeSuite).padStart(3, '0')} - {servico.cliente.nomeCompleto}</p>
                <p className="text-xs" style={{ color: '#9CA3AF' }}>{servico.caixa?.tracking ? `${servico.caixa.tracking} | ` : ''}{new Date(servico.criadoEm).toLocaleDateString('pt-BR')}</p>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  )
}
