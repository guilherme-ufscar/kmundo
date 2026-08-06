'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Minus, Plus, ShoppingBag, X } from 'lucide-react'
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
  const [detalhe, setDetalhe] = useState<Produto | null>(null)
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
    <>
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
                <div className="min-w-0">
                  <h2 className="font-semibold leading-snug break-words" style={{ color: '#1A1A2E' }}>{produto.nome}</h2>
                  {produto.descricao && (
                    <>
                      <p className="text-sm mt-1 line-clamp-2 break-words" style={{ color: '#6B7280' }}>{produto.descricao}</p>
                      <button type="button" onClick={() => setDetalhe(produto)} className="text-xs font-semibold mt-1 hover:underline" style={{ color: '#FF6B9D' }}>
                        Ver detalhes
                      </button>
                    </>
                  )}
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold min-w-0" style={{ color: '#FF6B9D' }}>
                    {produto.precoEstimado != null ? `${produto.moeda} ${produto.precoEstimado.toFixed(2)}` : 'Sob cotação'}
                  </span>
                  <div className="flex items-center gap-1 rounded-lg border border-gray-200 p-1 shrink-0">
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

    {detalhe && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.45)' }}
        onClick={() => setDetalhe(null)}
      >
        <div
          className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative">
            <div className="aspect-[4/3] bg-gray-100">
              {detalhe.imagemUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={detalhe.imagemUrl} alt={detalhe.nome} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <ShoppingBag className="w-10 h-10 text-gray-300" />
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => setDetalhe(null)}
              className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center hover:scale-105 transition-transform"
              style={{ background: 'rgba(255,255,255,0.9)' }}
              aria-label="Fechar detalhes"
            >
              <X className="w-5 h-5" style={{ color: '#374151' }} />
            </button>
          </div>

          <div className="p-5 sm:p-6 space-y-4">
            <div className="min-w-0">
              <h2 className="text-lg font-semibold leading-snug break-words" style={{ color: '#1A1A2E' }}>{detalhe.nome}</h2>
              <span className="mt-1 inline-block text-sm font-semibold" style={{ color: '#FF6B9D' }}>
                {detalhe.precoEstimado != null ? `${detalhe.moeda} ${detalhe.precoEstimado.toFixed(2)}` : 'Sob cotação'}
              </span>
            </div>

            {detalhe.descricao && (
              <p className="text-sm leading-relaxed whitespace-pre-line break-words" style={{ color: '#6B7280' }}>{detalhe.descricao}</p>
            )}

            <div className="flex items-center justify-between gap-2 pt-4 border-t border-gray-100">
              <span className="text-sm font-medium" style={{ color: '#374151' }}>Quantidade</span>
              <div className="flex items-center gap-1 rounded-lg border border-gray-200 p-1">
                <button type="button" onClick={() => setQuantidades(q => ({ ...q, [detalhe.id]: Math.max(1, (q[detalhe.id] ?? 1) - 1) }))} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-100" aria-label="Diminuir quantidade">
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-7 text-center text-sm font-medium">{quantidades[detalhe.id] ?? 1}</span>
                <button type="button" onClick={() => setQuantidades(q => ({ ...q, [detalhe.id]: (q[detalhe.id] ?? 1) + 1 }))} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-100" aria-label="Aumentar quantidade">
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <input value={variacoes[detalhe.id] ?? ''} onChange={(e) => setVariacoes(v => ({ ...v, [detalhe.id]: e.target.value }))} placeholder="Variação, cor ou tamanho" className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm" />
            <button type="button" onClick={() => solicitar(detalhe)} disabled={loading === detalhe.id} className="w-full h-10 rounded-lg text-sm font-semibold text-white" style={{ background: '#FF6B9D' }}>
              {loading === detalhe.id ? 'Enviando...' : 'Solicitar compra'}
            </button>
          </div>
        </div>
      </div>
    )}
  </>
  )
}
