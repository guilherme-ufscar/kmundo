'use client'

import { useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md px-6">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: '#FEF2F2' }}>
          <AlertTriangle className="w-8 h-8" style={{ color: '#EF4444' }} />
        </div>
        <h1 className="text-2xl font-bold mb-2" style={{ color: '#1A1A2E' }}>
          Algo deu errado
        </h1>
        <p className="text-sm mb-6" style={{ color: '#6B7280' }}>
          Ocorreu um erro inesperado. Tente novamente ou entre em contato com o suporte.
        </p>
        {error.digest && (
          <p className="text-xs mb-4 font-mono" style={{ color: '#9CA3AF' }}>
            Código: {error.digest}
          </p>
        )}
        <button
          onClick={reset}
          className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white"
          style={{ background: 'linear-gradient(135deg, #FF6B9D, #FF4D8D)' }}
        >
          Tentar novamente
        </button>
      </div>
    </div>
  )
}
