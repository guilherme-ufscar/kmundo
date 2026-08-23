import { z } from 'zod'

export const fretePaisSchema = z.object({
  nome: z.string().min(2, 'Nome obrigatório').max(80),
  codigo: z.string().min(2, 'Código obrigatório').max(10).transform(v => v.toUpperCase().trim()),
  moeda: z.string().min(3).max(3).default('BRL'),
  ativo: z.boolean().default(true),
  ordem: z.number().int().min(0).default(0),
})

export const freteCaixaSchema = z.object({
  nome: z.string().min(2, 'Nome obrigatório').max(80),
  descricao: z.string().max(500).optional().nullable(),
  comprimento: z.number().min(0).optional().nullable(),
  largura: z.number().min(0).optional().nullable(),
  altura: z.number().min(0).optional().nullable(),
  pesoMax: z.number().min(0).optional().nullable(),
  ativo: z.boolean().default(true),
  ordem: z.number().int().min(0).default(0),
})

export const freteTarifaSchema = z.object({
  paisId: z.string().cuid(),
  caixaTipoId: z.string().cuid().optional().nullable(),
  pesoMin: z.number().min(0, 'Peso mínimo inválido'),
  pesoMax: z.number().min(0.01, 'Peso máximo inválido'),
  valor: z.number().min(0, 'Valor inválido'),
  moeda: z.string().min(3).max(3).default('BRL'),
  taxaServico: z.number().min(0).default(0),
  ativo: z.boolean().default(true),
}).refine(d => d.pesoMax > d.pesoMin, { message: 'pesoMax deve ser maior que pesoMin', path: ['pesoMax'] })

export const freteConfigSchema = z.object({
  titulo: z.string().min(2).max(120).optional(),
  subtitulo: z.string().max(500).optional().nullable(),
  introducaoHtml: z.string().optional().nullable(),
  comoFuncionaHtml: z.string().optional().nullable(),
  avisoEstimativaHtml: z.string().optional().nullable(),
  comoPesoHtml: z.string().optional().nullable(),
  comoPaisHtml: z.string().optional().nullable(),
  comoCaixasHtml: z.string().optional().nullable(),
  taxasServicoHtml: z.string().optional().nullable(),
  diferencasValorHtml: z.string().optional().nullable(),
  regrasAdicionaisHtml: z.string().optional().nullable(),
})

export const calcularFreteSchema = z.object({
  paisId: z.string().cuid('Selecione um país'),
  peso: z.number().min(0.01, 'Informe o peso').max(500),
  caixaTipoId: z.string().cuid().optional().nullable(),
})

export type FretePaisInput = z.infer<typeof fretePaisSchema>
export type FreteCaixaInput = z.infer<typeof freteCaixaSchema>
export type FreteTarifaInput = z.infer<typeof freteTarifaSchema>
export type FreteConfigInput = z.infer<typeof freteConfigSchema>
export type CalcularFreteInput = z.infer<typeof calcularFreteSchema>
