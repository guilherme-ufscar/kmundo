import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, Clock, Mail, Users } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminInformacaoDetalhePage({ params }: { params: { id: string } }) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') redirect('/login')

  const atualizacao = await prisma.atualizacao.findUnique({
    where: { id: params.id },
    include: { _count: { select: { leituras: true } } },
  })
  if (!atualizacao) notFound()

  const [leituras, totalClientes] = await Promise.all([
    prisma.leituraAtualizacao.findMany({
      where: { atualizacaoId: params.id },
      include: { cliente: { select: { nomeCompleto: true, numeroDeSuite: true, usuario: { select: { email: true } } } } },
      orderBy: { confirmadoEm: 'desc' },
    }),
    prisma.cliente.count(),
  ])

  const pendentes = await prisma.cliente.findMany({
    where: { id: { notIn: leituras.map(l => l.clienteId) } },
    select: { nomeCompleto: true, numeroDeSuite: true, usuario: { select: { email: true } } },
    orderBy: { numeroDeSuite: 'asc' },
  })

  const ano = new Date(atualizacao.publicadaEm).getFullYear()
  const data = new Date(atualizacao.publicadaEm).toLocaleDateString('pt-BR')
  const horario = new Date(atualizacao.publicadaEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="p-4 sm:p-8 max-w-5xl">
      <Link href="/admin/informacoes" className="inline-flex items-center gap-2 text-sm font-medium mb-6 hover:opacity-70" style={{ color: '#FF6B9D' }}>
        <ArrowLeft className="w-4 h-4" />Voltar
      </Link>

      <div className="bg-white rounded-2xl p-6 mb-6" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <h1 className="text-xl font-bold" style={{ color: '#1A1A2E' }}>{atualizacao.titulo}</h1>
        <p className="text-xs mt-2 flex items-center gap-3 flex-wrap" style={{ color: '#9CA3AF' }}>
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{data} às {horario}</span>
          <span>Ano {ano}</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${atualizacao.arquivada ? 'bg-gray-100' : 'text-white'}`} style={atualizacao.arquivada ? { color: '#6B7280' } : { background: '#22C55E' }}>{atualizacao.arquivada ? 'Arquivada' : 'Ativa'}</span>
        </p>
        <div className="mt-4 termos-content" dangerouslySetInnerHTML={{ __html: atualizacao.conteudo }} />
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-2xl p-4 text-center" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <Users className="w-6 h-6 mx-auto mb-1" style={{ color: '#FF6B9D' }} />
          <p className="text-2xl font-bold" style={{ color: '#1A1A2E' }}>{totalClientes}</p>
          <p className="text-xs" style={{ color: '#9CA3AF' }}>Receberam (e-mail)</p>
        </div>
        <div className="bg-white rounded-2xl p-4 text-center" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <CheckCircle className="w-6 h-6 mx-auto mb-1" style={{ color: '#22C55E' }} />
          <p className="text-2xl font-bold" style={{ color: '#1A1A2E' }}>{leituras.length}</p>
          <p className="text-xs" style={{ color: '#9CA3AF' }}>Confirmaram leitura</p>
        </div>
        <div className="bg-white rounded-2xl p-4 text-center" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <Mail className="w-6 h-6 mx-auto mb-1" style={{ color: '#F59E0B' }} />
          <p className="text-2xl font-bold" style={{ color: '#1A1A2E' }}>{pendentes.length}</p>
          <p className="text-xs" style={{ color: '#9CA3AF' }}>Pendentes</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <h3 className="font-semibold mb-3 flex items-center gap-2" style={{ color: '#1A1A2E' }}><CheckCircle className="w-4 h-4" style={{ color: '#22C55E' }} />Confirmaram ({leituras.length})</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {leituras.map(l => (
              <div key={l.id} className="flex items-center justify-between p-3 rounded-xl" style={{ background: '#F0FDF4' }}>
                <div>
                  <p className="text-sm font-medium" style={{ color: '#1A1A2E' }}>{l.cliente.nomeCompleto} <span className="font-mono text-xs" style={{ color: '#9CA3AF' }}>#{String(l.cliente.numeroDeSuite).padStart(3, '0')}</span></p>
                  <p className="text-xs" style={{ color: '#6B7280' }}>{l.cliente.usuario.email}</p>
                </div>
                <span className="text-xs" style={{ color: '#9CA3AF' }}>{new Date(l.confirmadoEm).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            ))}
            {leituras.length === 0 && <p className="text-sm text-center py-6" style={{ color: '#9CA3AF' }}>Ninguém confirmou ainda.</p>}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <h3 className="font-semibold mb-3 flex items-center gap-2" style={{ color: '#1A1A2E' }}><Clock className="w-4 h-4" style={{ color: '#F59E0B' }} />Pendentes ({pendentes.length})</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {pendentes.map(p => (
              <div key={p.usuario.email} className="flex items-center justify-between p-3 rounded-xl" style={{ background: '#FEFCE8' }}>
                <div>
                  <p className="text-sm font-medium" style={{ color: '#1A1A2E' }}>{p.nomeCompleto} <span className="font-mono text-xs" style={{ color: '#9CA3AF' }}>#{String(p.numeroDeSuite).padStart(3, '0')}</span></p>
                  <p className="text-xs" style={{ color: '#6B7280' }}>{p.usuario.email}</p>
                </div>
              </div>
            ))}
            {pendentes.length === 0 && <p className="text-sm text-center py-6" style={{ color: '#9CA3AF' }}>Todos confirmaram!</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
