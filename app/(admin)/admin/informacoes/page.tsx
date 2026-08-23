import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { InformacoesAdmin } from '@/components/admin/InformacoesAdmin'

export const dynamic = 'force-dynamic'

export default async function AdminInformacoesPage() {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') redirect('/login')

  const [ativas, arquivadas] = await Promise.all([
    prisma.atualizacao.findMany({ where: { arquivada: false }, include: { _count: { select: { leituras: true } } }, orderBy: { publicadaEm: 'desc' } }),
    prisma.atualizacao.findMany({ where: { arquivada: true }, include: { _count: { select: { leituras: true } } }, orderBy: { publicadaEm: 'desc' } }),
  ])

  return (
    <div className="p-4 sm:p-8 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: '#1A1A2E' }}>Informações / Atualizações</h1>
        <p className="text-sm" style={{ color: '#6B7280' }}>Central de comunicados — publique, edite, arquive e acompanhe leituras. E-mail automático a todos os clientes ao publicar.</p>
      </div>
      <InformacoesAdmin initialAtivas={ativas as never} initialArquivadas={arquivadas as never} />
    </div>
  )
}
