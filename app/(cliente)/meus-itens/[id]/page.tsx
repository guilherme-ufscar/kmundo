import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { calcularDiasArmazenado, getCorArmazenagem } from '@/lib/utils'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Package,
  Store,
  Tag,
  Calendar,
  MessageSquare,
  CheckCircle,
  Circle,
} from 'lucide-react'
import { StorageBadge } from '@/components/cliente/StorageBadge'

const statusLabel: Record<string, string> = {
  RECEBIDO: 'Pagamento Feito',
  EM_ARMAZEM: 'Comprado',
  EM_ENVIO: 'No armazem',
  ENVIADO: 'Enviado',
  ENTREGUE: 'Entregue',
}

const statusColors: Record<string, string> = {
  RECEBIDO: '#3B82F6',
  EM_ARMAZEM: '#FF6B9D',
  EM_ENVIO: '#F59E0B',
  ENVIADO: '#8B5CF6',
  ENTREGUE: '#22C55E',
}

const statusOrder = ['RECEBIDO', 'EM_ARMAZEM', 'EM_ENVIO', 'ENVIADO', 'ENTREGUE']

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
    <div className="p-8 max-w-3xl">
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
      <div className="bg-white rounded-2xl p-6 mb-5" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <h2 className="text-sm font-semibold mb-5" style={{ color: '#6B7280' }}>LINHA DO TEMPO</h2>
        <div className="flex items-center justify-between relative">
          {/* Line */}
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
              <div key={s} className="relative flex flex-col items-center gap-2 z-10">
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
                  className="text-xs font-medium text-center w-16"
                  style={{ color: done ? (active ? '#FF6B9D' : '#22C55E') : '#9CA3AF' }}
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

      {/* Datas e armazenagem */}
      <div className="bg-white rounded-2xl p-6 mb-5" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <h2 className="text-sm font-semibold mb-4" style={{ color: '#6B7280' }}>DATAS</h2>
        <div className="grid grid-cols-3 gap-6">
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
      {item.fotos.length > 0 && (
        <div className="bg-white rounded-2xl p-6" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <h2 className="text-sm font-semibold mb-4" style={{ color: '#6B7280' }}>
            FOTOS ({item.fotos.length})
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {item.fotos.map((foto, idx) => (
              <a
                key={idx}
                href={foto}
                target="_blank"
                rel="noopener noreferrer"
                className="block aspect-square rounded-xl overflow-hidden bg-gray-100 hover:opacity-90 transition-opacity"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={foto}
                  alt={`Foto ${idx + 1} do item`}
                  className="w-full h-full object-cover"
                />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* No photos placeholder */}
      {item.fotos.length === 0 && (
        <div
          className="bg-white rounded-2xl p-8 flex flex-col items-center justify-center gap-2"
          style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
        >
          <Package className="w-10 h-10" style={{ color: '#E5E7EB' }} />
          <p className="text-sm" style={{ color: '#9CA3AF' }}>Nenhuma foto disponível</p>
        </div>
      )}
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
