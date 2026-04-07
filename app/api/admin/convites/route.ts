import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { randomBytes } from 'crypto'
import { z } from 'zod'
import { enviarEmailConvite } from '@/lib/email'

const criarConviteSchema = z.object({
  email: z.string().email('Email inválido').optional().or(z.literal('')),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const body = await req.json()
  const parsed = criarConviteSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const token = randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

  const email = parsed.data.email && parsed.data.email.length > 0 ? parsed.data.email : null

  const convite = await prisma.conviteCliente.create({
    data: { token, email, expiresAt },
  })

  const link = `${process.env.NEXTAUTH_URL ?? 'https://kmundowarehouse.com'}/cadastro?token=${token}`

  // Enviar email de convite se email foi fornecido
  if (email) {
    enviarEmailConvite(email, link, expiresAt).catch(console.error)
  }

  return NextResponse.json({ token: convite.token, link, expiresAt: convite.expiresAt }, { status: 201 })
}

export async function GET() {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const convites = await prisma.conviteCliente.findMany({
    orderBy: { criadoEm: 'desc' },
  })

  return NextResponse.json(convites)
}
