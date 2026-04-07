import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get('token')

  if (!token) {
    return NextResponse.json({ valido: false, motivo: 'Token não informado' })
  }

  const convite = await prisma.conviteCliente.findUnique({ where: { token } })

  if (!convite) {
    return NextResponse.json({ valido: false, motivo: 'Convite não encontrado' })
  }
  if (convite.usado) {
    return NextResponse.json({ valido: false, motivo: 'Este convite já foi utilizado' })
  }
  if (convite.expiresAt < new Date()) {
    return NextResponse.json({ valido: false, motivo: 'Este convite expirou' })
  }

  return NextResponse.json({ valido: true, email: convite.email ?? undefined })
}
