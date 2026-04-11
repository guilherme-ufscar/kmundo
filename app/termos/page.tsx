import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Logo } from '@/components/Logo'

const TERMOS_PADRAO = `
<h2>Termos de Uso e Condições do Serviço</h2>
<p>Bem-vinda à <strong>KMundo Warehouse</strong>. Ao criar uma conta e utilizar nossos serviços, você concorda com os termos e condições descritos abaixo. Leia com atenção antes de prosseguir.</p>

<h3>1. Descrição do Serviço</h3>
<p>A KMundo Warehouse oferece um serviço de endereço na Coreia do Sul para recebimento, armazenamento e redirecionamento de encomendas. Atuamos como intermediária entre lojas coreanas e clientes internacionais.</p>

<h3>2. Responsabilidades do Cliente</h3>
<p>O cliente é responsável por:</p>
<ul>
  <li>Fornecer informações de endereço de entrega corretas e completas;</li>
  <li>Verificar as restrições de importação do seu país;</li>
  <li>Arcar com todos os custos de envio, impostos e taxas alfandegárias aplicáveis;</li>
  <li>Comunicar qualquer problema com o pedido dentro do prazo estipulado.</li>
</ul>

<h3>3. Armazenamento</h3>
<p>Os itens serão armazenados gratuitamente por <strong>30 dias</strong> a partir da data de recebimento. Após esse período, poderão ser cobradas taxas de armazenamento conforme tabela vigente.</p>

<h3>4. Itens Proibidos</h3>
<p>Não são aceitos itens ilegais, perigosos, inflamáveis, perecíveis ou que violem as leis de exportação/importação da Coreia do Sul ou do país de destino.</p>

<h3>5. Limitação de Responsabilidade</h3>
<p>A KMundo Warehouse não se responsabiliza por danos causados por transportadoras, extravio ou atraso após despacho, ou retenção alfandegária no país de destino.</p>

<h3>6. Privacidade</h3>
<p>Seus dados pessoais são utilizados exclusivamente para a prestação do serviço e não serão compartilhados com terceiros sem seu consentimento.</p>

<h3>7. Alterações nos Termos</h3>
<p>Estes termos podem ser atualizados a qualquer momento. Clientes serão notificados sobre mudanças relevantes.</p>

<p><em>Ao marcar a caixa de aceite no cadastro, você confirma que leu, entendeu e concorda com todos os termos acima.</em></p>
`

export default async function TermosPage() {
  let html = TERMOS_PADRAO
  try {
    const config = await prisma.configuracao.findFirst()
    if (config?.termosUso) html = config.termosUso
  } catch {}

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #1A1A2E 0%, #16213E 100%)' }}>
      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Logo size={36} color="white" />
            <span className="text-white font-bold text-lg">KMundo Warehouse</span>
          </div>
          <Link
            href="/cadastro"
            className="inline-flex items-center gap-2 text-sm font-medium hover:opacity-70 transition-opacity"
            style={{ color: '#FF6B9D' }}
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <div
            className="prose prose-sm max-w-none termos-content"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>

        <p className="text-center text-xs mt-6" style={{ color: 'rgba(255,255,255,0.3)' }}>
          © {new Date().getFullYear()} KMundo Warehouse. Todos os direitos reservados.
        </p>
      </div>
    </div>
  )
}
