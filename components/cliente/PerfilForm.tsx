'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { User, Phone, Globe, MapPin, Save } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const perfilSchema = z.object({
  nomeCompleto: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  telefone: z.string().min(8, 'Telefone deve ter ao menos 8 caracteres'),
  pais: z.string().min(2, 'País deve ter ao menos 2 caracteres'),
  endereco: z.string().optional(),
  cidade: z.string().optional(),
  cep: z.string().optional(),
})

type PerfilForm = z.infer<typeof perfilSchema>

interface PerfilFormProps {
  clienteId: string
  defaultValues: PerfilForm
}

export function PerfilForm({ clienteId, defaultValues }: PerfilFormProps) {
  const [saving, setSaving] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PerfilForm>({
    resolver: zodResolver(perfilSchema),
    defaultValues,
  })

  async function onSubmit(data: PerfilForm) {
    setSaving(true)
    try {
      const res = await fetch(`/api/clientes/${clienteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const json = await res.json() as { error?: string }
        toast.error(json.error ?? 'Erro ao salvar')
        return
      }
      toast.success('Perfil atualizado com sucesso!')
    } catch {
      toast.error('Erro de conexão. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl p-6" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <Label className="text-sm font-medium" style={{ color: '#374151' }}>Nome completo</Label>
          <div className="relative mt-1.5">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9CA3AF' }} />
            <Input
              placeholder="Seu nome"
              className="pl-10 h-11"
              style={{ borderRadius: '8px' }}
              {...register('nomeCompleto')}
            />
          </div>
          {errors.nomeCompleto && (
            <p className="text-xs mt-1" style={{ color: '#EF4444' }}>{errors.nomeCompleto.message}</p>
          )}
        </div>

        <div>
          <Label className="text-sm font-medium" style={{ color: '#374151' }}>WhatsApp / Telefone</Label>
          <div className="relative mt-1.5">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9CA3AF' }} />
            <Input
              type="tel"
              placeholder="+55 11 99999-9999"
              className="pl-10 h-11"
              style={{ borderRadius: '8px' }}
              {...register('telefone')}
            />
          </div>
          {errors.telefone && (
            <p className="text-xs mt-1" style={{ color: '#EF4444' }}>{errors.telefone.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium" style={{ color: '#374151' }}>País</Label>
            <div className="relative mt-1.5">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9CA3AF' }} />
              <Input
                placeholder="Brazil"
                className="pl-10 h-11"
                style={{ borderRadius: '8px' }}
                {...register('pais')}
              />
            </div>
            {errors.pais && (
              <p className="text-xs mt-1" style={{ color: '#EF4444' }}>{errors.pais.message}</p>
            )}
          </div>
          <div>
            <Label className="text-sm font-medium" style={{ color: '#374151' }}>Cidade</Label>
            <div className="relative mt-1.5">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9CA3AF' }} />
              <Input
                placeholder="São Paulo"
                className="pl-10 h-11"
                style={{ borderRadius: '8px' }}
                {...register('cidade')}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium" style={{ color: '#374151' }}>Endereço</Label>
            <Input
              placeholder="Rua, número, bairro"
              className="h-11 mt-1.5"
              style={{ borderRadius: '8px' }}
              {...register('endereco')}
            />
          </div>
          <div>
            <Label className="text-sm font-medium" style={{ color: '#374151' }}>CEP</Label>
            <Input
              placeholder="00000-000"
              className="h-11 mt-1.5"
              style={{ borderRadius: '8px' }}
              {...register('cep')}
            />
          </div>
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 font-semibold text-white"
            style={{
              background: 'linear-gradient(135deg, #FF6B9D, #FF4D8D)',
              borderRadius: '10px',
            }}
          >
            <Save className="w-4 h-4" />
            {saving ? 'Salvando...' : 'Salvar alterações'}
          </Button>
        </div>
      </form>
    </div>
  )
}
