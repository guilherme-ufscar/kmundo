import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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

export async function GET() {
  try {
    const config = await prisma.configuracao.findFirst()
    const html = config?.termosUso ?? TERMOS_PADRAO
    return NextResponse.json({ html })
  } catch {
    return NextResponse.json({ html: TERMOS_PADRAO })
  }
}
