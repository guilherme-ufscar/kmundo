'use client'

import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { User, Phone, Globe, MapPin, Save, Loader2, Camera, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { clientePerfilSchema } from '@/lib/validations/cliente'

type PerfilForm = z.infer<typeof clientePerfilSchema>

interface PerfilFormProps {
  clienteId: string
  defaultValues: PerfilForm
}

export function PerfilForm({ clienteId, defaultValues }: PerfilFormProps) {
  const [saving, setSaving] = useState(false)
  const [buscandoCep, setBuscandoCep] = useState(false)
  const [uploadingFoto, setUploadingFoto] = useState(false)
  const [fotoPerfil, setFotoPerfil] = useState(defaultValues.fotoPerfil ?? '')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<PerfilForm>({
    resolver: zodResolver(clientePerfilSchema),
    defaultValues,
  })

  async function buscarCep(valor: string) {
    const cepLimpo = valor.replace(/\D/g, '')
    if (cepLimpo.length !== 8) return
    setBuscandoCep(true)
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`)
      const json = await res.json()
      if (!json.erro) {
        setValue('endereco', json.logradouro ?? '')
        setValue('bairro', json.bairro ?? '')
        setValue('cidade', json.localidade ?? '')
        setValue('estado', json.uf ?? '')
      }
    } catch {
      // ignore
    } finally {
      setBuscandoCep(false)
    }
  }

  async function handleUploadFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingFoto(true)
    try {
      const formData = new FormData()
      formData.append('foto', file)
      const res = await fetch(`/api/clientes/${clienteId}/foto`, {
        method: 'POST',
        body: formData,
      })
      const json = await res.json() as { fotoPerfil?: string; error?: string }
      if (!res.ok) {
        toast.error(json.error ?? 'Erro ao enviar foto.')
        return
      }
      setFotoPerfil(json.fotoPerfil ?? '')
      toast.success('Foto enviada com sucesso!')
    } catch {
      toast.error('Erro de conexão ao enviar foto.')
    } finally {
      setUploadingFoto(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  function removerFoto() {
    setFotoPerfil('')
  }

  async function onSubmit(data: PerfilForm) {
    setSaving(true)
    try {
      const res = await fetch(`/api/clientes/${clienteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, fotoPerfil: fotoPerfil || null }),
      })
      if (!res.ok) {
        const json = await res.json() as { error?: string; message?: string }
        toast.error(json.message ?? json.error ?? 'Erro ao salvar')
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
          <Label className="text-sm font-medium" style={{ color: '#374151' }}>Foto de perfil</Label>
          <div className="flex items-center gap-4 mt-1.5">
            <div className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center" style={{ background: '#FFF1F5' }}>
              {fotoPerfil ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={fotoPerfil} alt="Foto de perfil" className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8" style={{ color: '#FF6B9D' }} />
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium cursor-pointer" style={{ background: '#FFF1F5', color: '#FF6B9D' }}>
                <Camera className="w-4 h-4" />
                {uploadingFoto ? 'Enviando...' : fotoPerfil ? 'Trocar foto' : 'Adicionar foto'}
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUploadFoto} disabled={uploadingFoto} />
              </label>
              {fotoPerfil && (
                <button type="button" onClick={removerFoto} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium" style={{ background: '#FEF2F2', color: '#EF4444' }}>
                  <X className="w-4 h-4" />
                  Remover foto
                </button>
              )}
            </div>
          </div>
        </div>

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

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium" style={{ color: '#374151' }}>CEP</Label>
            <div className="relative mt-1.5">
              <Input
                placeholder="00000-000"
                className="h-11 pr-10"
                style={{ borderRadius: '8px' }}
                {...register('cep')}
                onBlur={(e) => buscarCep(e.target.value)}
              />
              {buscandoCep && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin" style={{ color: '#9CA3AF' }} />
              )}
            </div>
          </div>
          <div>
            <Label className="text-sm font-medium" style={{ color: '#374151' }}>Estado</Label>
            <Input placeholder="SP" className="h-11 mt-1.5" style={{ borderRadius: '8px' }} {...register('estado')} />
          </div>
          <div className="col-span-2">
            <Label className="text-sm font-medium" style={{ color: '#374151' }}>Endereço</Label>
            <Input placeholder="Rua, avenida..." className="h-11 mt-1.5" style={{ borderRadius: '8px' }} {...register('endereco')} />
          </div>
          <div>
            <Label className="text-sm font-medium" style={{ color: '#374151' }}>Número</Label>
            <Input placeholder="123" className="h-11 mt-1.5" style={{ borderRadius: '8px' }} {...register('numero')} />
          </div>
          <div>
            <Label className="text-sm font-medium" style={{ color: '#374151' }}>Complemento</Label>
            <Input placeholder="Apto, bloco..." className="h-11 mt-1.5" style={{ borderRadius: '8px' }} {...register('complemento')} />
          </div>
          <div>
            <Label className="text-sm font-medium" style={{ color: '#374151' }}>Bairro</Label>
            <Input className="h-11 mt-1.5" style={{ borderRadius: '8px' }} {...register('bairro')} />
          </div>
          <div>
            <Label className="text-sm font-medium" style={{ color: '#374151' }}>Cidade</Label>
            <div className="relative mt-1.5">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9CA3AF' }} />
              <Input placeholder="São Paulo" className="pl-10 h-11" style={{ borderRadius: '8px' }} {...register('cidade')} />
            </div>
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
