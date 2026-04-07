import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { enviarEmailRecuperacaoSenha } from '@/lib/email'
import { z } from 'zod'
import { randomBytes } from 'crypto'

const schema = z.object({
  email: z.string().email(),
})

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Email inválido' }, { status: 400 })
  }

  const { email } = parsed.data

  const usuario = await prisma.usuario.findUnique({ where: { email } })
  // Retorna sucesso mesmo se e-mail não existe (segurança)
  if (!usuario) {
    return NextResponse.json({ ok: true })
  }

  const token = randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hora

  await prisma.tokenRecuperacao.create({
    data: { email, token, expiresAt },
  })

  await enviarEmailRecuperacaoSenha(email, token)

  return NextResponse.json({ ok: true })
}
