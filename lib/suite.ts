import { prisma } from './prisma'

export async function gerarProximaSuite(): Promise<number> {
  // Use raw SQL to atomically get next suite number, avoiding race conditions
  const result = await prisma.$queryRaw<{ next_suite: number }[]>`
    SELECT COALESCE(MAX("numeroDeSuite"), 0) + 1 AS next_suite
    FROM "clientes"
  `
  return result[0].next_suite
}
