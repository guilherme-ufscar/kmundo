import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const convite = await prisma.conviteCliente.findUnique({ where: { id: params.id } })
  if (!convite) {
    return NextResponse.json({ error: 'Convite não encontrado' }, { status: 404 })
  }

  await prisma.conviteCliente.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
