'use client'

import { Download } from 'lucide-react'
import { useState } from 'react'

export function ExportarCSVButton() {
  const [loading, setLoading] = useState(false)

  async function handleExportar() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/exportar')
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const filename = res.headers.get('content-disposition')?.match(/filename="(.+)"/)?.[1] ?? 'itens.csv'
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleExportar}
      disabled={loading}
      className="flex items-center gap-2 h-10 px-4 rounded-xl border text-sm font-medium transition-colors hover:bg-gray-50 disabled:opacity-50"
      style={{ borderColor: '#E5E7EB', color: '#374151' }}
    >
      <Download className="w-4 h-4" />
      {loading ? 'Exportando...' : 'Exportar CSV'}
    </button>
  )
}
