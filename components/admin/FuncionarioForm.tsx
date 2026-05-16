'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Props {
  funcionario?: {
    id: string
    nomeCompleto: string
    email: string | null
    telefone: string | null
    cargo: string | null
    dataAdmissao: string | null
    salarioBase: number | null
    status: string
    observacoes: string | null
  }
}

export function FuncionarioForm({ funcionario }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    nomeCompleto: funcionario?.nomeCompleto ?? '',
    email: funcionario?.email ?? '',
    telefone: funcionario?.telefone ?? '',
    cargo: funcionario?.cargo ?? '',
    dataAdmissao: funcionario?.dataAdmissao ? new Date(funcionario.dataAdmissao).toISOString().slice(0, 10) : '',
    salarioBase: funcionario?.salarioBase?.toString() ?? '',
    status: funcionario?.status ?? 'ATIVO',
    observacoes: funcionario?.observacoes ?? '',
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function salvar() {
    if (!form.nomeCompleto.trim()) {
      toast.error('Informe o nome do funcionário.')
      return
    }

    setSaving(true)
    try {
      const res = await fetch(funcionario ? `/api/admin/funcionarios/${funcionario.id}` : '/api/admin/funcionarios', {
        method: funcionario ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nomeCompleto: form.nomeCompleto.trim(),
          email: form.email.trim() || undefined,
          telefone: form.telefone.trim() || undefined,
          cargo: form.cargo.trim() || undefined,
          dataAdmissao: form.dataAdmissao || undefined,
          salarioBase: form.salarioBase ? Number(form.salarioBase) : null,
          status: form.status,
          observacoes: form.observacoes.trim() || undefined,
        }),
      })

      const json = await res.json()
      if (!res.ok) {
        toast.error(json.message ?? json.error ?? 'Erro ao salvar funcionário.')
        return
      }

      toast.success(funcionario ? 'Funcionário atualizado!' : 'Funcionário cadastrado!')
      router.push(funcionario ? `/admin/funcionarios/${funcionario.id}` : `/admin/funcionarios/${json.id}`)
      router.refresh()
    } catch {
      toast.error('Erro de conexão. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl p-6" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <Label className="text-sm font-medium" style={{ color: '#374151' }}>Nome completo *</Label>
          <Input name="nomeCompleto" value={form.nomeCompleto} onChange={handleChange} className="h-11 mt-1.5" style={{ borderRadius: '8px' }} />
        </div>
        <div>
          <Label className="text-sm font-medium" style={{ color: '#374151' }}>Email</Label>
          <Input name="email" type="email" value={form.email} onChange={handleChange} className="h-11 mt-1.5" style={{ borderRadius: '8px' }} />
        </div>
        <div>
          <Label className="text-sm font-medium" style={{ color: '#374151' }}>Telefone</Label>
          <Input name="telefone" value={form.telefone} onChange={handleChange} className="h-11 mt-1.5" style={{ borderRadius: '8px' }} />
        </div>
        <div>
          <Label className="text-sm font-medium" style={{ color: '#374151' }}>Cargo</Label>
          <Input name="cargo" value={form.cargo} onChange={handleChange} className="h-11 mt-1.5" style={{ borderRadius: '8px' }} />
        </div>
        <div>
          <Label className="text-sm font-medium" style={{ color: '#374151' }}>Data de admissão</Label>
          <Input name="dataAdmissao" type="date" value={form.dataAdmissao} onChange={handleChange} className="h-11 mt-1.5" style={{ borderRadius: '8px' }} />
        </div>
        <div>
          <Label className="text-sm font-medium" style={{ color: '#374151' }}>Salário base</Label>
          <Input name="salarioBase" type="number" step="0.01" value={form.salarioBase} onChange={handleChange} className="h-11 mt-1.5" style={{ borderRadius: '8px' }} />
        </div>
        <div>
          <Label className="text-sm font-medium" style={{ color: '#374151' }}>Status</Label>
          <select name="status" value={form.status} onChange={handleChange} className="w-full h-11 mt-1.5 px-3 rounded-lg border text-sm focus:outline-none focus:ring-2" style={{ borderRadius: '8px', borderColor: '#E5E7EB', color: '#1A1A2E' }}>
            <option value="ATIVO">Ativo</option>
            <option value="INATIVO">Inativo</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <Label className="text-sm font-medium" style={{ color: '#374151' }}>Observações</Label>
          <textarea name="observacoes" value={form.observacoes} onChange={handleChange} rows={4} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm mt-1.5 resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" style={{ borderRadius: '8px' }} />
        </div>
      </div>

      <Button type="button" onClick={salvar} disabled={saving} className="w-full h-11 font-semibold text-white mt-6" style={{ background: 'linear-gradient(135deg, #FF6B9D, #FF4D8D)', borderRadius: '10px' }}>
        {saving ? 'Salvando...' : 'Salvar funcionário'}
      </Button>
    </div>
  )
}
