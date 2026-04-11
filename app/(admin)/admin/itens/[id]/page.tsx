import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { calcularDiasArmazenado, getCorArmazenagem } from '@/lib/utils'
import { ItemStatusForm } from '@/components/admin/ItemStatusForm'
import { ItemEditForm } from '@/components/admin/ItemEditForm'

const corArmazenagem: Record<string, string> = {
  green: '#22C55E',
  yellow: '#F59E0B',
  orange: '#F97316',
  red: '#EF4444',
}

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

export default async function ItemDetalhePage({ params }: { params: { id: string } }) {
  const session = await auth()
  if (!session || session.user?.role !== 'ADMIN') redirect('/login')

  const item = await prisma.item.findUnique({
    where: { id: params.id },
    include: {
      cliente: { include: { usuario: { select: { email: true } } } },
    },
  })

  if (!item) notFound()

  const dias = calcularDiasArmazenado(item.dataEntrada)
  const cor = getCorArmazenagem(dias)

  return (
    <div className="p-4 sm:p-8 max-w-4xl">
      <div className="flex items-center gap-3 mb-6 sm:mb-8">
        <Link href="/admin/itens">
          <button className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-colors" style={{ color: '#6B7280' }}>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </Link>
        <div>
          <h1 className="text-lg sm:text-2xl font-bold leading-tight" style={{ color: '#1A1A2E' }}>{item.descricao}</h1>
          <p style={{ color: '#6B7280' }}>
            Suite{' '}
            <Link href={`/admin/clientes/${item.clienteId}`} className="font-mono font-bold hover:underline" style={{ color: '#FF6B9D' }}>
              #{String(item.cliente.numeroDeSuite).padStart(3, '0')}
            </Link>
            {' '}— {item.cliente.nomeCompleto}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Dados do item */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium text-white" style={{ background: statusColors[item.status] }}>
                {statusLabel[item.status]}
              </span>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold" style={{ background: `${corArmazenagem[cor]}20`, color: corArmazenagem[cor] }}>
                {dias} dias
              </span>
            </div>
            <dl className="grid grid-cols-2 gap-4 mb-4">
              {[
                { label: 'Data de Entrada', value: new Date(item.dataEntrada).toLocaleDateString('pt-BR') },
                { label: 'Data de Envio', value: item.dataEnvio ? new Date(item.dataEnvio).toLocaleDateString('pt-BR') : null },
                { label: 'Data de Entrega', value: item.dataEntrega ? new Date(item.dataEntrega).toLocaleDateString('pt-BR') : null },
              ].filter(({ value }) => value).map(({ label, value }) => (
                <div key={label}>
                  <dt className="text-xs" style={{ color: '#9CA3AF' }}>{label}</dt>
                  <dd className="text-sm font-medium mt-0.5" style={{ color: '#1A1A2E' }}>{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <ItemEditForm item={{ id: item.id, descricao: item.descricao, lojaOrigem: item.lojaOrigem, trackingLoja: item.trackingLoja, observacoes: item.observacoes, dataEntrada: item.dataEntrada, fotos: item.fotos }} />

        </div>

        {/* Status form */}
        <div className="bg-white rounded-2xl p-6" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <h2 className="font-semibold mb-4" style={{ color: '#1A1A2E' }}>Alterar Status</h2>
          <ItemStatusForm itemId={item.id} statusAtual={item.status} />
        </div>
      </div>
    </div>
  )
}
