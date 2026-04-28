import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Package, CheckCircle } from 'lucide-react' // Package usado no título do card
import { EnvioAdminForm } from '@/components/admin/EnvioAdminForm'
import { DeleteButton } from '@/components/admin/DeleteButton'
import { ItemEnvioCard } from '@/components/admin/ItemEnvioCard'

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

export default async function AdminEnvioDetalhePage({ params }: { params: { id: string } }) {
  const session = await auth()
  if (!session || session.user?.role !== 'ADMIN') redirect('/login')

  const envio = await prisma.envio.findUnique({
    where: { id: params.id },
    include: {
      cliente: { select: { id: true, nomeCompleto: true, numeroDeSuite: true } },
      itens: {
        include: {
          item: { select: { id: true, descricao: true, lojaOrigem: true, trackingLoja: true, status: true, fotos: true, observacoes: true, dataEntrada: true } },
        },
      },
    },
  })

  if (!envio) notFound()

  return (
    <div className="p-4 sm:p-8 max-w-4xl">
      <div className="flex flex-wrap items-start gap-3 mb-6 sm:mb-8">
        <Link href="/admin/envios">
          <button className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-colors shrink-0" style={{ color: '#6B7280' }}>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg sm:text-2xl font-bold leading-tight" style={{ color: '#1A1A2E' }}>
            Envio — {metodoLabel[envio.metodoEnvio]}
          </h1>
          <p className="text-sm" style={{ color: '#6B7280' }}>
            Suite{' '}
            <Link href={`/admin/clientes/${envio.cliente.id}`} className="font-mono font-bold hover:underline" style={{ color: '#FF6B9D' }}>
              #{String(envio.cliente.numeroDeSuite).padStart(3, '0')}
            </Link>
            {' '}— {envio.cliente.nomeCompleto}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <DeleteButton
            url={`/api/envios/${envio.id}`}
            confirmar="Tem certeza que deseja excluir este envio? Esta ação não pode ser desfeita."
            redirectTo="/admin/envios"
          />
          <span
            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white"
            style={{ background: statusColors[envio.status] }}
          >
            {statusLabel[envio.status]}
          </span>
          {envio.confirmadoCliente && (
            <span
              className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
              style={{ background: '#F0FDF4', color: '#16A34A' }}
            >
              <CheckCircle className="w-3 h-3" />
              Cliente confirmou
            </span>
          )}
        </div>
      </div>

      {/* Itens — full width */}
      <div className="bg-white rounded-2xl p-6 mb-6" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <h2 className="font-semibold mb-4 flex items-center gap-2" style={{ color: '#1A1A2E' }}>
          <Package className="w-4 h-4" style={{ color: '#FF6B9D' }} />
          Itens no Envio ({envio.itens.length})
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {envio.itens.map(({ item }) => (
            <ItemEnvioCard
              key={item.id}
              item={{
                id: item.id,
                descricao: item.descricao,
                lojaOrigem: item.lojaOrigem,
                trackingLoja: item.trackingLoja,
                status: item.status,
                fotos: item.fotos,
                observacoes: item.observacoes,
                dataEntrada: item.dataEntrada.toISOString(),
              }}
            />
          ))}
        </div>
      </div>

      {/* Formulário + Fotos em 2 colunas */}
      <EnvioAdminForm
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
          valorFrete: (envio as { valorFrete?: number | null }).valorFrete ?? null,
          moedaFrete: (envio as { moedaFrete?: string | null }).moedaFrete ?? null,
          videoUrl: envio.videoUrl,
          trackingEnvio: envio.trackingEnvio,
          dataLimitePagamento: envio.dataLimitePagamento?.toISOString() ?? null,
          observacoes: envio.observacoes,
          fretePago: (envio as { fretePago?: boolean }).fretePago ?? false,
        }}
        fotos={envio.fotos}
      />
    </div>
  )
}
