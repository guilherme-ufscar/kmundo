'use client'

import { useState } from 'react'
import { Copy, CheckCircle } from 'lucide-react'

interface SuiteCardProps {
  numeroDeSuite: number
  nomeCliente?: string
}

export function SuiteCard({ numeroDeSuite }: SuiteCardProps) {
  const [copied, setCopied] = useState(false)
  const suiteFormatado = String(numeroDeSuite).padStart(3, '0')

  async function copiar() {
    await navigator.clipboard.writeText(suiteFormatado)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className="rounded-2xl p-6 text-white relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #FF6B9D 0%, #C77DFF 100%)' }}
    >
      {/* Decorative */}
      <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10" style={{ background: 'white', transform: 'translate(30%, -30%)' }} />
      <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full opacity-10" style={{ background: 'white', transform: 'translate(-30%, 30%)' }} />

      <div className="relative z-10 flex items-center justify-between">
        <div>
          <p className="text-white/70 text-sm font-medium mb-1">Sua Suite</p>
          <p className="text-6xl font-bold tracking-tight">#{suiteFormatado}</p>
          <p className="text-white/70 text-sm mt-3">
            Informe esse número ao fazer compras em lojas coreanas
          </p>
        </div>

        <button
          onClick={copiar}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
          style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}
        >
          {copied ? (
            <>
              <CheckCircle className="w-4 h-4" />
              Copiado!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copiar suite
            </>
          )}
        </button>
      </div>
    </div>
  )
}
