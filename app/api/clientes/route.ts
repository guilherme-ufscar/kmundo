import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { cadastroSchema } from '@/lib/validations/auth'
import { gerarProximaSuite } from '@/lib/suite'
import { hash } from 'bcryptjs'
import { enviarEmailBoasVindas } from '@/lib/email'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = cadastroSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { email, password, nomeCompleto, telefone, pais, endereco, cidade, cep, complemento, bairro, estado } = parsed.data

  const existente = await prisma.usuario.findUnique({ where: { email } })
  if (existente) {
    return NextResponse.json({ error: 'Email já cadastrado' }, { status: 409 })
  }

  const senhaHash = await hash(password, 12)

  // Retry loop to handle race conditions on numeroDeSuite (unique constraint)
  let usuarioId: string | null = null
  let clienteNumeroDeSuite: number | null = null
  for (let tentativa = 1; tentativa <= 5; tentativa++) {
    const numeroDeSuite = await gerarProximaSuite()
    try {
      const criado = await prisma.usuario.create({
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
              cep,
              endereco,
              complemento,
              bairro,
              cidade,
              estado,
              status: 'ATIVA',
            },
          },
        },
        include: { cliente: true },
      })
      usuarioId = criado.id
      clienteNumeroDeSuite = criado.cliente?.numeroDeSuite ?? null
      break
    } catch (err: unknown) {
      const e = err as { code?: string }
      if (e?.code === 'P2002' && tentativa < 5) continue
      throw err
    }
  }

  if (!usuarioId) {
    return NextResponse.json({ error: 'Erro ao gerar número de suite. Tente novamente.' }, { status: 500 })
  }

  if (clienteNumeroDeSuite) {
    enviarEmailBoasVindas({
      email,
      nomeCompleto,
      numeroDeSuite: clienteNumeroDeSuite,
    }).catch(console.error)
  }

  return NextResponse.json(
    { id: usuarioId, email, numeroDeSuite: clienteNumeroDeSuite },
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
