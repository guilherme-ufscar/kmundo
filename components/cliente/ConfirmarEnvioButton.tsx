'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  envioId: string
}

export function ConfirmarEnvioButton({ envioId }: Props) {
  const router = useRouter()
  const [confirmando, setConfirmando] = useState(false)

  async function confirmar() {
    setConfirmando(true)
    try {
      const res = await fetch(`/api/envios/${envioId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmadoCliente: true }),
      })
      if (res.ok) {
        toast.success('Pagamento confirmado com sucesso!')
        router.refresh()
      } else {
        toast.error('Erro ao confirmar pagamento')
      }
    } catch {
      toast.error('Erro de conexão')
    } finally {
      setConfirmando(false)
    }
  }

  return (
    <Button
      onClick={confirmar}
      disabled={confirmando}
      className="flex items-center gap-2 h-11 px-6 font-semibold text-white"
      style={{ background: 'linear-gradient(135deg, #FF6B9D, #FF4D8D)', borderRadius: '8px' }}
    >
      <CheckCircle className="w-4 h-4" />
      {confirmando ? 'Confirmando...' : 'Confirmar e vou realizar o pagamento'}
    </Button>
  )
}
