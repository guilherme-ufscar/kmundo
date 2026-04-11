'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { Eye, EyeOff, Star, ArrowRight, Lock, Mail } from 'lucide-react'
import { Logo } from '@/components/Logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha obrigatória'),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(data: LoginForm) {
    setError('')
    setLoading(true)
    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        setError('Email ou senha incorretos')
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div
        className="hidden lg:flex lg:w-3/5 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1A1A2E 0%, #16213E 50%, #0F3460 100%)' }}
      >
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #FF6B9D, transparent)', transform: 'translate(30%, -30%)' }} />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #C77DFF, transparent)', transform: 'translate(-30%, 30%)' }} />

        {/* Logo */}
        <div className="flex items-center gap-3 z-10">
          <Logo size={44} color="white" />
          <span className="text-white font-bold text-xl">KMundo Warehouse</span>
        </div>

        {/* Center content */}
        <div className="z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6" style={{ background: 'rgba(255,107,157,0.15)', color: '#FF6B9D', border: '1px solid rgba(255,107,157,0.3)' }}>
            <span>✨</span> Mais de 100 clientes ativas
          </div>
          <h1 className="text-5xl font-bold text-white leading-tight mb-4">
            Sua Suite<br />
            <span style={{ background: 'linear-gradient(135deg, #FF6B9D, #C77DFF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              na Coreia
            </span>
          </h1>
          <p className="text-lg mb-6" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Somos uma empresa especializada em redirecionamento de compras e armazenamento. Com a nossa ajuda, você compra diretamente de lojas na Coreia do Sul, mesmo que não enviem para o seu país.
          </p>
          <p className="text-lg mb-10" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Recebemos seus pacotes no nosso endereço na Coreia, armazenamos com segurança e redirecionamos para você, em qualquer lugar do mundo.
          </p>

          {/* Stats */}
          <div className="flex gap-8">
            <div>
              <div className="text-3xl font-bold text-white">100+</div>
              <div className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>Clientes ativas</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">4.9</div>
              <div className="flex items-center gap-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span className="text-sm">Avaliação</span>
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">30d</div>
              <div className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>Grátis de armazém</div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="z-10">
          <p style={{ color: 'rgba(255,255,255,0.4)' }} className="text-sm">
            Entre em contato:{' '}
            <a href="tel:+820107768901" className="font-semibold hover:opacity-80 transition-opacity" style={{ color: '#FF6B9D' }}>
              +82 010-7768-9011
            </a>
          </p>
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex-1 flex items-center justify-center p-8" style={{ background: '#F8F9FA' }}>
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <Logo size={36} color="dark" />
            <span className="font-bold text-lg" style={{ color: '#1A1A2E' }}>KMundo Warehouse</span>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8" style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.08)' }}>
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2" style={{ color: '#1A1A2E' }}>
                Bem-vinda de volta ✨
              </h2>
              <p className="text-sm" style={{ color: '#6B7280' }}>
                Entre na sua conta para acessar sua suite
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: '#FEF2F2', color: '#EF4444', border: '1px solid #FECACA' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <Label htmlFor="email" className="text-sm font-medium" style={{ color: '#374151' }}>
                  Email
                </Label>
                <div className="relative mt-1.5">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9CA3AF' }} />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    className="pl-10 h-11 rounded-lg border-gray-200 focus-visible:ring-pink-400"
                    style={{ borderRadius: '8px' }}
                    {...register('email')}
                  />
                </div>
                {errors.email && <p className="text-xs mt-1" style={{ color: '#EF4444' }}>{errors.email.message}</p>}
              </div>

              <div>
                <Label htmlFor="password" className="text-sm font-medium" style={{ color: '#374151' }}>
                  Senha
                </Label>
                <div className="relative mt-1.5">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9CA3AF' }} />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="pl-10 pr-10 h-11 rounded-lg border-gray-200 focus-visible:ring-pink-400"
                    style={{ borderRadius: '8px' }}
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: '#9CA3AF' }}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs mt-1" style={{ color: '#EF4444' }}>{errors.password.message}</p>}
              </div>

              <div className="flex justify-end">
                <Link href="/recuperar-senha" className="text-sm font-medium hover:opacity-80" style={{ color: '#C77DFF' }}>
                  Esqueceu sua senha?
                </Link>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 font-semibold text-white rounded-xl flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #FF6B9D, #FF4D8D)', borderRadius: '12px' }}
              >
                {loading ? 'Entrando...' : (
                  <>
                    Entrar
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-100 text-center">
              <p className="text-sm" style={{ color: '#6B7280' }}>
                Entre em contato:{' '}
                <a href="tel:+820107768901" className="font-semibold hover:opacity-80" style={{ color: '#FF6B9D' }}>
                  +82 010-7768-9011
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
