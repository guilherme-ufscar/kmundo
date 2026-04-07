'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Package, Check } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type MetodoEnvio = 'FEDEX' | 'EMS' | 'ENVIO_EM_GRUPO'

interface ItemDisponivel {
  id: string
  descricao: string
  lojaOrigem: string | null
  status: string
}

const metodos: { value: MetodoEnvio; label: string; desc: string }[] = [
  { value: 'FEDEX', label: 'FedEx', desc: 'Entrega expressa internacional' },
  { value: 'EMS', label: 'EMS', desc: 'Serviço postal expresso' },
  { value: 'ENVIO_EM_GRUPO', label: 'Envio em Grupo', desc: 'Consolide com outras clientes e economize' },
]

export default function NovoEnvioPage() {
  const router = useRouter()
  const [metodo, setMetodo] = useState<MetodoEnvio | null>(null)
  const [itensDisponiveis, setItensDisponiveis] = useState<ItemDisponivel[]>([])
  const [itensSelecionados, setItensSelecionados] = useState<Set<string>>(new Set())
  const [valorDeclarado, setValorDeclarado] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function carregar() {
      try {
        const res = await fetch('/api/itens?status=RECEBIDO&limite=100')
        const data = await res.json()
        const resArmazem = await fetch('/api/itens?status=EM_ARMAZEM&limite=100')
        const dataArmazem = await resArmazem.json()
        const resNoArmazem = await fetch('/api/itens?status=EM_ENVIO&limite=100')
        const dataNoArmazem = await resNoArmazem.json()
        setItensDisponiveis([...(data.itens ?? []), ...(dataArmazem.itens ?? []), ...(dataNoArmazem.itens ?? [])])
      } catch {
        setError('Erro ao carregar itens')
      } finally {
        setCarregando(false)
      }
    }
    carregar()
  }, [])

  function toggleItem(id: string) {
    setItensSelecionados((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function handleSubmit() {
    if (!metodo) { setError('Selecione o método de envio'); return }
    if (itensSelecionados.size === 0) { setError('Selecione ao menos um item'); return }

    setSalvando(true)
    setError('')
    try {
      const body: Record<string, unknown> = {
        metodoEnvio: metodo,
        itemIds: Array.from(itensSelecionados),
      }
      if (valorDeclarado && metodo !== 'ENVIO_EM_GRUPO') {
        body.valorDeclarado = parseFloat(valorDeclarado)
      }

      const res = await fetch('/api/envios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        const data = await res.json()
        toast.success('Envio solicitado com sucesso!')
        router.push(`/meus-envios/${data.id}`)
      } else {
        const json = await res.json()
        setError(json.error ?? 'Erro ao solicitar envio')
      }
    } catch {
      setError('Erro de conexão')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="p-4 sm:p-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/meus-envios">
          <button type="button" className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-colors" style={{ color: '#6B7280' }}>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#1A1A2E' }}>Solicitar Envio</h1>
          <p style={{ color: '#6B7280' }}>Escolha o método e os itens para enviar</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-3 rounded-lg text-sm" style={{ background: '#FEF2F2', color: '#EF4444', border: '1px solid #FECACA' }}>
          {error}
        </div>
      )}

      {/* Método de envio */}
      <div className="bg-white rounded-2xl p-6 mb-5" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <h2 className="font-semibold mb-4" style={{ color: '#1A1A2E' }}>Método de Envio</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {metodos.map((m) => {
            const ativo = metodo === m.value
            return (
              <button
                key={m.value}
                type="button"
                onClick={() => setMetodo(m.value)}
                className="p-4 rounded-xl border-2 text-left transition-all"
                style={{
                  borderColor: ativo ? '#FF6B9D' : '#E5E7EB',
                  background: ativo ? '#FFF1F5' : 'white',
                }}
              >
                <p className="font-semibold text-sm mb-1" style={{ color: ativo ? '#FF6B9D' : '#1A1A2E' }}>
                  {m.label}
                </p>
                <p className="text-xs" style={{ color: '#9CA3AF' }}>{m.desc}</p>
              </button>
            )
          })}
        </div>
      </div>

      {/* Itens */}
      <div className="bg-white rounded-2xl p-6 mb-5" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <h2 className="font-semibold mb-4" style={{ color: '#1A1A2E' }}>Selecionar Itens</h2>

        {carregando ? (
          <p className="text-sm text-center py-6" style={{ color: '#9CA3AF' }}>Carregando itens...</p>
        ) : itensDisponiveis.length === 0 ? (
          <p className="text-sm text-center py-6" style={{ color: '#9CA3AF' }}>Nenhum item disponível para envio</p>
        ) : (
          <div className="space-y-2">
            {itensDisponiveis.map((item) => {
              const sel = itensSelecionados.has(item.id)
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleItem(item.id)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left"
                  style={{
                    borderColor: sel ? '#FF6B9D' : '#E5E7EB',
                    background: sel ? '#FFF1F5' : 'white',
                  }}
                >
                  <div
                    className="w-5 h-5 rounded flex items-center justify-center border-2 shrink-0"
                    style={{ borderColor: sel ? '#FF6B9D' : '#D1D5DB', background: sel ? '#FF6B9D' : 'white' }}
                  >
                    {sel && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: '#1A1A2E' }}>{item.descricao}</p>
                    {item.lojaOrigem && (
                      <p className="text-xs" style={{ color: '#9CA3AF' }}>{item.lojaOrigem}</p>
                    )}
                  </div>
                  <div className="flex items-center">
                    <Package className="w-4 h-4" style={{ color: '#D1D5DB' }} />
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Valor declarado — apenas FedEx e EMS */}
      {metodo && metodo !== 'ENVIO_EM_GRUPO' && (
        <div className="bg-white rounded-2xl p-6 mb-5" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <h2 className="font-semibold mb-1" style={{ color: '#1A1A2E' }}>Valor Declarado (opcional)</h2>
          <p className="text-xs mb-4" style={{ color: '#9CA3AF' }}>
            Você pode informar o valor ou deixar para a administradora preencher
          </p>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              step="0.01"
              placeholder="Ex: 50000"
              value={valorDeclarado}
              onChange={(e) => setValorDeclarado(e.target.value)}
              className="h-11 flex-1"
              style={{ borderRadius: '8px' }}
            />
            <span className="text-sm font-medium px-3" style={{ color: '#6B7280' }}>BRL</span>
          </div>
        </div>
      )}

      <Button
        type="button"
        onClick={handleSubmit}
        disabled={salvando || !metodo || itensSelecionados.size === 0}
        className="w-full h-12 font-semibold text-white rounded-xl"
        style={{ background: 'linear-gradient(135deg, #FF6B9D, #FF4D8D)', borderRadius: '12px' }}
      >
        {salvando ? 'Solicitando...' : `Solicitar Envio (${itensSelecionados.size} ${itensSelecionados.size === 1 ? 'item' : 'itens'})`}
      </Button>

      <p className="text-xs text-center mt-3" style={{ color: '#9CA3AF' }}>
        Após a solicitação, nossa equipe irá preparar e informar os detalhes do envio
      </p>
    </div>
  )
}
