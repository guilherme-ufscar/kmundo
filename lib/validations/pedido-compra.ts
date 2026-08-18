import { z } from 'zod'

export const pedidoCompraItemSchema = z.object({
  produtoShopId: z.string().optional(),
  nomeProduto: z.string().min(2, 'Informe o nome do produto'),
  urlProduto: z.string().url('Informe um link válido').optional().or(z.literal('')),
  quantidade: z.number().int().min(1, 'Quantidade mínima é 1'),
  variacao: z.string().optional(),
  observacoes: z.string().optional(),
})

export const criarPedidoCompraSchema = z.object({
  itens: z.array(pedidoCompraItemSchema).min(1, 'Adicione ao menos um item'),
  observacoesCliente: z.string().optional(),
  formaPagamentoCliente: z.enum(['PIX', 'CARTAO_WHATSAPP']).optional(),
})

export const atualizarPedidoCompraAdminSchema = z.object({
  status: z.enum(['AGUARDANDO_REVISAO', 'AGUARDANDO_PAGAMENTO', 'PAGO', 'COMPRADO', 'CANCELADO']).optional(),
  valorTotal: z.number().nonnegative().optional().nullable(),
  moeda: z.string().min(1).optional(),
  chavePix: z.string().optional().nullable(),
  qrCodePix: z.string().optional().nullable(),
  instrucoesPix: z.string().optional().nullable(),
  linkCartao: z.string().url('Informe um link válido').optional().nullable().or(z.literal('')),
  whatsappRecepcao: z.string().optional().nullable(),
  observacoesAdmin: z.string().optional().nullable(),
  dataLimitePagamento: z.string().datetime().optional().nullable(),
  formaPagamentoCliente: z.enum(['PIX', 'CARTAO_WHATSAPP']).optional().nullable(),
  pagoEm: z.string().datetime().optional().nullable(),
})

export type CriarPedidoCompraInput = z.infer<typeof criarPedidoCompraSchema>
export type AtualizarPedidoCompraAdminInput = z.infer<typeof atualizarPedidoCompraAdminSchema>
