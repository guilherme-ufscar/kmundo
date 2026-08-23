import { z } from 'zod'

export const atualizacaoSchema = z.object({
  titulo: z.string().min(3, 'Título obrigatório').max(200),
  conteudo: z.string().min(10, 'Conteúdo obrigatório'),
  arquivada: z.boolean().default(false),
})

export type AtualizacaoInput = z.infer<typeof atualizacaoSchema>
