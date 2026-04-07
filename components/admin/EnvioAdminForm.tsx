'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Camera } from 'lucide-react'

const formSchema = z.object({
  status: z.enum(['AGUARDANDO_CONFIRMACAO', 'CONFIRMADO', 'PAGO', 'ENVIADO', 'ENTREGUE']),
  peso: z.string().optional(),
  largura: z.string().optional(),
  altura: z.string().optional(),
  comprimento: z.string().optional(),
  valorDeclarado: z.string().optional(),
  moeda: z.string().optional(),
  videoUrl: z.string().optional(),
  trackingEnvio: z.string().optional(),
  dataLimitePagamento: z.string().optional(),
  observacoes: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

const statusOpcoes = [
  { value: 'AGUARDANDO_CONFIRMACAO', label: 'Aguardando confirmação', color: '#F59E0B' },
  { value: 'CONFIRMADO', label: 'Confirmado', color: '#3B82F6' },
  { value: 'PAGO', label: 'Pago', color: '#8B5CF6' },
  { value: 'ENVIADO', label: 'Enviado', color: '#FF6B9D' },
  { value: 'ENTREGUE', label: 'Entregue', color: '#22C55E' },
]

interface EnvioData {
  id: string
  status: string
  metodoEnvio: string
  peso: number | null
  largura: number | null
  altura: number | null
  comprimento: number | null
  valorDeclarado: number | null
  moeda: string | null
  videoUrl: string | null
  trackingEnvio: string | null
  dataLimitePagamento: string | null
  observacoes: string | null
}

interface Props {
  envio: EnvioData
}

export function EnvioAdminForm({ envio }: Props) {
  const router = useRouter()
  const [salvando, setSalvando] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { register, handleSubmit } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: envio.status as FormData['status'],
      peso: envio.peso?.toString() ?? '',
      largura: envio.largura?.toString() ?? '',
      altura: envio.altura?.toString() ?? '',
      comprimento: envio.comprimento?.toString() ?? '',
      valorDeclarado: envio.valorDeclarado?.toString() ?? '',
      moeda: envio.moeda ?? 'BRL',
      videoUrl: envio.videoUrl ?? '',
      trackingEnvio: envio.trackingEnvio ?? '',
      dataLimitePagamento: envio.dataLimitePagamento
        ? new Date(envio.dataLimitePagamento).toISOString().slice(0, 10)
        : '',
      observacoes: envio.observacoes ?? '',
    },
  })

  async function onSubmit(data: FormData) {
    setSalvando(true)
    try {
      const body: Record<string, unknown> = { status: data.status }
      if (data.peso) body.peso = parseFloat(data.peso)
      if (data.largura) body.largura = parseFloat(data.largura)
      if (data.altura) body.altura = parseFloat(data.altura)
      if (data.comprimento) body.comprimento = parseFloat(data.comprimento)
      if (data.valorDeclarado && envio.metodoEnvio !== 'ENVIO_EM_GRUPO') {
        body.valorDeclarado = parseFloat(data.valorDeclarado)
        body.moeda = data.moeda || 'BRL'
      }
      if (data.videoUrl) body.videoUrl = data.videoUrl
      if (data.trackingEnvio) body.trackingEnvio = data.trackingEnvio
      if (data.dataLimitePagamento) {
        body.dataLimitePagamento = new Date(data.dataLimitePagamento).toISOString()
      }
      if (data.observacoes) body.observacoes = data.observacoes

      const res = await fetch(`/api/envios/${envio.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        toast.success('Envio atualizado com sucesso!')
        router.refresh()
      } else {
        toast.error('Erro ao atualizar envio')
      }
    } catch {
      toast.error('Erro de conexão')
    } finally {
      setSalvando(false)
    }
  }

  async function handleUploadFotos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    try {
      const formData = new FormData()
      for (const file of Array.from(files)) {
        formData.append('fotos', file)
      }
      const res = await fetch(`/api/envios/${envio.id}/upload`, {
        method: 'POST',
        body: formData,
      })
      if (res.ok) {
        toast.success('Fotos enviadas com sucesso!')
        router.refresh()
      } else {
        toast.error('Erro ao enviar fotos')
      }
    } catch {
      toast.error('Erro de conexão')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Status */}
      <div className="bg-white rounded-2xl p-5" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <h2 className="font-semibold mb-3 text-sm" style={{ color: '#1A1A2E' }}>Status do Envio</h2>
        <div className="space-y-2">
          {statusOpcoes.map((op) => (
            <label
              key={op.value}
              className="flex items-center gap-3 p-3 rounded-xl cursor-pointer border transition-colors"
              style={{ borderColor: '#E5E7EB' }}
            >
              <input
                type="radio"
                value={op.value}
                {...register('status')}
                className="accent-pink-500"
              />
              <span
                className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium text-white"
                style={{ background: op.color }}
              >
                {op.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Dimensões e peso */}
      <div className="bg-white rounded-2xl p-5" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <h2 className="font-semibold mb-3 text-sm" style={{ color: '#1A1A2E' }}>Dimensões e Peso</h2>
        <div className="space-y-3">
          <div>
            <Label className="text-xs" style={{ color: '#374151' }}>Peso (kg)</Label>
            <Input type="number" step="0.01" placeholder="Ex: 2.5" className="h-10 mt-1" style={{ borderRadius: '8px' }} {...register('peso')} />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label className="text-xs" style={{ color: '#374151' }}>Largura</Label>
              <Input type="number" step="0.1" placeholder="cm" className="h-10 mt-1" style={{ borderRadius: '8px' }} {...register('largura')} />
            </div>
            <div>
              <Label className="text-xs" style={{ color: '#374151' }}>Altura</Label>
              <Input type="number" step="0.1" placeholder="cm" className="h-10 mt-1" style={{ borderRadius: '8px' }} {...register('altura')} />
            </div>
            <div>
              <Label className="text-xs" style={{ color: '#374151' }}>Comprimento</Label>
              <Input type="number" step="0.1" placeholder="cm" className="h-10 mt-1" style={{ borderRadius: '8px' }} {...register('comprimento')} />
            </div>
          </div>
        </div>
      </div>

      {/* Valor declarado — não para Envio em Grupo */}
      {envio.metodoEnvio !== 'ENVIO_EM_GRUPO' && (
        <div className="bg-white rounded-2xl p-5" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <h2 className="font-semibold mb-3 text-sm" style={{ color: '#1A1A2E' }}>Valor Declarado</h2>
          <div className="flex gap-2">
            <Input
              type="number"
              step="0.01"
              placeholder="Ex: 50000"
              className="h-10 flex-1"
              style={{ borderRadius: '8px' }}
              {...register('valorDeclarado')}
            />
            <select
              className="h-10 px-2 rounded-lg border text-sm"
              style={{ borderRadius: '8px', borderColor: '#E5E7EB', color: '#1A1A2E' }}
              {...register('moeda')}
            >
              <option value="KRW">KRW</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="BRL">BRL</option>
            </select>
          </div>
        </div>
      )}

      {/* Rastreamento e vídeo */}
      <div className="bg-white rounded-2xl p-5" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <h2 className="font-semibold mb-3 text-sm" style={{ color: '#1A1A2E' }}>Rastreamento e Vídeo</h2>
        <div className="space-y-3">
          <div>
            <Label className="text-xs" style={{ color: '#374151' }}>Número de rastreamento</Label>
            <Input placeholder="Ex: 123456789" className="h-10 mt-1 font-mono" style={{ borderRadius: '8px' }} {...register('trackingEnvio')} />
          </div>
          <div>
            <Label className="text-xs" style={{ color: '#374151' }}>Link do vídeo YouTube</Label>
            <Input placeholder="https://youtube.com/watch?v=..." className="h-10 mt-1" style={{ borderRadius: '8px' }} {...register('videoUrl')} />
          </div>
        </div>
      </div>

      {/* Data limite e observações */}
      <div className="bg-white rounded-2xl p-5" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <h2 className="font-semibold mb-3 text-sm" style={{ color: '#1A1A2E' }}>Pagamento e Observações</h2>
        <div className="space-y-3">
          <div>
            <Label className="text-xs" style={{ color: '#374151' }}>Data limite de pagamento</Label>
            <Input type="date" className="h-10 mt-1" style={{ borderRadius: '8px' }} {...register('dataLimitePagamento')} />
          </div>
          <div>
            <Label className="text-xs" style={{ color: '#374151' }}>Observações</Label>
            <textarea
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm mt-1 resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              rows={3}
              placeholder="Instruções de pagamento, informações adicionais..."
              style={{ borderRadius: '8px' }}
              {...register('observacoes')}
            />
          </div>
        </div>
      </div>

      {/* Upload de fotos */}
      <div className="bg-white rounded-2xl p-5" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <h2 className="font-semibold mb-3 text-sm" style={{ color: '#1A1A2E' }}>Adicionar Fotos da Caixa</h2>
        <label
          className="flex flex-col items-center justify-center gap-2 p-5 rounded-xl border-2 border-dashed cursor-pointer transition-colors hover:bg-gray-50"
          style={{ borderColor: '#E5E7EB' }}
        >
          <Camera className="w-6 h-6" style={{ color: '#9CA3AF' }} />
          <span className="text-sm" style={{ color: '#9CA3AF' }}>
            {uploading ? 'Enviando...' : 'Clique para adicionar fotos'}
          </span>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={handleUploadFotos}
            disabled={uploading}
          />
        </label>
      </div>

      <Button
        type="submit"
        disabled={salvando}
        className="w-full h-11 font-semibold text-white"
        style={{ background: 'linear-gradient(135deg, #FF6B9D, #FF4D8D)', borderRadius: '10px' }}
      >
        {salvando ? 'Salvando...' : 'Salvar Alterações'}
      </Button>
    </form>
  )
}
