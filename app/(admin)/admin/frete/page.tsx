import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { FreteAdmin } from '@/components/admin/FreteAdmin'

export const dynamic = 'force-dynamic'

export default async function AdminFretePage() {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') redirect('/login')

  const [paises, caixas, tarifas, config] = await Promise.all([
    prisma.fretePais.findMany({ orderBy: [{ ordem: 'asc' }, { nome: 'asc' }] }),
    prisma.freteCaixaTipo.findMany({ orderBy: [{ ordem: 'asc' }, { nome: 'asc' }] }),
    prisma.freteTarifa.findMany({ include: { pais: { select: { nome: true, codigo: true } }, caixaTipo: { select: { nome: true } } }, orderBy: [{ paisId: 'asc' }, { pesoMin: 'asc' }] }),
    prisma.freteConfig.findFirst(),
  ])

  return (
    <div className="p-4 sm:p-8 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: '#1A1A2E' }}>Calculadora de Frete</h1>
        <p className="text-sm" style={{ color: '#6B7280' }}>Cadastre países, caixas, tarifas e edite todos os textos explicativos — 100% editável sem código.</p>
      </div>
      <FreteAdmin paises={paises} caixas={caixas} tarifas={tarifas as never} config={config as never} />
    </div>
  )
}
