import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { clienteWhereFromSession } from '@/lib/cliente-session'
import Link from 'next/link'
import { Megaphone, Archive, CheckCircle, Clock } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function InformacoesPage({ searchParams }: { searchParams: { tab?: string } }) {
  const session = await auth()
  const cliente = await prisma.cliente.findFirst({ where: clienteWhereFromSession(session!.user!) })
  if (!cliente) return null

  const tab = searchParams.tab === 'arquivadas' ? 'arquivadas' : 'ativas'
  const arquivada = tab === 'arquivadas'

  const atualizacoes = await prisma.atualizacao.findMany({
    where: { arquivada },
    orderBy: { publicadaEm: 'desc' },
  })

  const leituras = await prisma.leituraAtualizacao.findMany({ where: { clienteId: cliente.id } })
  const lidoSet = new Set(leituras.map(l => l.atualizacaoId))

  return (
    <div className="p-4 sm:p-8 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: '#1A1A2E' }}>Informações / Atualizações</h1>
        <p className="text-sm mt-1" style={{ color: '#6B7280' }}>Comunicados importantes da KMundo Warehouse</p>
      </div>

      <div className="bg-white rounded-2xl p-5 mb-6" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderLeft: '4px solid #FF6B9D' }}>
        <p className="text-sm leading-relaxed" style={{ color: '#374151' }}>
          Esta seção foi criada para manter você sempre informado sobre atualizações importantes relacionadas aos nossos serviços. Sempre que houver alguma mudança, pausa, alteração operacional, problema nos envios ou qualquer informação importante, um novo comunicado será publicado nesta área e enviado automaticamente para o e-mail cadastrado na sua conta. Por isso, é importante acompanhar regularmente esta seção e confirmar a leitura dos comunicados quando solicitado.
        </p>
      </div>

      <div className="flex gap-2 mb-6">
        <Link href="/informacoes" className={`px-4 py-2 rounded-xl text-sm font-medium ${tab === 'ativas' ? 'text-white' : 'bg-white border'}`} style={tab === 'ativas' ? { background: 'linear-gradient(135deg,#FF6B9D,#C77DFF)' } : { borderColor: '#E5E7EB', color: '#6B7280' }}>
          Ativas
        </Link>
        <Link href="/informacoes?tab=arquivadas" className={`px-4 py-2 rounded-xl text-sm font-medium ${tab === 'arquivadas' ? 'text-white' : 'bg-white border'}`} style={tab === 'arquivadas' ? { background: 'linear-gradient(135deg,#FF6B9D,#C77DFF)' } : { borderColor: '#E5E7EB', color: '#6B7280' }}>
          <Archive className="w-4 h-4 inline mr-1" />Arquivadas
        </Link>
      </div>

      {atualizacoes.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <Megaphone className="w-12 h-12 mx-auto mb-3" style={{ color: '#E5E7EB' }} />
          <p className="font-medium" style={{ color: '#1A1A2E' }}>Nenhuma atualização {tab === 'arquivadas' ? 'arquivada' : 'ativa'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {atualizacoes.map(a => {
            const lida = lidoSet.has(a.id)
            const data = new Date(a.publicadaEm).toLocaleDateString('pt-BR')
            const horario = new Date(a.publicadaEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
            const ano = new Date(a.publicadaEm).getFullYear()
            return (
              <Link key={a.id} href={`/informacoes/${a.id}`}>
                <div className="bg-white rounded-2xl p-5 flex items-start gap-4 hover:shadow-md transition-shadow" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)', opacity: lida ? 0.85 : 1 }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: lida ? '#F0FDF4' : '#FFF1F5' }}>
                    {lida ? <CheckCircle className="w-5 h-5" style={{ color: '#22C55E' }} /> : <Megaphone className="w-5 h-5" style={{ color: '#FF6B9D' }} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm" style={{ color: '#1A1A2E' }}>{a.titulo}</h3>
                    <p className="text-xs mt-1 flex items-center gap-2 flex-wrap" style={{ color: '#9CA3AF' }}>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{data} às {horario}</span>
                      <span>Ano {ano}</span>
                      {lida ? <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: '#F0FDF4', color: '#22C55E' }}>Lida</span> : <span className="px-2 py-0.5 rounded-full text-xs font-medium text-white" style={{ background: '#F59E0B' }}>Nova</span>}
                    </p>
                    <div className="mt-2 text-sm line-clamp-2 termos-content" style={{ color: '#6B7280' }} dangerouslySetInnerHTML={{ __html: a.conteudo.slice(0, 180) + (a.conteudo.length > 180 ? '...' : '') }} />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
