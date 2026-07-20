'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

type Caixa = { id: string; tracking: string; lojaOrigem: string | null }
type Servico = { id: string; tipo: string; status: string; descricao: string | null; peso: number | null; largura: number | null; altura: number | null; comprimento: number | null; fotoUrls: string[]; videoUrl: string | null; caixa: { tracking: string } | null; criadoEm: Date | string }

const tipos = [
  ['UNBOXING', 'Unboxing'],
  ['FOTO_VIDEO', 'Foto/video'],
  ['MEDICAO', 'Peso e tamanho'],
  ['REEMBALAGEM', 'Reembalagem'],
  ['OUTRO', 'Outro'],
]

export function ServicosCliente({ caixas, servicos }: { caixas: Caixa[]; servicos: Servico[] }) {
  const router = useRouter()
  const [caixaId, setCaixaId] = useState(caixas[0]?.id ?? '')
  const [tipo, setTipo] = useState('UNBOXING')
  const [descricao, setDescricao] = useState('')
  const [salvando, setSalvando] = useState(false)

  async function solicitar() {
    setSalvando(true)
    const res = await fetch('/api/servicos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ caixaId: caixaId || undefined, tipo, descricao: descricao.trim() || undefined }),
    })
    setSalvando(false)
    if (res.ok) {
      toast.success('Servico solicitado')
      setDescricao('')
      router.refresh()
    } else toast.error((await res.json()).error ?? 'Nao foi possivel solicitar')
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-100 rounded-lg p-5">
        <h2 className="font-semibold mb-4" style={{ color: '#1A1A2E' }}>Solicitar servico</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <select value={caixaId} onChange={e => setCaixaId(e.target.value)} className="h-10 rounded-lg border border-gray-200 px-3 text-sm">
            <option value="">Sem caixa vinculada</option>
            {caixas.map(caixa => <option key={caixa.id} value={caixa.id}>{caixa.tracking}{caixa.lojaOrigem ? ` - ${caixa.lojaOrigem}` : ''}</option>)}
          </select>
          <select value={tipo} onChange={e => setTipo(e.target.value)} className="h-10 rounded-lg border border-gray-200 px-3 text-sm">
            {tipos.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
          <textarea value={descricao} onChange={e => setDescricao(e.target.value)} placeholder="Detalhes do que precisa" className="md:col-span-2 min-h-20 rounded-lg border border-gray-200 px-3 py-2 text-sm" />
        </div>
        <button type="button" onClick={solicitar} disabled={salvando} className="mt-4 h-10 rounded-lg px-4 text-sm font-semibold text-white" style={{ background: '#FF6B9D' }}>{salvando ? 'Enviando...' : 'Solicitar servico'}</button>
      </div>

      <div className="space-y-3">
        {servicos.map(servico => <div key={servico.id} className="bg-white border border-gray-100 rounded-lg p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-medium" style={{ color: '#1A1A2E' }}>{servico.tipo.replaceAll('_', ' ')}</p>
              <p className="text-xs" style={{ color: '#6B7280' }}>{new Date(servico.criadoEm).toLocaleDateString('pt-BR')} {servico.caixa?.tracking ? `| ${servico.caixa.tracking}` : ''}</p>
            </div>
            <span className="rounded bg-gray-100 px-2 py-1 text-xs">{servico.status.replaceAll('_', ' ')}</span>
          </div>
          {(servico.peso || servico.largura || servico.videoUrl || servico.fotoUrls.length > 0) && <div className="mt-3 text-sm" style={{ color: '#374151' }}>
            {servico.peso && <p>Peso: {servico.peso} kg</p>}
            {servico.largura && servico.altura && servico.comprimento && <p>Tamanho: {servico.largura} x {servico.altura} x {servico.comprimento} cm</p>}
            <div className="mt-2 flex flex-wrap gap-2">
              {servico.videoUrl && <a href={servico.videoUrl} target="_blank" className="rounded bg-gray-100 px-2 py-1 text-xs">Video</a>}
              {servico.fotoUrls.map((url, idx) => <a key={url} href={url} target="_blank" className="rounded bg-gray-100 px-2 py-1 text-xs">Foto {idx + 1}</a>)}
            </div>
          </div>}
        </div>)}
      </div>
    </div>
  )
}
