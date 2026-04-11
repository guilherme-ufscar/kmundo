import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { TermosEditor } from '@/components/admin/TermosEditor'
import { FileText, ExternalLink } from 'lucide-react'
import Link from 'next/link'

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

export default async function TermosAdminPage() {
  const session = await auth()
  if (!session || session.user?.role !== 'ADMIN') redirect('/login')

  let html = TERMOS_PADRAO
  try {
    const config = await prisma.configuracao.findFirst()
    if (config?.termosUso) html = config.termosUso
  } catch {}

  return (
    <div className="p-4 sm:p-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #FF6B9D20, #C77DFF20)' }}>
              <FileText className="w-5 h-5" style={{ color: '#FF6B9D' }} />
            </div>
            <h1 className="text-2xl font-bold" style={{ color: '#1A1A2E' }}>Termos de Uso</h1>
          </div>
          <p className="text-sm ml-12" style={{ color: '#6B7280' }}>
            Edite o conteúdo que os clientes precisam aceitar no cadastro
          </p>
        </div>
        <Link
          href="/termos"
          target="_blank"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-opacity hover:opacity-70"
          style={{ borderColor: '#E5E7EB', color: '#6B7280' }}
        >
          <ExternalLink className="w-4 h-4" />
          Visualizar
        </Link>
      </div>

      {/* Info */}
      <div
        className="flex items-start gap-3 p-4 rounded-xl mb-6 text-sm"
        style={{ background: '#FFFBEB', border: '1px solid #FDE68A', color: '#92400E' }}
      >
        <span className="text-base mt-0.5">💡</span>
        <p>
          Este conteúdo é exibido na página pública <strong>/termos</strong> e deve ser aceito por todos os clientes durante o cadastro. Use o editor abaixo para formatar o texto com negrito, itálico, listas, títulos e imagens.
        </p>
      </div>

      <TermosEditor initialHtml={html} />
    </div>
  )
}
