'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Upload, CheckCircle, Image as ImageIcon } from 'lucide-react'

type Caixa = {
  id: string
  tracking: string
  lojaOrigem: string | null
  observacoes: string | null
  comprovanteCompraUrl: string
  fotoEtiquetaUrl: string | null
  status: 'PENDENTE' | 'RECEBIDA'
  recebidoEm: string | null
}

export function CaixaAdminDetalhe({ caixa }: { caixa: Caixa }) {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)

  const pendente = caixa.status === 'PENDENTE'

  async function confirmar() {
    if (!file) return toast.error('Selecione a foto da etiqueta')
    setSaving(true)
    try {
      const data = new FormData()
      data.append('files', file)
      const up = await fetch('/api/uploads/operacional', { method: 'POST', body: data })
      if (!up.ok) throw new Error((await up.json()).error ?? 'Falha no upload')
      const { urls } = await up.json() as { urls: string[] }
      const fotoEtiquetaUrl = urls[0]
      const res = await fetch(`/api/caixas/${caixa.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'RECEBIDA', fotoEtiquetaUrl }),
      })
      if (!res.ok) throw new Error((await res.json()).error ?? 'Falha ao confirmar')
      toast.success(`Caixa ${caixa.tracking} marcada como Recebida no armazém — e-mail enviado ao cliente!`)
      setFile(null)
      router.refresh()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao confirmar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <h2 className="font-semibold mb-4" style={{ color: '#1A1A2E' }}>Detalhes da caixa</h2>
        <div className="space-y-3 text-sm">
          <div><p className="text-xs" style={{ color: '#9CA3AF' }}>Tracking</p><p className="font-mono font-medium" style={{ color: '#1A1A2E' }}>{caixa.tracking}</p></div>
          {caixa.lojaOrigem && <div><p className="text-xs" style={{ color: '#9CA3AF' }}>Loja de origem</p><p style={{ color: '#374151' }}>{caixa.lojaOrigem}</p></div>}
          {caixa.observacoes && <div><p className="text-xs" style={{ color: '#9CA3AF' }}>Observações</p><p style={{ color: '#374151' }}>{caixa.observacoes}</p></div>}
          <div><p className="text-xs" style={{ color: '#9CA3AF' }}>Comprovante da compra</p><a href={caixa.comprovanteCompraUrl} target="_blank" rel="noreferrer" className="inline-block mt-1 rounded bg-gray-100 px-3 py-1.5 text-xs font-medium">Ver comprovante</a></div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <h2 className="font-semibold mb-4 flex items-center gap-2" style={{ color: '#1A1A2E' }}><ImageIcon className="w-4 h-4" style={{ color: '#FF6B9D' }} /> Foto da etiqueta</h2>
        {caixa.fotoEtiquetaUrl ? (
          <div>
            <a href={caixa.fotoEtiquetaUrl} target="_blank" rel="noreferrer">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={caixa.fotoEtiquetaUrl} alt="Etiqueta" className="w-40 h-40 rounded-xl object-cover border hover:opacity-90" style={{ borderColor: '#E5E7EB' }} />
            </a>
            <p className="text-xs mt-2" style={{ color: '#6B7280' }}>Clique para ver em tamanho maior. Esta foto também foi enviada por e-mail ao cliente.</p>
            {pendente && <p className="text-xs mt-2 font-medium" style={{ color: '#92400E' }}>A foto já está vinculada, mas o status ainda é “A caminho”. Clique abaixo para confirmar o recebimento.</p>}
          </div>
        ) : (
          <p className="text-sm" style={{ color: '#9CA3AF' }}>Nenhuma foto vinculada ainda.</p>
        )}

        {pendente ? (
          <div className="mt-6 border-t pt-6" style={{ borderColor: '#F3F4F6' }}>
            <h3 className="font-semibold text-sm mb-3" style={{ color: '#1A1A2E' }}>Confirmar recebimento</h3>
            <p className="text-xs mb-3" style={{ color: '#6B7280' }}>Ao confirmar, o status muda de <strong>A caminho → Recebida no armazém</strong> e o cliente recebe e-mail automático com a foto (se enviada).</p>
            <label className="h-10 rounded-lg border border-dashed border-gray-300 px-3 text-sm flex items-center gap-2 cursor-pointer mb-3">
              <Upload className="w-4 h-4" /> {file ? file.name : 'Selecionar foto da etiqueta *'}
              <input type="file" className="hidden" accept="image/*" onChange={e => setFile(e.target.files?.[0] ?? null)} />
            </label>
            <button type="button" onClick={confirmar} disabled={saving} className="inline-flex items-center gap-2 h-10 rounded-lg px-4 text-sm font-semibold text-white disabled:opacity-60" style={{ background: '#22C55E' }}>
              <CheckCircle className="w-4 h-4" />{saving ? 'Confirmando...' : 'Alterar para Recebida no armazém'}
            </button>
          </div>
        ) : (
          <div className="mt-4 rounded-xl p-3 flex items-center gap-2" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
            <CheckCircle className="w-4 h-4" style={{ color: '#22C55E' }} />
            <p className="text-sm font-medium" style={{ color: '#166534' }}>Recebida em {caixa.recebidoEm ? new Date(caixa.recebidoEm).toLocaleString('pt-BR') : ''}</p>
          </div>
        )}
      </div>
    </div>
  )
}
