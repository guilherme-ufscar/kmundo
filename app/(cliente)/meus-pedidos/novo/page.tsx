import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { PedidoCompraForm } from '@/components/cliente/PedidoCompraForm'

export default function NovoPedidoPage() {
  return (
    <div className="p-4 sm:p-8 max-w-4xl">
      <Link href="/meus-pedidos" className="inline-flex items-center gap-2 text-sm font-medium mb-6 hover:opacity-70 transition-opacity" style={{ color: '#FF6B9D' }}>
        <ArrowLeft className="w-4 h-4" />
        Voltar para meus pedidos
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: '#1A1A2E' }}>Novo pedido de compra</h1>
        <p style={{ color: '#6B7280' }}>Informe os produtos que deseja que a equipe compre para você.</p>
      </div>

      <PedidoCompraForm />
    </div>
  )
}
