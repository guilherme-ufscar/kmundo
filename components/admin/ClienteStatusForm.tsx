'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

const opcoes = [
  { value: 'ATIVA', label: 'Ativa', color: '#22C55E', bg: '#F0FDF4' },
  { value: 'PENDENTE', label: 'Pendente', color: '#F59E0B', bg: '#FFFBEB' },
  { value: 'SUSPENSA', label: 'Suspensa', color: '#EF4444', bg: '#FEF2F2' },
]

interface Props {
  clienteId: string
  statusAtual: string
}

export function ClienteStatusForm({ clienteId, statusAtual }: Props) {
  const [status, setStatus] = useState(statusAtual)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  async function handleSave() {
    if (status === statusAtual) return
    setSaving(true)
    try {
      const res = await fetch(`/api/clientes/${clienteId}`, {
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
    <div className="space-y-3">
      {opcoes.map((op) => (
        <button
          key={op.value}
          type="button"
          onClick={() => setStatus(op.value)}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left"
          style={{
            borderColor: status === op.value ? op.color : '#E5E7EB',
            background: status === op.value ? op.bg : 'transparent',
          }}
        >
          <span
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ background: op.color }}
          />
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
