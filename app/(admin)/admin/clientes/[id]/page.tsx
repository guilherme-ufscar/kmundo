import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Package, Calendar, Truck, CheckCircle2, ShoppingBag } from 'lucide-react'
import { calcularDiasArmazenado, getCorArmazenagem } from '@/lib/utils'
import { ClienteStatusForm } from '@/components/admin/ClienteStatusForm'
import { ClienteEditForm } from '@/components/admin/ClienteEditForm'
import { InlineEnvioEditor } from '@/components/admin/InlineEnvioEditor'
import { InlinePedidoEditor } from '@/components/admin/InlinePedidoEditor'
import { InlineItemEditor } from '@/components/admin/InlineItemEditor'

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

const corArmazenagem: Record<string, string> = {
  green: '#22C55E',
  yellow: '#F59E0B',
  orange: '#F97316',
  red: '#EF4444',
}

const statusEnvioLabel: Record<string, string> = {
  AGUARDANDO_CONFIRMACAO: 'Aguardando confirmação',
  CONFIRMADO: 'Confirmado',
  EMBALANDO: 'Embalando',
  PAGO: 'Aguardando pagamento',
  ENVIADO: 'Enviado',
  ENTREGUE: 'Entregue',
}

const statusEnvioColors: Record<string, string> = {
  AGUARDANDO_CONFIRMACAO: '#F59E0B',
  CONFIRMADO: '#3B82F6',
  EMBALANDO: '#F97316',
  PAGO: '#8B5CF6',
  ENVIADO: '#FF6B9D',
  ENTREGUE: '#22C55E',
}

export default async function ClienteDetalhePage({ params }: { params: { id: string } }) {
  const session = await auth()
  if (!session || session.user?.role !== 'ADMIN') redirect('/login')

  const [cliente, config] = await Promise.all([
    prisma.cliente.findUnique({
      where: { id: params.id },
      include: {
        usuario: { select: { email: true } },
        itens: { orderBy: { dataEntrada: 'desc' } },
        envios: { orderBy: { criadoEm: 'desc' } },
        pedidosCompra: { orderBy: { criadoEm: 'desc' }, include: { itens: true } },
      },
    }),
    prisma.configuracao.findFirst(),
  ])

  if (!cliente) notFound()

  return (
    <div className="p-4 sm:p-8 max-w-4xl">
      <div className="flex items-center gap-3 mb-6 sm:mb-8">
        <Link href="/admin/clientes">
          <button className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-colors" style={{ color: '#6B7280' }}>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </Link>
        <div>
          <h1 className="text-lg sm:text-2xl font-bold leading-tight" style={{ color: '#1A1A2E' }}>{cliente.nomeCompleto}</h1>
          <p style={{ color: '#6B7280' }}>
            Suite{' '}
            <span className="font-mono font-bold" style={{ color: '#FF6B9D' }}>
              #{String(cliente.numeroDeSuite).padStart(3, '0')}
            </span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Edit form */}
        <div className="lg:col-span-2">
          <ClienteEditForm
            cliente={{
              id: cliente.id,
              nomeCompleto: cliente.nomeCompleto,
              telefone: cliente.telefone,
              pais: cliente.pais,
              cep: cliente.cep,
              endereco: cliente.endereco,
              numero: cliente.numero,
              complemento: cliente.complemento,
              bairro: cliente.bairro,
              cidade: cliente.cidade,
              estado: cliente.estado,
              fotoPerfil: cliente.fotoPerfil,
              status: cliente.status,
            }}
            email={cliente.usuario.email}
          />
        </div>

        {/* Status form + info cadastro */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-6" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h2 className="font-semibold mb-4" style={{ color: '#1A1A2E' }}>Alterar Status</h2>
            <ClienteStatusForm clienteId={cliente.id} statusAtual={cliente.status} />
          </div>
          <div className="bg-white rounded-2xl p-4" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#FFF1F5' }}>
                <Calendar className="w-4 h-4" style={{ color: '#FF6B9D' }} />
              </div>
              <div>
                <p className="text-xs" style={{ color: '#9CA3AF' }}>Cadastro</p>
                <p className="text-sm font-medium" style={{ color: '#1A1A2E' }}>
                  {new Date(cliente.criadoEm).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Envios da cliente */}
      <div className="bg-white rounded-2xl mb-6" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="font-semibold flex items-center gap-2" style={{ color: '#1A1A2E' }}>
            <Truck className="w-4 h-4" style={{ color: '#FF6B9D' }} />
            Envios ({cliente.envios.length})
          </h2>
        </div>

        {cliente.envios.length === 0 ? (
          <div className="p-12 text-center">
            <Truck className="w-12 h-12 mx-auto mb-3" style={{ color: '#E5E7EB' }} />
            <p style={{ color: '#9CA3AF' }}>Nenhum envio registrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: '#F9FAFB' }}>
                  {['Método', 'Status', 'Frete', 'Pago', 'Prazo', 'Tracking', ''].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-medium uppercase tracking-wide" style={{ color: '#9CA3AF' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cliente.envios.map((envio) => (
                  <tr key={envio.id} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4 text-sm font-medium" style={{ color: '#1A1A2E' }}>{envio.metodoEnvio}</td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium text-white" style={{ background: statusEnvioColors[envio.status] }}>
                        {statusEnvioLabel[envio.status]}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm font-medium" style={{ color: '#374151' }}>
                      {envio.valorFrete !== null && envio.valorFrete !== undefined
                        ? `${envio.valorFrete.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ${envio.moedaFrete ?? 'BRL'}`
                        : '—'}
                    </td>
                    <td className="px-5 py-4">
                      {envio.fretePago ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium" style={{ color: '#16A34A' }}>
                          <CheckCircle2 className="w-3 h-3" />
                          Pago
                        </span>
                      ) : (
                        <span className="text-xs" style={{ color: '#9CA3AF' }}>Pendente</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-sm" style={{ color: '#6B7280' }}>
                      {envio.dataLimitePagamento
                        ? new Date(envio.dataLimitePagamento).toLocaleDateString('pt-BR')
                        : '—'}
                    </td>
                    <td className="px-5 py-4 text-sm font-mono" style={{ color: '#6B7280' }}>{envio.trackingEnvio ?? '—'}</td>
                    <td className="px-5 py-4 w-80">
                      <InlineEnvioEditor
                        envio={{
                          id: envio.id,
                          status: envio.status,
                          metodoEnvio: envio.metodoEnvio,
                          peso: envio.peso,
                          largura: envio.largura,
                          altura: envio.altura,
                          comprimento: envio.comprimento,
                          valorDeclarado: envio.valorDeclarado,
                          moeda: envio.moeda,
                          valorFrete: envio.valorFrete,
                          moedaFrete: envio.moedaFrete,
                          videoUrl: envio.videoUrl,
                          trackingEnvio: envio.trackingEnvio,
                          dataLimitePagamento: envio.dataLimitePagamento?.toISOString() ?? null,
                          observacoes: envio.observacoes,
                          fretePago: envio.fretePago,
                        }}
                        fotos={envio.fotos}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pedidos da cliente */}
      <div className="bg-white rounded-2xl mb-6" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="font-semibold flex items-center gap-2" style={{ color: '#1A1A2E' }}>
            <ShoppingBag className="w-4 h-4" style={{ color: '#FF6B9D' }} />
            Pedidos ({cliente.pedidosCompra.length})
          </h2>
        </div>

        {cliente.pedidosCompra.length === 0 ? (
          <div className="p-12 text-center">
            <ShoppingBag className="w-12 h-12 mx-auto mb-3" style={{ color: '#E5E7EB' }} />
            <p style={{ color: '#9CA3AF' }}>Nenhum pedido registrado</p>
          </div>
        ) : (
          <div className="space-y-4 p-6">
            {cliente.pedidosCompra.map((pedido) => (
              <div key={pedido.id} className="rounded-xl border border-gray-100 overflow-hidden">
                <div className="px-4 py-3" style={{ background: '#F9FAFB' }}>
                  <p className="text-sm font-medium" style={{ color: '#1A1A2E' }}>
                    Pedido com {pedido.itens.length} item(ns)
                  </p>
                  <p className="text-xs" style={{ color: '#9CA3AF' }}>
                    Criado em {new Date(pedido.criadoEm).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="p-4">
                  <InlinePedidoEditor
                    pedido={{
                      id: pedido.id,
                      status: pedido.status,
                      valorTotal: pedido.valorTotal,
                      moeda: pedido.moeda,
                      chavePix: pedido.chavePix,
                      qrCodePix: pedido.qrCodePix,
                      instrucoesPix: pedido.instrucoesPix,
                      linkCartao: pedido.linkCartao,
                      whatsappRecepcao: pedido.whatsappRecepcao,
                      observacoesAdmin: pedido.observacoesAdmin,
                      dataLimitePagamento: pedido.dataLimitePagamento?.toISOString() ?? null,
                      formaPagamentoCliente: pedido.formaPagamentoCliente,
                    }}
                    config={config ? {
                      chavePix: config.chavePix,
                      qrCodePix: config.qrCodePix,
                      instrucoesPix: config.instrucoesPix,
                      whatsappRecepcao: config.whatsappRecepcao,
                    } : null}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Itens da cliente */}
      <div className="bg-white rounded-2xl" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="font-semibold flex items-center gap-2" style={{ color: '#1A1A2E' }}>
            <Package className="w-4 h-4" style={{ color: '#FF6B9D' }} />
            Itens ({cliente.itens.length})
          </h2>
          <Link href={`/admin/itens/novo?suite=${cliente.numeroDeSuite}`} className="text-sm font-medium hover:opacity-80" style={{ color: '#FF6B9D' }}>
            + Registrar item
          </Link>
        </div>

        {cliente.itens.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-12 h-12 mx-auto mb-3" style={{ color: '#E5E7EB' }} />
            <p style={{ color: '#9CA3AF' }}>Nenhum item registrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: '#F9FAFB' }}>
                  {['Descrição', 'Loja', 'Entrada', 'Dias', 'Status', ''].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-medium uppercase tracking-wide" style={{ color: '#9CA3AF' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cliente.itens.map((item) => {
                  const dias = calcularDiasArmazenado(item.dataEntrada)
                  const cor = getCorArmazenagem(dias)
                  return (
                    <tr key={item.id} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-4 text-sm font-medium" style={{ color: '#1A1A2E' }}>{item.descricao}</td>
                      <td className="px-5 py-4 text-sm" style={{ color: '#6B7280' }}>{item.lojaOrigem ?? '—'}</td>
                      <td className="px-5 py-4 text-sm" style={{ color: '#6B7280' }}>
                        {new Date(item.dataEntrada).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: `${corArmazenagem[cor]}20`, color: corArmazenagem[cor] }}>
                          {dias}d
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium text-white" style={{ background: statusColors[item.status] }}>
                          {statusLabel[item.status]}
                        </span>
                      </td>
                      <td className="px-5 py-4 w-80">
                        <InlineItemEditor
                          item={{
                            id: item.id,
                            descricao: item.descricao,
                            lojaOrigem: item.lojaOrigem,
                            trackingLoja: item.trackingLoja,
                            observacoes: item.observacoes,
                            dataEntrada: item.dataEntrada,
                            fotos: item.fotos,
                          }}
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
