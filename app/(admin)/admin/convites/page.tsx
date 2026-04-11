'use client'

import { useState, useEffect, useCallback } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link2, Copy, Check, Plus, Mail, Trash2, RefreshCw, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

const gerarConviteSchema = z.object({
  email: z.string().email('Email inválido').optional().or(z.literal('')),
})
type GerarConviteForm = z.infer<typeof gerarConviteSchema>

interface Convite {
  id: string
  token: string
  email: string | null
  usado: boolean
  expiresAt: string
  criadoEm: string
}

function getStatus(convite: Convite): 'Usado' | 'Expirado' | 'Disponível' {
  if (convite.usado) return 'Usado'
  if (new Date(convite.expiresAt) < new Date()) return 'Expirado'
  return 'Disponível'
}

const statusColors: Record<string, string> = {
  Usado: '#9CA3AF',
  Expirado: '#EF4444',
  Disponível: '#22C55E',
}

export default function ConvitesPage() {
  const [convites, setConvites] = useState<Convite[]>([])
  const [loadingList, setLoadingList] = useState(true)
  const [linkGerado, setLinkGerado] = useState('')
  const [emailEnviado, setEmailEnviado] = useState('')
  const [emailErro, setEmailErro] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [copied, setCopied] = useState(false)
  const [reenviando, setReenviando] = useState<string | null>(null)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<GerarConviteForm>({
    resolver: zodResolver(gerarConviteSchema),
  })

  const fetchConvites = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/convites')
      if (res.ok) {
        const data = await res.json() as Convite[]
        setConvites(data)
      }
    } finally {
      setLoadingList(false)
    }
  }, [])

  useEffect(() => {
    void fetchConvites()
  }, [fetchConvites])

  async function onSubmit(data: GerarConviteForm) {
    setSubmitting(true)
    setLinkGerado('')
    setEmailEnviado('')
    setEmailErro('')
    try {
      const res = await fetch('/api/admin/convites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email ?? '' }),
      })
      const json = await res.json() as { link?: string; error?: string; emailEnviado?: boolean; emailErro?: string }
      if (!res.ok) {
        toast.error(typeof json.error === 'string' ? json.error : 'Erro ao gerar convite')
        return
      }
      setLinkGerado(json.link ?? '')
      if (data.email) {
        if (json.emailEnviado) {
          setEmailEnviado(data.email)
          toast.success(`Convite gerado e email enviado para ${data.email}!`)
        } else {
          setEmailErro(json.emailErro ?? 'Falha ao enviar email')
          toast.error(`Convite criado, mas o email não foi entregue: ${json.emailErro ?? 'erro desconhecido'}`)
        }
      } else {
        toast.success('Convite gerado com sucesso!')
      }
      reset()
      void fetchConvites()
    } catch {
      toast.error('Erro de conexão. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  async function reenviarConvite(id: string, email: string) {
    setReenviando(id)
    try {
      const res = await fetch(`/api/admin/convites/${id}/reenviar`, { method: 'POST' })
      const json = await res.json() as { ok?: boolean; error?: string }
      if (res.ok) {
        toast.success(`Email reenviado para ${email}!`)
      } else {
        toast.error(json.error ?? 'Erro ao reenviar email')
      }
    } catch {
      toast.error('Erro de conexão')
    } finally {
      setReenviando(null)
    }
  }

  async function excluirConvite(id: string) {
    if (!window.confirm('Excluir este convite?')) return
    try {
      const res = await fetch(`/api/admin/convites/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setConvites(prev => prev.filter(c => c.id !== id))
        toast.success('Convite excluído')
      } else {
        toast.error('Erro ao excluir')
      }
    } catch {
      toast.error('Erro de conexão')
    }
  }

  async function copiarLink() {
    await navigator.clipboard.writeText(linkGerado)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#1A1A2E' }}>Convites de Cadastro</h1>
        <p className="text-sm mt-1" style={{ color: '#6B7280' }}>Gere links únicos para novos clientes se cadastrarem</p>
      </div>

      {/* Gerar novo convite */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-base font-semibold mb-4" style={{ color: '#1A1A2E' }}>Gerar novo convite</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col sm:flex-row gap-4 items-start">
          <div className="flex-1">
            <Label className="text-sm font-medium" style={{ color: '#374151' }}>
              Email do cliente <span style={{ color: '#9CA3AF' }}>(opcional)</span>
            </Label>
            <div className="relative mt-1.5">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9CA3AF' }} />
              <Input
                type="email"
                placeholder="cliente@email.com"
                className="pl-10 h-11"
                style={{ borderRadius: '8px' }}
                {...register('email')}
              />
            </div>
            {errors.email && <p className="text-xs mt-1" style={{ color: '#EF4444' }}>{errors.email.message}</p>}
          </div>
          <div className="pt-7">
            <Button
              type="submit"
              disabled={submitting}
              className="h-11 px-6 font-semibold text-white flex items-center gap-2"
              style={{ background: 'linear-gradient(135deg, #FF6B9D, #FF4D8D)', borderRadius: '8px' }}
            >
              <Plus className="w-4 h-4" />
              {submitting ? 'Gerando...' : 'Gerar link de convite'}
            </Button>
          </div>
        </form>

        {linkGerado && (
          <div className="mt-5 space-y-3">
            {emailEnviado && (
              <div className="p-3 rounded-xl flex items-center gap-2" style={{ background: '#EFF6FF', border: '1px solid #BFDBFE' }}>
                <Mail className="w-4 h-4 shrink-0" style={{ color: '#3B82F6' }} />
                <span className="text-sm" style={{ color: '#1D4ED8' }}>
                  Email de convite enviado para <strong>{emailEnviado}</strong>
                </span>
              </div>
            )}
            {emailErro && (
              <div className="p-3 rounded-xl flex items-start gap-2" style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}>
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#EF4444' }} />
                <div>
                  <p className="text-sm font-medium" style={{ color: '#DC2626' }}>Email não foi entregue</p>
                  <p className="text-xs mt-0.5" style={{ color: '#EF4444' }}>{emailErro}</p>
                  <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>Copie o link abaixo e envie manualmente, ou tente reenviar depois pela lista.</p>
                </div>
              </div>
            )}
            <div className="p-4 rounded-xl flex items-center gap-3" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
              <Link2 className="w-5 h-5 shrink-0" style={{ color: '#22C55E' }} />
              <span className="flex-1 text-sm font-mono break-all" style={{ color: '#166534' }}>{linkGerado}</span>
              <button
                onClick={() => void copiarLink()}
                className="shrink-0 p-2 rounded-lg transition-colors hover:bg-green-100"
                title="Copiar link"
              >
                {copied ? <Check className="w-4 h-4" style={{ color: '#22C55E' }} /> : <Copy className="w-4 h-4" style={{ color: '#22C55E' }} />}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Lista de convites */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-base font-semibold" style={{ color: '#1A1A2E' }}>Convites anteriores</h2>
        </div>
        {loadingList ? (
          <div className="p-8 text-center text-sm" style={{ color: '#9CA3AF' }}>Carregando...</div>
        ) : convites.length === 0 ? (
          <div className="p-8 text-center text-sm" style={{ color: '#9CA3AF' }}>Nenhum convite gerado ainda</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid #F3F4F6' }}>
                  <th className="px-6 py-3 text-left font-medium" style={{ color: '#6B7280' }}>Email</th>
                  <th className="px-6 py-3 text-left font-medium" style={{ color: '#6B7280' }}>Link</th>
                  <th className="px-6 py-3 text-left font-medium" style={{ color: '#6B7280' }}>Status</th>
                  <th className="px-6 py-3 text-left font-medium" style={{ color: '#6B7280' }}>Criado em</th>
                  <th className="px-6 py-3 text-left font-medium" style={{ color: '#6B7280' }}>Validade</th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody>
                {convites.map((c) => {
                  const status = getStatus(c)
                  const link = `http://kmundowarehouse.com/cadastro?token=${c.token}`
                  return (
                    <tr key={c.id} style={{ borderBottom: '1px solid #F9FAFB' }}>
                      <td className="px-6 py-4" style={{ color: '#374151' }}>{c.email ?? '—'}</td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs" style={{ color: '#6B7280' }}>
                          {link.length > 50 ? link.slice(0, 50) + '...' : link}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                          style={{ background: `${statusColors[status]}15`, color: statusColors[status] }}
                        >
                          {status}
                        </span>
                      </td>
                      <td className="px-6 py-4" style={{ color: '#6B7280' }}>
                        {new Date(c.criadoEm).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4" style={{ color: '#6B7280' }}>
                        {new Date(c.expiresAt).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {c.email && status === 'Disponível' && (
                            <button
                              onClick={() => void reenviarConvite(c.id, c.email!)}
                              disabled={reenviando === c.id}
                              className="p-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                              title="Reenviar email"
                            >
                              <RefreshCw
                                className={`w-4 h-4 ${reenviando === c.id ? 'animate-spin' : ''}`}
                                style={{ color: '#3B82F6' }}
                              />
                            </button>
                          )}
                          <button
                            onClick={() => void excluirConvite(c.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                            title="Excluir convite"
                          >
                            <Trash2 className="w-4 h-4" style={{ color: '#EF4444' }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
