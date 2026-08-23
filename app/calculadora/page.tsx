import { prisma } from '@/lib/prisma'
import { FreteCalculadora } from '@/components/cliente/FreteCalculadora'
import Link from 'next/link'
import { Logo } from '@/components/Logo'
import { auth } from '@/lib/auth'
import { ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function CalculadoraPage() {
  const session = await auth()
  const [paises, caixas, config] = await Promise.all([
    prisma.fretePais.findMany({ where: { ativo: true }, orderBy: [{ ordem: 'asc' }, { nome: 'asc' }] }),
    prisma.freteCaixaTipo.findMany({ where: { ativo: true }, orderBy: [{ ordem: 'asc' }, { nome: 'asc' }] }),
    prisma.freteConfig.findFirst(),
  ])

  const titulo = config?.titulo ?? 'Calculadora de Frete'
  const subtitulo = config?.subtitulo ?? 'Simule o frete por país, peso e caixa. O valor é apenas uma estimativa.'

  const secoes: Array<{ html: string | null; titulo: string }> = [
    { html: config?.introducaoHtml ?? null, titulo: '' },
    { html: config?.comoFuncionaHtml ?? null, titulo: 'Como funciona a calculadora' },
    { html: config?.avisoEstimativaHtml ?? null, titulo: 'Valor é apenas uma estimativa' },
    { html: config?.comoPesoHtml ?? null, titulo: 'Como o peso influencia' },
    { html: config?.comoPaisHtml ?? null, titulo: 'Cálculo por país' },
    { html: config?.comoCaixasHtml ?? null, titulo: 'Tamanhos de caixa' },
    { html: config?.taxasServicoHtml ?? null, titulo: 'Taxas de serviço' },
    { html: config?.diferencasValorHtml ?? null, titulo: 'Diferenças entre estimado e final' },
    { html: config?.regrasAdicionaisHtml ?? null, titulo: 'Outras informações' },
  ]

  return (
    <main className="min-h-screen" style={{ background: '#F9FAFB' }}>
      <header className="border-b bg-white sticky top-0 z-30" style={{ borderColor: '#E5E7EB' }}>
        <div className="mx-auto max-w-5xl px-4 h-16 flex items-center justify-between">
          <Link href={session ? '/dashboard' : '/'} className="flex items-center gap-2">
            <Logo size={32} />
            <span className="font-bold" style={{ color: '#1A1A2E' }}>KMundo</span>
          </Link>
          <Link href={session ? (session.user.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard') : '/login'} className="inline-flex items-center gap-1.5 text-sm font-medium" style={{ color: '#FF6B9D' }}>
            <ArrowLeft className="w-4 h-4" />{session ? 'Voltar ao painel' : 'Entrar'}
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: '#1A1A2E' }}>{titulo}</h1>
          <p className="text-sm mt-1.5" style={{ color: '#6B7280' }}>{subtitulo}</p>
        </div>

        {config?.introducaoHtml && (
          <div className="bg-white rounded-2xl p-5 sm:p-6 mb-6 termos-content" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }} dangerouslySetInnerHTML={{ __html: config.introducaoHtml }} />
        )}

        <FreteCalculadora paises={paises} caixas={caixas} />

        {/* Textos explicativos */}
        <div className="mt-8 space-y-4">
          {secoes.slice(1).map((s, i) => s.html ? (
            <details key={i} className="group bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <summary className="list-none flex items-center justify-between p-5 cursor-pointer">
                <h3 className="font-semibold" style={{ color: '#1A1A2E' }}>{s.titulo}</h3>
                <span className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0" style={{ background: '#FFF1F5', color: '#FF6B9D' }}>+</span>
              </summary>
              <div className="px-5 pb-5 termos-content" dangerouslySetInnerHTML={{ __html: s.html }} />
            </details>
          ) : null)}
        </div>
      </section>
    </main>
  )
}
