import { z } from 'zod'

export const itemSchema = z.object({
  clienteId: z.string().cuid(),
  descricao: z.string().min(1, 'Descrição obrigatória').max(255),
  lojaOrigem: z.string().optional(),
  trackingLoja: z.string().optional(),
  observacoes: z.string().optional(),
  fotos: z.array(z.string()).max(10).optional(),
})

export const atualizarStatusSchema = z.object({
  status: z.enum(['RECEBIDO', 'EM_ARMAZEM', 'EM_ENVIO', 'PREPARANDO_ENVIO', 'ENVIADO', 'ENTREGUE']),
})

export type ItemInput = z.infer<typeof itemSchema>
export type AtualizarStatusInput = z.infer<typeof atualizarStatusSchema>
