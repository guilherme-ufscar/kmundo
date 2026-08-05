'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ImagePlus, Save, ToggleLeft, ToggleRight, Trash2, Upload, X } from 'lucide-react'
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
  const [uploadingFoto, setUploadingFoto] = useState(false)
  const [excluindoId, setExcluindoId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function enviarFoto(file: File) {
    const data = new FormData()
    data.append('files', file)
    const res = await fetch('/api/uploads/shop', { method: 'POST', body: data })
    if (!res.ok) throw new Error((await res.json()).error ?? 'Falha no upload da imagem')
    const json = await res.json() as { urls: string[] }
    return json.urls[0]
  }

  async function handleUploadFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingFoto(true)
    try {
      const url = await enviarFoto(file)
      setForm(f => ({ ...f, imagemUrl: url }))
      toast.success('Imagem enviada')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao enviar imagem')
    } finally {
      setUploadingFoto(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

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
    } else toast.error('Não foi possível cadastrar')
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
    } else toast.error('Não foi possível atualizar')
  }

  async function excluir(produto: Produto) {
    if (!confirm(`Excluir permanentemente o produto "${produto.nome}"? Essa ação não pode ser desfeita.`)) return
    setExcluindoId(produto.id)
    try {
      const res = await fetch(`/api/shop/produtos/${produto.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Não foi possível excluir')
      toast.success('Produto excluído')
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao excluir')
    } finally {
      setExcluindoId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-100 rounded-lg p-5">
        <h2 className="font-semibold mb-4" style={{ color: '#1A1A2E' }}>Novo produto</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} placeholder="Nome do produto" className="h-10 rounded-lg border border-gray-200 px-3 text-sm" />
          <input value={form.urlProduto} onChange={e => setForm(f => ({ ...f, urlProduto: e.target.value }))} placeholder="Link de referência ou compra" className="h-10 rounded-lg border border-gray-200 px-3 text-sm" />
          <div className="flex gap-2">
            <input value={form.precoEstimado} onChange={e => setForm(f => ({ ...f, precoEstimado: e.target.value }))} type="number" step="0.01" placeholder="Preço estimado" className="h-10 flex-1 rounded-lg border border-gray-200 px-3 text-sm" />
            <select value={form.moeda} onChange={e => setForm(f => ({ ...f, moeda: e.target.value }))} className="h-10 rounded-lg border border-gray-200 px-3 text-sm">
              <option value="BRL">BRL</option>
              <option value="USD">USD</option>
              <option value="KRW">KRW</option>
            </select>
          </div>
          <input value={form.ordem} onChange={e => setForm(f => ({ ...f, ordem: e.target.value }))} type="number" placeholder="Ordem" className="h-10 rounded-lg border border-gray-200 px-3 text-sm" />
          <textarea value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} placeholder="Descrição" className="md:col-span-2 min-h-20 rounded-lg border border-gray-200 px-3 py-2 text-sm" />
        </div>

        <div className="mt-4">
          <p className="text-sm font-medium mb-2" style={{ color: '#374151' }}>Imagem do produto</p>
          {form.imagemUrl ? (
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={form.imagemUrl} alt="Prévia" className="w-20 h-20 rounded-lg object-cover border border-gray-200" />
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 h-9 rounded-lg px-3 text-xs font-medium cursor-pointer border border-gray-200 hover:bg-gray-50" style={{ color: '#374151' }}>
                  <Upload className="w-3.5 h-3.5" />
                  Trocar imagem
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUploadFoto} disabled={uploadingFoto} />
                </label>
                <button type="button" onClick={() => setForm(f => ({ ...f, imagemUrl: '' }))} className="flex items-center gap-1.5 text-xs" style={{ color: '#EF4444' }}>
                  <X className="w-3.5 h-3.5" />
                  Remover imagem
                </button>
              </div>
            </div>
          ) : (
            <label className="flex items-center justify-center gap-2 h-20 rounded-lg border-2 border-dashed cursor-pointer hover:bg-gray-50" style={{ borderColor: '#E5E7EB' }}>
              {uploadingFoto ? (
                <span className="text-sm" style={{ color: '#9CA3AF' }}>Enviando imagem...</span>
              ) : (
                <>
                  <ImagePlus className="w-5 h-5" style={{ color: '#9CA3AF' }} />
                  <span className="text-sm" style={{ color: '#9CA3AF' }}>Enviar foto do produto</span>
                </>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUploadFoto} disabled={uploadingFoto} />
            </label>
          )}
        </div>

        <button type="button" onClick={criar} disabled={salvando || uploadingFoto} className="mt-4 inline-flex items-center gap-2 h-10 rounded-lg px-4 text-sm font-semibold text-white" style={{ background: '#FF6B9D' }}>
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
                  <p className="text-xs" style={{ color: '#6B7280' }}>{produto.precoEstimado != null ? `${produto.moeda} ${produto.precoEstimado.toFixed(2)}` : 'Sob cotação'}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button type="button" onClick={() => alternar(produto)} className="p-1 rounded-md hover:bg-gray-100" aria-label={produto.ativo ? 'Ocultar produto' : 'Publicar produto'}>
                    {produto.ativo ? <ToggleRight className="w-6 h-6 text-green-600" /> : <ToggleLeft className="w-6 h-6 text-gray-400" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => excluir(produto)}
                    disabled={excluindoId === produto.id}
                    className="p-1 rounded-md hover:bg-red-50 disabled:opacity-50"
                    aria-label="Excluir produto"
                    title="Excluir produto"
                  >
                    <Trash2 className="w-5 h-5 text-red-500" />
                  </button>
                </div>
              </div>
              {produto.descricao && <p className="text-sm mt-2 line-clamp-2" style={{ color: '#6B7280' }}>{produto.descricao}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
