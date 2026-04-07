'use client'

import { useState, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Search, Package, ArrowRight, Camera, X } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Suspense } from 'react'

const itemSchema = z.object({
  suiteNumero: z.string().min(1, 'Informe o número de suite'),
  descricao: z.string().min(1, 'Descrição obrigatória').max(255),
  lojaOrigem: z.string().optional(),
  trackingLoja: z.string().optional(),
  observacoes: z.string().optional(),
})

type ItemForm = z.infer<typeof itemSchema>

interface ClienteEncontrado {
  id: string
  nomeCompleto: string
  numeroDeSuite: number
}

const MAX_FOTOS = 10
const MAX_SIZE_MB = 5

function NovoItemForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const suiteParam = searchParams.get('suite') ?? ''

  const [clienteEncontrado, setClienteEncontrado] = useState<ClienteEncontrado | null>(null)
  const [buscando, setBuscando] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [error, setError] = useState('')
  const [fotos, setFotos] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { register, handleSubmit, watch, formState: { errors } } = useForm<ItemForm>({
    resolver: zodResolver(itemSchema),
    defaultValues: { suiteNumero: suiteParam },
  })

  const suiteNumero = watch('suiteNumero')

  async function buscarCliente() {
    if (!suiteNumero) return
    setBuscando(true)
    setClienteEncontrado(null)
    setError('')
    try {
      const res = await fetch(`/api/clientes?busca=${encodeURIComponent(suiteNumero)}&limite=1`)
      const data = await res.json()
      if (data.clientes?.length > 0) {
        const c = data.clientes[0]
        setClienteEncontrado({ id: c.id, nomeCompleto: c.nomeCompleto, numeroDeSuite: c.numeroDeSuite })
      } else {
        setError('Nenhum cliente encontrado com esse número de suite ou nome')
      }
    } catch {
      setError('Erro ao buscar cliente')
    } finally {
      setBuscando(false)
    }
  }

  async function handleFotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (fotos.length + files.length > MAX_FOTOS) {
      setError(`Máximo de ${MAX_FOTOS} fotos por item`)
      return
    }
    const novas: string[] = []
    for (const file of files) {
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        setError(`Arquivo "${file.name}" excede ${MAX_SIZE_MB}MB`)
        return
      }
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.readAsDataURL(file)
      })
      novas.push(base64)
    }
    setFotos((prev) => [...prev, ...novas])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function removerFoto(idx: number) {
    setFotos((prev) => prev.filter((_, i) => i !== idx))
  }

  async function onSubmit(data: ItemForm) {
    if (!clienteEncontrado) {
      setError('Busque e selecione um cliente primeiro')
      return
    }
    setSalvando(true)
    setError('')
    try {
      const res = await fetch('/api/itens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clienteId: clienteEncontrado.id,
          descricao: data.descricao,
          lojaOrigem: data.lojaOrigem || undefined,
          trackingLoja: data.trackingLoja || undefined,
          observacoes: data.observacoes || undefined,
          fotos,
        }),
      })
      if (res.ok) {
        toast.success('Item registrado no armazém com sucesso!')
        router.push('/admin/itens')
      } else {
        const json = await res.json()
        setError(json.error ?? 'Erro ao registrar item')
      }
    } catch {
      setError('Erro de conexão')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/itens">
          <button type="button" className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-colors" style={{ color: '#6B7280' }}>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#1A1A2E' }}>Registrar Item</h1>
          <p style={{ color: '#6B7280' }}>Registrar novo pacote recebido no armazém</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-3 rounded-lg text-sm" style={{ background: '#FEF2F2', color: '#EF4444', border: '1px solid #FECACA' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Busca de cliente */}
        <div className="bg-white rounded-2xl p-6" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <h2 className="font-semibold mb-4" style={{ color: '#1A1A2E' }}>Cliente</h2>
          <div className="flex gap-3">
            <div className="flex-1">
              <Label className="text-sm font-medium" style={{ color: '#374151' }}>Número de Suite ou Nome</Label>
              <Input
                placeholder="Ex: 001 ou Nome da cliente"
                className="mt-1.5 h-11"
                style={{ borderRadius: '8px' }}
                {...register('suiteNumero')}
              />
              {errors.suiteNumero && <p className="text-xs mt-1" style={{ color: '#EF4444' }}>{errors.suiteNumero.message}</p>}
            </div>
            <div className="flex items-end">
              <Button
                type="button"
                onClick={buscarCliente}
                disabled={buscando}
                className="h-11 px-4 flex items-center gap-2 font-medium text-white"
                style={{ background: 'linear-gradient(135deg, #FF6B9D, #FF4D8D)', borderRadius: '8px' }}
              >
                <Search className="w-4 h-4" />
                {buscando ? 'Buscando...' : 'Buscar'}
              </Button>
            </div>
          </div>

          {clienteEncontrado && (
            <div className="mt-4 p-4 rounded-xl flex items-center gap-3" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ background: 'linear-gradient(135deg, #FF6B9D, #C77DFF)' }}>
                {clienteEncontrado.nomeCompleto.charAt(0)}
              </div>
              <div>
                <p className="font-medium text-sm" style={{ color: '#1A1A2E' }}>{clienteEncontrado.nomeCompleto}</p>
                <p className="text-xs" style={{ color: '#16A34A' }}>
                  Suite #{String(clienteEncontrado.numeroDeSuite).padStart(3, '0')} — Encontrado ✓
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Dados do item */}
        <div className="bg-white rounded-2xl p-6" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <h2 className="font-semibold mb-4 flex items-center gap-2" style={{ color: '#1A1A2E' }}>
            <Package className="w-4 h-4" style={{ color: '#FF6B9D' }} />
            Dados do Item
          </h2>

          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium" style={{ color: '#374151' }}>Descrição *</Label>
              <Input placeholder="Ex: Skincare COSRX — soro de caracol" className="h-11 mt-1.5" style={{ borderRadius: '8px' }} {...register('descricao')} />
              {errors.descricao && <p className="text-xs mt-1" style={{ color: '#EF4444' }}>{errors.descricao.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium" style={{ color: '#374151' }}>Loja de Origem</Label>
                <Input placeholder="Ex: Olive Young" className="h-11 mt-1.5" style={{ borderRadius: '8px' }} {...register('lojaOrigem')} />
              </div>
              <div>
                <Label className="text-sm font-medium" style={{ color: '#374151' }}>Tracking da Loja</Label>
                <Input placeholder="Ex: KR1234567890" className="h-11 mt-1.5 font-mono" style={{ borderRadius: '8px' }} {...register('trackingLoja')} />
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium" style={{ color: '#374151' }}>Observações</Label>
              <textarea
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm mt-1.5 resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                rows={3}
                placeholder="Informações adicionais sobre o pacote..."
                style={{ borderRadius: '8px' }}
                {...register('observacoes')}
              />
            </div>
          </div>
        </div>

        {/* Upload de fotos */}
        <div className="bg-white rounded-2xl p-6" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <h2 className="font-semibold mb-4 flex items-center gap-2" style={{ color: '#1A1A2E' }}>
            <Camera className="w-4 h-4" style={{ color: '#FF6B9D' }} />
            Fotos ({fotos.length}/{MAX_FOTOS})
          </h2>

          {fotos.length > 0 && (
            <div className="grid grid-cols-5 gap-2 mb-4">
              {fotos.map((foto, idx) => (
                <div key={idx} className="relative aspect-square">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={foto} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover rounded-lg" />
                  <button
                    type="button"
                    onClick={() => removerFoto(idx)}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center text-white"
                    style={{ background: '#EF4444' }}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {fotos.length < MAX_FOTOS && (
            <label
              className="flex flex-col items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed cursor-pointer transition-colors hover:bg-gray-50"
              style={{ borderColor: '#E5E7EB' }}
            >
              <Camera className="w-6 h-6" style={{ color: '#9CA3AF' }} />
              <span className="text-sm" style={{ color: '#9CA3AF' }}>Clique para adicionar fotos (máx. {MAX_SIZE_MB}MB cada)</span>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleFotoChange}
              />
            </label>
          )}
        </div>

        <Button
          type="submit"
          disabled={salvando || !clienteEncontrado}
          className="w-full h-12 font-semibold text-white rounded-xl flex items-center justify-center gap-2"
          style={{ background: 'linear-gradient(135deg, #FF6B9D, #FF4D8D)', borderRadius: '12px' }}
        >
          {salvando ? 'Registrando...' : (
            <>
              Registrar Item no Armazém
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </form>
    </div>
  )
}

export default function NovoItemPage() {
  return (
    <Suspense fallback={<div className="p-8">Carregando...</div>}>
      <NovoItemForm />
    </Suspense>
  )
}
