'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useCallback, useState } from 'react'
import { Search } from 'lucide-react'

interface Props {
  buscaInicial: string
  statusInicial: string
}

const statusOpcoes = [
  { value: '', label: 'Todos' },
  { value: 'RECEBIDO', label: 'Pagamento Feito' },
  { value: 'EM_ARMAZEM', label: 'Comprado' },
  { value: 'EM_ENVIO', label: 'No armazem' },
  { value: 'PREPARANDO_ENVIO', label: 'Preparando para o envio' },
  { value: 'ENVIADO', label: 'Enviado' },
  { value: 'ENTREGUE', label: 'Entregue' },
]

export function ItensFiltros({ buscaInicial, statusInicial }: Props) {
  const [busca, setBusca] = useState(buscaInicial)
  const [status, setStatus] = useState(statusInicial)
  const router = useRouter()
  const pathname = usePathname()

  const aplicar = useCallback(
    (novaBusca: string, novoStatus: string) => {
      const params = new URLSearchParams()
      if (novaBusca) params.set('busca', novaBusca)
      if (novoStatus) params.set('status', novoStatus)
      params.set('pagina', '1')
      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname]
  )

  return (
    <div className="flex flex-wrap gap-3">
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9CA3AF' }} />
        <input
          type="text"
          placeholder="Buscar item, cliente, loja..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && aplicar(busca, status)}
          className="w-full h-10 pl-9 pr-4 rounded-xl border text-sm focus:outline-none focus:ring-2"
          style={{ borderColor: '#E5E7EB', color: '#1A1A2E' }}
        />
      </div>

      <div className="flex flex-wrap gap-1 bg-white rounded-xl border p-1" style={{ borderColor: '#E5E7EB' }}>
        {statusOpcoes.map((op) => (
          <button
            key={op.value}
            type="button"
            onClick={() => {
              setStatus(op.value)
              aplicar(busca, op.value)
            }}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{
              background: status === op.value ? '#1A1A2E' : 'transparent',
              color: status === op.value ? 'white' : '#6B7280',
            }}
          >
            {op.label}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => aplicar(busca, status)}
        className="h-10 px-4 rounded-xl text-sm font-semibold text-white"
        style={{ background: 'linear-gradient(135deg, #FF6B9D, #FF4D8D)' }}
      >
        Buscar
      </button>
    </div>
  )
}
