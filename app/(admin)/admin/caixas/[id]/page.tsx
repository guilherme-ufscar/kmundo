import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, PackageSearch, Clock, CheckCircle } from 'lucide-react'
import { CaixaAdminDetalhe } from '@/components/admin/CaixaAdminDetalhe'

export const dynamic = 'force-dynamic'

export default async function AdminCaixaDetalhePage({ params }: { params: { id: string } }) {
  const session = await auth()
  if (!session || session.user?.role !== 'ADMIN') redirect('/login')

  const caixa = await prisma.caixaRecebida.findUnique({
    where: { id: params.id },
    include: { cliente: { select: { id: true, nomeCompleto: true, numeroDeSuite: true } } },
  })
  if (!caixa) notFound()

  return (
    <div className="p-4 sm:p-8 max-w-4xl">
      <Link href="/admin/operacional" className="inline-flex items-center gap-2 text-sm font-medium mb-6 hover:opacity-70" style={{ color: '#FF6B9D' }}>
        <ArrowLeft className="w-4 h-4" />Voltar para Operacional
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#1A1A2E' }}>Caixa {caixa.tracking}</h1>
          <p className="text-sm" style={{ color: '#6B7280' }}>
            Suite <Link href={`/admin/clientes/${caixa.cliente.id}`} className="font-mono font-bold hover:underline" style={{ color: '#FF6B9D' }}>#{String(caixa.cliente.numeroDeSuite).padStart(3, '0')}</Link> — {caixa.cliente.nomeCompleto}
          </p>
          <p className="text-xs mt-1 flex items-center gap-1" style={{ color: '#9CA3AF' }}><Clock className="w-3 h-3" />Registrada em {new Date(caixa.criadoEm).toLocaleString('pt-BR')}</p>
        </div>
        {caixa.status === 'PENDENTE' ? (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100" style={{ color: '#92400E' }}>A caminho</span>
        ) : (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100" style={{ color: '#047857' }}><CheckCircle className="w-3 h-3" />Recebida no armazém</span>
        )}
      </div>

      <div className="bg-white rounded-2xl p-6 mb-6" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <h2 className="font-semibold mb-4 flex items-center gap-2" style={{ color: '#1A1A2E' }}><PackageSearch className="w-4 h-4" style={{ color: '#FF6B9D' }} /> Etapas</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: '#FFF1F5', color: '#FF6B9D' }}>1</div>
            <div><p className="text-sm font-medium" style={{ color: '#1A1A2E' }}>A caminho</p><p className="text-xs" style={{ color: '#6B7280' }}>Cliente cadastrou o tracking, caixa a caminho.</p></div>
            <CheckCircle className="w-5 h-5 ml-auto" style={{ color: '#22C55E' }} />
          </div>
          <div className="flex items-center gap-3" style={{ opacity: caixa.status === 'PENDENTE' ? 0.4 : 1 }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: caixa.status === 'PENDENTE' ? '#F3F4F6' : '#F0FDF4', color: caixa.status === 'PENDENTE' ? '#9CA3AF' : '#22C55E' }}>2</div>
            <div><p className="text-sm font-medium" style={{ color: caixa.status === 'PENDENTE' ? '#9CA3AF' : '#1A1A2E' }}>Recebida no armazém</p><p className="text-xs" style={{ color: '#6B7280' }}>{caixa.status === 'PENDENTE' ? 'Aguardando confirmação física' : `Recebida em ${caixa.recebidoEm ? new Date(caixa.recebidoEm).toLocaleString('pt-BR') : ''}`}</p></div>
            {caixa.status !== 'PENDENTE' && <CheckCircle className="w-5 h-5 ml-auto" style={{ color: '#22C55E' }} />}
          </div>
        </div>
      </div>

      <CaixaAdminDetalhe caixa={{
        id: caixa.id,
        tracking: caixa.tracking,
        lojaOrigem: caixa.lojaOrigem,
        observacoes: caixa.observacoes,
        comprovanteCompraUrl: caixa.comprovanteCompraUrl,
        fotoEtiquetaUrl: caixa.fotoEtiquetaUrl,
        status: caixa.status,
        recebidoEm: caixa.recebidoEm?.toISOString() ?? null,
      }} />
    </div>
  )
}
