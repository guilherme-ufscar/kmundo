import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { calcularDiasArmazenado, getCorArmazenagem } from '@/lib/utils'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Store,
  Tag,
  Calendar,
  MessageSquare,
  CheckCircle,
  Circle,
} from 'lucide-react'
import { StorageBadge } from '@/components/cliente/StorageBadge'
import { FotoGaleria } from '@/components/FotoGaleria'

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

const statusOrder = ['RECEBIDO', 'EM_ARMAZEM', 'EM_ENVIO', 'PREPARANDO_ENVIO', 'ENVIADO', 'ENTREGUE']

interface PageProps {
  params: { id: string }
}

export default async function ItemDetailPage({ params }: PageProps) {
  const session = await auth()

  const cliente = await prisma.cliente.findFirst({
    where: { usuario: { id: session!.user!.id } },
  })

  if (!cliente) notFound()

  const item = await prisma.item.findFirst({
    where: { id: params.id, clienteId: cliente.id },
  })

  if (!item) notFound()

  const dias = calcularDiasArmazenado(item.dataEntrada)
  const cor = getCorArmazenagem(dias)
  const statusIndex = statusOrder.indexOf(item.status)

  return (
    <div className="p-4 sm:p-8 max-w-3xl">
      {/* Back */}
      <Link
        href="/meus-itens"
        className="inline-flex items-center gap-2 text-sm font-medium mb-6 hover:opacity-70 transition-opacity"
        style={{ color: '#FF6B9D' }}
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar para meus itens
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#1A1A2E' }}>{item.descricao}</h1>
          <div className="flex items-center gap-3 mt-2">
            <span
              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white"
              style={{ background: statusColors[item.status] }}
            >
              {statusLabel[item.status]}
            </span>
            <StorageBadge dias={dias} cor={cor} />
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 mb-5" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <h2 className="text-sm font-semibold mb-5" style={{ color: '#6B7280' }}>LINHA DO TEMPO</h2>

        {/* Mobile: vertical */}
        <div className="flex flex-col gap-0 sm:hidden">
          {statusOrder.map((s, i) => {
            const done = i <= statusIndex
            const active = i === statusIndex
            const isLast = i === statusOrder.length - 1
            return (
              <div key={s} className="flex items-stretch gap-3">
                {/* Dot + vertical line */}
                <div className="flex flex-col items-center">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center border-2 flex-shrink-0 transition-all"
                    style={{
                      background: done ? (active ? '#FF6B9D' : '#F0FDF4') : 'white',
                      borderColor: done ? (active ? '#FF6B9D' : '#22C55E') : '#E5E7EB',
                    }}
                  >
                    {done && !active ? (
                      <CheckCircle className="w-4 h-4" style={{ color: '#22C55E' }} />
                    ) : active ? (
                      <Circle className="w-3 h-3 fill-white text-white" />
                    ) : (
                      <Circle className="w-3 h-3" style={{ color: '#E5E7EB' }} />
                    )}
                  </div>
                  {!isLast && (
                    <div
                      className="w-0.5 flex-1 my-1"
                      style={{ background: i < statusIndex ? '#22C55E' : '#E5E7EB', minHeight: '20px' }}
                    />
                  )}
                </div>
                {/* Label */}
                <div className="flex items-start pt-1.5 pb-4">
                  <span
                    className="text-sm font-medium"
                    style={{ color: done ? (active ? '#FF6B9D' : '#22C55E') : '#9CA3AF' }}
                  >
                    {statusLabel[s]}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Desktop: horizontal */}
        <div className="hidden sm:flex items-start justify-between relative">
          {/* Track line */}
          <div className="absolute top-4 left-0 right-0 h-0.5" style={{ background: '#E5E7EB' }} />
          <div
            className="absolute top-4 left-0 h-0.5 transition-all"
            style={{
              background: 'linear-gradient(90deg, #FF6B9D, #C77DFF)',
              width: statusIndex === 0 ? '0%' : `${(statusIndex / (statusOrder.length - 1)) * 100}%`,
            }}
          />

          {statusOrder.map((s, i) => {
            const done = i <= statusIndex
            const active = i === statusIndex
            return (
              <div key={s} className="relative flex flex-col items-center gap-2 z-10 flex-1">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all"
                  style={{
                    background: done ? (active ? '#FF6B9D' : '#F0FDF4') : 'white',
                    borderColor: done ? (active ? '#FF6B9D' : '#22C55E') : '#E5E7EB',
                  }}
                >
                  {done && !active ? (
                    <CheckCircle className="w-4 h-4" style={{ color: '#22C55E' }} />
                  ) : active ? (
                    <Circle className="w-3 h-3 fill-white text-white" />
                  ) : (
                    <Circle className="w-3 h-3" style={{ color: '#E5E7EB' }} />
                  )}
                </div>
                <span
                  className="text-xs font-medium text-center leading-tight"
                  style={{ color: done ? (active ? '#FF6B9D' : '#22C55E') : '#9CA3AF', maxWidth: '72px' }}
                >
                  {statusLabel[s]}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Details grid */}
      <div className="mb-5">
        {/* Informações da loja */}
        <div className="bg-white rounded-2xl p-6" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <h2 className="text-sm font-semibold mb-4" style={{ color: '#6B7280' }}>INFORMAÇÕES DA LOJA</h2>
          <div className="space-y-4">
            <InfoRow icon={<Store className="w-4 h-4" />} label="Loja de origem" value={item.lojaOrigem ?? '—'} />
            <InfoRow icon={<Tag className="w-4 h-4" />} label="Código de rastreamento" value={item.trackingLoja ?? '—'} mono />
          </div>
        </div>
      </div>

      {/* Datas e armazenagem — só exibe quando o item já chegou no armazém */}
      {item.status !== 'RECEBIDO' && (
        <div className="bg-white rounded-2xl p-6 mb-5" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <h2 className="text-sm font-semibold mb-4" style={{ color: '#6B7280' }}>DATAS</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <InfoRow
              icon={<Calendar className="w-4 h-4" />}
              label="Entrada no armazém"
              value={new Date(item.dataEntrada).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
            />
            {item.dataEnvio && (
              <InfoRow
                icon={<Calendar className="w-4 h-4" />}
                label="Data de envio"
                value={new Date(item.dataEnvio).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
              />
            )}
            {item.dataEntrega && (
              <InfoRow
                icon={<Calendar className="w-4 h-4" />}
                label="Data de entrega"
                value={new Date(item.dataEntrega).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
              />
            )}
          </div>
        </div>
      )}

      {/* Observações */}
      {item.observacoes && (
        <div className="bg-white rounded-2xl p-6 mb-5" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <h2 className="text-sm font-semibold mb-3" style={{ color: '#6B7280' }}>OBSERVAÇÕES</h2>
          <div className="flex gap-3">
            <MessageSquare className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#9CA3AF' }} />
            <p className="text-sm" style={{ color: '#374151' }}>{item.observacoes}</p>
          </div>
        </div>
      )}

      {/* Fotos */}
      <div className="bg-white rounded-2xl p-6" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <h2 className="text-sm font-semibold mb-4" style={{ color: '#6B7280' }}>
          FOTOS {item.fotos.length > 0 && `(${item.fotos.length})`}
        </h2>
        <FotoGaleria fotos={item.fotos} />
      </div>
    </div>
  )
}

interface InfoRowProps {
  icon: React.ReactNode
  label: string
  value: string
  mono?: boolean
}

function InfoRow({ icon, label, value, mono = false }: InfoRowProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5" style={{ color: '#9CA3AF' }}>{icon}</div>
      <div>
        <p className="text-xs" style={{ color: '#9CA3AF' }}>{label}</p>
        <p
          className={`text-sm font-medium mt-0.5 ${mono ? 'font-mono' : ''}`}
          style={{ color: '#1A1A2E' }}
        >
          {value}
        </p>
      </div>
    </div>
  )
}
