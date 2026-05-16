'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { ItemEditForm } from '@/components/admin/ItemEditForm'

interface Props {
  item: {
    id: string
    descricao: string
    lojaOrigem: string | null
    trackingLoja: string | null
    observacoes: string | null
    dataEntrada: Date
    fotos: string[]
  }
}

export function InlineItemEditor({ item }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <div className="rounded-xl border border-gray-100 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
        style={{ background: '#F9FAFB' }}
      >
        <div>
          <p className="text-sm font-medium" style={{ color: '#1A1A2E' }}>
            Editar item
          </p>
          <p className="text-xs" style={{ color: '#9CA3AF' }}>
            Descrição, loja, tracking, data e fotos
          </p>
        </div>
        {open ? <ChevronUp className="w-4 h-4" style={{ color: '#6B7280' }} /> : <ChevronDown className="w-4 h-4" style={{ color: '#6B7280' }} />}
      </button>

      {open && (
        <div className="p-4 bg-white">
          <ItemEditForm item={item} redirectTo={typeof window !== 'undefined' ? window.location.pathname : '/admin/clientes'} />
        </div>
      )}
    </div>
  )
}
