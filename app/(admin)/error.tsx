'use client'

import { useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'
import Link from 'next/link'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function AdminError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex-1 flex items-center justify-center min-h-[60vh]">
      <div className="text-center max-w-md px-6">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: '#FEF2F2' }}>
          <AlertTriangle className="w-7 h-7" style={{ color: '#EF4444' }} />
        </div>
        <h2 className="text-xl font-bold mb-2" style={{ color: '#1A1A2E' }}>
          Erro no painel administrativo
        </h2>
        <p className="text-sm mb-6" style={{ color: '#6B7280' }}>
          Ocorreu um erro ao processar esta requisição. Verifique os logs ou tente novamente.
        </p>
        {error.digest && (
          <p className="text-xs mb-4 font-mono" style={{ color: '#9CA3AF' }}>
            Código: {error.digest}
          </p>
        )}
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #FF6B9D, #FF4D8D)' }}
          >
            Tentar novamente
          </button>
          <Link
            href="/admin/dashboard"
            className="px-5 py-2.5 rounded-xl text-sm font-semibold border"
            style={{ color: '#374151', borderColor: '#E5E7EB' }}
          >
            Ir ao Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
