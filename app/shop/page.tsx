import Link from 'next/link'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Logo } from '@/components/Logo'
import { ShopVitrine } from '@/components/cliente/ShopVitrine'
import { PersonalShopperInfo } from '@/components/cliente/PersonalShopperInfo'
import { GuiaPedidoInfo } from '@/components/cliente/GuiaPedidoInfo'

export const dynamic = 'force-dynamic'

export default async function ShopPage() {
  const session = await auth()
  const [produtos, categorias] = await Promise.all([
    prisma.produtoShop.findMany({
      where: { ativo: true },
      orderBy: [{ ordem: 'asc' }, { criadoEm: 'desc' }],
    }),
    prisma.shopCategoria.findMany({ where: { ativo: true }, orderBy: [{ ordem: 'asc' }, { nome: 'asc' }] }),
  ])

  return (
    <main className="min-h-screen" style={{ background: '#F8F9FA' }}>
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-3">
            <Logo size={34} color="dark" />
            <span className="font-bold" style={{ color: '#1A1A2E' }}>KMundo Warehouse</span>
          </Link>
          <Link href={session ? (session.user.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard') : '/login'} className="rounded-lg px-4 py-2 text-sm font-semibold text-white" style={{ background: '#1A1A2E' }}>
            {session ? 'Minha conta' : 'Entrar'}
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold" style={{ color: '#1A1A2E' }}>Personal Shopper 🇰🇷</h1>
          <p className="text-sm" style={{ color: '#6B7280' }}>Bem-vinda à nossa vitrine de produtos! Aqui você poderá solicitar e acompanhar seus pedidos de compra diretamente da Coreia do Sul.</p>
        </div>
        <PersonalShopperInfo />
        <GuiaPedidoInfo />
        <ShopVitrine produtos={produtos} categorias={categorias} podeSolicitar={session?.user?.role === 'CLIENTE'} />
      </section>
    </main>
  )
}
