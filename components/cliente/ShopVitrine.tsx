'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Minus, Plus, Search, ShoppingBag, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'
type Categoria = { id: string; nome: string }

type Produto = {
  id: string
  nome: string
  descricao: string | null
  categoria: string | null
  precoEstimado: number | null
  moeda: string
  imagemUrl: string | null
  urlProduto: string | null
}

type CarrinhoItem = {
  produtoId: string
  nome: string
  preco: number | null
  moeda: string
  imagem: string | null
  quantidade: number
  variacao: string
}

const CHAVE_CARRINHO = 'kmundo-carrinho'

function normalizar(texto: string) {
  return texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()
}

function carregarCarrinho(): CarrinhoItem[] {
  if (typeof window === 'undefined') return []
  try {
    const bruto = localStorage.getItem(CHAVE_CARRINHO)
    if (!bruto) return []
    const parsed = JSON.parse(bruto)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function ShopVitrine({ produtos, categorias = [], podeSolicitar = true }: { produtos: Produto[]; categorias?: Categoria[]; podeSolicitar?: boolean }) {
  const router = useRouter()
  const [quantidades, setQuantidades] = useState<Record<string, number>>({})
  const [variacoes, setVariacoes] = useState<Record<string, string>>({})
  const [detalhe, setDetalhe] = useState<Produto | null>(null)
  const [busca, setBusca] = useState('')
  const [categoriaAtiva, setCategoriaAtiva] = useState<string | null>(null)
  const [carrinho, setCarrinho] = useState<CarrinhoItem[]>([])
  const [carrinhoAberto, setCarrinhoAberto] = useState(false)
  const [finalizando, setFinalizando] = useState(false)

  useEffect(() => {
    setCarrinho(carregarCarrinho())
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    localStorage.setItem(CHAVE_CARRINHO, JSON.stringify(carrinho))
  }, [carrinho])

  const totalItens = carrinho.reduce((s, i) => s + i.quantidade, 0)

  const categoriasPresentes = Array.from(new Set(produtos.map(p => p.categoria).filter((c): c is string => !!c)))

  const produtosFiltrados = useMemo(() => {
    const termo = normalizar(busca)
    return produtos.filter(p => {
      if (categoriaAtiva && p.categoria !== categoriaAtiva) return false
      if (!termo) return true
      const alvo = normalizar(`${p.nome} ${p.descricao ?? ''} ${p.categoria ?? ''}`)
      return alvo.includes(termo)
    })
  }, [produtos, busca, categoriaAtiva])

  function adicionar(produto: Produto, qtd: number, variacao: string) {
    setCarrinho(c => {
      const existente = c.find(i => i.produtoId === produto.id && i.variacao === variacao)
      if (existente) {
        return c.map(i => (i === existente ? { ...i, quantidade: i.quantidade + qtd } : i))
      }
      return [...c, {
        produtoId: produto.id,
        nome: produto.nome,
        preco: produto.precoEstimado,
        moeda: produto.moeda,
        imagem: produto.imagemUrl,
        quantidade: qtd,
        variacao,
      }]
    })
    toast.success('Adicionado ao carrinho')
  }

  function alterarQtd(produtoId: string, variacao: string, delta: number) {
    setCarrinho(c => c.map(i => {
      if (i.produtoId !== produtoId || i.variacao !== variacao) return i
      const nova = i.quantidade + delta
      return nova <= 0 ? i : { ...i, quantidade: nova }
    }))
  }

  function remover(produtoId: string, variacao: string) {
    setCarrinho(c => c.filter(i => !(i.produtoId === produtoId && i.variacao === variacao)))
  }

  const totalEstimado = carrinho.reduce((s, i) => s + (i.preco ?? 0) * i.quantidade, 0)
  const temSobCotacao = carrinho.some(i => i.preco == null)

  async function finalizar() {
    if (!podeSolicitar) {
      toast.info('Entre como cliente para finalizar o pedido')
      router.push('/login')
      return
    }
    if (carrinho.length === 0) {
      toast.error('Seu carrinho está vazio')
      return
    }
    setFinalizando(true)
    try {
      const res = await fetch('/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itens: carrinho.map(i => ({
            produtoShopId: i.produtoId,
            nomeProduto: i.nome,
            urlProduto: undefined,
            quantidade: i.quantidade,
            variacao: i.variacao || undefined,
          })),
        }),
      })
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        toast.error(json?.message ?? json?.error ?? 'Não foi possível enviar o pedido')
        return
      }
      const json = await res.json()
      localStorage.removeItem(CHAVE_CARRINHO)
      setCarrinho([])
      setCarrinhoAberto(false)
      toast.success('Solicitação enviada para a equipe')
      router.push(`/meus-pedidos/${json.id}`)
    } catch {
      toast.error('Erro de conexão. Tente novamente.')
    } finally {
      setFinalizando(false)
    }
  }

  if (produtos.length === 0) {
    return <div className="rounded-lg bg-white p-10 text-center text-sm text-gray-500 border border-gray-100">Nenhum produto disponível no momento.</div>
  }

  return (
    <>
      {/* Busca */}
      <div className="relative mb-4">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9CA3AF' }} />
        <input
          value={busca}
          onChange={e => setBusca(e.target.value)}
          placeholder="Buscar produtos, categorias ou palavras-chave (ex.: álbum, maquiagem, BTS, skincare)..."
          className="w-full h-11 rounded-xl border border-gray-200 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                    style={{ borderColor: '#E5E7EB' }}
        />
        {busca && (
          <button type="button" onClick={() => setBusca('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100" aria-label="Limpar busca">
            <X className="w-4 h-4" style={{ color: '#6B7280' }} />
          </button>
        )}
      </div>

      {/* Categorias — dinâmicas do BD (editáveis em /admin/shop) */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <button
          type="button"
          onClick={() => setCategoriaAtiva(null)}
          className="h-8 px-3.5 rounded-full text-xs font-medium border transition-colors"
          style={{ borderColor: categoriaAtiva === null ? '#FF6B9D' : '#E5E7EB', color: categoriaAtiva === null ? '#FF6B9D' : '#6B7280', background: categoriaAtiva === null ? '#FFF1F5' : 'white' }}
        >
          Todos
        </button>
        {categorias.map(c => (
          <button
            key={c.id}
            type="button"
            onClick={() => setCategoriaAtiva(categoriaAtiva === c.nome ? null : c.nome)}
            className="h-8 px-3.5 rounded-full text-xs font-medium border transition-colors"
            style={{ borderColor: categoriaAtiva === c.nome ? '#FF6B9D' : '#E5E7EB', color: categoriaAtiva === c.nome ? '#FF6B9D' : '#6B7280', background: categoriaAtiva === c.nome ? '#FFF1F5' : 'white' }}
          >
            {c.nome}
          </button>
        ))}
        {categoriasPresentes.filter(c => !categorias.some(cat => cat.nome === c)).map(c => (
          <button
            key={c}
            type="button"
            onClick={() => setCategoriaAtiva(categoriaAtiva === c ? null : c)}
            className="h-8 px-3.5 rounded-full text-xs font-medium border transition-colors"
            style={{ borderColor: categoriaAtiva === c ? '#FF6B9D' : '#E5E7EB', color: categoriaAtiva === c ? '#FF6B9D' : '#6B7280', background: categoriaAtiva === c ? '#FFF1F5' : 'white' }}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Contador de resultados */}
      {(busca || categoriaAtiva) && (
        <p className="text-xs mb-4" style={{ color: '#6B7280' }}>
          {produtosFiltrados.length === 0 ? 'Nenhum produto encontrado.' : `${produtosFiltrados.length} produto${produtosFiltrados.length > 1 ? 's' : ''} encontrado${produtosFiltrados.length > 1 ? 's' : ''}.`}
        </p>
      )}

      {produtosFiltrados.length === 0 ? (
        <div className="rounded-lg bg-white p-10 text-center text-sm text-gray-500 border border-gray-100">
          Nenhum produto encontrado para essa busca. Tente outro termo ou limpe os filtros.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {produtosFiltrados.map((produto) => {
            const quantidade = quantidades[produto.id] ?? 1
            return (
              <div key={produto.id} className="bg-white border border-gray-100 rounded-lg overflow-hidden">
                <div className="aspect-[4/3] bg-gray-100 relative">
                  {produto.imagemUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={produto.imagemUrl} alt={produto.nome} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <ShoppingBag className="w-10 h-10 text-gray-300" />
                    </div>
                  )}
                  {produto.categoria && (
                    <span className="absolute top-2.5 left-2.5 text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.92)', color: '#FF6B9D' }}>
                      {produto.categoria}
                    </span>
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
                  <button type="button" onClick={() => adicionar(produto, quantidade, variacoes[produto.id]?.trim() ?? '')} className="w-full h-10 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90" style={{ background: '#FF6B9D' }}>
                    Adicionar ao carrinho
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Botão flutuante do carrinho */}
      {totalItens > 0 && (
        <button
          type="button"
          onClick={() => setCarrinhoAberto(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 h-12 px-5 rounded-full text-sm font-semibold text-white shadow-lg hover:shadow-xl transition-shadow"
          style={{ background: 'linear-gradient(135deg, #FF6B9D, #FF4D8D)' }}
        >
          <ShoppingBag className="w-5 h-5" />
          Ver carrinho
          <span className="min-w-6 h-6 px-1.5 flex items-center justify-center rounded-full text-xs font-bold" style={{ background: 'rgba(255,255,255,0.25)' }}>
            {totalItens}
          </span>
        </button>
      )}

      {/* Detalhes */}
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
                {detalhe.categoria && (
                  <span className="inline-block mb-1.5 text-xs px-2 py-0.5 rounded-full" style={{ background: '#FFF1F5', color: '#FF6B9D' }}>{detalhe.categoria}</span>
                )}
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
              <button type="button" onClick={() => { adicionar(detalhe, quantidades[detalhe.id] ?? 1, variacoes[detalhe.id]?.trim() ?? ''); setDetalhe(null) }} className="w-full h-10 rounded-lg text-sm font-semibold text-white" style={{ background: '#FF6B9D' }}>
                Adicionar ao carrinho
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Drawer do carrinho */}
      {carrinhoAberto && (
        <div
          className="fixed inset-0 z-50 flex justify-end"
          style={{ background: 'rgba(0,0,0,0.45)' }}
          onClick={() => setCarrinhoAberto(false)}
        >
          <div
            className="bg-white w-full max-w-md h-full flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-bold flex items-center gap-2" style={{ color: '#1A1A2E' }}>
                <ShoppingBag className="w-5 h-5" style={{ color: '#FF6B9D' }} />
                Seu carrinho
              </h2>
              <button type="button" onClick={() => setCarrinhoAberto(false)} className="p-1.5 rounded-md hover:bg-gray-100" aria-label="Fechar carrinho">
                <X className="w-5 h-5" style={{ color: '#6B7280' }} />
              </button>
            </div>

            {carrinho.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-2 p-8 text-center">
                <ShoppingBag className="w-10 h-10" style={{ color: '#D1D5DB' }} />
                <p className="text-sm" style={{ color: '#6B7280' }}>Seu carrinho está vazio.</p>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                  {carrinho.map((item) => (
                    <div key={`${item.produtoId}-${item.variacao}`} className="flex gap-3">
                      <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
                        {item.imagem ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.imagem} alt={item.nome} className="w-full h-full object-cover" />
                        ) : (
                          <ShoppingBag className="w-5 h-5 text-gray-300" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium leading-snug break-words" style={{ color: '#1A1A2E' }}>{item.nome}</p>
                          <button type="button" onClick={() => remover(item.produtoId, item.variacao)} className="p-1 rounded-md hover:bg-red-50 shrink-0" aria-label="Remover item">
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                        {item.variacao && <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>{item.variacao}</p>}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-1 rounded-lg border border-gray-200 p-0.5">
                            <button type="button" onClick={() => alterarQtd(item.produtoId, item.variacao, -1)} className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-gray-100" aria-label="Diminuir quantidade">
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-6 text-center text-sm font-medium">{item.quantidade}</span>
                            <button type="button" onClick={() => alterarQtd(item.produtoId, item.variacao, 1)} className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-gray-100" aria-label="Aumentar quantidade">
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <span className="text-sm font-semibold" style={{ color: '#FF6B9D' }}>
                            {item.preco != null ? `${item.moeda} ${(item.preco * item.quantidade).toFixed(2)}` : 'Sob cotação'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-5 border-t border-gray-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium" style={{ color: '#374151' }}>Total estimado</span>
                    <span className="font-bold" style={{ color: '#1A1A2E' }}>
                      {temSobCotacao
                        ? `${carrinho[0]?.moeda ?? 'BRL'} ${totalEstimado.toFixed(2)}*`
                        : `${carrinho[0]?.moeda ?? 'BRL'} ${totalEstimado.toFixed(2)}`}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: '#6B7280' }}>
                    {temSobCotacao && '* O valor de itens "Sob cotação" será confirmado pela equipe. '}
                    O valor total será confirmado pela nossa equipe após a verificação de disponibilidade.
                  </p>
                  <button
                    type="button"
                    onClick={finalizar}
                    disabled={finalizando}
                    className="w-full h-12 font-semibold text-white rounded-xl transition-opacity hover:opacity-90 disabled:opacity-60"
                    style={{ background: 'linear-gradient(135deg, #FF6B9D, #FF4D8D)' }}
                  >
                    {finalizando ? 'Enviando solicitação...' : 'Finalizar pedido'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}