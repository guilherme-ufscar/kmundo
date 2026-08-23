import { z } from 'zod'
import { validarCpf } from './auth'

function validarDocumento(doc: string | undefined): boolean {
  if (!doc || doc.trim() === '') return true // opcional no perfil, mas se preenchido valida
  const digitos = doc.replace(/\D/g, '')
  // Aceita CPF (11) com validação, ou CNPJ/outro com 11-14 dígitos sem validar rigoroso
  if (digitos.length === 11) return validarCpf(doc)
  if (digitos.length >= 8 && digitos.length <= 14) return true
  return false
}

export const clientePerfilSchema = z.object({
  nomeCompleto: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  documento: z.string().trim().max(18).optional().or(z.literal('')).refine(validarDocumento, { message: 'CPF inválido' }),
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
