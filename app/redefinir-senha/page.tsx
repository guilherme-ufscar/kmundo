'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react'
import { Logo } from '@/components/Logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const schema = z.object({
  senha: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
  confirmarSenha: z.string(),
}).refine((d) => d.senha === d.confirmarSenha, {
  message: 'As senhas não coincidem',
  path: ['confirmarSenha'],
})

type FormData = z.infer<typeof schema>

function RedefinirSenhaForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? ''

  const [showSenha, setShowSenha] = useState(false)
  const [showConfirmar, setShowConfirmar] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sucesso, setSucesso] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    if (!token) {
      setError('Token inválido. Solicite uma nova recuperação.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/redefinir-senha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, senha: data.senha }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error ?? 'Erro ao redefinir senha')
        return
      }
      setSucesso(true)
    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-8"
      style={{ background: 'linear-gradient(135deg, #1A1A2E 0%, #16213E 50%, #0F3460 100%)' }}
    >
      <div className="fixed top-0 right-0 w-96 h-96 rounded-full opacity-5 pointer-events-none" style={{ background: 'radial-gradient(circle, #FF6B9D, transparent)', transform: 'translate(30%, -30%)' }} />
      <div className="fixed bottom-0 left-0 w-80 h-80 rounded-full opacity-5 pointer-events-none" style={{ background: 'radial-gradient(circle, #C77DFF, transparent)', transform: 'translate(-30%, 30%)' }} />

      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-3 mb-8">
          <Logo size={44} color="white" />
          <span className="text-white font-bold text-xl">KMundo Warehouse</span>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8" style={{ boxShadow: '0 30px 80px rgba(0,0,0,0.3)' }}>
          {sucesso ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#F0FDF4' }}>
                <CheckCircle className="w-8 h-8" style={{ color: '#22C55E' }} />
              </div>
              <h2 className="text-xl font-bold mb-2" style={{ color: '#1A1A2E' }}>Senha redefinida!</h2>
              <p className="text-sm mb-6" style={{ color: '#6B7280' }}>
                Sua senha foi atualizada com sucesso. Faça login com a nova senha.
              </p>
              <Button
                onClick={() => router.push('/login')}
                className="w-full h-11 font-semibold text-white rounded-xl"
                style={{ background: 'linear-gradient(135deg, #FF6B9D, #FF4D8D)' }}
              >
                Ir para o login →
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-1" style={{ color: '#1A1A2E' }}>Nova senha</h2>
                <p className="text-sm" style={{ color: '#6B7280' }}>
                  Escolha uma senha forte para sua conta.
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: '#FEF2F2', color: '#EF4444', border: '1px solid #FECACA' }}>
                  {error}{' '}
                  {error.includes('inválido') && (
                    <Link href="/recuperar-senha" className="underline">Solicitar novo link</Link>
                  )}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <Label className="text-sm font-medium" style={{ color: '#374151' }}>Nova senha</Label>
                  <div className="relative mt-1.5">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9CA3AF' }} />
                    <Input
                      type={showSenha ? 'text' : 'password'}
                      placeholder="Mínimo 8 caracteres"
                      className="pl-10 pr-10 h-11"
                      style={{ borderRadius: '8px' }}
                      {...register('senha')}
                    />
                    <button type="button" onClick={() => setShowSenha(!showSenha)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#9CA3AF' }}>
                      {showSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.senha && <p className="text-xs mt-1" style={{ color: '#EF4444' }}>{errors.senha.message}</p>}
                </div>

                <div>
                  <Label className="text-sm font-medium" style={{ color: '#374151' }}>Confirmar nova senha</Label>
                  <div className="relative mt-1.5">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9CA3AF' }} />
                    <Input
                      type={showConfirmar ? 'text' : 'password'}
                      placeholder="Repita a nova senha"
                      className="pl-10 pr-10 h-11"
                      style={{ borderRadius: '8px' }}
                      {...register('confirmarSenha')}
                    />
                    <button type="button" onClick={() => setShowConfirmar(!showConfirmar)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#9CA3AF' }}>
                      {showConfirmar ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirmarSenha && <p className="text-xs mt-1" style={{ color: '#EF4444' }}>{errors.confirmarSenha.message}</p>}
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 font-semibold text-white rounded-xl"
                  style={{ background: 'linear-gradient(135deg, #FF6B9D, #FF4D8D)', borderRadius: '12px' }}
                >
                  {loading ? 'Salvando...' : 'Salvar nova senha'}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function RedefinirSenhaPage() {
  return (
    <Suspense>
      <RedefinirSenhaForm />
    </Suspense>
  )
}
