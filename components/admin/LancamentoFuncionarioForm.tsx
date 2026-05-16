'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function LancamentoFuncionarioForm({ funcionarioId }: { funcionarioId: string }) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [arquivoAtestado, setArquivoAtestado] = useState('')
  const [form, setForm] = useState({
    tipo: 'PAGAMENTO',
    dataReferencia: new Date().toISOString().slice(0, 10),
    valor: '',
    horas: '',
    quantidadeDias: '',
    descricao: '',
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('arquivo', file)

      const res = await fetch(`/api/admin/funcionarios/${funcionarioId}/upload-atestado`, {
        method: 'POST',
        body: formData,
      })

      const json = await res.json()
      if (!res.ok) {
        toast.error(json.error ?? 'Erro ao enviar arquivo.')
        return
      }

      setArquivoAtestado(json.arquivoUrl)
      toast.success('Arquivo enviado com sucesso!')
    } catch {
      toast.error('Erro de conexão no upload.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function salvar() {
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/funcionarios/${funcionarioId}/lancamentos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: form.tipo,
          dataReferencia: form.dataReferencia,
          valor: form.valor ? Number(form.valor) : null,
          horas: form.horas ? Number(form.horas) : null,
          quantidadeDias: form.quantidadeDias ? Number(form.quantidadeDias) : null,
          descricao: form.descricao.trim() || undefined,
          arquivoAtestado: arquivoAtestado || undefined,
        }),
      })

      const json = await res.json()
      if (!res.ok) {
        toast.error(json.message ?? json.error ?? 'Erro ao registrar lançamento.')
        return
      }

      toast.success('Lançamento registrado com sucesso!')
      setForm({
        tipo: 'PAGAMENTO',
        dataReferencia: new Date().toISOString().slice(0, 10),
        valor: '',
        horas: '',
        quantidadeDias: '',
        descricao: '',
      })
      setArquivoAtestado('')
      router.refresh()
    } catch {
      toast.error('Erro de conexão. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  const exibeValor = form.tipo === 'PAGAMENTO' || form.tipo === 'HORA_EXTRA' || form.tipo === 'DESCONTO'
  const exibeHoras = form.tipo === 'HORA_EXTRA'
  const exibeDias = form.tipo === 'ATESTADO'

  return (
    <div className="bg-white rounded-2xl p-6" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
      <h2 className="font-semibold mb-4" style={{ color: '#1A1A2E' }}>Novo lançamento</h2>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium" style={{ color: '#374151' }}>Tipo</Label>
            <select name="tipo" value={form.tipo} onChange={handleChange} className="w-full h-11 mt-1.5 px-3 rounded-lg border text-sm focus:outline-none focus:ring-2" style={{ borderRadius: '8px', borderColor: '#E5E7EB', color: '#1A1A2E' }}>
              <option value="PAGAMENTO">Pagamento</option>
              <option value="HORA_EXTRA">Hora extra</option>
              <option value="ATESTADO">Atestado</option>
              <option value="DESCONTO">Desconto</option>
              <option value="OBSERVACAO">Observação</option>
            </select>
          </div>
          <div>
            <Label className="text-sm font-medium" style={{ color: '#374151' }}>Data de referência</Label>
            <Input name="dataReferencia" type="date" value={form.dataReferencia} onChange={handleChange} className="h-11 mt-1.5" style={{ borderRadius: '8px' }} />
          </div>
        </div>

        {(exibeValor || exibeHoras || exibeDias) && (
          <div className="grid grid-cols-3 gap-4">
            {exibeValor && (
              <div>
                <Label className="text-sm font-medium" style={{ color: '#374151' }}>Valor</Label>
                <Input name="valor" type="number" step="0.01" value={form.valor} onChange={handleChange} className="h-11 mt-1.5" style={{ borderRadius: '8px' }} />
              </div>
            )}
            {exibeHoras && (
              <div>
                <Label className="text-sm font-medium" style={{ color: '#374151' }}>Horas</Label>
                <Input name="horas" type="number" step="0.01" value={form.horas} onChange={handleChange} className="h-11 mt-1.5" style={{ borderRadius: '8px' }} />
              </div>
            )}
            {exibeDias && (
              <div>
                <Label className="text-sm font-medium" style={{ color: '#374151' }}>Dias</Label>
                <Input name="quantidadeDias" type="number" min="0" value={form.quantidadeDias} onChange={handleChange} className="h-11 mt-1.5" style={{ borderRadius: '8px' }} />
              </div>
            )}
          </div>
        )}

        {form.tipo === 'ATESTADO' && (
          <div>
            <Label className="text-sm font-medium" style={{ color: '#374151' }}>Arquivo do atestado</Label>
            <label className="flex flex-col items-center justify-center gap-2 p-5 rounded-xl border-2 border-dashed cursor-pointer transition-colors hover:bg-gray-50 mt-1.5" style={{ borderColor: '#E5E7EB' }}>
              <span className="text-sm" style={{ color: '#9CA3AF' }}>{uploading ? 'Enviando...' : 'Clique para anexar o atestado'}</span>
              <input ref={fileInputRef} type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
            </label>
            {arquivoAtestado && <p className="text-xs mt-2" style={{ color: '#16A34A' }}>Arquivo anexado com sucesso.</p>}
          </div>
        )}

        <div>
          <Label className="text-sm font-medium" style={{ color: '#374151' }}>Descrição</Label>
          <textarea name="descricao" value={form.descricao} onChange={handleChange} rows={3} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm mt-1.5 resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" style={{ borderRadius: '8px' }} />
        </div>
      </div>

      <Button type="button" onClick={salvar} disabled={saving || uploading} className="w-full h-11 font-semibold text-white mt-6" style={{ background: 'linear-gradient(135deg, #FF6B9D, #FF4D8D)', borderRadius: '10px' }}>
        {saving ? 'Salvando...' : 'Registrar lançamento'}
      </Button>
    </div>
  )
}
