'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { CheckCircle, Clock } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function ConfirmarLeituraButton({ atualizacaoId, jaLida, confirmadoEm }: { atualizacaoId: string; jaLida: boolean; confirmadoEm: string | null }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [lida, setLida] = useState(jaLida)

  async function confirmar() {
    setLoading(true)
    const res = await fetch(`/api/atualizacoes/${atualizacaoId}/confirmar`, { method: 'POST' })
    setLoading(false)
    if (res.ok) {
      await res.json()
      setLida(true)
      toast.success('Leitura confirmada! Obrigado.')
      router.refresh()
    } else {
      toast.error('Erro ao confirmar leitura')
    }
  }

  if (lida) {
    return (
      <div className="bg-white rounded-2xl p-5 flex items-center gap-3" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)', background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
        <CheckCircle className="w-5 h-5" style={{ color: '#22C55E' }} />
        <div>
          <p className="text-sm font-medium" style={{ color: '#166534' }}>Você confirmou a leitura</p>
          {confirmadoEm && <p className="text-xs flex items-center gap-1" style={{ color: '#6B7280' }}><Clock className="w-3 h-3" />{new Date(confirmadoEm).toLocaleString('pt-BR')}</p>}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl p-6" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
      <h3 className="font-semibold mb-2" style={{ color: '#1A1A2E' }}>Confirmação de leitura</h3>
      <p className="text-sm mb-4" style={{ color: '#6B7280' }}>Ao clicar abaixo você confirma que leu e está ciente desta atualização. Seu nome, data e horário serão registrados.</p>
      <button type="button" onClick={confirmar} disabled={loading} className="inline-flex items-center gap-2 px-6 h-11 rounded-xl text-sm font-semibold text-white disabled:opacity-60" style={{ background: 'linear-gradient(135deg,#FF6B9D,#FF4D8D)' }}>
        <CheckCircle className="w-4 h-4" />{loading ? 'Confirmando...' : 'Confirmo que li esta atualização'}
      </button>
    </div>
  )
}
