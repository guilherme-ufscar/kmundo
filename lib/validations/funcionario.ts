import { z } from 'zod'

export const funcionarioSchema = z.object({
  nomeCompleto: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  telefone: z.string().optional(),
  cargo: z.string().optional(),
  dataAdmissao: z.string().optional(),
  salarioBase: z.number().nonnegative('Salário base não pode ser negativo').optional().nullable(),
  status: z.enum(['ATIVO', 'INATIVO']).optional(),
  observacoes: z.string().optional(),
})

export const lancamentoFuncionarioSchema = z.object({
  tipo: z.enum(['PAGAMENTO', 'HORA_EXTRA', 'ATESTADO', 'DESCONTO', 'OBSERVACAO']),
  dataReferencia: z.string().min(1, 'Informe a data de referência'),
  valor: z.number().nonnegative().optional().nullable(),
  horas: z.number().nonnegative().optional().nullable(),
  quantidadeDias: z.number().int().nonnegative().optional().nullable(),
  descricao: z.string().optional(),
  arquivoAtestado: z.string().optional().nullable(),
})

export type FuncionarioInput = z.infer<typeof funcionarioSchema>
export type LancamentoFuncionarioInput = z.infer<typeof lancamentoFuncionarioSchema>
