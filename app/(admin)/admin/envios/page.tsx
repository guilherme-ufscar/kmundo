import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Truck, Package, ChevronRight, CheckCircle } from 'lucide-react'

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

interface PageProps {
  searchParams: { status?: string; metodo?: string }
}

export default async function AdminEnviosPage({ searchParams }: PageProps) {
  const session = await auth()
  if (!session || session.user?.role !== 'ADMIN') redirect('/login')

  const where: Record<string, unknown> = {}
  if (searchParams.status) where['status'] = searchParams.status
  if (searchParams.metodo) where['metodoEnvio'] = searchParams.metodo

  const envios = await prisma.envio.findMany({
    where,
    include: {
      cliente: { select: { nomeCompleto: true, numeroDeSuite: true } },
      itens: { include: { item: { select: { descricao: true } } } },
    },
    orderBy: { criadoEm: 'desc' },
  })

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#1A1A2E' }}>Envios</h1>
          <p style={{ color: '#6B7280' }}>{envios.length} envio(s) encontrado(s)</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl p-4 mb-6 flex flex-wrap gap-3" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        {[
          { label: 'Todos', value: '' },
          { label: 'Aguardando', value: 'AGUARDANDO_CONFIRMACAO' },
          { label: 'Confirmado', value: 'CONFIRMADO' },
          { label: 'Embalando', value: 'EMBALANDO' },
          { label: 'Ag. pagamento', value: 'PAGO' },
          { label: 'Enviado', value: 'ENVIADO' },
          { label: 'Entregue', value: 'ENTREGUE' },
        ].map(({ label, value }) => {
          const ativo = (searchParams.status ?? '') === value
          return (
            <Link
              key={value}
              href={value ? `/admin/envios?status=${value}` : '/admin/envios'}
              className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
              style={{
                background: ativo ? '#FF6B9D' : '#F3F4F6',
                color: ativo ? 'white' : '#6B7280',
              }}
            >
              {label}
            </Link>
          )
        })}
        <div className="w-px bg-gray-200 self-stretch mx-1" />
        {[
          { label: 'FedEx', value: 'FEDEX' },
          { label: 'EMS', value: 'EMS' },
          { label: 'Grupo', value: 'ENVIO_EM_GRUPO' },
        ].map(({ label, value }) => {
          const ativo = searchParams.metodo === value
          return (
            <Link
              key={value}
              href={`/admin/envios?metodo=${value}${searchParams.status ? `&status=${searchParams.status}` : ''}`}
              className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
              style={{
                background: ativo ? '#C77DFF' : '#F3F4F6',
                color: ativo ? 'white' : '#6B7280',
              }}
            >
              {label}
            </Link>
          )
        })}
      </div>

      {envios.length === 0 ? (
        <div
          className="bg-white rounded-2xl p-12 flex flex-col items-center justify-center gap-3"
          style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
        >
          <Truck className="w-12 h-12" style={{ color: '#E5E7EB' }} />
          <p className="font-medium" style={{ color: '#1A1A2E' }}>Nenhum envio encontrado</p>
        </div>
      ) : (
        <div className="space-y-3">
          {envios.map((envio) => (
            <Link key={envio.id} href={`/admin/envios/${envio.id}`}>
              <div
                className="bg-white rounded-2xl p-5 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer"
                style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#FFF1F5' }}>
                  <Package className="w-5 h-5" style={{ color: '#FF6B9D' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm" style={{ color: '#1A1A2E' }}>
                      Suite #{String(envio.cliente.numeroDeSuite).padStart(3, '0')} — {envio.cliente.nomeCompleto}
                    </span>
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-white"
                      style={{ background: statusColors[envio.status] }}
                    >
                      {statusLabel[envio.status]}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: '#F3F4F6', color: '#6B7280' }}>
                      {metodoLabel[envio.metodoEnvio]}
                    </span>
                    <span className="text-xs" style={{ color: '#9CA3AF' }}>
                      {envio.itens.length} {envio.itens.length === 1 ? 'item' : 'itens'}
                    </span>
                    {envio.confirmadoCliente && (
                      <span className="flex items-center gap-1 text-xs" style={{ color: '#16A34A' }}>
                        <CheckCircle className="w-3 h-3" />
                        Cliente confirmou
                      </span>
                    )}
                    <span className="text-xs" style={{ color: '#D1D5DB' }}>
                      {new Date(envio.criadoEm).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
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
