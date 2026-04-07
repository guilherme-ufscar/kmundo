'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import { Logo } from '@/components/Logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const schema = z.object({
  email: z.string().email('Email inválido'),
})

type FormData = z.infer<typeof schema>

export default function RecuperarSenhaPage() {
  const [enviado, setEnviado] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/recuperar-senha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const json = await res.json()
        setError(json.error ?? 'Erro ao enviar e-mail')
        return
      }
      setEnviado(true)
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
          {enviado ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#F0FDF4' }}>
                <CheckCircle className="w-8 h-8" style={{ color: '#22C55E' }} />
              </div>
              <h2 className="text-xl font-bold mb-2" style={{ color: '#1A1A2E' }}>E-mail enviado!</h2>
              <p className="text-sm mb-6" style={{ color: '#6B7280' }}>
                Se esse e-mail estiver cadastrado, você receberá um link para redefinir sua senha. Verifique sua caixa de entrada.
              </p>
              <Link href="/login">
                <Button className="w-full h-11 font-semibold text-white rounded-xl" style={{ background: 'linear-gradient(135deg, #FF6B9D, #FF4D8D)' }}>
                  Voltar para o login
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <Link href="/login" className="inline-flex items-center gap-2 text-sm hover:opacity-70 transition-opacity" style={{ color: '#9CA3AF' }}>
                  <ArrowLeft className="w-4 h-4" />
                  Voltar para o login
                </Link>
              </div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-1" style={{ color: '#1A1A2E' }}>Recuperar senha</h2>
                <p className="text-sm" style={{ color: '#6B7280' }}>
                  Informe seu e-mail e enviaremos um link para redefinir sua senha.
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: '#FEF2F2', color: '#EF4444', border: '1px solid #FECACA' }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <Label className="text-sm font-medium" style={{ color: '#374151' }}>Email</Label>
                  <div className="relative mt-1.5">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9CA3AF' }} />
                    <Input
                      type="email"
                      placeholder="seu@email.com"
                      className="pl-10 h-11"
                      style={{ borderRadius: '8px' }}
                      {...register('email')}
                    />
                  </div>
                  {errors.email && <p className="text-xs mt-1" style={{ color: '#EF4444' }}>{errors.email.message}</p>}
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 font-semibold text-white rounded-xl"
                  style={{ background: 'linear-gradient(135deg, #FF6B9D, #FF4D8D)', borderRadius: '12px' }}
                >
                  {loading ? 'Enviando...' : 'Enviar link de recuperação'}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
