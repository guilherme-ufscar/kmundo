import { prisma } from '@/lib/prisma'

export type ResultadoCalculo = {
  encontrado: boolean
  valor: number | null
  moeda: string | null
  taxaServico: number
  total: number | null
  tarifa: { id: string; pesoMin: number; pesoMax: number; valor: number; moeda: string; taxaServico: number } | null
  mensagem?: string
}

export async function calcularFrete(params: { paisId: string; peso: number; caixaTipoId?: string | null }): Promise<ResultadoCalculo> {
  const { paisId, peso, caixaTipoId } = params

  const pais = await prisma.fretePais.findUnique({ where: { id: paisId } })
  if (!pais || !pais.ativo) return { encontrado: false, valor: null, moeda: null, taxaServico: 0, total: null, tarifa: null, mensagem: 'País não encontrado ou inativo.' }

  // Prioridade: tarifa específica para caixa + peso, depois genérica (caixaTipoId null)
  const candidatos = await prisma.freteTarifa.findMany({
    where: {
      paisId,
      ativo: true,
      pesoMin: { lte: peso },
      pesoMax: { gte: peso },
      OR: caixaTipoId ? [{ caixaTipoId }, { caixaTipoId: null }] : [{ caixaTipoId: null }],
    },
    orderBy: [
      // específica primeiro
      { caixaTipoId: 'desc' },
      { valor: 'asc' },
    ],
  })

  // Preferir match exato de caixa; se não houver, usar genérico
  let tarifa = candidatos.find(c => c.caixaTipoId === caixaTipoId) ?? candidatos.find(c => c.caixaTipoId === null) ?? null

  // Se cliente não escolheu caixa mas só existem tarifas específicas, tentar qualquer ativa no peso
  if (!tarifa && candidatos.length > 0) tarifa = candidatos[0]

  if (!tarifa) {
    // tentar buscar caixaTipo para ver se peso excede limits
    return { encontrado: false, valor: null, moeda: pais.moeda, taxaServico: 0, total: null, tarifa: null, mensagem: 'Nenhuma tarifa encontrada para esse peso/país/caixa. Nossa equipe confirmará o valor final.' }
  }

  const total = tarifa.valor + (tarifa.taxaServico ?? 0)
  return {
    encontrado: true,
    valor: tarifa.valor,
    moeda: tarifa.moeda,
    taxaServico: tarifa.taxaServico ?? 0,
    total,
    tarifa: { id: tarifa.id, pesoMin: tarifa.pesoMin, pesoMax: tarifa.pesoMax, valor: tarifa.valor, moeda: tarifa.moeda, taxaServico: tarifa.taxaServico ?? 0 },
  }
}

export async function getFreteDadosPublicos() {
  const [paises, caixas, config] = await Promise.all([
    prisma.fretePais.findMany({ where: { ativo: true }, orderBy: [{ ordem: 'asc' }, { nome: 'asc' }] }),
    prisma.freteCaixaTipo.findMany({ where: { ativo: true }, orderBy: [{ ordem: 'asc' }, { nome: 'asc' }] }),
    prisma.freteConfig.findFirst(),
  ])
  return { paises, caixas, config }
}
