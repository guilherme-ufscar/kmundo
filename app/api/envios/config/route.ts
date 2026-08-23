import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { envioConfigSchema } from '@/lib/validations/envio'

export const dynamic = 'force-dynamic'

export async function GET() {
  let config = await prisma.envioConfig.findFirst()
  if (!config) config = await prisma.envioConfig.create({ data: {} })
  return NextResponse.json(config)
}

export async function PUT(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const body = await req.json()
  const parsed = envioConfigSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  let config = await prisma.envioConfig.findFirst()
  if (config) config = await prisma.envioConfig.update({ where: { id: config.id }, data: parsed.data })
  else config = await prisma.envioConfig.create({ data: parsed.data })
  return NextResponse.json(config)
}
