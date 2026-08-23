import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { clienteWhereFromSession } from '@/lib/cliente-session'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Clock } from 'lucide-react'
import { ConfirmarLeituraButton } from '@/components/cliente/ConfirmarLeituraButton'

export const dynamic = 'force-dynamic'

export default async function InformacaoDetalhePage({ params }: { params: { id: string } }) {
  const session = await auth()
  const cliente = await prisma.cliente.findFirst({ where: clienteWhereFromSession(session!.user!) })
  if (!cliente) notFound()

  const atualizacao = await prisma.atualizacao.findUnique({ where: { id: params.id } })
  if (!atualizacao) notFound()

  const leitura = await prisma.leituraAtualizacao.findUnique({
    where: { atualizacaoId_clienteId: { atualizacaoId: params.id, clienteId: cliente.id } },
  })

  const data = new Date(atualizacao.publicadaEm).toLocaleDateString('pt-BR')
  const horario = new Date(atualizacao.publicadaEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  const ano = new Date(atualizacao.publicadaEm).getFullYear()

  return (
    <div className="p-4 sm:p-8 max-w-3xl">
      <Link href="/informacoes" className="inline-flex items-center gap-2 text-sm font-medium mb-6 hover:opacity-70" style={{ color: '#FF6B9D' }}>
        <ArrowLeft className="w-4 h-4" />Voltar
      </Link>

      <div className="bg-white rounded-2xl p-6 mb-6" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <h1 className="text-xl font-bold" style={{ color: '#1A1A2E' }}>{atualizacao.titulo}</h1>
        <p className="text-xs mt-2 flex items-center gap-3" style={{ color: '#9CA3AF' }}>
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{data} às {horario}</span>
          <span>Ano {ano}</span>
          <span className={`px-2 py-0.5 rounded-full text-xs ${atualizacao.arquivada ? 'bg-gray-100' : 'text-white'}`} style={atualizacao.arquivada ? { color: '#6B7280' } : { background: '#22C55E' }}>{atualizacao.arquivada ? 'Arquivada' : 'Ativa'}</span>
        </p>
        <div className="mt-4 termos-content" dangerouslySetInnerHTML={{ __html: atualizacao.conteudo }} />
      </div>

      <ConfirmarLeituraButton atualizacaoId={atualizacao.id} jaLida={!!leitura} confirmadoEm={leitura?.confirmadoEm?.toISOString() ?? null} />
    </div>
  )
}
