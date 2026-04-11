import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { enviarEmailConvite } from '@/lib/email'

export async function POST(
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
  if (!convite.email) {
    return NextResponse.json({ error: 'Este convite não tem email associado' }, { status: 400 })
  }
  if (convite.usado) {
    return NextResponse.json({ error: 'Este convite já foi utilizado' }, { status: 400 })
  }
  if (new Date(convite.expiresAt) < new Date()) {
    return NextResponse.json({ error: 'Este convite está expirado' }, { status: 400 })
  }

  const link = `${process.env.NEXTAUTH_URL ?? 'https://kmundowarehouse.com'}/cadastro?token=${convite.token}`

  try {
    await enviarEmailConvite(convite.email, link, convite.expiresAt)
    return NextResponse.json({ ok: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro ao enviar email'
    console.error('[reenviar convite]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
