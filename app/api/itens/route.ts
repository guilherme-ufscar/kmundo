import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { itemSchema } from '@/lib/validations/item'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const body = await req.json()
  const parsed = itemSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const item = await prisma.item.create({
    data: {
      ...parsed.data,
      dataEntrada: new Date(),
    },
    include: { cliente: true },
  })

  return NextResponse.json(item, { status: 201 })
}

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const clienteId = searchParams.get('clienteId')
  const status = searchParams.get('status')
  const pagina = parseInt(searchParams.get('pagina') ?? '1')
  const limite = parseInt(searchParams.get('limite') ?? '20')

  // Cliente só pode ver seus próprios itens
  const where: Record<string, unknown> = {}

  if (session.user.role === 'CLIENTE') {
    const cliente = await prisma.cliente.findFirst({
      where: { usuario: { id: session.user.id } },
    })
    if (!cliente) return NextResponse.json({ itens: [], total: 0 })
    where['clienteId'] = cliente.id
  } else if (clienteId) {
    where['clienteId'] = clienteId
  }

  if (status) where['status'] = status

  const [itens, total] = await Promise.all([
    prisma.item.findMany({
      where,
      include: { cliente: { select: { numeroDeSuite: true, nomeCompleto: true } } },
      orderBy: { dataEntrada: 'desc' },
      skip: (pagina - 1) * limite,
      take: limite,
    }),
    prisma.item.count({ where }),
  ])

  return NextResponse.json({ itens, total, pagina, limite })
}
