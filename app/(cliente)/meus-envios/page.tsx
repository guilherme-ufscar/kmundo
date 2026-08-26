import { auth } from '@/lib/auth'
import { getClienteEnvios } from '@/lib/cache'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Package, Truck, Plus, ChevronRight } from 'lucide-react'

export const dynamic = 'force-dynamic'

const statusLabel: Record<string, string> = {
  AGUARDANDO_CONFIRMACAO: 'Aguardando confirmação',
  CONFIRMADO: 'Confirmado',
  EMBALANDO: 'Embalando',
  PAGO: 'Aguardando pagamento',
  ENVIADO: 'Enviado',
  ENTREGUE: 'Entregue',
}

const statusColors: Record<string, string> = {
  AGUARDANDO_CONFIRMACAO: '#F59E0B',
  CONFIRMADO: '#3B82F6',
  EMBALANDO: '#F97316',
  PAGO: '#8B5CF6',
  ENVIADO: '#FF6B9D',
  ENTREGUE: '#22C55E',
}

const metodoLabel: Record<string, string> = {
  FEDEX: 'FedEx',
  EMS: 'EMS',
  ENVIO_EM_GRUPO: 'Envio em Grupo',
}

export default async function MeusEnviosPage() {
  const session = await auth()
  const [data, envioConfig] = await Promise.all([
    getClienteEnvios(session!.user!),
    prisma.envioConfig.findFirst(),
  ])

  if (!data) return null

  const { envios } = data
  const titulo = envioConfig?.titulo?.trim() || 'Meus Envios'
  const subtitulo = envioConfig?.subtitulo?.trim() || null
  const introducaoHtml = envioConfig?.introducaoHtml?.trim() || null
  const painelInfoHtml = envioConfig?.painelInfoHtml?.trim() || null
  const prazosHtml = envioConfig?.prazosHtml?.trim() || null
  const pagamentoHtml = envioConfig?.pagamentoHtml?.trim() || null
  const comprovanteHtml = envioConfig?.comprovanteHtml?.trim() || null
  const envioHtml = envioConfig?.envioHtml?.trim() || null
  const recebimentoHtml = envioConfig?.recebimentoHtml?.trim() || null
  const regrasAdicionaisHtml = envioConfig?.regrasAdicionaisHtml?.trim() || null
  const hasInfo = painelInfoHtml || prazosHtml || pagamentoHtml || comprovanteHtml || envioHtml || recebimentoHtml || regrasAdicionaisHtml

  return (
    <div className="p-4 sm:p-8 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#1A1A2E' }}>{titulo}</h1>
          <p style={{ color: '#6B7280' }}>{subtitulo ?? 'Acompanhe suas solicitações de envio'}</p>
        </div>
        <Link href="/meus-envios/novo">
          <button
            className="flex items-center gap-2 px-4 h-11 rounded-xl font-medium text-white text-sm"
            style={{ background: 'linear-gradient(135deg, #FF6B9D, #FF4D8D)' }}
          >
            <Plus className="w-4 h-4" />
            Solicitar Envio
          </button>
        </Link>
      </div>

      {introducaoHtml && (
        <div className="bg-white rounded-2xl p-6 mb-5 termos-content" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderLeft: '4px solid #FF6B9D' }} dangerouslySetInnerHTML={{ __html: introducaoHtml }} />
      )}

      {hasInfo && (
        <div className="space-y-3 mb-6">
          {painelInfoHtml && <div className="bg-white rounded-2xl p-6 termos-content text-sm" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }} dangerouslySetInnerHTML={{ __html: painelInfoHtml }} />}
          {prazosHtml && <div className="bg-white rounded-2xl p-6 termos-content text-sm" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }} dangerouslySetInnerHTML={{ __html: prazosHtml }} />}
          {pagamentoHtml && <div className="bg-white rounded-2xl p-6 termos-content text-sm" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }} dangerouslySetInnerHTML={{ __html: pagamentoHtml }} />}
          {comprovanteHtml && <div className="bg-white rounded-2xl p-6 termos-content text-sm" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }} dangerouslySetInnerHTML={{ __html: comprovanteHtml }} />}
          {envioHtml && <div className="bg-white rounded-2xl p-6 termos-content text-sm" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }} dangerouslySetInnerHTML={{ __html: envioHtml }} />}
          {recebimentoHtml && <div className="bg-white rounded-2xl p-6 termos-content text-sm" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }} dangerouslySetInnerHTML={{ __html: recebimentoHtml }} />}
          {regrasAdicionaisHtml && <div className="bg-white rounded-2xl p-6 termos-content text-sm" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }} dangerouslySetInnerHTML={{ __html: regrasAdicionaisHtml }} />}
        </div>
      )}

      {envios.length === 0 ? (
        <div
          className="bg-white rounded-2xl p-12 flex flex-col items-center justify-center gap-3 mb-6"
          style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
        >
          <Truck className="w-12 h-12" style={{ color: '#E5E7EB' }} />
          <p className="font-medium" style={{ color: '#1A1A2E' }}>Nenhum envio solicitado ainda</p>
          <p className="text-sm" style={{ color: '#9CA3AF' }}>Clique em &quot;Solicitar Envio&quot; para começar</p>
        </div>
      ) : (
        <div className="space-y-4">
          {envios.map((envio) => (
            <Link key={envio.id} href={`/meus-envios/${envio.id}`}>
              <div
                className="bg-white rounded-2xl p-5 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer"
                style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: '#FFF1F5' }}
                >
                  <Package className="w-5 h-5" style={{ color: '#FF6B9D' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm" style={{ color: '#1A1A2E' }}>
                      {metodoLabel[envio.metodoEnvio]}
                    </span>
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-white"
                      style={{ background: statusColors[envio.status] }}
                    >
                      {statusLabel[envio.status]}
                    </span>
                    {envio.confirmadoCliente && (
                      <span
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{ background: '#F0FDF4', color: '#16A34A' }}
                      >
                        Confirmado ✓
                      </span>
                    )}
                  </div>
                  <p className="text-xs truncate" style={{ color: '#9CA3AF' }}>
                    {envio.itens.length} {envio.itens.length === 1 ? 'item' : 'itens'} ·{' '}
                    {envio.itens.map((i) => i.item.descricao).join(', ')}
                  </p>
                  <p className="text-xs mt-1" style={{ color: '#D1D5DB' }}>
                    {new Date(envio.criadoEm).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </p>
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
