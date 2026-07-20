'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PackageCheck, Upload } from 'lucide-react'
import { toast } from 'sonner'

type Cliente = { id: string; nomeCompleto: string; numeroDeSuite: number }
type Caixa = { id: string; tracking: string; lojaOrigem: string | null; comprovanteCompraUrl: string; fotoEtiquetaUrl: string; cliente: Cliente; recebidoEm: Date | string }
type Servico = { id: string; tipo: string; status: string; peso: number | null; largura: number | null; altura: number | null; comprimento: number | null; fotoUrls: string[]; videoUrl: string | null; caixa: { tracking: string } | null; cliente: Cliente }

export function OperacionalAdmin({ clientes, caixas, servicos }: { clientes: Cliente[]; caixas: Caixa[]; servicos: Servico[] }) {
  const router = useRouter()
  const [form, setForm] = useState({ clienteId: clientes[0]?.id ?? '', tracking: '', lojaOrigem: '', observacoes: '' })
  const [comprovante, setComprovante] = useState<File | null>(null)
  const [etiqueta, setEtiqueta] = useState<File | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [servicoEdit, setServicoEdit] = useState<Record<string, { peso: string; largura: string; altura: string; comprimento: string; videoUrl: string }>>({})

  async function upload(files: File[]) {
    const data = new FormData()
    files.forEach(file => data.append('files', file))
    const res = await fetch('/api/uploads/operacional', { method: 'POST', body: data })
    if (!res.ok) throw new Error((await res.json()).error ?? 'Falha no upload')
    return (await res.json()).urls as string[]
  }

  async function cadastrarCaixa() {
    if (!form.clienteId || form.tracking.trim().length < 3) return toast.error('Informe cliente e rastreamento')
    if (!comprovante || !etiqueta) return toast.error('Comprovante de compra e foto da etiqueta sao obrigatorios')
    setSalvando(true)
    try {
      const [comprovanteCompraUrl, fotoEtiquetaUrl] = await upload([comprovante, etiqueta])
      const res = await fetch('/api/caixas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, tracking: form.tracking.trim(), lojaOrigem: form.lojaOrigem.trim() || undefined, observacoes: form.observacoes.trim() || undefined, comprovanteCompraUrl, fotoEtiquetaUrl }),
      })
      if (!res.ok) throw new Error((await res.json()).error ?? 'Nao foi possivel cadastrar')
      toast.success('Caixa recebida cadastrada')
      setForm({ clienteId: clientes[0]?.id ?? '', tracking: '', lojaOrigem: '', observacoes: '' })
      setComprovante(null)
      setEtiqueta(null)
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao cadastrar')
    } finally {
      setSalvando(false)
    }
  }

  async function concluirServico(servico: Servico, fotos: FileList | null) {
    const valores = servicoEdit[servico.id] ?? { peso: '', largura: '', altura: '', comprimento: '', videoUrl: '' }
    setSalvando(true)
    try {
      const fotoUrls = fotos?.length ? await upload(Array.from(fotos)) : servico.fotoUrls
      const res = await fetch('/api/servicos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: servico.id,
          status: 'CONCLUIDO',
          fotoUrls,
          videoUrl: valores.videoUrl || undefined,
          peso: valores.peso ? Number(valores.peso) : undefined,
          largura: valores.largura ? Number(valores.largura) : undefined,
          altura: valores.altura ? Number(valores.altura) : undefined,
          comprimento: valores.comprimento ? Number(valores.comprimento) : undefined,
        }),
      })
      if (!res.ok) throw new Error('Nao foi possivel concluir o servico')
      toast.success('Servico concluido')
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao concluir')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-100 rounded-lg p-5">
        <h2 className="font-semibold mb-4 flex items-center gap-2" style={{ color: '#1A1A2E' }}><PackageCheck className="w-4 h-4" /> Caixa Recebida</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <select value={form.clienteId} onChange={e => setForm(f => ({ ...f, clienteId: e.target.value }))} className="h-10 rounded-lg border border-gray-200 px-3 text-sm">
            {clientes.map(cliente => <option key={cliente.id} value={cliente.id}>#{String(cliente.numeroDeSuite).padStart(3, '0')} - {cliente.nomeCompleto}</option>)}
          </select>
          <input value={form.tracking} onChange={e => setForm(f => ({ ...f, tracking: e.target.value }))} placeholder="Numero de rastreamento" className="h-10 rounded-lg border border-gray-200 px-3 text-sm" />
          <input value={form.lojaOrigem} onChange={e => setForm(f => ({ ...f, lojaOrigem: e.target.value }))} placeholder="Loja de origem" className="h-10 rounded-lg border border-gray-200 px-3 text-sm" />
          <input value={form.observacoes} onChange={e => setForm(f => ({ ...f, observacoes: e.target.value }))} placeholder="Observacoes" className="h-10 rounded-lg border border-gray-200 px-3 text-sm" />
          <label className="h-10 rounded-lg border border-dashed border-gray-300 px-3 text-sm flex items-center gap-2 cursor-pointer">
            <Upload className="w-4 h-4" /> {comprovante ? comprovante.name : 'Comprovante de compra *'}
            <input type="file" className="hidden" accept="image/*,application/pdf" onChange={e => setComprovante(e.target.files?.[0] ?? null)} />
          </label>
          <label className="h-10 rounded-lg border border-dashed border-gray-300 px-3 text-sm flex items-center gap-2 cursor-pointer">
            <Upload className="w-4 h-4" /> {etiqueta ? etiqueta.name : 'Foto da etiqueta *'}
            <input type="file" className="hidden" accept="image/*" onChange={e => setEtiqueta(e.target.files?.[0] ?? null)} />
          </label>
        </div>
        <button type="button" onClick={cadastrarCaixa} disabled={salvando} className="mt-4 h-10 rounded-lg px-4 text-sm font-semibold text-white" style={{ background: '#FF6B9D' }}>
          {salvando ? 'Salvando...' : 'Cadastrar caixa'}
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-100 rounded-lg p-5">
          <h2 className="font-semibold mb-4" style={{ color: '#1A1A2E' }}>Caixas cadastradas</h2>
          <div className="space-y-3">
            {caixas.map(caixa => <div key={caixa.id} className="rounded-lg border border-gray-100 p-3">
              <p className="font-medium" style={{ color: '#1A1A2E' }}>{caixa.tracking}</p>
              <p className="text-xs" style={{ color: '#6B7280' }}>Suite #{String(caixa.cliente.numeroDeSuite).padStart(3, '0')} - {caixa.cliente.nomeCompleto}</p>
              <div className="mt-2 flex gap-2 text-xs"><a href={caixa.comprovanteCompraUrl} target="_blank" className="rounded bg-gray-100 px-2 py-1">Comprovante</a><a href={caixa.fotoEtiquetaUrl} target="_blank" className="rounded bg-gray-100 px-2 py-1">Etiqueta</a></div>
            </div>)}
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-lg p-5">
          <h2 className="font-semibold mb-4" style={{ color: '#1A1A2E' }}>Solicitacoes de servico</h2>
          <div className="space-y-3">
            {servicos.map(servico => {
              const edit = servicoEdit[servico.id] ?? { peso: '', largura: '', altura: '', comprimento: '', videoUrl: '' }
              return <div key={servico.id} className="rounded-lg border border-gray-100 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium" style={{ color: '#1A1A2E' }}>{servico.tipo.replaceAll('_', ' ')}</p>
                    <p className="text-xs" style={{ color: '#6B7280' }}>#{String(servico.cliente.numeroDeSuite).padStart(3, '0')} - {servico.cliente.nomeCompleto} {servico.caixa?.tracking ? `| ${servico.caixa.tracking}` : ''}</p>
                  </div>
                  <span className="text-xs rounded bg-gray-100 px-2 py-1">{servico.status.replaceAll('_', ' ')}</span>
                </div>
                {servico.status !== 'CONCLUIDO' && <div className="mt-3 grid grid-cols-2 gap-2">
                  <input value={edit.peso} onChange={e => setServicoEdit(s => ({ ...s, [servico.id]: { ...edit, peso: e.target.value } }))} placeholder="Peso kg" type="number" step="0.01" className="h-9 rounded-lg border border-gray-200 px-2 text-sm" />
                  <input value={edit.videoUrl} onChange={e => setServicoEdit(s => ({ ...s, [servico.id]: { ...edit, videoUrl: e.target.value } }))} placeholder="URL do video" className="h-9 rounded-lg border border-gray-200 px-2 text-sm" />
                  <input value={edit.largura} onChange={e => setServicoEdit(s => ({ ...s, [servico.id]: { ...edit, largura: e.target.value } }))} placeholder="Largura cm" type="number" step="0.1" className="h-9 rounded-lg border border-gray-200 px-2 text-sm" />
                  <input value={edit.altura} onChange={e => setServicoEdit(s => ({ ...s, [servico.id]: { ...edit, altura: e.target.value } }))} placeholder="Altura cm" type="number" step="0.1" className="h-9 rounded-lg border border-gray-200 px-2 text-sm" />
                  <input value={edit.comprimento} onChange={e => setServicoEdit(s => ({ ...s, [servico.id]: { ...edit, comprimento: e.target.value } }))} placeholder="Comprimento cm" type="number" step="0.1" className="h-9 rounded-lg border border-gray-200 px-2 text-sm" />
                  <input id={`fotos-${servico.id}`} type="file" multiple accept="image/*,video/*" className="h-9 text-sm" />
                  <button type="button" onClick={() => concluirServico(servico, (document.getElementById(`fotos-${servico.id}`) as HTMLInputElement | null)?.files ?? null)} className="col-span-2 h-9 rounded-lg text-sm font-semibold text-white" style={{ background: '#1A1A2E' }}>Concluir com arquivos</button>
                </div>}
              </div>
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
