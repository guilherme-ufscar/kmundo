import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { clienteWhereFromSession } from '@/lib/cliente-session'
import { CobrancasCliente } from '@/components/cliente/CobrancasCliente'

export default async function FinanceiroPage() {
  const session = await auth()
  const cliente = await prisma.cliente.findFirst({ where: clienteWhereFromSession(session!.user!) })
  if (!cliente) return null
  const [cobrancas, servicos] = await Promise.all([
    prisma.cobranca.findMany({ where: { clienteId: cliente.id }, include: { notaFiscal: true }, orderBy: { criadoEm: 'desc' } }),
    prisma.solicitacaoServico.findMany({ where: { clienteId: cliente.id }, include: { caixa: { select: { tracking: true } } }, orderBy: { criadoEm: 'desc' } }),
  ])

  return (
    <div className="p-4 sm:p-8 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: '#1A1A2E' }}>Financeiro</h1>
        <p className="text-sm" style={{ color: '#6B7280' }}>Cobranças, comprovantes, notas fiscais e serviços da sua suite.</p>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6">
        <CobrancasCliente cobrancas={cobrancas.map(c => ({ ...c, criadoEm: c.criadoEm.toISOString() }))} />
        <aside className="bg-white border border-gray-100 rounded-lg p-4 h-fit">
          <h2 className="font-semibold mb-3" style={{ color: '#1A1A2E' }}>Serviços</h2>
          <div className="space-y-3">
            {servicos.map(servico => (
              <div key={servico.id} className="rounded-lg bg-gray-50 p-3 text-sm">
                <p className="font-medium" style={{ color: '#1A1A2E' }}>{servico.tipo.replaceAll('_', ' ')} - {servico.status.replaceAll('_', ' ')}</p>
                <p className="text-xs" style={{ color: '#6B7280' }}>{servico.caixa?.tracking ? `${servico.caixa.tracking} | ` : ''}{new Date(servico.criadoEm).toLocaleDateString('pt-BR')}</p>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  )
}
