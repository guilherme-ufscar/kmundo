'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PackageSearch, Upload } from 'lucide-react'
import { toast } from 'sonner'

type Caixa = {
  id: string
  tracking: string
  lojaOrigem: string | null
  observacoes: string | null
  comprovanteCompraUrl: string
  fotoEtiquetaUrl: string | null
  status: 'PENDENTE' | 'RECEBIDA'
  recebidoEm: Date | string | null
  criadoEm: Date | string
}

export function TrackingCliente({ caixas }: { caixas: Caixa[] }) {
  const router = useRouter()
  const [form, setForm] = useState({ tracking: '', lojaOrigem: '', observacoes: '' })
  const [comprovante, setComprovante] = useState<File | null>(null)
  const [etiqueta, setEtiqueta] = useState<File | null>(null)
  const [salvando, setSalvando] = useState(false)

  async function registrarCaixa() {
    if (form.tracking.trim().length < 3) return toast.error('Informe o número de rastreamento')
    if (!comprovante) return toast.error('Envie o comprovante da compra')
    setSalvando(true)
    try {
      const data = new FormData()
      data.append('files', comprovante)
      const up = await fetch('/api/uploads/operacional', { method: 'POST', body: data })
      if (!up.ok) throw new Error((await up.json()).error ?? 'Falha no upload do comprovante')
      const { urls: urlsComprovante } = await up.json() as { urls: string[] }
      const comprovanteCompraUrl = urlsComprovante[0]

      let fotoEtiquetaUrl: string | undefined
      if (etiqueta) {
        const etiquetaData = new FormData()
        etiquetaData.append('files', etiqueta)
        const et = await fetch('/api/uploads/operacional', { method: 'POST', body: etiquetaData })
        if (!et.ok) throw new Error((await et.json()).error ?? 'Falha no upload da etiqueta')
        const etUrls = await et.json() as { urls: string[] }
        fotoEtiquetaUrl = etUrls.urls[0]
      }

      const res = await fetch('/api/caixas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tracking: form.tracking.trim(),
          lojaOrigem: form.lojaOrigem.trim() || undefined,
          observacoes: form.observacoes.trim() || undefined,
          comprovanteCompraUrl,
          fotoEtiquetaUrl,
        }),
      })
      if (!res.ok) throw new Error((await res.json()).error ?? 'Não foi possível registrar')
      toast.success(fotoEtiquetaUrl ? 'Caixa registrada e recebimento confirmado' : 'Caixa registrada! A equipe será avisada.')
      setForm({ tracking: '', lojaOrigem: '', observacoes: '' })
      setComprovante(null)
      setEtiqueta(null)
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao registrar')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-100 rounded-lg p-5">
        <h2 className="font-semibold mb-1 flex items-center gap-2" style={{ color: '#1A1A2E' }}><PackageSearch className="w-4 h-4" /> Registrar nova caixa</h2>
        <p className="text-xs mb-4" style={{ color: '#6B7280' }}>Após realizar uma compra, registre o rastreamento aqui. Quando a encomenda chegar ao armazém, nossa equipe confirma o recebimento e você é avisado. Se já estiver com a foto da etiqueta em mãos, envie junto para confirmar o recebimento na hora.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input value={form.tracking} onChange={e => setForm(f => ({ ...f, tracking: e.target.value }))} placeholder="Tracking" className="h-10 rounded-lg border border-gray-200 px-3 text-sm" />
          <input value={form.lojaOrigem} onChange={e => setForm(f => ({ ...f, lojaOrigem: e.target.value }))} placeholder="Loja de origem" className="h-10 rounded-lg border border-gray-200 px-3 text-sm" />
          <input value={form.observacoes} onChange={e => setForm(f => ({ ...f, observacoes: e.target.value }))} placeholder="Observações (opcional)" className="h-10 rounded-lg border border-gray-200 px-3 text-sm" />
          <label className="h-10 rounded-lg border border-dashed border-gray-300 px-3 text-sm flex items-center gap-2 cursor-pointer">
            <Upload className="w-4 h-4" /> {comprovante ? comprovante.name : 'Comprovante da compra *'}
            <input type="file" className="hidden" accept="image/*,application/pdf" onChange={e => setComprovante(e.target.files?.[0] ?? null)} />
          </label>
          <label className="h-10 rounded-lg border border-dashed border-gray-300 px-3 text-sm flex items-center gap-2 cursor-pointer">
            <Upload className="w-4 h-4" /> {etiqueta ? etiqueta.name : 'Foto da etiqueta (opcional)'}
            <input type="file" className="hidden" accept="image/*" onChange={e => setEtiqueta(e.target.files?.[0] ?? null)} />
          </label>
        </div>
        <button type="button" onClick={registrarCaixa} disabled={salvando} className="mt-4 h-10 rounded-lg px-4 text-sm font-semibold text-white" style={{ background: '#FF6B9D' }}>
          {salvando ? 'Registrando...' : 'Registrar caixa'}
        </button>
      </div>

      <div className="space-y-3">
        {caixas.length === 0 && (
          <div className="bg-white border border-gray-100 rounded-lg p-6 text-center text-sm" style={{ color: '#6B7280' }}>
            Nenhuma caixa registrada ainda. Registre o rastreamento da sua primeira compra acima.
          </div>
        )}
        {caixas.map(caixa => {
          const pendente = caixa.status === 'PENDENTE'
          return (
            <div key={caixa.id} className="bg-white border border-gray-100 rounded-lg p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium" style={{ color: '#1A1A2E' }}>{caixa.tracking}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>
                    Registrada em {new Date(caixa.criadoEm).toLocaleDateString('pt-BR')}
                    {caixa.lojaOrigem ? ` · ${caixa.lojaOrigem}` : ''}
                    {caixa.recebidoEm ? ` · Recebida em ${new Date(caixa.recebidoEm).toLocaleDateString('pt-BR')}` : ''}
                  </p>
                  {caixa.observacoes && <p className="text-xs mt-1" style={{ color: '#6B7280' }}>{caixa.observacoes}</p>}
                </div>
                <span className={`rounded px-2 py-1 text-xs font-medium ${pendente ? 'bg-amber-100' : 'bg-green-100'}`} style={{ color: pendente ? '#B45309' : '#047857' }}>
                  {pendente ? 'Aguardando chegada' : 'Recebida no armazém'}
                </span>
              </div>
              <div className="mt-2 flex gap-2 text-xs">
                <a href={caixa.comprovanteCompraUrl} target="_blank" rel="noreferrer" className="rounded bg-gray-100 px-2 py-1">Comprovante da compra</a>
                {caixa.fotoEtiquetaUrl && <a href={caixa.fotoEtiquetaUrl} target="_blank" rel="noreferrer" className="rounded bg-gray-100 px-2 py-1">Foto da etiqueta</a>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
