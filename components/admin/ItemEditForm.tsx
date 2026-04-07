'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Save, Trash2, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Props {
  item: {
    id: string
    descricao: string
    lojaOrigem: string | null
    trackingLoja: string | null
    observacoes: string | null
  }
}

export function ItemEditForm({ item }: Props) {
  const router = useRouter()
  const [descricao, setDescricao] = useState(item.descricao)
  const [lojaOrigem, setLojaOrigem] = useState(item.lojaOrigem ?? '')
  const [trackingLoja, setTrackingLoja] = useState(item.trackingLoja ?? '')
  const [observacoes, setObservacoes] = useState(item.observacoes ?? '')
  const [salvando, setSalvando] = useState(false)
  const [excluindo, setExcluindo] = useState(false)

  async function salvar() {
    if (!descricao.trim()) return
    setSalvando(true)
    try {
      const res = await fetch(`/api/itens/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          descricao: descricao.trim(),
          lojaOrigem: lojaOrigem.trim() || null,
          trackingLoja: trackingLoja.trim() || null,
          observacoes: observacoes.trim() || null,
        }),
      })
      if (res.ok) {
        toast.success('Item atualizado!')
        router.refresh()
      } else {
        toast.error('Erro ao salvar')
      }
    } catch {
      toast.error('Erro de conexão')
    } finally {
      setSalvando(false)
    }
  }

  async function excluir() {
    if (!window.confirm('Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita.')) return
    setExcluindo(true)
    try {
      const res = await fetch(`/api/itens/${item.id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Item excluído')
        router.push('/admin/itens')
      } else {
        toast.error('Erro ao excluir')
      }
    } catch {
      toast.error('Erro de conexão')
    } finally {
      setExcluindo(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl p-6" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-semibold flex items-center gap-2" style={{ color: '#1A1A2E' }}>
          <Package className="w-4 h-4" style={{ color: '#FF6B9D' }} />
          Dados do Item
        </h2>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-xs font-medium" style={{ color: '#9CA3AF' }}>Descrição *</label>
          <Input value={descricao} onChange={e => setDescricao(e.target.value)} className="mt-1 h-9 text-sm" style={{ borderRadius: '8px' }} />
        </div>
        <div>
          <label className="text-xs font-medium" style={{ color: '#9CA3AF' }}>Loja de Origem</label>
          <Input value={lojaOrigem} onChange={e => setLojaOrigem(e.target.value)} className="mt-1 h-9 text-sm" style={{ borderRadius: '8px' }} />
        </div>
        <div>
          <label className="text-xs font-medium" style={{ color: '#9CA3AF' }}>Tracking</label>
          <Input value={trackingLoja} onChange={e => setTrackingLoja(e.target.value)} className="mt-1 h-9 text-sm font-mono" style={{ borderRadius: '8px' }} />
        </div>
        <div>
          <label className="text-xs font-medium" style={{ color: '#9CA3AF' }}>Observações</label>
          <textarea
            value={observacoes}
            onChange={e => setObservacoes(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring"
            style={{ borderRadius: '8px' }}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 mt-5 pt-4 border-t border-gray-100">
        <Button
          onClick={salvar}
          disabled={salvando || !descricao.trim()}
          className="flex-1 h-9 text-sm font-semibold text-white flex items-center justify-center gap-1.5"
          style={{ background: 'linear-gradient(135deg, #FF6B9D, #FF4D8D)', borderRadius: '8px' }}
        >
          <Save className="w-3.5 h-3.5" />
          {salvando ? 'Salvando...' : 'Salvar'}
        </Button>
        <Button
          onClick={excluir}
          disabled={excluindo}
          variant="outline"
          className="h-9 px-3 text-sm border-red-200 hover:bg-red-50 flex items-center gap-1.5"
          style={{ borderRadius: '8px', color: '#EF4444', borderColor: '#FECACA' }}
        >
          <Trash2 className="w-3.5 h-3.5" />
          {excluindo ? 'Excluindo...' : 'Excluir'}
        </Button>
      </div>
    </div>
  )
}
