import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { clienteWhereFromSession } from '@/lib/cliente-session'
import { CobrancasCliente } from '@/components/cliente/CobrancasCliente'
import { KCoinInformationCard } from '@/components/cliente/KCoinInformationCard'

export const dynamic = 'force-dynamic'

export default async function FinanceiroPage() {
  const session = await auth()
  const cliente = await prisma.cliente.findFirst({ where: clienteWhereFromSession(session!.user!) })
  if (!cliente) return null
  const [cobrancas, servicos, config, caixasTotal, serviceUsesMes, clienteUsuario] = await Promise.all([
    prisma.cobranca.findMany({ where: { clienteId: cliente.id }, include: { notaFiscal: true }, orderBy: { criadoEm: 'desc' } }),
    prisma.solicitacaoServico.findMany({ where: { clienteId: cliente.id }, include: { caixa: { select: { tracking: true } } }, orderBy: { criadoEm: 'desc' } }),
    prisma.configuracao.findFirst(),
    prisma.caixaRecebida.count({ where: { clienteId: cliente.id } }),
    prisma.solicitacaoServico.count({ where: { clienteId: cliente.id, criadoEm: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } } }),
    prisma.usuario.findUnique({ where: { id: cliente.usuarioId }, select: { email: true } }),
  ])
  const pendentes = cobrancas.filter(c => c.status === 'PENDENTE' || c.status === 'COMPROVANTE_ENVIADO')
  const kcoinFee = pendentes.filter(c => c.solicitacaoId).reduce((s, c) => s + c.valor, 0)
  const kcoinPurchase = pendentes.filter(c => !c.solicitacaoId && c.envioId).reduce((s, c) => s + c.valor, 0)
  const caixasComServico = new Set(servicos.filter(s => s.caixa).map(s => s.caixa!.tracking)).size
  const kid = `G${String(cliente.numeroDeSuite).padStart(4, '0')}`
  const emailCliente = clienteUsuario?.email ?? ''

  return (
    <div className="p-4 sm:p-8 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: '#1A1A2E' }}>Financeiro</h1>
        <p className="text-sm" style={{ color: '#6B7280' }}>Cobranças, comprovantes, notas fiscais e serviços da sua suite.</p>
      </div>

      <div className="mb-6">
        <KCoinInformationCard
          kid={kid}
          email={emailCliente}
          kcoinPurchase={kcoinPurchase}
          kcoinFee={kcoinFee}
          moedaPurchase={pendentes.find(c => !c.solicitacaoId && c.envioId)?.moeda ?? 'KRW'}
          moedaFee={pendentes.find(c => c.solicitacaoId)?.moeda ?? config?.moedaTaxa ?? 'KRW'}
          serviceUses={serviceUsesMes}
          caixasTotal={caixasTotal}
          caixasComServico={caixasComServico}
          wiseLink={config?.wiseLink ?? null}
          koreanBank={config ? { name: config.koreanBankName, account: config.koreanBankAccount, holder: config.koreanBankHolder } : null}
        />
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
