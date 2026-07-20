'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ImagePlus, Save, ToggleLeft, ToggleRight } from 'lucide-react'
import { toast } from 'sonner'

type Produto = {
  id: string
  nome: string
  descricao: string | null
  precoEstimado: number | null
  moeda: string
  imagemUrl: string | null
  urlProduto: string | null
  ativo: boolean
  ordem: number
}

export function ShopAdmin({ produtos }: { produtos: Produto[] }) {
  const router = useRouter()
  const [form, setForm] = useState({ nome: '', descricao: '', precoEstimado: '', moeda: 'BRL', imagemUrl: '', urlProduto: '', ordem: '0' })
  const [salvando, setSalvando] = useState(false)

  async function criar() {
    if (form.nome.trim().length < 2) return toast.error('Informe o nome do produto')
    setSalvando(true)
    const res = await fetch('/api/shop/produtos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: form.nome.trim(),
        descricao: form.descricao.trim() || undefined,
        precoEstimado: form.precoEstimado ? Number(form.precoEstimado) : undefined,
        moeda: form.moeda,
        imagemUrl: form.imagemUrl.trim() || undefined,
        urlProduto: form.urlProduto.trim() || undefined,
        ordem: Number(form.ordem || 0),
      }),
    })
    setSalvando(false)
    if (res.ok) {
      setForm({ nome: '', descricao: '', precoEstimado: '', moeda: 'BRL', imagemUrl: '', urlProduto: '', ordem: '0' })
      toast.success('Produto cadastrado')
      router.refresh()
    } else toast.error('Nao foi possivel cadastrar')
  }

  async function alternar(produto: Produto) {
    const res = await fetch(`/api/shop/produtos/${produto.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ativo: !produto.ativo }),
    })
    if (res.ok) {
      toast.success(!produto.ativo ? 'Produto publicado' : 'Produto ocultado')
      router.refresh()
    } else toast.error('Nao foi possivel atualizar')
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-100 rounded-lg p-5">
        <h2 className="font-semibold mb-4" style={{ color: '#1A1A2E' }}>Novo produto</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} placeholder="Nome do produto" className="h-10 rounded-lg border border-gray-200 px-3 text-sm" />
          <input value={form.imagemUrl} onChange={e => setForm(f => ({ ...f, imagemUrl: e.target.value }))} placeholder="URL da imagem" className="h-10 rounded-lg border border-gray-200 px-3 text-sm" />
          <input value={form.urlProduto} onChange={e => setForm(f => ({ ...f, urlProduto: e.target.value }))} placeholder="Link de referencia ou compra" className="h-10 rounded-lg border border-gray-200 px-3 text-sm" />
          <div className="flex gap-2">
            <input value={form.precoEstimado} onChange={e => setForm(f => ({ ...f, precoEstimado: e.target.value }))} type="number" step="0.01" placeholder="Preco estimado" className="h-10 flex-1 rounded-lg border border-gray-200 px-3 text-sm" />
            <select value={form.moeda} onChange={e => setForm(f => ({ ...f, moeda: e.target.value }))} className="h-10 rounded-lg border border-gray-200 px-3 text-sm">
              <option value="BRL">BRL</option>
              <option value="USD">USD</option>
              <option value="KRW">KRW</option>
            </select>
          </div>
          <input value={form.ordem} onChange={e => setForm(f => ({ ...f, ordem: e.target.value }))} type="number" placeholder="Ordem" className="h-10 rounded-lg border border-gray-200 px-3 text-sm" />
          <textarea value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} placeholder="Descricao" className="md:col-span-2 min-h-20 rounded-lg border border-gray-200 px-3 py-2 text-sm" />
        </div>
        <button type="button" onClick={criar} disabled={salvando} className="mt-4 inline-flex items-center gap-2 h-10 rounded-lg px-4 text-sm font-semibold text-white" style={{ background: '#FF6B9D' }}>
          <Save className="w-4 h-4" /> {salvando ? 'Salvando...' : 'Cadastrar produto'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {produtos.map((produto) => (
          <div key={produto.id} className="bg-white border border-gray-100 rounded-lg p-4 flex gap-4">
            <div className="w-20 h-20 rounded-lg bg-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
              {produto.imagemUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={produto.imagemUrl} alt={produto.nome} className="w-full h-full object-cover" />
              ) : <ImagePlus className="w-6 h-6 text-gray-300" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium truncate" style={{ color: '#1A1A2E' }}>{produto.nome}</p>
                  <p className="text-xs" style={{ color: '#6B7280' }}>{produto.precoEstimado != null ? `${produto.moeda} ${produto.precoEstimado.toFixed(2)}` : 'Sob cotacao'}</p>
                </div>
                <button type="button" onClick={() => alternar(produto)} className="p-1 rounded-md hover:bg-gray-100" aria-label={produto.ativo ? 'Ocultar produto' : 'Publicar produto'}>
                  {produto.ativo ? <ToggleRight className="w-6 h-6 text-green-600" /> : <ToggleLeft className="w-6 h-6 text-gray-400" />}
                </button>
              </div>
              {produto.descricao && <p className="text-sm mt-2 line-clamp-2" style={{ color: '#6B7280' }}>{produto.descricao}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
