import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'
import { z } from 'zod'

const schema = z.object({
  token: z.string().min(1),
  senha: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
})

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { token, senha } = parsed.data

  const registro = await prisma.tokenRecuperacao.findUnique({ where: { token } })

  if (!registro || registro.usado || registro.expiresAt < new Date()) {
    return NextResponse.json({ error: 'Token inválido ou expirado' }, { status: 400 })
  }

  const senhaHash = await hash(senha, 12)

  await prisma.$transaction([
    prisma.usuario.update({
      where: { email: registro.email },
      data: { senha: senhaHash },
    }),
    prisma.tokenRecuperacao.update({
      where: { token },
      data: { usado: true },
    }),
  ])

  return NextResponse.json({ ok: true })
}
