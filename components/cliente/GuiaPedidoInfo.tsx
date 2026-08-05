'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const statuses = [
  {
    emoji: '🔎',
    titulo: 'Em revisão',
    texto: 'Significa que estamos analisando sua solicitação e realizando a confirmação da disponibilidade do item, valores, loja de compra e demais informações necessárias para seguir com o atendimento.',
  },
  {
    emoji: '💳',
    titulo: 'Aguardando pagamento',
    texto: 'Após a confirmação do item, atualizaremos o pedido com as informações de pagamento e os detalhes necessários para finalizar a compra.',
  },
  {
    emoji: '🛒',
    titulo: 'Comprado',
    texto: 'Quando o pedido for marcado como comprado, significa que a compra já foi realizada e estamos aguardando a chegada do item em nosso armazém na Coreia do Sul.',
  },
]

export function GuiaPedidoInfo() {
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
            <span className="text-lg font-bold" style={{ color: '#1A1A2E' }}>Guia de acompanhamento do pedido 📦</span>
            <ChevronDown className="w-5 h-5 shrink-0" style={{ color: '#6B7280' }} />
          </span>
          <div className="relative">
            <p className="text-sm leading-relaxed line-clamp-6" style={{ color: '#6B7280' }}>
              Após solicitar um produto pelo serviço de Personal Shopper, sua solicitação ficará disponível na aba Pedidos, onde você poderá acompanhar todas as atualizações do processo. Sempre consulte essa área para verificar o andamento da sua compra. 🔎 Em revisão: analisamos sua solicitação e confirmamos a disponibilidade do item, valores e loja de compra. 💳 Aguardando pagamento: enviamos as informações de pagamento para finalizar a compra. 🛒 Comprado: compra realizada, aguardando a chegada do item ao armazém na Coreia do Sul.
            </p>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white via-white to-transparent" />
          </div>
          <p className="text-sm font-semibold mt-3" style={{ color: '#FF6B9D' }}>Clique para ver o guia completo</p>
        </button>
      ) : (
        <>
          <button
            type="button"
            onClick={() => setAberto(false)}
            aria-expanded={true}
            className="w-full flex items-center justify-between gap-3 p-6 sm:p-8 text-left hover:bg-gray-50/50 transition-colors"
          >
            <h2 className="text-lg font-bold" style={{ color: '#1A1A2E' }}>Guia de acompanhamento do pedido 📦</h2>
            <ChevronDown className="w-5 h-5 shrink-0 transition-transform rotate-180" style={{ color: '#6B7280' }} />
          </button>

          <div className="px-6 sm:px-8 pb-6 sm:pb-8">
            <div className="space-y-8">
              <div>
                <p className="text-sm" style={{ color: '#6B7280' }}>
                  Após solicitar um produto pelo serviço de Personal Shopper, sua solicitação ficará disponível na aba Pedidos, onde você poderá acompanhar todas as atualizações do processo.
                </p>
                <p className="text-sm mt-3" style={{ color: '#6B7280' }}>
                  Sempre consulte essa área para verificar o andamento da sua compra.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-4" style={{ color: '#1A1A2E' }}>Status do pedido</h3>
                <div className="space-y-3">
                  {statuses.map(({ emoji, titulo, texto }) => (
                    <div key={titulo} className="rounded-xl p-4" style={{ background: '#F9FAFB' }}>
                      <p className="font-medium text-sm" style={{ color: '#1A1A2E' }}>{emoji} {titulo}:</p>
                      <p className="text-sm mt-1" style={{ color: '#6B7280' }}>{texto}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 space-y-3">
                  <p className="text-sm" style={{ color: '#6B7280' }}>
                    Assim que o produto chegar, iremos registrar diretamente na sua suíte que o item está disponível.
                  </p>
                  <p className="text-sm" style={{ color: '#6B7280' }}>
                    Em compras individuais (compra solo), iremos adicionar a foto da etiqueta da caixa para identificação da chegada do produto.
                  </p>
                  <p className="text-sm" style={{ color: '#6B7280' }}>
                    Quando o item fizer parte de uma compra conjunta com produtos de outros clientes, não adicionaremos a foto da etiqueta da caixa, mas iremos realizar o registro fotográfico do seu item e atualizar diretamente na sua suíte.
                  </p>
                  <p className="text-sm" style={{ color: '#6B7280' }}>
                    Após o registro, seu item ficará disponível e pronto para que você possa solicitar o envio quando desejar.
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-4" style={{ color: '#1A1A2E' }}>Alteração de valor</h3>
                <div className="space-y-3">
                  <p className="text-sm" style={{ color: '#6B7280' }}>
                    Em alguns casos, pode ocorrer alteração no valor do produto devido a mudanças de preço da loja, disponibilidade do item ou diferença entre plataformas de compra na Coreia do Sul.
                  </p>
                  <p className="text-sm" style={{ color: '#6B7280' }}>
                    Caso o valor seja alterado e você não queira continuar com a compra pelo novo valor informado, você poderá utilizar o botão de cancelamento da solicitação sem nenhum problema. Entenderemos que o novo valor não está de acordo com o que você deseja.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl p-5" style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}>
                <p className="text-sm font-medium" style={{ color: '#1A1A2E' }}>
                  Atenção: o cancelamento só poderá ser realizado enquanto o pedido ainda não tiver sido confirmado e o pagamento não tiver sido efetuado.
                </p>
                <p className="text-sm mt-3" style={{ color: '#6B7280' }}>
                  Após a confirmação da compra e a realização do pagamento, o cancelamento não será aceito, pois já teremos iniciado o processo de compra, separação e andamento do seu pedido.
                </p>
                <p className="text-sm mt-3" style={{ color: '#6B7280' }}>
                  Por isso, confirme todas as informações e valores antes de finalizar o pagamento.
                </p>
                <p className="text-sm mt-3 font-medium" style={{ color: '#1A1A2E' }}>
                  Lembre-se: todas as atualizações, confirmações e informações do seu pedido estarão disponíveis na aba Pedidos.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  )
}
