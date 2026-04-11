'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { Eye, EyeOff, User, Mail, Lock, Phone, Globe, MapPin, ArrowRight, CheckCircle } from 'lucide-react'
import { Logo } from '@/components/Logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const cadastroSchema = z.object({
  nomeCompleto: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
  confirmPassword: z.string(),
  telefone: z.string().min(8, 'Telefone inválido'),
  pais: z.string().min(2, 'País obrigatório'),
  cidade: z.string().optional(),
  cep: z.string().optional(),
  aceitouTermos: z.boolean().refine((v) => v === true, {
    message: 'Você deve ler e aceitar os Termos de Uso para continuar',
  }),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
})

type CadastroForm = z.infer<typeof cadastroSchema>

export default function CadastroPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [suiteGerada, setSuiteGerada] = useState<number | null>(null)
  const [countdown, setCountdown] = useState(5)

  const { register, handleSubmit, formState: { errors } } = useForm<CadastroForm>({
    resolver: zodResolver(cadastroSchema),
  })

  async function onSubmit(data: CadastroForm) {
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          nomeCompleto: data.nomeCompleto,
          telefone: data.telefone,
          pais: data.pais,
          cidade: data.cidade,
          cep: data.cep,
        }),
      })

      const json = await res.json()

      if (!res.ok) {
        setError(typeof json.error === 'string' ? json.error : 'Erro ao criar conta')
        return
      }

      setSuiteGerada(json.numeroDeSuite)
      let count = 5
      const interval = setInterval(() => {
        count -= 1
        setCountdown(count)
        if (count === 0) {
          clearInterval(interval)
          router.push('/login')
        }
      }, 1000)
    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (suiteGerada !== null) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8" style={{ background: 'linear-gradient(135deg, #1A1A2E 0%, #16213E 100%)' }}>
        <div className="bg-white rounded-2xl p-10 max-w-md w-full text-center shadow-2xl">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: 'linear-gradient(135deg, #FF6B9D20, #C77DFF20)' }}>
            <CheckCircle className="w-10 h-10" style={{ color: '#22C55E' }} />
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: '#1A1A2E' }}>Conta criada!</h2>
          <p className="mb-8" style={{ color: '#6B7280' }}>Sua suite exclusiva foi gerada</p>

          <div className="rounded-2xl p-6 mb-8" style={{ background: 'linear-gradient(135deg, #FF6B9D15, #C77DFF15)', border: '2px solid #FF6B9D30' }}>
            <p className="text-sm font-medium mb-2" style={{ color: '#9CA3AF' }}>Seu número de suite</p>
            <p className="text-5xl font-bold" style={{ background: 'linear-gradient(135deg, #FF6B9D, #C77DFF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              #{String(suiteGerada).padStart(3, '0')}
            </p>
            <p className="text-xs mt-3" style={{ color: '#9CA3AF' }}>Guarde esse número — é seu identificador único</p>
          </div>

          <p className="text-sm mb-4" style={{ color: '#9CA3AF' }}>
            Redirecionando para o login em <strong style={{ color: '#FF6B9D' }}>{countdown}s</strong>...
          </p>
          <Button
            onClick={() => router.push('/login')}
            className="w-full h-11 font-semibold text-white rounded-xl"
            style={{ background: 'linear-gradient(135deg, #FF6B9D, #FF4D8D)' }}
          >
            Entrar na minha conta →
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-8"
      style={{ background: 'linear-gradient(135deg, #1A1A2E 0%, #16213E 50%, #0F3460 100%)' }}
    >
      {/* Decorative */}
      <div className="fixed top-0 right-0 w-96 h-96 rounded-full opacity-5 pointer-events-none" style={{ background: 'radial-gradient(circle, #FF6B9D, transparent)', transform: 'translate(30%, -30%)' }} />
      <div className="fixed bottom-0 left-0 w-80 h-80 rounded-full opacity-5 pointer-events-none" style={{ background: 'radial-gradient(circle, #C77DFF, transparent)', transform: 'translate(-30%, 30%)' }} />

      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <Logo size={44} color="white" />
          <span className="text-white font-bold text-xl">KMundo Warehouse</span>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8" style={{ boxShadow: '0 30px 80px rgba(0,0,0,0.3)' }}>
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-1" style={{ color: '#1A1A2E' }}>Crie sua conta</h1>
            <p className="text-sm" style={{ color: '#6B7280' }}>Sua suite na Coreia em minutos</p>
          </div>

          {error && (
            <div className="mb-6 p-3 rounded-lg text-sm" style={{ background: '#FEF2F2', color: '#EF4444', border: '1px solid #FECACA' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Nome */}
              <div className="md:col-span-2">
                <Label className="text-sm font-medium" style={{ color: '#374151' }}>Nome completo</Label>
                <div className="relative mt-1.5">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9CA3AF' }} />
                  <Input placeholder="Seu nome completo" className="pl-10 h-11" style={{ borderRadius: '8px' }} {...register('nomeCompleto')} />
                </div>
                {errors.nomeCompleto && <p className="text-xs mt-1" style={{ color: '#EF4444' }}>{errors.nomeCompleto.message}</p>}
              </div>

              {/* Email */}
              <div>
                <Label className="text-sm font-medium" style={{ color: '#374151' }}>Email</Label>
                <div className="relative mt-1.5">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9CA3AF' }} />
                  <Input type="email" placeholder="seu@email.com" className="pl-10 h-11" style={{ borderRadius: '8px' }} {...register('email')} />
                </div>
                {errors.email && <p className="text-xs mt-1" style={{ color: '#EF4444' }}>{errors.email.message}</p>}
              </div>

              {/* Telefone */}
              <div>
                <Label className="text-sm font-medium" style={{ color: '#374151' }}>WhatsApp / Telefone</Label>
                <div className="relative mt-1.5">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9CA3AF' }} />
                  <Input type="tel" placeholder="+55 11 99999-9999" className="pl-10 h-11" style={{ borderRadius: '8px' }} {...register('telefone')} />
                </div>
                {errors.telefone && <p className="text-xs mt-1" style={{ color: '#EF4444' }}>{errors.telefone.message}</p>}
              </div>

              {/* Senha */}
              <div>
                <Label className="text-sm font-medium" style={{ color: '#374151' }}>Senha</Label>
                <div className="relative mt-1.5">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9CA3AF' }} />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Mínimo 8 caracteres"
                    className="pl-10 pr-10 h-11"
                    style={{ borderRadius: '8px' }}
                    {...register('password')}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#9CA3AF' }}>
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs mt-1" style={{ color: '#EF4444' }}>{errors.password.message}</p>}
              </div>

              {/* Confirmar senha */}
              <div>
                <Label className="text-sm font-medium" style={{ color: '#374151' }}>Confirmar senha</Label>
                <div className="relative mt-1.5">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9CA3AF' }} />
                  <Input
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Repita a senha"
                    className="pl-10 pr-10 h-11"
                    style={{ borderRadius: '8px' }}
                    {...register('confirmPassword')}
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#9CA3AF' }}>
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-xs mt-1" style={{ color: '#EF4444' }}>{errors.confirmPassword.message}</p>}
              </div>

              {/* País */}
              <div>
                <Label className="text-sm font-medium" style={{ color: '#374151' }}>País de residência</Label>
                <div className="relative mt-1.5">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9CA3AF' }} />
                  <Input placeholder="Ex: Brazil" className="pl-10 h-11" style={{ borderRadius: '8px' }} {...register('pais')} />
                </div>
                {errors.pais && <p className="text-xs mt-1" style={{ color: '#EF4444' }}>{errors.pais.message}</p>}
              </div>

              {/* Cidade */}
              <div>
                <Label className="text-sm font-medium" style={{ color: '#374151' }}>Cidade <span style={{ color: '#9CA3AF' }}>(opcional)</span></Label>
                <div className="relative mt-1.5">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9CA3AF' }} />
                  <Input placeholder="Sua cidade" className="pl-10 h-11" style={{ borderRadius: '8px' }} {...register('cidade')} />
                </div>
              </div>
            </div>

            {/* Termos de Uso */}
            <div className="mt-6 pt-5 border-t border-gray-100">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-0.5 w-4 h-4 rounded border-gray-300 cursor-pointer accent-pink-500 flex-shrink-0"
                  {...register('aceitouTermos')}
                />
                <span className="text-sm leading-relaxed" style={{ color: '#374151' }}>
                  Li e concordo com os{' '}
                  <Link
                    href="/termos"
                    target="_blank"
                    className="font-semibold underline hover:opacity-80 transition-opacity"
                    style={{ color: '#FF6B9D' }}
                  >
                    Termos de Uso e Condições do Serviço
                  </Link>
                  {' '}da KMundo Warehouse. Entendo que estes termos funcionam como um contrato entre mim e a empresa.
                </span>
              </label>
              {errors.aceitouTermos && (
                <p className="text-xs mt-2 ml-7" style={{ color: '#EF4444' }}>
                  {errors.aceitouTermos.message}
                </p>
              )}
            </div>

            <div className="mt-5">
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 font-semibold text-white rounded-xl flex items-center justify-center gap-2 text-base"
                style={{ background: 'linear-gradient(135deg, #FF6B9D, #FF4D8D)', borderRadius: '12px' }}
              >
                {loading ? 'Criando sua conta...' : (
                  <>
                    Criar minha conta
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </Button>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100 text-center">
              <p className="text-sm" style={{ color: '#6B7280' }}>
                Já tem conta?{' '}
                <Link href="/login" className="font-semibold hover:opacity-80" style={{ color: '#FF6B9D' }}>
                  Entrar →
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
