import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Package, Truck, Calendar, MessageSquare, CheckCircle } from 'lucide-react'
import { ConfirmarEnvioButton } from '@/components/cliente/ConfirmarEnvioButton'

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

function getYouTubeEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url)
    if (u.hostname.includes('youtube.com')) {
      const v = u.searchParams.get('v')
      if (v) return `https://www.youtube.com/embed/${v}`
    }
    if (u.hostname === 'youtu.be') {
      return `https://www.youtube.com/embed${u.pathname}`
    }
  } catch { /* ignore */ }
  return null
}

interface PageProps {
  params: { id: string }
}

export default async function EnvioDetalhePage({ params }: PageProps) {
  const session = await auth()

  const cliente = await prisma.cliente.findFirst({
    where: { usuario: { id: session!.user!.id } },
  })
  if (!cliente) notFound()

  const envio = await prisma.envio.findFirst({
    where: { id: params.id, clienteId: cliente.id },
    include: {
      itens: {
        include: {
          item: { select: { id: true, descricao: true, lojaOrigem: true, trackingLoja: true } },
        },
      },
    },
  })

  if (!envio) notFound()

  const embedUrl = envio.videoUrl ? getYouTubeEmbedUrl(envio.videoUrl) : null
  const podeConfirmar = !envio.confirmadoCliente && envio.status === 'AGUARDANDO_CONFIRMACAO'

  return (
    <div className="p-8 max-w-3xl">
      <Link
        href="/meus-envios"
        className="inline-flex items-center gap-2 text-sm font-medium mb-6 hover:opacity-70 transition-opacity"
        style={{ color: '#FF6B9D' }}
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar para meus envios
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#1A1A2E' }}>
            Envio via {metodoLabel[envio.metodoEnvio]}
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <span
              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white"
              style={{ background: statusColors[envio.status] }}
            >
              {statusLabel[envio.status]}
            </span>
            {envio.confirmadoCliente && envio.status === 'AGUARDANDO_CONFIRMACAO' && (
              <span
                className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                style={{ background: '#F0FDF4', color: '#16A34A' }}
              >
                <CheckCircle className="w-3 h-3" />
                Confirmado
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Botão de confirmação */}
      {podeConfirmar && (
        <div
          className="bg-white rounded-2xl p-6 mb-5 border-2"
          style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderColor: '#FF6B9D' }}
        >
          <h2 className="font-semibold mb-2" style={{ color: '#1A1A2E' }}>Confirmar Pagamento</h2>
          <p className="text-sm mb-4" style={{ color: '#6B7280' }}>
            Ao confirmar, você declara que irá realizar o pagamento do envio conforme os dados informados.
          </p>
          {envio.dataLimitePagamento && (
            <p className="text-sm font-medium mb-4" style={{ color: '#EF4444' }}>
              Data limite: {new Date(envio.dataLimitePagamento).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
          )}
          <ConfirmarEnvioButton envioId={envio.id} />
        </div>
      )}

      {/* Dados do envio */}
      <div className="bg-white rounded-2xl p-6 mb-5" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <h2 className="text-sm font-semibold mb-4" style={{ color: '#6B7280' }}>DETALHES DO ENVIO</h2>
        <div className="grid grid-cols-2 gap-4">
          {envio.trackingEnvio && (
            <div>
              <p className="text-xs" style={{ color: '#9CA3AF' }}>Rastreamento</p>
              <p className="text-sm font-mono font-medium mt-0.5" style={{ color: '#1A1A2E' }}>{envio.trackingEnvio}</p>
            </div>
          )}
          {envio.peso && (
            <div>
              <p className="text-xs" style={{ color: '#9CA3AF' }}>Peso</p>
              <p className="text-sm font-medium mt-0.5" style={{ color: '#1A1A2E' }}>{envio.peso} kg</p>
            </div>
          )}
          {(envio.largura && envio.altura && envio.comprimento) && (
            <div>
              <p className="text-xs" style={{ color: '#9CA3AF' }}>Dimensões (L×A×C)</p>
              <p className="text-sm font-medium mt-0.5" style={{ color: '#1A1A2E' }}>
                {envio.largura} × {envio.altura} × {envio.comprimento} cm
              </p>
            </div>
          )}
          {envio.valorDeclarado && (
            <div>
              <p className="text-xs" style={{ color: '#9CA3AF' }}>Valor Declarado</p>
              <p className="text-sm font-medium mt-0.5" style={{ color: '#1A1A2E' }}>
                {envio.valorDeclarado.toLocaleString('pt-BR')} {envio.moeda ?? 'BRL'}
              </p>
            </div>
          )}
          {envio.dataLimitePagamento && (
            <div className="flex items-start gap-2">
              <Calendar className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#EF4444' }} />
              <div>
                <p className="text-xs" style={{ color: '#9CA3AF' }}>Data limite de pagamento</p>
                <p className="text-sm font-medium mt-0.5" style={{ color: '#EF4444' }}>
                  {new Date(envio.dataLimitePagamento).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Itens */}
      <div className="bg-white rounded-2xl p-6 mb-5" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <h2 className="text-sm font-semibold mb-4" style={{ color: '#6B7280' }}>
          ITENS ({envio.itens.length})
        </h2>
        <div className="space-y-3">
          {envio.itens.map(({ item }) => (
            <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: '#F9FAFB' }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#FFF1F5' }}>
                <Package className="w-4 h-4" style={{ color: '#FF6B9D' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: '#1A1A2E' }}>{item.descricao}</p>
                {item.lojaOrigem && (
                  <p className="text-xs" style={{ color: '#9CA3AF' }}>{item.lojaOrigem}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Observações */}
      {envio.observacoes && (
        <div className="bg-white rounded-2xl p-6 mb-5" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <h2 className="text-sm font-semibold mb-3" style={{ color: '#6B7280' }}>OBSERVAÇÕES</h2>
          <div className="flex gap-3">
            <MessageSquare className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#9CA3AF' }} />
            <p className="text-sm" style={{ color: '#374151' }}>{envio.observacoes}</p>
          </div>
        </div>
      )}

      {/* Fotos */}
      {envio.fotos.length > 0 && (
        <div className="bg-white rounded-2xl p-6 mb-5" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <h2 className="text-sm font-semibold mb-4" style={{ color: '#6B7280' }}>
            FOTOS DA CAIXA ({envio.fotos.length})
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {envio.fotos.map((foto, idx) => (
              <a key={idx} href={foto} target="_blank" rel="noopener noreferrer">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={foto}
                  alt={`Foto ${idx + 1}`}
                  className="w-full aspect-square object-cover rounded-xl hover:opacity-90 transition-opacity"
                />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Vídeo YouTube */}
      {embedUrl && (
        <div className="bg-white rounded-2xl p-6" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: '#6B7280' }}>
            <Truck className="w-4 h-4" />
            VÍDEO DO ENVIO
          </h2>
          <div className="aspect-video rounded-xl overflow-hidden">
            <iframe
              src={embedUrl}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </div>
  )
}
