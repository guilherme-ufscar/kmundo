'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { PedidoCompraAdminForm } from '@/components/admin/PedidoCompraAdminForm'

interface Props {
  pedido: {
    id: string
    status: string
    valorTotal: number | null
    moeda: string
    chavePix: string | null
    qrCodePix: string | null
    instrucoesPix: string | null
    linkCartao: string | null
    whatsappRecepcao: string | null
    observacoesAdmin: string | null
    dataLimitePagamento: string | null
    formaPagamentoCliente: string | null
  }
  config: {
    chavePix: string | null
    qrCodePix: string | null
    instrucoesPix: string | null
    whatsappRecepcao: string | null
  } | null
}

export function InlinePedidoEditor({ pedido, config }: Props) {
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
            Editar pedido
          </p>
          <p className="text-xs" style={{ color: '#9CA3AF' }}>
            Pagamento, Pix, WhatsApp e status
          </p>
        </div>
        {open ? <ChevronUp className="w-4 h-4" style={{ color: '#6B7280' }} /> : <ChevronDown className="w-4 h-4" style={{ color: '#6B7280' }} />}
      </button>

      {open && (
        <div className="p-4 bg-white">
          <PedidoCompraAdminForm pedido={pedido} config={config} />
        </div>
      )}
    </div>
  )
}
