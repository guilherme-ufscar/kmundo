'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Save, Trash2, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Props {
  cliente: {
    id: string
    nomeCompleto: string
    telefone: string
    pais: string
    cidade: string | null
    cep: string | null
    endereco: string | null
    status: string
  }
  email: string
}

export function ClienteEditForm({ cliente, email }: Props) {
  const router = useRouter()
  const [nomeCompleto, setNomeCompleto] = useState(cliente.nomeCompleto)
  const [telefone, setTelefone] = useState(cliente.telefone)
  const [pais, setPais] = useState(cliente.pais)
  const [cidade, setCidade] = useState(cliente.cidade ?? '')
  const [cep, setCep] = useState(cliente.cep ?? '')
  const [endereco, setEndereco] = useState(cliente.endereco ?? '')
  const [salvando, setSalvando] = useState(false)
  const [excluindo, setExcluindo] = useState(false)

  const statusClienteLabel: Record<string, string> = { PENDENTE: 'Pendente', ATIVA: 'Ativa', SUSPENSA: 'Suspensa' }
  const statusClienteColor: Record<string, string> = { PENDENTE: '#F59E0B', ATIVA: '#22C55E', SUSPENSA: '#EF4444' }

  async function salvar() {
    if (!nomeCompleto.trim() || !telefone.trim() || !pais.trim()) return
    setSalvando(true)
    try {
      const res = await fetch(`/api/clientes/${cliente.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nomeCompleto: nomeCompleto.trim(),
          telefone: telefone.trim(),
          pais: pais.trim(),
          cidade: cidade.trim() || undefined,
          cep: cep.trim() || undefined,
          endereco: endereco.trim() || undefined,
        }),
      })
      if (res.ok) {
        toast.success('Cliente atualizado!')
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
    if (!window.confirm('Tem certeza que deseja excluir este cliente e todos os seus dados? Esta ação não pode ser desfeita.')) return
    setExcluindo(true)
    try {
      const res = await fetch(`/api/clientes/${cliente.id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Cliente excluído')
        router.push('/admin/clientes')
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
          <User className="w-4 h-4" style={{ color: '#FF6B9D' }} />
          Dados da Cliente
        </h2>
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium text-white" style={{ background: statusClienteColor[cliente.status] }}>
          {statusClienteLabel[cliente.status]}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="text-xs font-medium" style={{ color: '#9CA3AF' }}>Nome completo *</label>
          <Input value={nomeCompleto} onChange={e => setNomeCompleto(e.target.value)} className="mt-1 h-9 text-sm" style={{ borderRadius: '8px' }} />
        </div>
        <div className="col-span-2">
          <label className="text-xs font-medium" style={{ color: '#9CA3AF' }}>Email (não editável)</label>
          <Input value={email} disabled className="mt-1 h-9 text-sm opacity-60" style={{ borderRadius: '8px' }} />
        </div>
        <div>
          <label className="text-xs font-medium" style={{ color: '#9CA3AF' }}>Telefone *</label>
          <Input value={telefone} onChange={e => setTelefone(e.target.value)} className="mt-1 h-9 text-sm" style={{ borderRadius: '8px' }} />
        </div>
        <div>
          <label className="text-xs font-medium" style={{ color: '#9CA3AF' }}>País *</label>
          <Input value={pais} onChange={e => setPais(e.target.value)} className="mt-1 h-9 text-sm" style={{ borderRadius: '8px' }} />
        </div>
        <div>
          <label className="text-xs font-medium" style={{ color: '#9CA3AF' }}>Cidade</label>
          <Input value={cidade} onChange={e => setCidade(e.target.value)} className="mt-1 h-9 text-sm" style={{ borderRadius: '8px' }} />
        </div>
        <div>
          <label className="text-xs font-medium" style={{ color: '#9CA3AF' }}>CEP</label>
          <Input value={cep} onChange={e => setCep(e.target.value)} className="mt-1 h-9 text-sm" style={{ borderRadius: '8px' }} />
        </div>
        <div className="col-span-2">
          <label className="text-xs font-medium" style={{ color: '#9CA3AF' }}>Endereço</label>
          <Input value={endereco} onChange={e => setEndereco(e.target.value)} className="mt-1 h-9 text-sm" style={{ borderRadius: '8px' }} />
        </div>
      </div>

      <div className="flex items-center gap-2 mt-5 pt-4 border-t border-gray-100">
        <Button
          onClick={salvar}
          disabled={salvando || !nomeCompleto.trim() || !telefone.trim() || !pais.trim()}
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
          className="h-9 px-3 text-sm flex items-center gap-1.5"
          style={{ borderRadius: '8px', color: '#EF4444', borderColor: '#FECACA' }}
        >
          <Trash2 className="w-3.5 h-3.5" />
          {excluindo ? 'Excluindo...' : 'Excluir'}
        </Button>
      </div>
    </div>
  )
}
