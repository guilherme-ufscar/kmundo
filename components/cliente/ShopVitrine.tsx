'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Minus, Plus, ShoppingBag } from 'lucide-react'
import { toast } from 'sonner'

type Produto = {
  id: string
  nome: string
  descricao: string | null
  precoEstimado: number | null
  moeda: string
  imagemUrl: string | null
}

export function ShopVitrine({ produtos, podeSolicitar = true }: { produtos: Produto[]; podeSolicitar?: boolean }) {
  const router = useRouter()
  const [quantidades, setQuantidades] = useState<Record<string, number>>({})
  const [variacoes, setVariacoes] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState<string | null>(null)

  async function solicitar(produto: Produto) {
    if (!podeSolicitar) {
      toast.info('Entre como cliente para solicitar compra')
      router.push('/login')
      return
    }
    setLoading(produto.id)
    const res = await fetch('/api/shop/solicitacoes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        produtoId: produto.id,
        quantidade: quantidades[produto.id] ?? 1,
        variacao: variacoes[produto.id]?.trim() || undefined,
      }),
    })
    setLoading(null)
    if (res.ok) {
      toast.success('Solicitação enviada para a equipe')
      router.push('/meus-pedidos')
    } else {
      toast.error((await res.json()).error ?? 'Não foi possível solicitar')
    }
  }

  if (produtos.length === 0) {
    return <div className="rounded-lg bg-white p-10 text-center text-sm text-gray-500 border border-gray-100">Nenhum produto disponível no momento.</div>
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {produtos.map((produto) => {
        const quantidade = quantidades[produto.id] ?? 1
        return (
          <div key={produto.id} className="bg-white border border-gray-100 rounded-lg overflow-hidden">
            <div className="aspect-[4/3] bg-gray-100">
              {produto.imagemUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={produto.imagemUrl} alt={produto.nome} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <ShoppingBag className="w-10 h-10 text-gray-300" />
                </div>
              )}
            </div>
            <div className="p-4 space-y-3">
              <div>
                <h2 className="font-semibold leading-snug" style={{ color: '#1A1A2E' }}>{produto.nome}</h2>
                {produto.descricao && <p className="text-sm mt-1 line-clamp-2" style={{ color: '#6B7280' }}>{produto.descricao}</p>}
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold" style={{ color: '#FF6B9D' }}>
                  {produto.precoEstimado != null ? `${produto.moeda} ${produto.precoEstimado.toFixed(2)}` : 'Sob cotação'}
                </span>
                <div className="flex items-center gap-1 rounded-lg border border-gray-200 p-1">
                  <button type="button" onClick={() => setQuantidades(q => ({ ...q, [produto.id]: Math.max(1, quantidade - 1) }))} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-100" aria-label="Diminuir quantidade">
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-7 text-center text-sm font-medium">{quantidade}</span>
                  <button type="button" onClick={() => setQuantidades(q => ({ ...q, [produto.id]: quantidade + 1 }))} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-100" aria-label="Aumentar quantidade">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <input value={variacoes[produto.id] ?? ''} onChange={(e) => setVariacoes(v => ({ ...v, [produto.id]: e.target.value }))} placeholder="Variação, cor ou tamanho" className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm" />
              <button type="button" onClick={() => solicitar(produto)} disabled={loading === produto.id} className="w-full h-10 rounded-lg text-sm font-semibold text-white" style={{ background: '#FF6B9D' }}>
                {loading === produto.id ? 'Enviando...' : 'Solicitar compra'}
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
