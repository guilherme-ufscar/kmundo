'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Save, Trash2, ToggleLeft, ToggleRight, Pencil, Calculator, Globe, Package, DollarSign, FileText } from 'lucide-react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'
import Placeholder from '@tiptap/extension-placeholder'

type Pais = { id: string; nome: string; codigo: string; moeda: string; ativo: boolean; ordem: number }
type Caixa = { id: string; nome: string; descricao: string | null; comprimento: number | null; largura: number | null; altura: number | null; pesoMax: number | null; ativo: boolean; ordem: number }
type Tarifa = { id: string; paisId: string; caixaTipoId: string | null; pesoMin: number; pesoMax: number; valor: number; moeda: string; taxaServico: number; ativo: boolean; pais?: { nome: string; codigo: string }; caixaTipo?: { nome: string } | null }
type Config = {
  id: string; titulo: string; subtitulo: string | null;
  introducaoHtml: string | null; comoFuncionaHtml: string | null; avisoEstimativaHtml: string | null;
  comoPesoHtml: string | null; comoPaisHtml: string | null; comoCaixasHtml: string | null;
  taxasServicoHtml: string | null; diferencasValorHtml: string | null; regrasAdicionaisHtml: string | null;
}

function MiniEditor({ content, onChange, placeholder }: { content: string; onChange: (html: string) => void; placeholder: string }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder }),
    ],
    content: content || `<p>${placeholder}</p>`,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: { attributes: { class: 'outline-none min-h-[140px] px-3 py-2 text-sm' } },
  })
  if (!editor) return null
  return (
    <div className="border rounded-xl overflow-hidden" style={{ borderColor: '#E5E7EB' }}>
      <div className="flex flex-wrap gap-0.5 p-2 border-b bg-gray-50" style={{ borderColor: '#E5E7EB' }}>
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className="px-2 py-1 text-xs rounded hover:bg-white border" style={{ background: editor.isActive('bold') ? '#FFF1F5' : 'white', color: editor.isActive('bold') ? '#FF6B9D' : '#374151' }}>B</button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className="px-2 py-1 text-xs rounded hover:bg-white border italic" style={{ background: editor.isActive('italic') ? '#FFF1F5' : 'white' }}>I</button>
        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className="px-2 py-1 text-xs rounded hover:bg-white border">• Lista</button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className="px-2 py-1 text-xs rounded hover:bg-white border">H3</button>
      </div>
      <div className="termos-content bg-white">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}

export function FreteAdmin({ paises: initialPaises, caixas: initialCaixas, tarifas: initialTarifas, config: initialConfig }: { paises: Pais[]; caixas: Caixa[]; tarifas: Tarifa[]; config: Config | null }) {
  const router = useRouter()
  const [tab, setTab] = useState<'textos' | 'paises' | 'caixas' | 'tarifas'>('textos')

  // --- Config textos ---
  const [cfg, setCfg] = useState({
    titulo: initialConfig?.titulo ?? 'Calculadora de Frete',
    subtitulo: initialConfig?.subtitulo ?? '',
    introducaoHtml: initialConfig?.introducaoHtml ?? '',
    comoFuncionaHtml: initialConfig?.comoFuncionaHtml ?? '',
    avisoEstimativaHtml: initialConfig?.avisoEstimativaHtml ?? '<p><strong>⚠️ Atenção:</strong> o valor exibido é apenas uma <em>estimativa</em> e pode diferir do valor final cobrado no fechamento do envio.</p>',
    comoPesoHtml: initialConfig?.comoPesoHtml ?? '',
    comoPaisHtml: initialConfig?.comoPaisHtml ?? '',
    comoCaixasHtml: initialConfig?.comoCaixasHtml ?? '',
    taxasServicoHtml: initialConfig?.taxasServicoHtml ?? '',
    diferencasValorHtml: initialConfig?.diferencasValorHtml ?? '',
    regrasAdicionaisHtml: initialConfig?.regrasAdicionaisHtml ?? '',
  })
  const [savingCfg, setSavingCfg] = useState(false)
  async function salvarCfg() {
    setSavingCfg(true)
    const res = await fetch('/api/frete/config', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cfg) })
    setSavingCfg(false)
    if (res.ok) { toast.success('Textos salvos'); router.refresh() } else toast.error('Erro ao salvar textos')
  }

  // --- Paises ---
  const [paises, setPaises] = useState(initialPaises)
  const [paisForm, setPaisForm] = useState({ nome: '', codigo: '', moeda: 'BRL', ordem: '0', ativo: true })
  const [editingPais, setEditingPais] = useState<Pais | null>(null)
  async function criarPais() {
    if (!paisForm.nome.trim() || !paisForm.codigo.trim()) return toast.error('Nome e código obrigatórios')
    const url = editingPais ? `/api/frete/paises/${editingPais.id}` : '/api/frete/paises'
    const method = editingPais ? 'PATCH' : 'POST'
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nome: paisForm.nome.trim(), codigo: paisForm.codigo.trim().toUpperCase(), moeda: paisForm.moeda, ordem: Number(paisForm.ordem) || 0, ativo: paisForm.ativo }) })
    if (!res.ok) { const j = await res.json().catch(() => ({})); return toast.error(j.error ?? 'Erro') }
    toast.success(editingPais ? 'País atualizado' : 'País cadastrado')
    setPaisForm({ nome: '', codigo: '', moeda: 'BRL', ordem: '0', ativo: true }); setEditingPais(null); router.refresh()
    const data = await res.json(); if (editingPais) setPaises(p => p.map(x => x.id === data.id ? data : x)); else setPaises(p => [...p, data])
  }
  async function excluirPais(id: string) {
    if (!confirm('Excluir país? Tarifas vinculadas serão apagadas.')) return
    const res = await fetch(`/api/frete/paises/${id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('Excluído'); setPaises(p => p.filter(x => x.id !== id)); router.refresh() } else toast.error('Erro ao excluir')
  }
  async function togglePais(p: Pais) {
    const res = await fetch(`/api/frete/paises/${p.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ativo: !p.ativo }) })
    if (res.ok) { const d = await res.json(); setPaises(ps => ps.map(x => x.id === p.id ? d : x)) }
  }

  // --- Caixas ---
  const [caixas, setCaixas] = useState(initialCaixas)
  const [caixaForm, setCaixaForm] = useState({ nome: '', descricao: '', comprimento: '', largura: '', altura: '', pesoMax: '', ordem: '0', ativo: true })
  const [editingCaixa, setEditingCaixa] = useState<Caixa | null>(null)
  async function criarCaixa() {
    if (!caixaForm.nome.trim()) return toast.error('Nome obrigatório')
    const payload = { nome: caixaForm.nome.trim(), descricao: caixaForm.descricao.trim() || null, comprimento: caixaForm.comprimento ? Number(caixaForm.comprimento) : null, largura: caixaForm.largura ? Number(caixaForm.largura) : null, altura: caixaForm.altura ? Number(caixaForm.altura) : null, pesoMax: caixaForm.pesoMax ? Number(caixaForm.pesoMax) : null, ordem: Number(caixaForm.ordem) || 0, ativo: caixaForm.ativo }
    const url = editingCaixa ? `/api/frete/caixas/${editingCaixa.id}` : '/api/frete/caixas'
    const method = editingCaixa ? 'PATCH' : 'POST'
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    if (!res.ok) return toast.error('Erro ao salvar caixa')
    const data = await res.json(); toast.success(editingCaixa ? 'Caixa atualizada' : 'Caixa cadastrada')
    setCaixaForm({ nome: '', descricao: '', comprimento: '', largura: '', altura: '', pesoMax: '', ordem: '0', ativo: true }); setEditingCaixa(null); router.refresh()
    if (editingCaixa) setCaixas(c => c.map(x => x.id === data.id ? data : x)); else setCaixas(c => [...c, data])
  }
  async function excluirCaixa(id: string) {
    if (!confirm('Excluir caixa?')) return
    const res = await fetch(`/api/frete/caixas/${id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('Excluído'); setCaixas(c => c.filter(x => x.id !== id)); router.refresh() } else toast.error('Erro')
  }

  // --- Tarifas ---
  const [tarifas, setTarifas] = useState(initialTarifas)
  const [tarifaForm, setTarifaForm] = useState({ paisId: '', caixaTipoId: '', pesoMin: '', pesoMax: '', valor: '', moeda: 'BRL', taxaServico: '0', ativo: true })
  const [editingTarifa, setEditingTarifa] = useState<Tarifa | null>(null)
  async function criarTarifa() {
    if (!tarifaForm.paisId) return toast.error('Selecione o país')
    if (!tarifaForm.pesoMin || !tarifaForm.pesoMax || !tarifaForm.valor) return toast.error('Peso e valor obrigatórios')
    if (Number(tarifaForm.pesoMax) <= Number(tarifaForm.pesoMin)) return toast.error('pesoMax deve ser > pesoMin')
    const payload = { paisId: tarifaForm.paisId, caixaTipoId: tarifaForm.caixaTipoId || null, pesoMin: Number(tarifaForm.pesoMin), pesoMax: Number(tarifaForm.pesoMax), valor: Number(tarifaForm.valor), moeda: tarifaForm.moeda, taxaServico: Number(tarifaForm.taxaServico) || 0, ativo: tarifaForm.ativo }
    const url = editingTarifa ? `/api/frete/tarifas/${editingTarifa.id}` : '/api/frete/tarifas'
    const method = editingTarifa ? 'PATCH' : 'POST'
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    if (!res.ok) { const j = await res.json().catch(() => ({})); return toast.error(j.error?.valor?._errors?.[0] ?? j.error ?? 'Erro ao salvar tarifa') }
    const data = await res.json(); toast.success(editingTarifa ? 'Tarifa atualizada' : 'Tarifa cadastrada')
    setTarifaForm({ paisId: '', caixaTipoId: '', pesoMin: '', pesoMax: '', valor: '', moeda: 'BRL', taxaServico: '0', ativo: true }); setEditingTarifa(null); router.refresh()
    // para exibir nome, recarrega ou adiciona manual
    const pais = paises.find(p => p.id === data.paisId)
    const caixa = caixas.find(c => c.id === data.caixaTipoId)
    const enriched = { ...data, pais: pais ? { nome: pais.nome, codigo: pais.codigo } : undefined, caixaTipo: caixa ? { nome: caixa.nome } : null }
    if (editingTarifa) setTarifas(t => t.map(x => x.id === data.id ? enriched : x)); else setTarifas(t => [...t, enriched])
  }
  async function excluirTarifa(id: string) {
    if (!confirm('Excluir tarifa?')) return
    const res = await fetch(`/api/frete/tarifas/${id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('Excluída'); setTarifas(t => t.filter(x => x.id !== id)); router.refresh() } else toast.error('Erro')
  }

  const tabBtn = (id: typeof tab, label: string, Icon: typeof Calculator) => (
    <button type="button" onClick={() => setTab(id)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${tab === id ? 'text-white shadow-sm' : 'hover:bg-gray-100'}`} style={tab === id ? { background: 'linear-gradient(135deg,#FF6B9D,#C77DFF)' } : { color: '#6B7280', background: 'white', border: '1px solid #E5E7EB' }}>
      <Icon className="w-4 h-4" />{label}
    </button>
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {tabBtn('textos', 'Textos & Explicações', FileText)}
        {tabBtn('paises', 'Países', Globe)}
        {tabBtn('caixas', 'Caixas Padrão', Package)}
        {tabBtn('tarifas', 'Tarifas', DollarSign)}
      </div>

      {tab === 'textos' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h3 className="font-semibold mb-4" style={{ color: '#1A1A2E' }}>Cabeçalho da calculadora</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium" style={{ color: '#374151' }}>Título</label>
                <input value={cfg.titulo} onChange={e => setCfg(c => ({ ...c, titulo: e.target.value }))} className="w-full h-11 mt-1.5 px-3 rounded-xl border text-sm" style={{ borderColor: '#E5E7EB' }} placeholder="Calculadora de Frete" />
              </div>
              <div>
                <label className="text-sm font-medium" style={{ color: '#374151' }}>Subtítulo</label>
                <textarea value={cfg.subtitulo ?? ''} onChange={e => setCfg(c => ({ ...c, subtitulo: e.target.value }))} rows={2} className="w-full mt-1.5 px-3 py-2 rounded-xl border text-sm resize-none" style={{ borderColor: '#E5E7EB' }} placeholder="Simule o frete por país, peso e caixa. Valor apenas estimativo." />
              </div>
              <div>
                <label className="text-sm font-medium" style={{ color: '#374151' }}>Introdução (topo)</label>
                <MiniEditor content={cfg.introducaoHtml ?? ''} onChange={v => setCfg(c => ({ ...c, introducaoHtml: v }))} placeholder="Texto introdutório..." />
              </div>
            </div>
          </div>

          {[
            { key: 'comoFuncionaHtml', label: 'Como funciona a calculadora', placeholder: 'Explique o passo a passo...' },
            { key: 'avisoEstimativaHtml', label: 'Aviso — valor é apenas estimativa', placeholder: 'Deixe claro que é simulação...' },
            { key: 'comoPesoHtml', label: 'Como o peso influencia no valor', placeholder: 'Explique faixas por kg...' },
            { key: 'comoPaisHtml', label: 'Como funciona o cálculo por país', placeholder: 'Cada país tem tarifas diferentes...' },
            { key: 'comoCaixasHtml', label: 'Como funcionam os tamanhos de caixa', placeholder: 'Descreva P/M/G e medidas...' },
            { key: 'taxasServicoHtml', label: 'Taxas de serviço', placeholder: 'Informe taxas adicionais...' },
            { key: 'diferencasValorHtml', label: 'Diferenças entre estimado e final', placeholder: 'Variações cambiais, pesagem...' },
            { key: 'regrasAdicionaisHtml', label: 'Regras adicionais / outras informações', placeholder: 'Outras regras...' },
          ].map(f => (
            <div key={f.key} className="bg-white rounded-2xl p-6" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <h3 className="font-semibold mb-3" style={{ color: '#1A1A2E' }}>{f.label}</h3>
              <MiniEditor content={(cfg as unknown as Record<string, string>)[f.key] ?? ''} onChange={v => setCfg(c => ({ ...c, [f.key]: v }))} placeholder={f.placeholder} />
            </div>
          ))}

          <button type="button" onClick={salvarCfg} disabled={savingCfg} className="inline-flex items-center gap-2 px-6 h-11 rounded-xl text-sm font-semibold text-white disabled:opacity-60" style={{ background: 'linear-gradient(135deg,#FF6B9D,#FF4D8D)' }}>
            <Save className="w-4 h-4" />{savingCfg ? 'Salvando...' : 'Salvar textos'}
          </button>
        </div>
      )}

      {tab === 'paises' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h3 className="font-semibold mb-4" style={{ color: '#1A1A2E' }}>{editingPais ? 'Editar país' : 'Novo país'}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <input value={paisForm.nome} onChange={e => setPaisForm(f => ({ ...f, nome: e.target.value }))} placeholder="Nome (ex: Brasil)" className="h-11 px-3 rounded-xl border text-sm" style={{ borderColor: '#E5E7EB' }} />
              <input value={paisForm.codigo} onChange={e => setPaisForm(f => ({ ...f, codigo: e.target.value.toUpperCase() }))} placeholder="Código (BR)" maxLength={10} className="h-11 px-3 rounded-xl border text-sm" style={{ borderColor: '#E5E7EB' }} />
              <select value={paisForm.moeda} onChange={e => setPaisForm(f => ({ ...f, moeda: e.target.value }))} className="h-11 px-3 rounded-xl border text-sm bg-white" style={{ borderColor: '#E5E7EB' }}>
                <option value="BRL">BRL</option><option value="USD">USD</option><option value="KRW">KRW</option><option value="EUR">EUR</option>
              </select>
              <input value={paisForm.ordem} onChange={e => setPaisForm(f => ({ ...f, ordem: e.target.value }))} type="number" placeholder="Ordem" className="h-11 px-3 rounded-xl border text-sm" style={{ borderColor: '#E5E7EB' }} />
            </div>
            <div className="flex items-center gap-3 mt-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={paisForm.ativo} onChange={e => setPaisForm(f => ({ ...f, ativo: e.target.checked }))} /> Ativo</label>
              <button type="button" onClick={criarPais} className="ml-auto inline-flex items-center gap-2 px-5 h-10 rounded-xl text-sm font-semibold text-white" style={{ background: '#FF6B9D' }}><Save className="w-4 h-4" />{editingPais ? 'Salvar' : 'Adicionar'}</button>
              {editingPais && <button type="button" onClick={() => { setEditingPais(null); setPaisForm({ nome: '', codigo: '', moeda: 'BRL', ordem: '0', ativo: true }) }} className="px-4 h-10 rounded-xl border text-sm" style={{ borderColor: '#E5E7EB' }}>Cancelar</button>}
            </div>
          </div>
          <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr style={{ background: '#F9FAFB' }}><th className="text-left px-4 py-3 text-xs" style={{ color: '#9CA3AF' }}>País</th><th className="text-left px-4 py-3 text-xs" style={{ color: '#9CA3AF' }}>Código</th><th className="text-left px-4 py-3 text-xs" style={{ color: '#9CA3AF' }}>Moeda</th><th className="text-left px-4 py-3 text-xs" style={{ color: '#9CA3AF' }}>Ordem</th><th className="text-right px-4 py-3 text-xs" style={{ color: '#9CA3AF' }}>Ações</th></tr></thead>
                <tbody>
                  {paises.map(p => (
                    <tr key={p.id} className="border-t" style={{ borderColor: '#F3F4F6' }}>
                      <td className="px-4 py-3 text-sm font-medium" style={{ color: '#1A1A2E' }}>{p.nome} {!p.ativo && <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-gray-100" style={{ color: '#9CA3AF' }}>inativo</span>}</td>
                      <td className="px-4 py-3 text-sm" style={{ color: '#6B7280' }}>{p.codigo}</td>
                      <td className="px-4 py-3 text-sm" style={{ color: '#6B7280' }}>{p.moeda}</td>
                      <td className="px-4 py-3 text-sm" style={{ color: '#6B7280' }}>{p.ordem}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <button type="button" onClick={() => togglePais(p)} className="p-1.5 rounded-lg hover:bg-gray-100">{p.ativo ? <ToggleRight className="w-6 h-6 text-green-600" /> : <ToggleLeft className="w-6 h-6 text-gray-400" />}</button>
                          <button type="button" onClick={() => { setEditingPais(p); setPaisForm({ nome: p.nome, codigo: p.codigo, moeda: p.moeda, ordem: String(p.ordem), ativo: p.ativo }) }} className="p-1.5 rounded-lg hover:bg-gray-100"><Pencil className="w-4 h-4" style={{ color: '#6B7280' }} /></button>
                          <button type="button" onClick={() => excluirPais(p.id)} className="p-1.5 rounded-lg hover:bg-red-50"><Trash2 className="w-4 h-4 text-red-500" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {paises.length === 0 && <tr><td colSpan={5} className="px-4 py-10 text-center text-sm" style={{ color: '#9CA3AF' }}>Nenhum país cadastrado</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === 'caixas' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h3 className="font-semibold mb-4" style={{ color: '#1A1A2E' }}>{editingCaixa ? 'Editar caixa' : 'Nova caixa padrão'}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input value={caixaForm.nome} onChange={e => setCaixaForm(f => ({ ...f, nome: e.target.value }))} placeholder="Nome (ex: Caixa Média)" className="h-11 px-3 rounded-xl border text-sm" style={{ borderColor: '#E5E7EB' }} />
              <input value={caixaForm.ordem} onChange={e => setCaixaForm(f => ({ ...f, ordem: e.target.value }))} type="number" placeholder="Ordem" className="h-11 px-3 rounded-xl border text-sm" style={{ borderColor: '#E5E7EB' }} />
              <input value={caixaForm.descricao} onChange={e => setCaixaForm(f => ({ ...f, descricao: e.target.value }))} placeholder="Descrição (opcional)" className="sm:col-span-2 h-11 px-3 rounded-xl border text-sm" style={{ borderColor: '#E5E7EB' }} />
              <input value={caixaForm.comprimento} onChange={e => setCaixaForm(f => ({ ...f, comprimento: e.target.value }))} type="number" step="0.1" placeholder="Comprimento (cm)" className="h-11 px-3 rounded-xl border text-sm" style={{ borderColor: '#E5E7EB' }} />
              <input value={caixaForm.largura} onChange={e => setCaixaForm(f => ({ ...f, largura: e.target.value }))} type="number" step="0.1" placeholder="Largura (cm)" className="h-11 px-3 rounded-xl border text-sm" style={{ borderColor: '#E5E7EB' }} />
              <input value={caixaForm.altura} onChange={e => setCaixaForm(f => ({ ...f, altura: e.target.value }))} type="number" step="0.1" placeholder="Altura (cm)" className="h-11 px-3 rounded-xl border text-sm" style={{ borderColor: '#E5E7EB' }} />
              <input value={caixaForm.pesoMax} onChange={e => setCaixaForm(f => ({ ...f, pesoMax: e.target.value }))} type="number" step="0.01" placeholder="Peso máx. (kg)" className="h-11 px-3 rounded-xl border text-sm" style={{ borderColor: '#E5E7EB' }} />
            </div>
            <div className="flex items-center gap-3 mt-4">
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={caixaForm.ativo} onChange={e => setCaixaForm(f => ({ ...f, ativo: e.target.checked }))} /> Ativo</label>
              <button type="button" onClick={criarCaixa} className="ml-auto inline-flex items-center gap-2 px-5 h-10 rounded-xl text-sm font-semibold text-white" style={{ background: '#FF6B9D' }}><Save className="w-4 h-4" />{editingCaixa ? 'Salvar' : 'Adicionar'}</button>
              {editingCaixa && <button type="button" onClick={() => { setEditingCaixa(null); setCaixaForm({ nome: '', descricao: '', comprimento: '', largura: '', altura: '', pesoMax: '', ordem: '0', ativo: true }) }} className="px-4 h-10 rounded-xl border text-sm">Cancelar</button>}
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {caixas.map(c => (
              <div key={c.id} className="bg-white rounded-2xl p-4 flex gap-4" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)', opacity: c.ativo ? 1 : 0.6 }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#FFF1F5' }}><Package className="w-6 h-6" style={{ color: '#FF6B9D' }} /></div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm" style={{ color: '#1A1A2E' }}>{c.nome} <span className="text-xs font-normal" style={{ color: '#9CA3AF' }}>#{c.ordem}</span></p>
                  <p className="text-xs" style={{ color: '#6B7280' }}>{[c.comprimento && `${c.comprimento}cm`, c.largura && `${c.largura}cm`, c.altura && `${c.altura}cm`].filter(Boolean).join(' × ') || 'Medidas não informadas'} {c.pesoMax ? `• até ${c.pesoMax}kg` : ''}</p>
                  {c.descricao && <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>{c.descricao}</p>}
                </div>
                <div className="flex flex-col gap-1 shrink-0">
                  <button type="button" onClick={() => { setEditingCaixa(c); setCaixaForm({ nome: c.nome, descricao: c.descricao ?? '', comprimento: c.comprimento != null ? String(c.comprimento) : '', largura: c.largura != null ? String(c.largura) : '', altura: c.altura != null ? String(c.altura) : '', pesoMax: c.pesoMax != null ? String(c.pesoMax) : '', ordem: String(c.ordem), ativo: c.ativo }) }} className="p-1.5 rounded-lg hover:bg-gray-100"><Pencil className="w-4 h-4" style={{ color: '#6B7280' }} /></button>
                  <button type="button" onClick={async () => { const res = await fetch(`/api/frete/caixas/${c.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ativo: !c.ativo }) }); if (res.ok) { const d = await res.json(); setCaixas(cs => cs.map(x => x.id === c.id ? d : x)) } }} className="p-1.5 rounded-lg hover:bg-gray-100">{c.ativo ? <ToggleRight className="w-6 h-6 text-green-600" /> : <ToggleLeft className="w-6 h-6 text-gray-400" />}</button>
                  <button type="button" onClick={() => excluirCaixa(c.id)} className="p-1.5 rounded-lg hover:bg-red-50"><Trash2 className="w-4 h-4 text-red-500" /></button>
                </div>
              </div>
            ))}
            {caixas.length === 0 && <p className="text-sm col-span-2 text-center py-8" style={{ color: '#9CA3AF' }}>Nenhuma caixa cadastrada</p>}
          </div>
        </div>
      )}

      {tab === 'tarifas' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h3 className="font-semibold mb-4" style={{ color: '#1A1A2E' }}>{editingTarifa ? 'Editar tarifa' : 'Nova tarifa (país + peso + caixa = valor)'}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <select value={tarifaForm.paisId} onChange={e => setTarifaForm(f => ({ ...f, paisId: e.target.value }))} className="h-11 px-3 rounded-xl border text-sm bg-white" style={{ borderColor: '#E5E7EB' }}>
                <option value="">Selecione o país *</option>
                {paises.map(p => <option key={p.id} value={p.id}>{p.nome} ({p.codigo})</option>)}
              </select>
              <select value={tarifaForm.caixaTipoId} onChange={e => setTarifaForm(f => ({ ...f, caixaTipoId: e.target.value }))} className="h-11 px-3 rounded-xl border text-sm bg-white" style={{ borderColor: '#E5E7EB' }}>
                <option value="">Qualquer caixa (genérica)</option>
                {caixas.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
              <select value={tarifaForm.moeda} onChange={e => setTarifaForm(f => ({ ...f, moeda: e.target.value }))} className="h-11 px-3 rounded-xl border text-sm bg-white" style={{ borderColor: '#E5E7EB' }}>
                <option value="BRL">BRL</option><option value="USD">USD</option><option value="KRW">KRW</option><option value="EUR">EUR</option>
              </select>
              <input value={tarifaForm.pesoMin} onChange={e => setTarifaForm(f => ({ ...f, pesoMin: e.target.value }))} type="number" step="0.01" placeholder="Peso mín (kg) *" className="h-11 px-3 rounded-xl border text-sm" style={{ borderColor: '#E5E7EB' }} />
              <input value={tarifaForm.pesoMax} onChange={e => setTarifaForm(f => ({ ...f, pesoMax: e.target.value }))} type="number" step="0.01" placeholder="Peso máx (kg) *" className="h-11 px-3 rounded-xl border text-sm" style={{ borderColor: '#E5E7EB' }} />
              <input value={tarifaForm.valor} onChange={e => setTarifaForm(f => ({ ...f, valor: e.target.value }))} type="number" step="0.01" placeholder="Valor do frete *" className="h-11 px-3 rounded-xl border text-sm" style={{ borderColor: '#E5E7EB' }} />
              <input value={tarifaForm.taxaServico} onChange={e => setTarifaForm(f => ({ ...f, taxaServico: e.target.value }))} type="number" step="0.01" placeholder="Taxa serviço (opcional)" className="h-11 px-3 rounded-xl border text-sm" style={{ borderColor: '#E5E7EB' }} />
            </div>
            <div className="flex items-center gap-3 mt-4">
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={tarifaForm.ativo} onChange={e => setTarifaForm(f => ({ ...f, ativo: e.target.checked }))} /> Ativo</label>
              <button type="button" onClick={criarTarifa} className="ml-auto inline-flex items-center gap-2 px-5 h-10 rounded-xl text-sm font-semibold text-white" style={{ background: '#FF6B9D' }}><Save className="w-4 h-4" />{editingTarifa ? 'Salvar' : 'Adicionar tarifa'}</button>
              {editingTarifa && <button type="button" onClick={() => { setEditingTarifa(null); setTarifaForm({ paisId: '', caixaTipoId: '', pesoMin: '', pesoMax: '', valor: '', moeda: 'BRL', taxaServico: '0', ativo: true }) }} className="px-4 h-10 rounded-xl border text-sm">Cancelar</button>}
            </div>
            <p className="text-xs mt-3" style={{ color: '#9CA3AF' }}>Dica: cadastre faixas sem sobreposição. Ex: 0.01–1kg = 80, 1.01–3kg = 120. Use “Qualquer caixa” para tarifa genérica por peso/país.</p>
          </div>

          <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr style={{ background: '#F9FAFB' }}><th className="text-left px-4 py-3 text-xs" style={{ color: '#9CA3AF' }}>País</th><th className="text-left px-4 py-3 text-xs" style={{ color: '#9CA3AF' }}>Caixa</th><th className="text-left px-4 py-3 text-xs" style={{ color: '#9CA3AF' }}>Peso</th><th className="text-left px-4 py-3 text-xs" style={{ color: '#9CA3AF' }}>Valor</th><th className="text-right px-4 py-3 text-xs" style={{ color: '#9CA3AF' }}>Ações</th></tr></thead>
                <tbody>
                  {tarifas.map(t => (
                    <tr key={t.id} className="border-t" style={{ borderColor: '#F3F4F6', opacity: t.ativo ? 1 : 0.55 }}>
                      <td className="px-4 py-3 text-sm font-medium" style={{ color: '#1A1A2E' }}>{t.pais?.nome ?? t.paisId.slice(0, 6)} <span className="text-xs" style={{ color: '#9CA3AF' }}>{t.pais?.codigo}</span></td>
                      <td className="px-4 py-3 text-sm" style={{ color: '#6B7280' }}>{t.caixaTipo?.nome ?? 'Qualquer'}</td>
                      <td className="px-4 py-3 text-sm" style={{ color: '#6B7280' }}>{t.pesoMin}–{t.pesoMax} kg</td>
                      <td className="px-4 py-3 text-sm font-semibold" style={{ color: '#FF6B9D' }}>{t.moeda} {t.valor.toFixed(2)}{t.taxaServico > 0 ? ` + ${t.taxaServico.toFixed(2)} taxa` : ''}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <button type="button" onClick={() => { setEditingTarifa(t); setTarifaForm({ paisId: t.paisId, caixaTipoId: t.caixaTipoId ?? '', pesoMin: String(t.pesoMin), pesoMax: String(t.pesoMax), valor: String(t.valor), moeda: t.moeda, taxaServico: String(t.taxaServico ?? 0), ativo: t.ativo }) }} className="p-1.5 rounded-lg hover:bg-gray-100"><Pencil className="w-4 h-4" style={{ color: '#6B7280' }} /></button>
                          <button type="button" onClick={() => excluirTarifa(t.id)} className="p-1.5 rounded-lg hover:bg-red-50"><Trash2 className="w-4 h-4 text-red-500" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {tarifas.length === 0 && <tr><td colSpan={5} className="px-4 py-10 text-center text-sm" style={{ color: '#9CA3AF' }}>Nenhuma tarifa cadastrada. Cadastre países e caixas primeiro.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
