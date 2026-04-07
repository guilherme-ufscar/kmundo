import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { ConfiguracoesForm } from '@/components/admin/ConfiguracoesForm'

export default async function ConfiguracoesPage() {
  const session = await auth()
  if (!session || session.user?.role !== 'ADMIN') redirect('/login')

  let config = await prisma.configuracao.findFirst()
  if (!config) {
    config = await prisma.configuracao.create({ data: {} })
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: '#1A1A2E' }}>Configurações</h1>
        <p style={{ color: '#6B7280' }}>Configure as regras do sistema</p>
      </div>
      <ConfiguracoesForm config={config} />
    </div>
  )
}
