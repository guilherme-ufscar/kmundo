'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, CheckCircle2, XCircle } from 'lucide-react'

const listaTaxaServico = [
  'Pesquisa e cotação dos produtos',
  'Contato e negociação com fornecedores e sites coreanos',
  'Organização e acompanhamento do pedido',
  'Recebimento e conferência das mercadorias no armazém',
  'Envio de fotos e vídeos das mercadorias após a chegada ao armazém',
]

const listaNaoInclui = [
  'Frete internacional',
  'Taxas alfandegárias ou impostos cobrados pela fiscalização',
]

const paragrafos = [
  'O Personal Shopper é um serviço onde atuamos como seu agente de compras na Coreia do Sul. Você nos contrata para encontrar, pesquisar e comprar produtos de acordo com a sua solicitação, seja em lojas físicas ou sites coreanos.',
  'Criamos esta vitrine com produtos disponíveis diretamente da Coreia do Sul para facilitar sua busca. Você poderá solicitar a compra dos itens apresentados, mas antes da confirmação realizaremos a verificação de disponibilidade, local de compra e valor atualizado.',
  'Como trabalhamos com diferentes lojas e plataformas coreanas, os valores podem sofrer alterações. Caso exista alguma mudança de preço, informaremos antes de finalizar a compra.',
  'Nós não trabalhamos com estoque próprio. Nosso serviço é realizado sob demanda, com o objetivo de ajudar você a encontrar seus produtos desejados na Coreia do Sul, oferecendo suporte desde a pesquisa até o recebimento da mercadoria em nosso armazém.',
  'Caso o produto que você deseja não esteja disponível em nossa vitrine, você pode acessar a área de Pedidos e solicitar sua compra. Envie uma foto, link ou informações do item desejado para que possamos realizar a pesquisa.',
]

function bloco(texto: string, destacado = false) {
  return <p className={destacado ? 'text-sm font-medium' : 'text-sm'} style={{ color: destacado ? '#1A1A2E' : '#6B7280' }}>{texto}</p>
}

function lista(items: string[], icone: 'check' | 'x') {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2.5 text-sm" style={{ color: '#6B7280' }}>
          {icone === 'check' ? (
            <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#22C55E' }} />
          ) : (
            <XCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#EF4444' }} />
          )}
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

export function PersonalShopperInfo() {
  const [aberto, setAberto] = useState(false)

  return (
    <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-8">
      {!aberto ? (
        <button
          type="button"
          onClick={() => setAberto(true)}
          aria-expanded={false}
          className="w-full text-left p-6 sm:p-8 hover:bg-gray-50/50 transition-colors"
        >
          <span className="flex items-center justify-between gap-3 mb-4">
            <span className="text-lg font-bold" style={{ color: '#1A1A2E' }}>O que é o Personal Shopper?</span>
            <ChevronDown className="w-5 h-5 shrink-0" style={{ color: '#6B7280' }} />
          </span>
          <div className="relative">
            <p className="text-sm leading-relaxed line-clamp-6" style={{ color: '#6B7280' }}>
              {paragrafos[0]} {paragrafos[1]}
            </p>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white via-white to-transparent" />
          </div>
          <p className="text-sm font-semibold mt-3" style={{ color: '#FF6B9D' }}>Clique para saber mais</p>
        </button>
      ) : (
        <>
          <button
            type="button"
            onClick={() => setAberto(false)}
            aria-expanded={true}
            className="w-full flex items-center justify-between gap-3 p-6 sm:p-8 text-left hover:bg-gray-50/50 transition-colors"
          >
            <h2 className="text-lg font-bold" style={{ color: '#1A1A2E' }}>O que é o Personal Shopper?</h2>
            <ChevronDown className="w-5 h-5 shrink-0 transition-transform rotate-180" style={{ color: '#6B7280' }} />
          </button>

          <div className="px-6 sm:px-8 pb-6 sm:pb-8">
            <div className="space-y-8">
              <div className="space-y-3">
                {paragrafos.map((p) => bloco(p))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-2xl p-5" style={{ background: '#FFF1F5' }}>
                  <h3 className="font-semibold mb-3" style={{ color: '#1A1A2E' }}>Taxa de serviço</h3>
                  {bloco('A taxa de serviço é cobrada a partir de ₩5.000 e corresponde ao processo de intermediação e acompanhamento da sua compra na Coreia.')}
                  <div className="mt-3 mb-4">
                    {bloco('A taxa inclui:', true)}
                    <div className="mt-3">{lista(listaTaxaServico, 'check')}</div>
                  </div>
                  {bloco('O valor da taxa de serviço pode variar de acordo com cada pedido, considerando sua complexidade e os serviços necessários.')}
                  <div className="mt-4 rounded-xl p-4" style={{ background: 'rgba(255,107,157,0.08)' }}>
                    {bloco('Importante: a taxa de serviço não é calculada por item, mas sim por pedido.', true)}
                  </div>
                  {bloco('O valor final da taxa será informado e calculado ao final da compra.')}
                </div>

                <div className="rounded-2xl p-5" style={{ background: '#FEF2F2' }}>
                  <h3 className="font-semibold mb-3" style={{ color: '#1A1A2E' }}>Informações importantes</h3>
                  {bloco('Antes de finalizar sua compra, leia atentamente toda a descrição do produto.')}
                  <div className="mt-3 mb-4">
                    {bloco('O valor do Personal Shopper não inclui:', true)}
                    <div className="mt-3">{lista(listaNaoInclui, 'x')}</div>
                  </div>
                  {bloco('Ao contratar nosso serviço, você está solicitando a compra de um item específico escolhido por você. Após a confirmação da compra, não realizamos cancelamentos ou reembolsos, pois o processo de pesquisa, compra e atendimento já terá sido iniciado.')}
                </div>
              </div>

              <div className="rounded-2xl p-5" style={{ background: '#F8F9FA' }}>
                {bloco('Certifique-se de todas as informações do produto antes de concluir seu pedido. Caso tenha dúvidas sobre o serviço, entre em contato com nosso suporte pelo WhatsApp antes de finalizar sua solicitação.', true)}
                <p className="text-sm mt-3">
                  <Link href="/meus-pedidos" className="font-semibold hover:underline" style={{ color: '#FF6B9D' }}>
                    Acessar a área de Pedidos →
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  )
}