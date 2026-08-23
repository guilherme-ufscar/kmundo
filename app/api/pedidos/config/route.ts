import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { pedidoConfigSchema } from '@/lib/validations/pedido-compra'

export const dynamic = 'force-dynamic'

export async function GET() {
  let config = await prisma.pedidoConfig.findFirst()
  if (!config) config = await prisma.pedidoConfig.create({ data: {} })
  return NextResponse.json(config)
}

export async function PUT(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const body = await req.json()
  const parsed = pedidoConfigSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  let config = await prisma.pedidoConfig.findFirst()
  if (config) config = await prisma.pedidoConfig.update({ where: { id: config.id }, data: parsed.data })
  else config = await prisma.pedidoConfig.create({ data: parsed.data })
  return NextResponse.json(config)
}
