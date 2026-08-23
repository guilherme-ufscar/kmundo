import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { OperacionalAdmin } from '@/components/admin/OperacionalAdmin'

export default async function AdminOperacionalPage() {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') redirect('/login')

  const [clientes, caixas, servicos] = await Promise.all([
    prisma.cliente.findMany({ where: { status: 'ATIVA' }, select: { id: true, nomeCompleto: true, numeroDeSuite: true }, orderBy: { numeroDeSuite: 'asc' } }),
    prisma.caixaRecebida.findMany({ include: { cliente: { select: { id: true, nomeCompleto: true, numeroDeSuite: true } } }, orderBy: { criadoEm: 'desc' }, take: 80 }),
    prisma.solicitacaoServico.findMany({ include: { caixa: { select: { id: true, tracking: true } }, cliente: { select: { id: true, nomeCompleto: true, numeroDeSuite: true } } }, orderBy: { criadoEm: 'desc' }, take: 80 }),
  ])

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: '#1A1A2E' }}>Operacional</h1>
        <p className="text-sm" style={{ color: '#6B7280' }}>Caixas recebidas, comprovantes, etiquetas e solicitações de serviço.</p>
      </div>
      <OperacionalAdmin clientes={clientes} caixas={caixas} servicos={servicos} />
    </div>
  )
}
