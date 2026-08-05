'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PackageCheck, Upload, CheckCircle2, Search } from 'lucide-react'
import { toast } from 'sonner'

type Cliente = { id: string; nomeCompleto: string; numeroDeSuite: number }
type Caixa = {
  id: string
  tracking: string
  lojaOrigem: string | null
  comprovanteCompraUrl: string
  fotoEtiquetaUrl: string | null
  status: 'PENDENTE' | 'RECEBIDA'
  cliente: Cliente
  recebidoEm: Date | string | null
  criadoEm: Date | string
}
type Servico = { id: string; tipo: string; status: string; peso: number | null; largura: number | null; altura: number | null; comprimento: number | null; fotoUrls: string[]; videoUrl: string | null; observacoesEquipe: string | null; caixa: { tracking: string } | null; cliente: Cliente }

const MAX_FOTOS_SERVICO = 10

export function OperacionalAdmin({ clientes, caixas, servicos }: { clientes: Cliente[]; caixas: Caixa[]; servicos: Servico[] }) {
  const router = useRouter()
  const [form, setForm] = useState({ clienteId: clientes[0]?.id ?? '', tracking: '', lojaOrigem: '', observacoes: '' })
  const [comprovante, setComprovante] = useState<File | null>(null)
  const [etiqueta, setEtiqueta] = useState<File | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [confirmandoId, setConfirmandoId] = useState<string | null>(null)
  const [servicoEdit, setServicoEdit] = useState<Record<string, { peso: string; largura: string; altura: string; comprimento: string; videoUrl: string; observacoesEquipe: string }>>({})
  const [buscaCaixas, setBuscaCaixas] = useState('')
  const [buscaServicos, setBuscaServicos] = useState('')

  const caixasFiltradas = caixas.filter(c =>
    c.tracking.toLowerCase().includes(buscaCaixas.trim().toLowerCase()) ||
    c.cliente.nomeCompleto.toLowerCase().includes(buscaCaixas.trim().toLowerCase())
  )
  const servicosFiltrados = servicos.filter(s =>
    (s.caixa?.tracking ?? '').toLowerCase().includes(buscaServicos.trim().toLowerCase()) ||
    s.cliente.nomeCompleto.toLowerCase().includes(buscaServicos.trim().toLowerCase())
  )

  async function upload(files: File[]) {
    const data = new FormData()
    files.forEach(file => data.append('files', file))
    const res = await fetch('/api/uploads/operacional', { method: 'POST', body: data })
    if (!res.ok) throw new Error((await res.json()).error ?? 'Falha no upload')
    return (await res.json()).urls as string[]
  }

  async function cadastrarCaixa() {
    if (!form.clienteId || form.tracking.trim().length < 3) return toast.error('Informe cliente e tracking')
    if (!comprovante) return toast.error('Comprovante de compra é obrigatório')
    setSalvando(true)
    try {
      const files: File[] = [comprovante]
      if (etiqueta) files.push(etiqueta)
      const urls = await upload(files)
      const comprovanteCompraUrl = urls[0]
      const fotoEtiquetaUrl = etiqueta ? urls[1] : undefined
      const res = await fetch('/api/caixas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          tracking: form.tracking.trim(),
          lojaOrigem: form.lojaOrigem.trim() || undefined,
          observacoes: form.observacoes.trim() || undefined,
          comprovanteCompraUrl,
          fotoEtiquetaUrl,
        }),
      })
      if (!res.ok) throw new Error((await res.json()).error ?? 'Não foi possível cadastrar')
      toast.success(fotoEtiquetaUrl ? 'Caixa cadastrada e recebimento confirmado' : 'Caixa registrada (aguardando chegada)')
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

  async function confirmarRecebimento(caixa: Caixa, file: File | null) {
    if (!file) return toast.error('Selecione a foto da etiqueta recebida')
    setConfirmandoId(caixa.id)
    try {
      const [fotoEtiquetaUrl] = await upload([file])
      const res = await fetch(`/api/caixas/${caixa.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'RECEBIDA', fotoEtiquetaUrl }),
      })
      if (!res.ok) throw new Error((await res.json()).error ?? 'Não foi possível confirmar')
      toast.success(`Caixa ${caixa.tracking} recebida no armazém`)
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao confirmar')
    } finally {
      setConfirmandoId(null)
    }
  }

  async function concluirServico(servico: Servico, fotos: FileList | null) {
    const valores = servicoEdit[servico.id] ?? { peso: '', largura: '', altura: '', comprimento: '', videoUrl: '', observacoesEquipe: '' }
    setSalvando(true)
    try {
      let fotoUrls = servico.fotoUrls
      if (fotos?.length) {
        const files = Array.from(fotos).slice(0, MAX_FOTOS_SERVICO)
        if (files.length !== fotos.length) toast.warning(`Máximo de ${MAX_FOTOS_SERVICO} fotos por solicitação`)
        const novas = await upload(files)
        fotoUrls = [...servico.fotoUrls, ...novas].slice(0, MAX_FOTOS_SERVICO)
      }
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
          observacoesEquipe: valores.observacoesEquipe.trim() || undefined,
        }),
      })
      if (!res.ok) throw new Error('Não foi possível concluir o serviço')
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
          <input value={form.tracking} onChange={e => setForm(f => ({ ...f, tracking: e.target.value }))} placeholder="Tracking" className="h-10 rounded-lg border border-gray-200 px-3 text-sm" />
          <input value={form.lojaOrigem} onChange={e => setForm(f => ({ ...f, lojaOrigem: e.target.value }))} placeholder="Loja de origem" className="h-10 rounded-lg border border-gray-200 px-3 text-sm" />
          <input value={form.observacoes} onChange={e => setForm(f => ({ ...f, observacoes: e.target.value }))} placeholder="Observações" className="h-10 rounded-lg border border-gray-200 px-3 text-sm" />
          <label className="h-10 rounded-lg border border-dashed border-gray-300 px-3 text-sm flex items-center gap-2 cursor-pointer">
            <Upload className="w-4 h-4" /> {comprovante ? comprovante.name : 'Comprovante de compra *'}
            <input type="file" className="hidden" accept="image/*,application/pdf" onChange={e => setComprovante(e.target.files?.[0] ?? null)} />
          </label>
          <label className="h-10 rounded-lg border border-dashed border-gray-300 px-3 text-sm flex items-center gap-2 cursor-pointer">
            <Upload className="w-4 h-4" /> {etiqueta ? etiqueta.name : 'Foto da etiqueta (opcional)'}
            <input type="file" className="hidden" accept="image/*" onChange={e => setEtiqueta(e.target.files?.[0] ?? null)} />
          </label>
        </div>
        <button type="button" onClick={cadastrarCaixa} disabled={salvando} className="mt-4 h-10 rounded-lg px-4 text-sm font-semibold text-white" style={{ background: '#FF6B9D' }}>
          {salvando ? 'Salvando...' : 'Cadastrar caixa'}
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-100 rounded-lg p-5">
          <div className="flex items-center justify-between gap-2 mb-4">
            <h2 className="font-semibold" style={{ color: '#1A1A2E' }}>Caixas cadastradas</h2>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#9CA3AF' }} />
              <input
                value={buscaCaixas}
                onChange={e => setBuscaCaixas(e.target.value)}
                placeholder="Buscar por tracking..."
                className="h-9 rounded-lg border border-gray-200 pl-9 pr-3 text-sm w-52"
              />
            </div>
          </div>
          <div className="space-y-3">
            {caixasFiltradas.length === 0 && (
              <p className="text-sm py-4 text-center" style={{ color: '#9CA3AF' }}>Nenhuma caixa encontrada</p>
            )}
            {caixasFiltradas.map(caixa => {
              const pendente = caixa.status === 'PENDENTE'
              return <div key={caixa.id} className="rounded-lg border border-gray-100 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium" style={{ color: '#1A1A2E' }}>{caixa.tracking}</p>
                    <p className="text-xs" style={{ color: '#6B7280' }}>Suite #{String(caixa.cliente.numeroDeSuite).padStart(3, '0')} - {caixa.cliente.nomeCompleto}</p>
                  </div>
                  <span className={`shrink-0 rounded px-2 py-1 text-xs font-medium ${pendente ? 'bg-amber-100' : 'bg-green-100'}`} style={{ color: pendente ? '#B45309' : '#047857' }}>
                    {pendente ? 'Aguardando chegada' : 'Recebida'}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  <a href={caixa.comprovanteCompraUrl} target="_blank" rel="noreferrer" className="rounded bg-gray-100 px-2 py-1">Comprovante</a>
                  {caixa.fotoEtiquetaUrl && <a href={caixa.fotoEtiquetaUrl} target="_blank" rel="noreferrer" className="rounded bg-gray-100 px-2 py-1">Etiqueta</a>}
                </div>
                {pendente && (
                  <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3">
                    <label className="h-9 rounded-lg border border-dashed border-gray-300 px-3 text-xs flex items-center gap-2 cursor-pointer">
                      <Upload className="w-3.5 h-3.5" /> Foto da etiqueta recebida
                      <input id={`etiqueta-${caixa.id}`} type="file" className="hidden" accept="image/*" />
                    </label>
                    <button
                      type="button"
                      onClick={() => confirmarRecebimento(caixa, (document.getElementById(`etiqueta-${caixa.id}`) as HTMLInputElement | null)?.files?.[0] ?? null)}
                      disabled={confirmandoId === caixa.id}
                      className="h-9 rounded-lg px-3 text-xs font-semibold text-white flex items-center gap-1.5"
                      style={{ background: '#22C55E' }}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {confirmandoId === caixa.id ? 'Confirmando...' : 'Confirmar recebimento'}
                    </button>
                  </div>
                )}
              </div>
            })}
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-lg p-5">
          <div className="flex items-center justify-between gap-2 mb-4">
            <h2 className="font-semibold" style={{ color: '#1A1A2E' }}>Solicitações de serviço</h2>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#9CA3AF' }} />
              <input
                value={buscaServicos}
                onChange={e => setBuscaServicos(e.target.value)}
                placeholder="Buscar por tracking..."
                className="h-9 rounded-lg border border-gray-200 pl-9 pr-3 text-sm w-52"
              />
            </div>
          </div>
          <div className="space-y-3">
            {servicosFiltrados.length === 0 && (
              <p className="text-sm py-4 text-center" style={{ color: '#9CA3AF' }}>Nenhuma solicitação encontrada</p>
            )}
            {servicosFiltrados.map(servico => {
              const edit = servicoEdit[servico.id] ?? { peso: '', largura: '', altura: '', comprimento: '', videoUrl: '', observacoesEquipe: '' }
              const ehFotoVideo = servico.tipo === 'FOTO_VIDEO'
              return <div key={servico.id} className="rounded-lg border border-gray-100 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium" style={{ color: '#1A1A2E' }}>{servico.tipo.replaceAll('_', ' ')}</p>
                    <p className="text-xs" style={{ color: '#6B7280' }}>#{String(servico.cliente.numeroDeSuite).padStart(3, '0')} - {servico.cliente.nomeCompleto} {servico.caixa?.tracking ? `| ${servico.caixa.tracking}` : ''}</p>
                  </div>
                  <span className="text-xs rounded bg-gray-100 px-2 py-1">{servico.status.replaceAll('_', ' ')}</span>
                </div>
                {servico.observacoesEquipe && <p className="text-xs mt-2 rounded bg-gray-50 px-2 py-1" style={{ color: '#6B7280' }}>{servico.observacoesEquipe}</p>}
                {servico.status !== 'CONCLUIDO' && <div className="mt-3 grid grid-cols-2 gap-2">
                  {!ehFotoVideo && <>
                    <input value={edit.peso} onChange={e => setServicoEdit(s => ({ ...s, [servico.id]: { ...edit, peso: e.target.value } }))} placeholder="Peso kg" type="number" step="0.01" className="h-9 rounded-lg border border-gray-200 px-2 text-sm" />
                    <input value={edit.largura} onChange={e => setServicoEdit(s => ({ ...s, [servico.id]: { ...edit, largura: e.target.value } }))} placeholder="Largura cm" type="number" step="0.1" className="h-9 rounded-lg border border-gray-200 px-2 text-sm" />
                    <input value={edit.altura} onChange={e => setServicoEdit(s => ({ ...s, [servico.id]: { ...edit, altura: e.target.value } }))} placeholder="Altura cm" type="number" step="0.1" className="h-9 rounded-lg border border-gray-200 px-2 text-sm" />
                    <input value={edit.comprimento} onChange={e => setServicoEdit(s => ({ ...s, [servico.id]: { ...edit, comprimento: e.target.value } }))} placeholder="Comprimento cm" type="number" step="0.1" className="h-9 rounded-lg border border-gray-200 px-2 text-sm" />
                  </>}
                  <input value={edit.videoUrl} onChange={e => setServicoEdit(s => ({ ...s, [servico.id]: { ...edit, videoUrl: e.target.value } }))} placeholder="URL do video" className={`h-9 rounded-lg border border-gray-200 px-2 text-sm ${ehFotoVideo ? 'col-span-2' : ''}`} />
                  <textarea value={edit.observacoesEquipe} onChange={e => setServicoEdit(s => ({ ...s, [servico.id]: { ...edit, observacoesEquipe: e.target.value } }))} placeholder="Observações" className="col-span-2 min-h-16 rounded-lg border border-gray-200 px-2 py-1.5 text-sm" />
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
