'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { PackageCheck, CheckCircle } from 'lucide-react'

export function EnvioCaixaRecebida({ envioId, status }: { envioId: string; status: string }) {
  const router = useRouter()
  const [uploading, setUploading] = useState(false)
  const [files, setFiles] = useState<FileList | null>(null)

  if (status !== 'ENVIADO') return null

  async function confirmar() {
    setUploading(true)
    const fd = new FormData()
    if (files) {
      Array.from(files).slice(0, 5).forEach(f => fd.append('files', f))
    }
    try {
      const res = await fetch(`/api/envios/${envioId}/confirmar-recebimento`, { method: 'POST', body: fd })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Erro')
      toast.success('Caixa recebida confirmada! Obrigado.')
      router.refresh()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao confirmar')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl p-6 mb-5 border-2" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderColor: '#22C55E' }}>
      <h3 className="font-semibold mb-2 flex items-center gap-2" style={{ color: '#1A1A2E' }}>
        <PackageCheck className="w-5 h-5" style={{ color: '#22C55E' }} /> Caixa enviada — confirme o recebimento
      </h3>
      <p className="text-sm mb-4" style={{ color: '#6B7280' }}>
        Quando receber a caixa, clique abaixo para confirmar. Você pode anexar fotos da caixa recebida como registro.
      </p>
      <div className="mb-4">
        <label className="text-sm font-medium block mb-1" style={{ color: '#374151' }}>Fotos da caixa recebida (opcional, até 5)</label>
        <input type="file" accept="image/*" multiple onChange={e => setFiles(e.target.files)} className="text-sm" />
      </div>
      <button type="button" onClick={confirmar} disabled={uploading} className="inline-flex items-center gap-2 px-6 h-11 rounded-xl text-sm font-semibold text-white disabled:opacity-60" style={{ background: 'linear-gradient(135deg,#22C55E,#16A34A)' }}>
        <CheckCircle className="w-4 h-4" />{uploading ? 'Confirmando...' : 'Caixa recebida'}
      </button>
    </div>
  )
}
