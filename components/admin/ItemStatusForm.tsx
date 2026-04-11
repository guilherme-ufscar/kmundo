'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

type StatusItem = 'RECEBIDO' | 'EM_ARMAZEM' | 'EM_ENVIO' | 'PREPARANDO_ENVIO' | 'ENVIADO' | 'ENTREGUE'

const opcoes: { value: StatusItem; label: string; color: string; bg: string }[] = [
  { value: 'RECEBIDO', label: 'Pagamento Feito', color: '#3B82F6', bg: '#EFF6FF' },
  { value: 'EM_ARMAZEM', label: 'Comprado', color: '#FF6B9D', bg: '#FFF1F5' },
  { value: 'EM_ENVIO', label: 'No armazem', color: '#F59E0B', bg: '#FFFBEB' },
  { value: 'PREPARANDO_ENVIO', label: 'Preparando para o envio', color: '#F97316', bg: '#FFF7ED' },
  { value: 'ENVIADO', label: 'Enviado', color: '#8B5CF6', bg: '#F5F3FF' },
  { value: 'ENTREGUE', label: 'Entregue', color: '#22C55E', bg: '#F0FDF4' },
]

interface Props {
  itemId: string
  statusAtual: string
}

export function ItemStatusForm({ itemId, statusAtual }: Props) {
  const [status, setStatus] = useState<StatusItem>(statusAtual as StatusItem)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  async function handleSave() {
    if (status === statusAtual) return
    setSaving(true)
    try {
      const res = await fetch(`/api/itens/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        toast.success('Status atualizado com sucesso!')
        router.refresh()
      } else {
        toast.error('Erro ao salvar status')
      }
    } catch {
      toast.error('Erro de conexão')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-2">
      {opcoes.map((op) => (
        <button
          key={op.value}
          type="button"
          onClick={() => setStatus(op.value)}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl border-2 transition-all text-left"
          style={{
            borderColor: status === op.value ? op.color : '#E5E7EB',
            background: status === op.value ? op.bg : 'transparent',
          }}
        >
          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: op.color }} />
          <span className="text-sm font-medium" style={{ color: status === op.value ? op.color : '#6B7280' }}>
            {op.label}
          </span>
        </button>
      ))}

      <button
        type="button"
        onClick={handleSave}
        disabled={saving || status === statusAtual}
        className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-50 mt-2"
        style={{ background: 'linear-gradient(135deg, #FF6B9D, #FF4D8D)' }}
      >
        {saving ? 'Salvando...' : 'Salvar'}
      </button>

    </div>
  )
}
