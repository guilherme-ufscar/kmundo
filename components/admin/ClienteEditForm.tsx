'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Save, Trash2, User, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Props {
  cliente: {
    id: string
    nomeCompleto: string
    telefone: string
    pais: string
    cep: string | null
    endereco: string | null
    numero: string | null
    complemento: string | null
    bairro: string | null
    cidade: string | null
    estado: string | null
    status: string
  }
  email: string
}

export function ClienteEditForm({ cliente, email }: Props) {
  const router = useRouter()
  const [nomeCompleto, setNomeCompleto] = useState(cliente.nomeCompleto)
  const [telefone, setTelefone] = useState(cliente.telefone)
  const [pais, setPais] = useState(cliente.pais)
  const [cep, setCep] = useState(cliente.cep ?? '')
  const [endereco, setEndereco] = useState(cliente.endereco ?? '')
  const [numero, setNumero] = useState(cliente.numero ?? '')
  const [complemento, setComplemento] = useState(cliente.complemento ?? '')
  const [bairro, setBairro] = useState(cliente.bairro ?? '')
  const [cidade, setCidade] = useState(cliente.cidade ?? '')
  const [estado, setEstado] = useState(cliente.estado ?? '')
  const [salvando, setSalvando] = useState(false)
  const [excluindo, setExcluindo] = useState(false)
  const [buscandoCep, setBuscandoCep] = useState(false)

  const statusClienteLabel: Record<string, string> = { PENDENTE: 'Pendente', ATIVA: 'Ativa', SUSPENSA: 'Suspensa' }
  const statusClienteColor: Record<string, string> = { PENDENTE: '#F59E0B', ATIVA: '#22C55E', SUSPENSA: '#EF4444' }

  async function buscarCep(valor: string) {
    const cepLimpo = valor.replace(/\D/g, '')
    if (cepLimpo.length !== 8) return
    setBuscandoCep(true)
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`)
      const data = await res.json()
      if (!data.erro) {
        if (data.logradouro) setEndereco(data.logradouro)
        if (data.bairro) setBairro(data.bairro)
        if (data.localidade) setCidade(data.localidade)
        if (data.uf) setEstado(data.uf)
      }
    } catch {
      // silently fail
    } finally {
      setBuscandoCep(false)
    }
  }

  async function salvar() {
    if (!nomeCompleto.trim() || !telefone.trim() || !pais.trim()) return
    setSalvando(true)
    let sucesso = false
    for (let tentativa = 1; tentativa <= 3 && !sucesso; tentativa++) {
      try {
        const res = await fetch(`/api/clientes/${cliente.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nomeCompleto: nomeCompleto.trim(),
            telefone: telefone.trim(),
            pais: pais.trim(),
            cep: cep.trim() || undefined,
            endereco: endereco.trim() || undefined,
            numero: numero.trim() || undefined,
            complemento: complemento.trim() || undefined,
            bairro: bairro.trim() || undefined,
            cidade: cidade.trim() || undefined,
            estado: estado.trim() || undefined,
          }),
        })
        if (res.ok) {
          sucesso = true
          toast.success('Cliente atualizado!')
          router.refresh()
        } else if (tentativa === 3) {
          toast.error('Erro ao salvar. Tente novamente.')
        }
      } catch {
        if (tentativa === 3) toast.error('Erro de conexão. Verifique a internet e tente novamente.')
        else await new Promise(r => setTimeout(r, 800 * tentativa))
      }
    }
    setSalvando(false)
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
        {/* Nome */}
        <div className="col-span-2">
          <label className="text-xs font-medium" style={{ color: '#9CA3AF' }}>Nome completo *</label>
          <Input value={nomeCompleto} onChange={e => setNomeCompleto(e.target.value)} className="mt-1 h-9 text-sm" style={{ borderRadius: '8px' }} />
        </div>

        {/* Email */}
        <div className="col-span-2">
          <label className="text-xs font-medium" style={{ color: '#9CA3AF' }}>Email (não editável)</label>
          <Input value={email} disabled className="mt-1 h-9 text-sm opacity-60" style={{ borderRadius: '8px' }} />
        </div>

        {/* Telefone + País */}
        <div>
          <label className="text-xs font-medium" style={{ color: '#9CA3AF' }}>Telefone *</label>
          <Input value={telefone} onChange={e => setTelefone(e.target.value)} className="mt-1 h-9 text-sm" style={{ borderRadius: '8px' }} />
        </div>
        <div>
          <label className="text-xs font-medium" style={{ color: '#9CA3AF' }}>País *</label>
          <Input value={pais} onChange={e => setPais(e.target.value)} className="mt-1 h-9 text-sm" style={{ borderRadius: '8px' }} />
        </div>
      </div>

      {/* Address section */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: '#9CA3AF' }}>Endereço</p>
        <div className="grid grid-cols-2 gap-3">
          {/* CEP */}
          <div>
            <label className="text-xs font-medium" style={{ color: '#9CA3AF' }}>CEP</label>
            <div className="relative mt-1">
              <Input
                value={cep}
                onChange={e => setCep(e.target.value)}
                onBlur={e => buscarCep(e.target.value)}
                placeholder="00000-000"
                className="h-9 text-sm pr-8"
                style={{ borderRadius: '8px' }}
              />
              {buscandoCep && (
                <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 animate-spin" style={{ color: '#9CA3AF' }} />
              )}
            </div>
            {!buscandoCep && <p className="text-xs mt-0.5" style={{ color: '#C4B5C8' }}>Preenche automaticamente</p>}
          </div>

          {/* Estado */}
          <div>
            <label className="text-xs font-medium" style={{ color: '#9CA3AF' }}>Estado (UF)</label>
            <Input value={estado} onChange={e => setEstado(e.target.value)} placeholder="SP" className="mt-1 h-9 text-sm" style={{ borderRadius: '8px' }} />
          </div>

          {/* Endereço / Logradouro */}
          <div className="col-span-2">
            <label className="text-xs font-medium" style={{ color: '#9CA3AF' }}>Endereço / Logradouro</label>
            <Input value={endereco} onChange={e => setEndereco(e.target.value)} placeholder="Rua, Avenida, etc." className="mt-1 h-9 text-sm" style={{ borderRadius: '8px' }} />
          </div>

          {/* Número + Complemento */}
          <div>
            <label className="text-xs font-medium" style={{ color: '#9CA3AF' }}>Número</label>
            <Input value={numero} onChange={e => setNumero(e.target.value)} placeholder="123" className="mt-1 h-9 text-sm" style={{ borderRadius: '8px' }} />
          </div>
          <div>
            <label className="text-xs font-medium" style={{ color: '#9CA3AF' }}>Complemento</label>
            <Input value={complemento} onChange={e => setComplemento(e.target.value)} placeholder="Apto, Bloco, etc." className="mt-1 h-9 text-sm" style={{ borderRadius: '8px' }} />
          </div>

          {/* Bairro + Cidade */}
          <div>
            <label className="text-xs font-medium" style={{ color: '#9CA3AF' }}>Bairro</label>
            <Input value={bairro} onChange={e => setBairro(e.target.value)} className="mt-1 h-9 text-sm" style={{ borderRadius: '8px' }} />
          </div>
          <div>
            <label className="text-xs font-medium" style={{ color: '#9CA3AF' }}>Cidade</label>
            <Input value={cidade} onChange={e => setCidade(e.target.value)} className="mt-1 h-9 text-sm" style={{ borderRadius: '8px' }} />
          </div>
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
