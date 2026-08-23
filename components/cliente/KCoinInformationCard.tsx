'use client'

import { Flag, Coins, Wallet, Hash, Mail, ExternalLink } from 'lucide-react'

type Props = {
  kid: string
  email: string
  kcoinPurchase: number
  kcoinFee: number
  moedaPurchase: string
  moedaFee: string
  serviceUses: number
  caixasTotal: number
  caixasComServico: number
  wiseLink?: string | null
  koreanBank?: { name?: string | null; account?: string | null; holder?: string | null } | null
}

function fmt(valor: number, moeda: string) {
  if (moeda === 'KRW') return `${Math.round(valor).toLocaleString('pt-BR')} ${moeda}`
  return `${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ${moeda}`
}

export function KCoinInformationCard({ kid, email, kcoinPurchase, kcoinFee, moedaPurchase, moedaFee, serviceUses, caixasTotal, caixasComServico, wiseLink, koreanBank }: Props) {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl p-5" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #E5E7EB' }}>
        <div className="flex items-center gap-2 mb-4">
          <Flag className="w-5 h-5" style={{ color: '#EF4444' }} />
          <h2 className="font-bold" style={{ color: '#1A1A2E' }}>Information</h2>
        </div>
        <div className="border-t border-dashed pt-4 space-y-2 text-sm" style={{ borderColor: '#E5E7EB' }}>
          <div className="flex items-center gap-2">
            <span style={{ color: '#374151' }}>→</span>
            <span className="font-bold" style={{ color: '#1A1A2E' }}>KID :</span>
            <span style={{ color: '#6B7280' }}>{kid} ( {kid} )</span>
          </div>
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4" style={{ color: '#F59E0B' }} />
            <span className="font-bold" style={{ color: '#1A1A2E' }}>KCoin (For Purchase) :</span>
            <span style={{ color: kcoinPurchase > 0 ? '#DC2626' : '#16A34A' }}>{fmt(kcoinPurchase, moedaPurchase)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4" style={{ color: '#16A34A' }} />
            <span className="font-bold" style={{ color: '#1A1A2E' }}>KCoin (For Fee Payment) :</span>
            <span style={{ color: kcoinFee > 0 ? '#DC2626' : '#16A34A' }}>{fmt(kcoinFee, moedaFee)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Hash className="w-4 h-4" style={{ color: '#6B7280' }} />
            <span className="font-bold" style={{ color: '#1A1A2E' }}>Number of monthly service uses :</span>
            <span style={{ color: '#6B7280' }}>{serviceUses}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4" style={{ color: '#6B7280' }} />
            <span className="font-bold" style={{ color: '#1A1A2E' }}>Email :</span>
            <span style={{ color: '#6B7280' }}>{email}</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span style={{ color: '#6B7280' }}>Caixas: {caixasTotal} • Com serviço: {caixasComServico} • A pagar para liberar: {fmt(kcoinFee, moedaFee)}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #E5E7EB' }}>
        <div className="flex items-center gap-2 mb-2">
          <span className="w-6 h-6 rounded flex items-center justify-center text-sm" style={{ background: '#22C55E', color: 'white' }}>✓</span>
          <h3 className="font-bold" style={{ color: '#1A1A2E' }}>important</h3>
        </div>
        <p className="text-sm leading-relaxed" style={{ color: '#6B7280' }}>
          : Please proceed with caution as K-Coin that has been sent or deposited cannot be sent to another bank or refunded under any circumstances. (Legal issues may arise under Korean law)
        </p>
      </div>

      <div className="bg-white rounded-2xl p-5" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <h3 className="font-bold mb-2" style={{ color: '#1A1A2E' }}>1) Using Wise</h3>
        <p className="text-sm italic mb-3" style={{ color: '#6B7280' }}>You can easily make a transfer through the Wise payment link below.↓</p>
        {wiseLink ? (
          <a href={wiseLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold" style={{ background: '#F1F5F9', color: '#0E7490' }}>
            <span>💸</span> Wise Quick Link - <ExternalLink className="w-4 h-4" />
          </a>
        ) : (
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm" style={{ background: '#F1F5F9', color: '#9CA3AF' }}>Wise link — configure em Admin → Config</span>
        )}
        <div className="border-t border-dashed mt-6 pt-6">
          <h3 className="font-bold mb-3" style={{ color: '#1A1A2E' }}>2) Using ‘Direct Korean Bank’</h3>
          <div className="space-y-1 text-sm" style={{ color: '#0E7490' }}>
            <p>- Bank Name : <span className="font-semibold">{koreanBank?.name ?? 'Kookmin Bank'}</span></p>
            <p>- Account Number : <span className="font-mono font-semibold">{koreanBank?.account ?? '469301-01-213906'}</span></p>
            <p>- Account Holder Name : <span className="font-semibold">{koreanBank?.holder ?? 'Hwa Jiwook'}</span></p>
          </div>
        </div>
      </div>
    </div>
  )
}
