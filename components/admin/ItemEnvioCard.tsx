'use client'

import { useState } from 'react'
import { Package, X, ExternalLink } from 'lucide-react'

const statusItemLabel: Record<string, string> = {
  RECEBIDO: 'Recebido',
  AGUARDANDO_ENVIO: 'Aguardando envio',
  ENVIADO: 'Enviado',
  ENTREGUE: 'Entregue',
}

const statusItemCor: Record<string, string> = {
  RECEBIDO: '#F59E0B',
  AGUARDANDO_ENVIO: '#3B82F6',
  ENVIADO: '#FF6B9D',
  ENTREGUE: '#22C55E',
}

interface Item {
  id: string
  descricao: string
  lojaOrigem: string | null
  trackingLoja: string | null
  status: string
  fotos: string[]
  observacoes: string | null
  dataEntrada: string
}

export function ItemEnvioCard({ item }: { item: Item }) {
  const [open, setOpen] = useState(false)
  const foto = item.fotos[0]

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-3 p-3 rounded-xl w-full text-left transition-colors hover:bg-gray-100"
        style={{ background: '#F9FAFB' }}
      >
        {/* Foto ou ícone */}
        <div className="w-10 h-10 rounded-lg flex-shrink-0 overflow-hidden" style={{ background: '#FFF1F5' }}>
          {foto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={foto} alt={item.descricao} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-4 h-4" style={{ color: '#FF6B9D' }} />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate" style={{ color: '#1A1A2E' }}>{item.descricao}</p>
          {item.lojaOrigem && (
            <p className="text-xs" style={{ color: '#9CA3AF' }}>{item.lojaOrigem}</p>
          )}
        </div>

        {item.trackingLoja && (
          <span className="text-xs font-mono flex-shrink-0" style={{ color: '#9CA3AF' }}>{item.trackingLoja}</span>
        )}
      </button>

      {/* Popup */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-md overflow-hidden"
            style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Foto grande */}
            {item.fotos.length > 0 ? (
              <div className="w-full h-52 overflow-hidden bg-gray-100">
                <img
                  src={item.fotos[0]}
                  alt={item.descricao}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-full h-32 flex items-center justify-center" style={{ background: '#FFF1F5' }}>
                <Package className="w-10 h-10" style={{ color: '#FF6B9D' }} />
              </div>
            )}

            <div className="p-5">
              <div className="flex items-start justify-between gap-3 mb-4">
                <h3 className="font-semibold text-base leading-snug" style={{ color: '#1A1A2E' }}>{item.descricao}</h3>
                <button onClick={() => setOpen(false)} className="flex-shrink-0 text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span style={{ color: '#6B7280' }}>Status</span>
                  <span
                    className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
                    style={{ background: statusItemCor[item.status] ?? '#6B7280' }}
                  >
                    {statusItemLabel[item.status] ?? item.status}
                  </span>
                </div>

                {item.lojaOrigem && (
                  <div className="flex justify-between">
                    <span style={{ color: '#6B7280' }}>Loja</span>
                    <span className="font-medium" style={{ color: '#1A1A2E' }}>{item.lojaOrigem}</span>
                  </div>
                )}

                {item.trackingLoja && (
                  <div className="flex justify-between">
                    <span style={{ color: '#6B7280' }}>Tracking</span>
                    <span className="font-mono text-xs font-medium" style={{ color: '#1A1A2E' }}>{item.trackingLoja}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span style={{ color: '#6B7280' }}>Entrada</span>
                  <span style={{ color: '#1A1A2E' }}>
                    {new Date(item.dataEntrada).toLocaleDateString('pt-BR')}
                  </span>
                </div>

                {item.observacoes && (
                  <div className="pt-2 border-t" style={{ borderColor: '#F3F4F6' }}>
                    <p className="text-xs mb-1" style={{ color: '#6B7280' }}>Observações</p>
                    <p className="text-sm" style={{ color: '#1A1A2E' }}>{item.observacoes}</p>
                  </div>
                )}
              </div>

              {item.fotos.length > 1 && (
                <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                  {item.fotos.slice(1).map((foto, i) => (
                    <a key={i} href={foto} target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
                      <img src={foto} alt="" className="w-14 h-14 object-cover rounded-lg hover:opacity-80 transition-opacity" />
                    </a>
                  ))}
                </div>
              )}

              <a
                href={`/admin/itens/${item.id}`}
                className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-medium text-white"
                style={{ background: 'linear-gradient(135deg, #FF6B9D, #FF4D8D)' }}
              >
                <ExternalLink className="w-4 h-4" />
                Ver item completo
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
