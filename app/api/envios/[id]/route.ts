import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { notificarClienteStatusEnvio, notificarAdminClienteConfirmou } from '@/lib/email'

const patchAdminSchema = z.object({
  status: z.enum(['AGUARDANDO_CONFIRMACAO', 'CONFIRMADO', 'EMBALANDO', 'PAGO', 'ENVIADO', 'ENTREGUE']).optional(),
  peso: z.number().positive().optional(),
  largura: z.number().positive().optional(),
  altura: z.number().positive().optional(),
  comprimento: z.number().positive().optional(),
  valorDeclarado: z.number().positive().optional(),
  moeda: z.string().optional(),
  fotos: z.array(z.string()).optional(),
  videoUrl: z.string().optional(),
  trackingEnvio: z.string().optional(),
  dataLimitePagamento: z.string().datetime().optional(),
  observacoes: z.string().optional(),
})

const patchClienteSchema = z.object({
  confirmadoCliente: z.literal(true),
})

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const envio = await prisma.envio.findUnique({
    where: { id: params.id },
    include: {
      cliente: { select: { id: true, nomeCompleto: true, numeroDeSuite: true } },
      itens: {
        include: {
          item: { select: { id: true, descricao: true, lojaOrigem: true, trackingLoja: true, status: true } },
        },
      },
    },
  })

  if (!envio) {
    return NextResponse.json({ error: 'Envio não encontrado' }, { status: 404 })
  }

  if (session.user.role === 'CLIENTE') {
    const cliente = await prisma.cliente.findFirst({
      where: { usuario: { id: session.user.id } },
    })
    if (!cliente || envio.clienteId !== cliente.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
    }
  }

  return NextResponse.json(envio)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const envio = await prisma.envio.findUnique({ where: { id: params.id } })
  if (!envio) {
    return NextResponse.json({ error: 'Envio não encontrado' }, { status: 404 })
  }

  await prisma.$transaction(async (tx) => {
    await tx.itemEnvio.deleteMany({ where: { envioId: params.id } })
    await tx.envio.delete({ where: { id: params.id } })
  })

  return NextResponse.json({ ok: true })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const envio = await prisma.envio.findUnique({ where: { id: params.id } })
  if (!envio) {
    return NextResponse.json({ error: 'Envio não encontrado' }, { status: 404 })
  }

  const body = await req.json()

  if (session.user.role === 'ADMIN') {
    const parsed = patchAdminSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const data: Record<string, unknown> = { ...parsed.data }
    if (parsed.data.dataLimitePagamento) {
      data.dataLimitePagamento = new Date(parsed.data.dataLimitePagamento)
    }

    const atualizado = await prisma.envio.update({
      where: { id: params.id },
      data,
      include: {
        itens: { include: { item: true } },
        cliente: { include: { usuario: { select: { email: true } } } },
      },
    })

    // Notificar cliente se status mudou
    if (parsed.data.status && parsed.data.status !== envio.status) {
      notificarClienteStatusEnvio({
        emailCliente: atualizado.cliente.usuario.email,
        nomeCliente: atualizado.cliente.nomeCompleto,
        suite: atualizado.cliente.numeroDeSuite,
        novoStatus: parsed.data.status,
        metodo: atualizado.metodoEnvio,
        tracking: atualizado.trackingEnvio,
        itens: atualizado.itens.map(i => i.item.descricao),
        envioId: atualizado.id,
      }).catch(console.error)
    }

    return NextResponse.json(atualizado)
  }

  // Cliente só pode confirmar
  const cliente = await prisma.cliente.findFirst({
    where: { usuario: { id: session.user.id } },
    include: { usuario: { select: { email: true } } },
  })
  if (!cliente || envio.clienteId !== cliente.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  const parsed = patchClienteSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Operação não permitida' }, { status: 400 })
  }

  const atualizado = await prisma.envio.update({
    where: { id: params.id },
    data: { confirmadoCliente: true },
  })

  notificarAdminClienteConfirmou({
    nomeCliente: cliente.nomeCompleto,
    suite: cliente.numeroDeSuite,
    envioId: atualizado.id,
  }).catch(console.error)

  return NextResponse.json(atualizado)
}
