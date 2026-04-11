import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
})

export const cadastroSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
  nomeCompleto: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  telefone: z.string().min(8, 'Telefone inválido'),
  pais: z.string().min(2, 'País obrigatório'),
  endereco: z.string().optional(),
  cidade: z.string().optional(),
  cep: z.string().optional(),
})

export type LoginInput = z.infer<typeof loginSchema>
export type CadastroInput = z.infer<typeof cadastroSchema>
