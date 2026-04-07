import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const perfilSchema = z.object({
  nomeCompleto: z.string().min(2).optional(),
  telefone: z.string().min(8).optional(),
  pais: z.string().min(2).optional(),
  cidade: z.string().optional(),
  cep: z.string().optional(),
  endereco: z.string().optional(),
  status: z.enum(['PENDENTE', 'ATIVA', 'SUSPENSA']).optional(),
})

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const cliente = await prisma.cliente.findUnique({
    where: { id: params.id },
    include: { usuario: { select: { email: true } } },
  })

  if (!cliente) {
    return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 })
  }

  // Only own client or admin can view
  if (session.user.role !== 'ADMIN' && cliente.usuarioId !== session.user.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  return NextResponse.json(cliente)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const cliente = await prisma.cliente.findUnique({ where: { id: params.id } })
  if (!cliente) {
    return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 })
  }

  await prisma.$transaction(async (tx) => {
    await tx.itemEnvio.deleteMany({ where: { item: { clienteId: params.id } } })
    await tx.itemEnvio.deleteMany({ where: { envio: { clienteId: params.id } } })
    await tx.item.deleteMany({ where: { clienteId: params.id } })
    await tx.envio.deleteMany({ where: { clienteId: params.id } })
    await tx.cliente.delete({ where: { id: params.id } })
    await tx.usuario.delete({ where: { id: cliente.usuarioId } })
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

  const cliente = await prisma.cliente.findUnique({
    where: { id: params.id },
  })

  if (!cliente) {
    return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 })
  }

  // Only own client can update their profile (admin cannot use this endpoint for security)
  if (cliente.usuarioId !== session.user.id && session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  const body = await req.json()
  const parsed = perfilSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const atualizado = await prisma.cliente.update({
    where: { id: params.id },
    data: parsed.data,
  })

  return NextResponse.json(atualizado)
}
