import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ShopVitrine } from '@/components/cliente/ShopVitrine'

export default async function ShopPage() {
  await auth()
  const produtos = await prisma.produtoShop.findMany({
    where: { ativo: true },
    orderBy: [{ ordem: 'asc' }, { criadoEm: 'desc' }],
  })

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: '#1A1A2E' }}>K-Mundo Shop</h1>
        <p className="text-sm" style={{ color: '#6B7280' }}>Escolha produtos e envie a solicitacao de compra para sua suite.</p>
      </div>
      <ShopVitrine produtos={produtos} />
    </div>
  )
}
