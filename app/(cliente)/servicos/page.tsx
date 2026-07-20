import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { clienteWhereFromSession } from '@/lib/cliente-session'
import { ServicosCliente } from '@/components/cliente/ServicosCliente'

export default async function ServicosPage() {
  const session = await auth()
  const cliente = await prisma.cliente.findFirst({ where: clienteWhereFromSession(session!.user!) })
  if (!cliente) return null

  const [caixas, servicos] = await Promise.all([
    prisma.caixaRecebida.findMany({ where: { clienteId: cliente.id }, select: { id: true, tracking: true, lojaOrigem: true }, orderBy: { recebidoEm: 'desc' } }),
    prisma.solicitacaoServico.findMany({ where: { clienteId: cliente.id }, include: { caixa: { select: { tracking: true } } }, orderBy: { criadoEm: 'desc' } }),
  ])

  return (
    <div className="p-4 sm:p-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: '#1A1A2E' }}>Servicos</h1>
        <p className="text-sm" style={{ color: '#6B7280' }}>Unboxing, foto/video, peso e tamanho vinculados ao rastreamento.</p>
      </div>
      <ServicosCliente caixas={caixas} servicos={servicos} />
    </div>
  )
}
