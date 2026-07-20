import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { CobrancasAdmin } from '@/components/admin/CobrancasAdmin'

export default async function FinanceiroAdminPage() {
  const session = await auth(); if (!session || session.user.role !== 'ADMIN') redirect('/login')
  const cobrancas = await prisma.cobranca.findMany({ include: { cliente: { select: { nomeCompleto: true, numeroDeSuite: true } }, notaFiscal: true }, orderBy: { criadoEm: 'desc' } })
  return <div className="p-4 sm:p-8 max-w-5xl"><div className="mb-6"><h1 className="text-2xl font-bold" style={{ color: '#1A1A2E' }}>Financeiro</h1><p style={{ color: '#6B7280' }}>Pagamentos, comprovantes e notas fiscais por suíte.</p></div><CobrancasAdmin cobrancas={cobrancas} /></div>
}
