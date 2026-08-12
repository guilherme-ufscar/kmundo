import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
})

// Validação de CPF (11 dígitos + dígitos verificadores), aceita com ou sem máscara
export function validarCpf(cpf: string): boolean {
  const digitos = cpf.replace(/\D/g, '')
  if (digitos.length !== 11) return false
  if (/^(\d)\1{10}$/.test(digitos)) return false

  let soma = 0
  for (let i = 0; i < 9; i++) soma += parseInt(digitos[i]) * (10 - i)
  let resto = (soma * 10) % 11
  if (resto === 10 || resto === 11) resto = 0
  if (resto !== parseInt(digitos[9])) return false

  soma = 0
  for (let i = 0; i < 10; i++) soma += parseInt(digitos[i]) * (11 - i)
  resto = (soma * 10) % 11
  if (resto === 10 || resto === 11) resto = 0
  return resto === parseInt(digitos[10])
}

export const cadastroSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
  nomeCompleto: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  cpf: z.string().refine(validarCpf, { message: 'CPF inválido' }),
  telefone: z.string().min(8, 'Telefone inválido'),
  pais: z.string().min(2, 'País obrigatório'),
  cep: z.string().optional(),
  endereco: z.string().optional(),
  numero: z.string().optional(),
  complemento: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
})

export type LoginInput = z.infer<typeof loginSchema>
export type CadastroInput = z.infer<typeof cadastroSchema>
