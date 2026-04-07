import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Package, CheckCircle } from 'lucide-react'
import { EnvioAdminForm } from '@/components/admin/EnvioAdminForm'

const statusLabel: Record<string, string> = {
  AGUARDANDO_CONFIRMACAO: 'Aguardando confirmação',
  CONFIRMADO: 'Confirmado',
  PAGO: 'Pago',
  ENVIADO: 'Enviado',
  ENTREGUE: 'Entregue',
}

const statusColors: Record<string, string> = {
  AGUARDANDO_CONFIRMACAO: '#F59E0B',
  CONFIRMADO: '#3B82F6',
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
          item: { select: { id: true, descricao: true, lojaOrigem: true, trackingLoja: true, status: true } },
        },
      },
    },
  })

  if (!envio) notFound()

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/envios">
          <button className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-colors" style={{ color: '#6B7280' }}>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#1A1A2E' }}>
            Envio — {metodoLabel[envio.metodoEnvio]}
          </h1>
          <p style={{ color: '#6B7280' }}>
            Suite{' '}
            <Link href={`/admin/clientes/${envio.cliente.id}`} className="font-mono font-bold hover:underline" style={{ color: '#FF6B9D' }}>
              #{String(envio.cliente.numeroDeSuite).padStart(3, '0')}
            </Link>
            {' '}— {envio.cliente.nomeCompleto}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
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

      <div className="grid grid-cols-3 gap-6">
        {/* Coluna principal */}
        <div className="col-span-2 space-y-6">
          {/* Itens */}
          <div className="bg-white rounded-2xl p-6" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h2 className="font-semibold mb-4 flex items-center gap-2" style={{ color: '#1A1A2E' }}>
              <Package className="w-4 h-4" style={{ color: '#FF6B9D' }} />
              Itens no Envio ({envio.itens.length})
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
                  {item.trackingLoja && (
                    <span className="text-xs font-mono" style={{ color: '#9CA3AF' }}>{item.trackingLoja}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Fotos atuais */}
          {envio.fotos.length > 0 && (
            <div className="bg-white rounded-2xl p-6" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <h2 className="font-semibold mb-4" style={{ color: '#1A1A2E' }}>
                Fotos da Caixa ({envio.fotos.length})
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
        </div>

        {/* Formulário admin */}
        <div className="space-y-6">
          <EnvioAdminForm envio={{
            id: envio.id,
            status: envio.status,
            metodoEnvio: envio.metodoEnvio,
            peso: envio.peso,
            largura: envio.largura,
            altura: envio.altura,
            comprimento: envio.comprimento,
            valorDeclarado: envio.valorDeclarado,
            moeda: envio.moeda,
            videoUrl: envio.videoUrl,
            trackingEnvio: envio.trackingEnvio,
            dataLimitePagamento: envio.dataLimitePagamento?.toISOString() ?? null,
            observacoes: envio.observacoes,
          }} />
        </div>
      </div>
    </div>
  )
}
