'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Settings, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Configuracao {
  id: string
  diasGratuitos: number
  taxaDiariaArmazem: number
  moedaTaxa: string
  nomeEmpresa: string
  emailContato: string | null
}

interface Props {
  config: Configuracao
}

export function ConfiguracoesForm({ config }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    nomeEmpresa: config.nomeEmpresa,
    emailContato: config.emailContato ?? '',
    diasGratuitos: String(config.diasGratuitos),
    taxaDiariaArmazem: String(config.taxaDiariaArmazem),
    moedaTaxa: config.moedaTaxa,
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/admin/configuracoes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nomeEmpresa: form.nomeEmpresa,
          emailContato: form.emailContato || null,
          diasGratuitos: parseInt(form.diasGratuitos),
          taxaDiariaArmazem: parseFloat(form.taxaDiariaArmazem),
          moedaTaxa: form.moedaTaxa,
        }),
      })
      if (res.ok) {
        toast.success('Configurações salvas com sucesso!')
        router.refresh()
      } else {
        const json = await res.json() as { error?: string }
        toast.error(json.error ?? 'Erro ao salvar')
      }
    } catch {
      toast.error('Erro de conexão')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="bg-white rounded-2xl p-6" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <h2 className="font-semibold mb-4 flex items-center gap-2" style={{ color: '#1A1A2E' }}>
          <Settings className="w-4 h-4" style={{ color: '#FF6B9D' }} />
          Empresa
        </h2>
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium" style={{ color: '#374151' }}>Nome da empresa</Label>
            <Input
              name="nomeEmpresa"
              value={form.nomeEmpresa}
              onChange={handleChange}
              className="h-11 mt-1.5"
              style={{ borderRadius: '8px' }}
            />
          </div>
          <div>
            <Label className="text-sm font-medium" style={{ color: '#374151' }}>Email de contato</Label>
            <Input
              name="emailContato"
              type="email"
              value={form.emailContato}
              onChange={handleChange}
              placeholder="contato@suitemanager.com"
              className="h-11 mt-1.5"
              style={{ borderRadius: '8px' }}
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <h2 className="font-semibold mb-4" style={{ color: '#1A1A2E' }}>Armazenagem</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium" style={{ color: '#374151' }}>Dias gratuitos</Label>
            <Input
              name="diasGratuitos"
              type="number"
              min="0"
              value={form.diasGratuitos}
              onChange={handleChange}
              className="h-11 mt-1.5"
              style={{ borderRadius: '8px' }}
            />
            <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>Período sem cobrança</p>
          </div>
          <div>
            <Label className="text-sm font-medium" style={{ color: '#374151' }}>Taxa diária</Label>
            <Input
              name="taxaDiariaArmazem"
              type="number"
              step="0.01"
              min="0"
              value={form.taxaDiariaArmazem}
              onChange={handleChange}
              className="h-11 mt-1.5"
              style={{ borderRadius: '8px' }}
            />
            <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>Após o período gratuito</p>
          </div>
          <div>
            <Label className="text-sm font-medium" style={{ color: '#374151' }}>Moeda</Label>
            <select
              name="moedaTaxa"
              value={form.moedaTaxa}
              onChange={handleChange}
              className="w-full h-11 mt-1.5 px-3 rounded-lg border text-sm focus:outline-none focus:ring-2"
              style={{ borderRadius: '8px', borderColor: '#E5E7EB', color: '#1A1A2E' }}
            >
              <option value="USD">USD</option>
              <option value="KRW">KRW</option>
              <option value="BRL">BRL</option>
              <option value="EUR">EUR</option>
            </select>
          </div>
        </div>
      </div>

      <Button
        type="submit"
        disabled={saving}
        className="flex items-center gap-2 font-semibold text-white rounded-xl"
        style={{ background: 'linear-gradient(135deg, #FF6B9D, #FF4D8D)', borderRadius: '10px' }}
      >
        <Save className="w-4 h-4" />
        {saving ? 'Salvando...' : 'Salvar configurações'}
      </Button>
    </form>
  )
}
