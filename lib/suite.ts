import { prisma } from './prisma'

export async function gerarProximaSuite(): Promise<number> {
  const resultado = await prisma.cliente.aggregate({
    _max: { numeroDeSuite: true },
  })
  return (resultado._max.numeroDeSuite ?? 0) + 1
}
