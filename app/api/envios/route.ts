import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { notificarAdminNovoEnvio, notificarClienteEnvioSolicitado } from '@/lib/email'

const criarEnvioSchema = z.object({
  metodoEnvio: z.enum(['FEDEX', 'EMS', 'ENVIO_EM_GRUPO']),
  itemIds: z.array(z.string()).min(1, 'Selecione ao menos um item'),
  valorDeclarado: z.number().positive().optional(),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const cliente = await prisma.cliente.findFirst({
    where: { usuario: { id: session.user.id } },
  })
  if (!cliente) {
    return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 })
  }

  const body = await req.json()
  const parsed = criarEnvioSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { metodoEnvio, itemIds, valorDeclarado } = parsed.data

  // Verificar que os itens pertencem ao cliente
  const itens = await prisma.item.findMany({
    where: { id: { in: itemIds }, clienteId: cliente.id },
  })
  if (itens.length !== itemIds.length) {
    return NextResponse.json({ error: 'Um ou mais itens inválidos' }, { status: 400 })
  }

  const envio = await prisma.envio.create({
    data: {
      clienteId: cliente.id,
      metodoEnvio,
      valorDeclarado,
      itens: {
        create: itemIds.map((itemId) => ({ itemId })),
      },
    },
    include: {
      itens: { include: { item: true } },
      cliente: { include: { usuario: { select: { email: true } } } },
    },
  })

  const emailCliente = envio.cliente.usuario.email
  const nomeCliente = envio.cliente.nomeCompleto
  const suite = envio.cliente.numeroDeSuite
  const nomesItens = envio.itens.map(i => i.item.descricao)

  Promise.all([
    notificarAdminNovoEnvio({ nomeCliente, suite, metodo: metodoEnvio, itens: nomesItens, envioId: envio.id }),
    notificarClienteEnvioSolicitado({ emailCliente, nomeCliente, suite, metodo: metodoEnvio, itens: nomesItens, envioId: envio.id }),
  ]).catch(console.error)

  return NextResponse.json(envio, { status: 201 })
}

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const metodo = searchParams.get('metodo')

  const where: Record<string, unknown> = {}

  if (session.user.role === 'CLIENTE') {
    const cliente = await prisma.cliente.findFirst({
      where: { usuario: { id: session.user.id } },
    })
    if (!cliente) return NextResponse.json([])
    where['clienteId'] = cliente.id
  }

  if (status) where['status'] = status
  if (metodo) where['metodoEnvio'] = metodo

  const envios = await prisma.envio.findMany({
    where,
    include: {
      cliente: { select: { nomeCompleto: true, numeroDeSuite: true } },
      itens: { include: { item: { select: { id: true, descricao: true, status: true } } } },
    },
    orderBy: { criadoEm: 'desc' },
  })

  return NextResponse.json(envios)
}
