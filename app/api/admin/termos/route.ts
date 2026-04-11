import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const config = await prisma.configuracao.findFirst()
  return NextResponse.json({ html: config?.termosUso ?? '' })
}

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { html } = await req.json()
  if (typeof html !== 'string') {
    return NextResponse.json({ error: 'Conteúdo inválido' }, { status: 400 })
  }

  let config = await prisma.configuracao.findFirst()
  if (config) {
    config = await prisma.configuracao.update({
      where: { id: config.id },
      data: { termosUso: html },
    })
  } else {
    config = await prisma.configuracao.create({ data: { termosUso: html } })
  }

  return NextResponse.json({ ok: true })
}
