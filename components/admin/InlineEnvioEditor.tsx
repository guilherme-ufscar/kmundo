'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { EnvioAdminForm } from '@/components/admin/EnvioAdminForm'

interface Props {
  envio: {
    id: string
    status: string
    metodoEnvio: string
    peso: number | null
    largura: number | null
    altura: number | null
    comprimento: number | null
    valorDeclarado: number | null
    moeda: string | null
    valorFrete: number | null
    moedaFrete: string | null
    videoUrl: string | null
    trackingEnvio: string | null
    dataLimitePagamento: string | null
    observacoes: string | null
    fretePago: boolean
  }
  fotos: string[]
}

export function InlineEnvioEditor({ envio, fotos }: Props) {
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
            Editar envio {envio.metodoEnvio}
          </p>
          <p className="text-xs" style={{ color: '#9CA3AF' }}>
            Frete, pagamento, tracking e observações
          </p>
        </div>
        {open ? <ChevronUp className="w-4 h-4" style={{ color: '#6B7280' }} /> : <ChevronDown className="w-4 h-4" style={{ color: '#6B7280' }} />}
      </button>

      {open && (
        <div className="p-4 bg-white">
          <EnvioAdminForm envio={envio} fotos={fotos} />
        </div>
      )}
    </div>
  )
}
