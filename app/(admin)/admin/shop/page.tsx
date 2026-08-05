import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ShopAdmin } from '@/components/admin/ShopAdmin'

export default async function AdminShopPage() {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') redirect('/login')
  const produtos = await prisma.produtoShop.findMany({ orderBy: [{ ordem: 'asc' }, { criadoEm: 'desc' }] })

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: '#1A1A2E' }}>Personal Shopper 🇰🇷</h1>
        <p className="text-sm" style={{ color: '#6B7280' }}>Vitrine de produtos e solicitações integradas aos pedidos de compra.</p>
      </div>
      <ShopAdmin produtos={produtos} />
    </div>
  )
}
