import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { cadastroSchema } from '@/lib/validations/auth'
import { gerarProximaSuite } from '@/lib/suite'
import { hash } from 'bcryptjs'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = cadastroSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { email, password, nomeCompleto, telefone, pais, endereco, cidade, cep, token } = parsed.data

  // Validate invite token
  const convite = await prisma.conviteCliente.findUnique({ where: { token } })
  if (!convite) {
    return NextResponse.json({ error: 'Token de convite inválido' }, { status: 403 })
  }
  if (convite.usado) {
    return NextResponse.json({ error: 'Este convite já foi utilizado' }, { status: 403 })
  }
  if (convite.expiresAt < new Date()) {
    return NextResponse.json({ error: 'Este convite expirou' }, { status: 403 })
  }

  const existente = await prisma.usuario.findUnique({ where: { email } })
  if (existente) {
    return NextResponse.json({ error: 'Email já cadastrado' }, { status: 409 })
  }

  const senhaHash = await hash(password, 12)
  const numeroDeSuite = await gerarProximaSuite()

  const usuario = await prisma.usuario.create({
    data: {
      email,
      senha: senhaHash,
      role: 'CLIENTE',
      cliente: {
        create: {
          numeroDeSuite,
          nomeCompleto,
          telefone,
          pais,
          endereco,
          cidade,
          cep,
          status: 'ATIVA',
        },
      },
    },
    include: { cliente: true },
  })

  // Mark invite as used
  await prisma.conviteCliente.update({
    where: { token },
    data: { usado: true },
  })

  return NextResponse.json(
    {
      id: usuario.id,
      email: usuario.email,
      numeroDeSuite: usuario.cliente?.numeroDeSuite,
    },
    { status: 201 }
  )
}

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const busca = searchParams.get('busca') ?? ''
  const status = searchParams.get('status')
  const pagina = parseInt(searchParams.get('pagina') ?? '1')
  const limite = parseInt(searchParams.get('limite') ?? '20')

  const where = {
    ...(busca && {
      OR: [
        { nomeCompleto: { contains: busca, mode: 'insensitive' as const } },
        { usuario: { email: { contains: busca, mode: 'insensitive' as const } } },
        ...(!isNaN(Number(busca)) && busca.trim() !== '' ? [{ numeroDeSuite: Number(busca) }] : []),
      ],
    }),
    ...(status && { status: status as 'PENDENTE' | 'ATIVA' | 'SUSPENSA' }),
  }

  const [clientes, total] = await Promise.all([
    prisma.cliente.findMany({
      where,
      include: { usuario: { select: { email: true } }, _count: { select: { itens: true } } },
      orderBy: { numeroDeSuite: 'asc' },
      skip: (pagina - 1) * limite,
      take: limite,
    }),
    prisma.cliente.count({ where }),
  ])

  return NextResponse.json({ clientes, total, pagina, limite })
}
