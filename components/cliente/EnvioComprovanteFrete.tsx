'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Upload, AlertTriangle, CheckCircle } from 'lucide-react'

export function EnvioComprovanteFrete({ envioId, status, comprovanteFreteUrl }: { envioId: string; status: string; comprovanteFreteUrl: string | null }) {
  const router = useRouter()
  const [uploading, setUploading] = useState(false)

  const precisa = status === 'AGUARDANDO_PAGAMENTO' || status === 'PAGO'
  const aguardandoConfirmacao = status === 'AGUARDANDO_CONFIRMACAO_PAGAMENTO'

  if (!precisa && !aguardandoConfirmacao && !comprovanteFreteUrl) return null
  if (status === 'CAIXA_RECEBIDA' || status === 'ENTREGUE') return null

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    try {
      const res = await fetch(`/api/envios/${envioId}/comprovante`, { method: 'POST', body: fd })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Erro')
      toast.success(json.message)
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao enviar')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  return (
    <div className="bg-white rounded-2xl p-6 mb-5" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
      <h3 className="font-semibold mb-3 flex items-center gap-2" style={{ color: '#1A1A2E' }}>
        <Upload className="w-4 h-4" style={{ color: '#FF6B9D' }} /> Comprovante de pagamento do frete
      </h3>

      {comprovanteFreteUrl && (
        <div className="mb-4 rounded-xl p-3 flex items-start gap-2" style={{ background: aguardandoConfirmacao ? '#FFF7ED' : '#F0FDF4', border: `1px solid ${aguardandoConfirmacao ? '#FFEDD5' : '#BBF7D0'}` }}>
          {aguardandoConfirmacao ? <AlertTriangle className="w-4 h-4 mt-0.5" style={{ color: '#F97316' }} /> : <CheckCircle className="w-4 h-4 mt-0.5" style={{ color: '#22C55E' }} />}
          <div className="text-sm">
            <p className="font-medium" style={{ color: aguardandoConfirmacao ? '#9A3412' : '#166534' }}>
              {aguardandoConfirmacao ? 'Comprovante enviado — aguardando confirmação do pagamento' : 'Comprovante enviado'}
            </p>
            <a href={comprovanteFreteUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-medium hover:underline" style={{ color: '#FF6B9D' }}>Ver comprovante</a>
            {aguardandoConfirmacao && <p className="text-xs mt-1" style={{ color: '#6B7280' }}>Vamos conferir o pagamento na conta e alterar para “Pagamento feito” assim que cair.</p>}
          </div>
        </div>
      )}

      {(precisa || aguardandoConfirmacao) && (
        <div>
          <p className="text-sm mb-3" style={{ color: '#6B7280' }}>
            Após informarmos o valor do frete, realize o pagamento e anexe o comprovante aqui. Não precisa enviar por WhatsApp.
          </p>
          <label className="inline-flex items-center gap-2 px-5 h-11 rounded-xl text-sm font-semibold cursor-pointer text-white hover:opacity-90" style={{ background: 'linear-gradient(135deg,#FF6B9D,#FF4D8D)' }}>
            <Upload className="w-4 h-4" />{uploading ? 'Enviando...' : comprovanteFreteUrl ? 'Reenviar comprovante' : 'Enviar comprovante'}
            <input type="file" accept="image/*,application/pdf" className="hidden" onChange={onFile} disabled={uploading} />
          </label>
        </div>
      )}
    </div>
  )
}
