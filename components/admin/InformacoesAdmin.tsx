'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Save, Trash2, Archive, ArchiveRestore, Search, Megaphone, Send, Eye } from 'lucide-react'
import Link from 'next/link'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import LinkExtension from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'

type Atualizacao = { id: string; titulo: string; conteudo: string; publicadaEm: string; arquivada: boolean; _count?: { leituras: number } }

function TiptapEditor({ content, onChange }: { content: string; onChange: (html: string) => void }) {
  const editor = useEditor({
    extensions: [StarterKit, Underline, LinkExtension.configure({ openOnClick: false }), TextAlign.configure({ types: ['heading', 'paragraph'] })],
    content: content || '<p></p>',
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: { attributes: { class: 'outline-none min-h-[200px] px-3 py-2 text-sm' } },
  })
  if (!editor) return null
  return (
    <div className="border rounded-xl overflow-hidden" style={{ borderColor: '#E5E7EB' }}>
      <div className="flex flex-wrap gap-1 p-2 border-b bg-gray-50" style={{ borderColor: '#E5E7EB' }}>
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className="px-2 py-1 text-xs rounded border bg-white">B</button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className="px-2 py-1 text-xs rounded border bg-white italic">I</button>
        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className="px-2 py-1 text-xs rounded border bg-white">• Lista</button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className="px-2 py-1 text-xs rounded border bg-white">H2</button>
      </div>
      <div className="termos-content bg-white"><EditorContent editor={editor} /></div>
    </div>
  )
}

export function InformacoesAdmin({ initialAtivas, initialArquivadas }: { initialAtivas: Atualizacao[]; initialArquivadas: Atualizacao[] }) {
  const router = useRouter()
  const [tab, setTab] = useState<'ativas' | 'arquivadas'>(initialArquivadas.length === 0 ? 'ativas' : 'ativas')
  const [busca, setBusca] = useState('')
  const [titulo, setTitulo] = useState('')
  const [conteudo, setConteudo] = useState('')
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState<Atualizacao | null>(null)

  const lista = tab === 'ativas' ? initialAtivas : initialArquivadas
  const filtrada = busca ? lista.filter(a => a.titulo.toLowerCase().includes(busca.toLowerCase())) : lista

  async function criar() {
    if (!titulo.trim() || conteudo.trim().length < 10) return toast.error('Título e conteúdo obrigatórios')
    setSaving(true)
    const body = editing ? { titulo: titulo.trim(), conteudo, arquivada: editing.arquivada } : { titulo: titulo.trim(), conteudo, arquivada: false }
    const url = editing ? `/api/atualizacoes/${editing.id}` : '/api/atualizacoes'
    const method = editing ? 'PATCH' : 'POST'
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    setSaving(false)
    if (!res.ok) { const j = await res.json().catch(() => ({})); return toast.error(j.error ?? 'Erro') }
    toast.success(editing ? 'Atualização editada' : 'Publicada e e-mail enviado a todos os clientes!')
    setTitulo(''); setConteudo(''); setEditing(null); router.refresh()
  }

  async function toggleArquivar(a: Atualizacao) {
    const res = await fetch(`/api/atualizacoes/${a.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ arquivada: !a.arquivada }) })
    if (res.ok) { toast.success(a.arquivada ? 'Desarquivada' : 'Arquivada'); router.refresh() } else toast.error('Erro')
  }

  async function excluir(id: string) {
    if (!confirm('Excluir permanentemente esta atualização?')) return
    const res = await fetch(`/api/atualizacoes/${id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('Excluída'); router.refresh() } else toast.error('Erro')
  }

  async function reenviar(id: string) {
    const res = await fetch(`/api/atualizacoes/${id}/reenviar`, { method: 'POST' })
    if (res.ok) toast.success('E-mail reenviado a todos'); else toast.error('Erro ao reenviar')
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <button type="button" onClick={() => setTab('ativas')} className={`px-4 py-2 rounded-xl text-sm font-medium ${tab === 'ativas' ? 'text-white' : 'bg-white border'}`} style={tab === 'ativas' ? { background: 'linear-gradient(135deg,#FF6B9D,#C77DFF)' } : { borderColor: '#E5E7EB', color: '#6B7280' }}>Ativas ({initialAtivas.length})</button>
        <button type="button" onClick={() => setTab('arquivadas')} className={`px-4 py-2 rounded-xl text-sm font-medium ${tab === 'arquivadas' ? 'text-white' : 'bg-white border'}`} style={tab === 'arquivadas' ? { background: 'linear-gradient(135deg,#FF6B9D,#C77DFF)' } : { borderColor: '#E5E7EB', color: '#6B7280' }}>Arquivadas ({initialArquivadas.length})</button>
      </div>

      <div className="bg-white rounded-2xl p-6" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: '#1A1A2E' }}><Megaphone className="w-5 h-5" style={{ color: '#FF6B9D' }} />{editing ? 'Editar atualização' : 'Nova atualização (publica + e-mail automático)'}</h3>
        <input value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Título (ex: Pausa operacional — 12 a 15/ago)" className="w-full h-11 px-3 rounded-xl border text-sm mb-3" style={{ borderColor: '#E5E7EB' }} />
        <TiptapEditor content={conteudo} onChange={setConteudo} />
        <div className="flex gap-2 mt-4">
          <button type="button" onClick={criar} disabled={saving} className="inline-flex items-center gap-2 px-6 h-11 rounded-xl text-sm font-semibold text-white disabled:opacity-60" style={{ background: 'linear-gradient(135deg,#FF6B9D,#FF4D8D)' }}>
            <Save className="w-4 h-4" />{saving ? 'Salvando...' : editing ? 'Salvar edição' : 'Publicar e enviar e-mail'}
          </button>
          {editing && <button type="button" onClick={() => { setEditing(null); setTitulo(''); setConteudo('') }} className="px-4 h-11 rounded-xl border text-sm">Cancelar</button>}
        </div>
        {!editing && <p className="text-xs mt-2" style={{ color: '#9CA3AF' }}>Ao publicar, e-mail automático será enviado a todos os clientes cadastrados.</p>}
      </div>

      <div className="flex gap-2 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9CA3AF' }} />
          <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar atualização por título..." className="h-10 w-full rounded-xl border pl-9 pr-3 text-sm" style={{ borderColor: '#E5E7EB' }} />
        </div>
      </div>

      <div className="space-y-3">
        {filtrada.map(a => (
          <div key={a.id} className="bg-white rounded-2xl p-5" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm" style={{ color: '#1A1A2E' }}>{a.titulo}</h4>
                <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>
                  {new Date(a.publicadaEm).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })} • {new Date(a.publicadaEm).getFullYear()} • {a.arquivada ? 'Arquivada' : 'Ativa'} • {a._count?.leituras ?? 0} confirmações
                </p>
                <div className="mt-3 termos-content text-sm" dangerouslySetInnerHTML={{ __html: a.conteudo }} />
              </div>
              <div className="flex flex-col gap-1 shrink-0">
                <Link href={`/admin/informacoes/${a.id}`} className="p-2 rounded-lg hover:bg-gray-100 flex items-center justify-center" title="Ver leituras"><Eye className="w-4 h-4" style={{ color: '#6B7280' }} /></Link>
                <button type="button" onClick={() => { setEditing(a); setTitulo(a.titulo); setConteudo(a.conteudo); window.scrollTo({ top: 0, behavior: 'smooth' }) }} className="p-2 rounded-lg hover:bg-gray-100" title="Editar"><Save className="w-4 h-4" style={{ color: '#6B7280' }} /></button>
                <button type="button" onClick={() => toggleArquivar(a)} className="p-2 rounded-lg hover:bg-gray-100" title={a.arquivada ? 'Desarquivar' : 'Arquivar'}>{a.arquivada ? <ArchiveRestore className="w-4 h-4" style={{ color: '#6B7280' }} /> : <Archive className="w-4 h-4" style={{ color: '#6B7280' }} />}</button>
                <button type="button" onClick={() => reenviar(a.id)} className="p-2 rounded-lg hover:bg-gray-100" title="Reenviar e-mail"><Send className="w-4 h-4" style={{ color: '#6B7280' }} /></button>
                <button type="button" onClick={() => excluir(a.id)} className="p-2 rounded-lg hover:bg-red-50" title="Excluir"><Trash2 className="w-4 h-4 text-red-500" /></button>
              </div>
            </div>
          </div>
        ))}
        {filtrada.length === 0 && <p className="text-sm text-center py-8" style={{ color: '#9CA3AF' }}>Nenhuma atualização encontrada.</p>}
      </div>
    </div>
  )
}
