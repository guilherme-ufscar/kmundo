import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { CobrancasCliente } from '@/components/cliente/CobrancasCliente'

export default async function FinanceiroPage() {
  const session = await auth(); const cliente = await prisma.cliente.findFirst({ where: { usuarioId: session!.user!.id } }); if (!cliente) return null
  const cobrancas = await prisma.cobranca.findMany({ where: { clienteId: cliente.id }, include: { notaFiscal: true }, orderBy: { criadoEm: 'desc' } })
  return <div className="p-4 sm:p-8 max-w-4xl"><div className="mb-6"><h1 className="text-2xl font-bold" style={{ color: '#1A1A2E' }}>Financeiro</h1><p className="text-sm" style={{ color: '#6B7280' }}>Cobranças, comprovantes e notas fiscais da sua suíte.</p></div><CobrancasCliente cobrancas={cobrancas.map(c => ({ ...c, criadoEm: c.criadoEm.toISOString() }))} /></div>
}
