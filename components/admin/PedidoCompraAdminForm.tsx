'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

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

const statusOpcoes = [
  { value: 'AGUARDANDO_REVISAO', label: 'Aguardando revisão' },
  { value: 'AGUARDANDO_PAGAMENTO', label: 'Aguardando pagamento' },
  { value: 'PAGO', label: 'Pago' },
  { value: 'COMPRADO', label: 'Comprado' },
  { value: 'CANCELADO', label: 'Cancelado' },
]

export function PedidoCompraAdminForm({ pedido, config }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState(pedido.status)
  const [valorTotal, setValorTotal] = useState(pedido.valorTotal?.toString() ?? '')
  const [moeda, setMoeda] = useState(pedido.moeda || 'BRL')
  const [chavePix, setChavePix] = useState(pedido.chavePix ?? config?.chavePix ?? '')
  const [qrCodePix, setQrCodePix] = useState(pedido.qrCodePix ?? config?.qrCodePix ?? '')
  const [instrucoesPix, setInstrucoesPix] = useState(pedido.instrucoesPix ?? config?.instrucoesPix ?? '')
  const [linkCartao, setLinkCartao] = useState(pedido.linkCartao ?? '')
  const [whatsappRecepcao, setWhatsappRecepcao] = useState(pedido.whatsappRecepcao ?? config?.whatsappRecepcao ?? '')
  const [observacoesAdmin, setObservacoesAdmin] = useState(pedido.observacoesAdmin ?? '')
  const [dataLimitePagamento, setDataLimitePagamento] = useState(pedido.dataLimitePagamento ? new Date(pedido.dataLimitePagamento).toISOString().slice(0, 10) : '')
  const [formaPagamentoCliente, setFormaPagamentoCliente] = useState(pedido.formaPagamentoCliente ?? 'PIX')

  async function salvar() {
    setSaving(true)
    try {
      const body: Record<string, unknown> = {
        status,
        valorTotal: valorTotal ? Number(valorTotal) : null,
        moeda,
        chavePix: chavePix || null,
        qrCodePix: qrCodePix || null,
        instrucoesPix: instrucoesPix || null,
        linkCartao: linkCartao || null,
        whatsappRecepcao: whatsappRecepcao || null,
        observacoesAdmin: observacoesAdmin || null,
        formaPagamentoCliente,
      }

      if (dataLimitePagamento) {
        body.dataLimitePagamento = new Date(dataLimitePagamento).toISOString()
      }

      if (status === 'PAGO' || status === 'COMPRADO') {
        body.pagoEm = new Date().toISOString()
      }

      const res = await fetch(`/api/pedidos/${pedido.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const json = await res.json()
      if (!res.ok) {
        toast.error(json.message ?? json.error ?? 'Erro ao salvar pedido.')
        return
      }

      toast.success('Pedido atualizado com sucesso!')
      router.refresh()
    } catch {
      toast.error('Erro de conexão. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <h2 className="font-semibold mb-4" style={{ color: '#1A1A2E' }}>Gestão do pedido</h2>
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium" style={{ color: '#374151' }}>Status</Label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full h-11 mt-1.5 px-3 rounded-lg border text-sm focus:outline-none focus:ring-2" style={{ borderRadius: '8px', borderColor: '#E5E7EB', color: '#1A1A2E' }}>
              {statusOpcoes.map((op) => <option key={op.value} value={op.value}>{op.label}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium" style={{ color: '#374151' }}>Valor total</Label>
              <Input type="number" step="0.01" value={valorTotal} onChange={(e) => setValorTotal(e.target.value)} className="h-11 mt-1.5" style={{ borderRadius: '8px' }} />
            </div>
            <div>
              <Label className="text-sm font-medium" style={{ color: '#374151' }}>Moeda</Label>
              <select value={moeda} onChange={(e) => setMoeda(e.target.value)} className="w-full h-11 mt-1.5 px-3 rounded-lg border text-sm focus:outline-none focus:ring-2" style={{ borderRadius: '8px', borderColor: '#E5E7EB', color: '#1A1A2E' }}>
                <option value="BRL">BRL</option>
                <option value="USD">USD</option>
                <option value="KRW">KRW</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
          </div>
          <div>
            <Label className="text-sm font-medium" style={{ color: '#374151' }}>Forma de pagamento</Label>
            <select value={formaPagamentoCliente} onChange={(e) => setFormaPagamentoCliente(e.target.value)} className="w-full h-11 mt-1.5 px-3 rounded-lg border text-sm focus:outline-none focus:ring-2" style={{ borderRadius: '8px', borderColor: '#E5E7EB', color: '#1A1A2E' }}>
              <option value="PIX">Pix</option>
              <option value="CARTAO_WHATSAPP">Cartão via WhatsApp</option>
            </select>
          </div>
          <div>
            <Label className="text-sm font-medium" style={{ color: '#374151' }}>Data limite de pagamento</Label>
            <Input type="date" value={dataLimitePagamento} onChange={(e) => setDataLimitePagamento(e.target.value)} className="h-11 mt-1.5" style={{ borderRadius: '8px' }} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <h2 className="font-semibold mb-4" style={{ color: '#1A1A2E' }}>Pix</h2>
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium" style={{ color: '#374151' }}>Chave Pix</Label>
            <Input value={chavePix} onChange={(e) => setChavePix(e.target.value)} className="h-11 mt-1.5" style={{ borderRadius: '8px' }} />
          </div>
          <div>
            <Label className="text-sm font-medium" style={{ color: '#374151' }}>Imagem/URL do QR Code Pix</Label>
            <Input value={qrCodePix} onChange={(e) => setQrCodePix(e.target.value)} className="h-11 mt-1.5" style={{ borderRadius: '8px' }} />
          </div>
          <div>
            <Label className="text-sm font-medium" style={{ color: '#374151' }}>Instruções do Pix</Label>
            <textarea value={instrucoesPix} onChange={(e) => setInstrucoesPix(e.target.value)} rows={4} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm mt-1.5 resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" style={{ borderRadius: '8px' }} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <h2 className="font-semibold mb-4" style={{ color: '#1A1A2E' }}>Cartão parcelado</h2>
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium" style={{ color: '#374151' }}>Link externo de pagamento</Label>
            <Input value={linkCartao} onChange={(e) => setLinkCartao(e.target.value)} placeholder="https://..." className="h-11 mt-1.5" style={{ borderRadius: '8px' }} />
          </div>
          <div>
            <Label className="text-sm font-medium" style={{ color: '#374151' }}>WhatsApp da recepção</Label>
            <Input value={whatsappRecepcao} onChange={(e) => setWhatsappRecepcao(e.target.value)} placeholder="5511999999999" className="h-11 mt-1.5" style={{ borderRadius: '8px' }} />
          </div>
          <div>
            <Label className="text-sm font-medium" style={{ color: '#374151' }}>Observações internas</Label>
            <textarea value={observacoesAdmin} onChange={(e) => setObservacoesAdmin(e.target.value)} rows={4} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm mt-1.5 resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" style={{ borderRadius: '8px' }} />
          </div>
        </div>
      </div>

      <Button type="button" onClick={salvar} disabled={saving} className="w-full h-11 font-semibold text-white" style={{ background: 'linear-gradient(135deg, #FF6B9D, #FF4D8D)', borderRadius: '10px' }}>
        {saving ? 'Salvando...' : 'Salvar alterações'}
      </Button>
    </div>
  )
}
