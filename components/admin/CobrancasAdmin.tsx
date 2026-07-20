'use client'

import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

type Cobranca = {
  id: string
  status: string
  descricao: string
  valor: number
  moeda: string
  comprovanteUrl: string | null
  criadoEm: Date | string
  pagoEm: Date | string | null
  cliente?: { nomeCompleto: string; numeroDeSuite: number } | null
  notaFiscal: { status: string; urlPdf: string | null } | null
}

export function CobrancasAdmin({ cobrancas }: { cobrancas: Cobranca[] }) {
  const router = useRouter()
  async function atualizar(id: string, body: object) {
    const res = await fetch(`/api/cobrancas/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    if (res.ok) { router.refresh(); toast.success('Cobranca atualizada') }
    else toast.error((await res.json()).error ?? 'Erro ao atualizar')
  }
  async function emitir(id: string) {
    const res = await fetch(`/api/cobrancas/${id}/emitir-nota`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tipo: 'NFSE' }) })
    if (res.ok) { router.refresh(); toast.success('Nota emitida e PDF salvo') }
    else toast.error((await res.json()).error ?? 'Nao foi possivel emitir a nota')
  }
  return (
    <div className="space-y-3">
      {cobrancas.map(c => (
        <div key={c.id} className="border border-gray-100 bg-white rounded-lg p-4 flex flex-wrap items-center gap-3 justify-between">
          <div>
            <p className="font-medium" style={{ color: '#1A1A2E' }}>{c.descricao}</p>
            <p className="text-xs" style={{ color: '#6B7280' }}>
              {c.cliente ? `Suite #${String(c.cliente.numeroDeSuite).padStart(3, '0')} - ${c.cliente.nomeCompleto} | ` : ''}
              {c.status.replaceAll('_', ' ')} | {c.moeda} {c.valor.toFixed(2)} | {new Date(c.criadoEm).toLocaleDateString('pt-BR')}
              {c.pagoEm ? ` | pago em ${new Date(c.pagoEm).toLocaleDateString('pt-BR')}` : ''}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {c.comprovanteUrl && <a href={c.comprovanteUrl} target="_blank" className="px-3 py-1.5 text-xs rounded-lg bg-gray-100">Comprovante</a>}
            {c.status === 'COMPROVANTE_ENVIADO' && <button onClick={() => atualizar(c.id, { status: 'PAGO' })} className="px-3 py-1.5 text-xs rounded-lg text-white" style={{ background: '#16A34A' }}>Confirmar pagamento</button>}
            {c.status === 'PAGO' && !c.notaFiscal?.urlPdf && <button onClick={() => emitir(c.id)} className="px-3 py-1.5 text-xs rounded-lg text-white" style={{ background: '#1A1A2E' }}>Emitir NFS-e</button>}
            {c.notaFiscal?.urlPdf && <a href={c.notaFiscal.urlPdf} target="_blank" className="px-3 py-1.5 text-xs rounded-lg" style={{ background: '#ECFDF5', color: '#15803D' }}>PDF da nota</a>}
          </div>
        </div>
      ))}
    </div>
  )
}
