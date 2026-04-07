'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  url: string
  confirmar: string
  redirectTo: string
  label?: string
}

export function DeleteButton({ url, confirmar, redirectTo, label = 'Excluir' }: Props) {
  const router = useRouter()
  const [excluindo, setExcluindo] = useState(false)

  async function excluir() {
    if (!window.confirm(confirmar)) return
    setExcluindo(true)
    try {
      const res = await fetch(url, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Excluído com sucesso')
        router.push(redirectTo)
      } else {
        toast.error('Erro ao excluir')
      }
    } catch {
      toast.error('Erro de conexão')
    } finally {
      setExcluindo(false)
    }
  }

  return (
    <Button
      onClick={excluir}
      disabled={excluindo}
      variant="outline"
      className="h-9 px-4 text-sm flex items-center gap-1.5"
      style={{ borderRadius: '8px', color: '#EF4444', borderColor: '#FECACA' }}
    >
      <Trash2 className="w-3.5 h-3.5" />
      {excluindo ? 'Excluindo...' : label}
    </Button>
  )
}
