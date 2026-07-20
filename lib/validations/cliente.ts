import { z } from 'zod'

export const clientePerfilSchema = z.object({
  nomeCompleto: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  documento: z.string().trim().min(11, 'Informe CPF ou CNPJ').max(18).optional().or(z.literal('')),
  telefone: z.string().min(8, 'Telefone deve ter ao menos 8 caracteres'),
  pais: z.string().min(2, 'País deve ter ao menos 2 caracteres'),
  cep: z.string().optional(),
  endereco: z.string().optional(),
  numero: z.string().optional(),
  complemento: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  fotoPerfil: z.string().optional().nullable(),
})

export const clienteStatusSchema = z.enum(['PENDENTE', 'ATIVA', 'SUSPENSA'])

export const clientePatchSchema = clientePerfilSchema.partial().extend({
  status: clienteStatusSchema.optional(),
})

export type ClientePerfilInput = z.infer<typeof clientePerfilSchema>
export type ClientePatchInput = z.infer<typeof clientePatchSchema>
