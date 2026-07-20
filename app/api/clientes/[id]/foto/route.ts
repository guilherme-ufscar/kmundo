import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { clienteMatchesSession } from '@/lib/cliente-session'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? '/app/uploads'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const cliente = await prisma.cliente.findUnique({ where: { id: params.id }, include: { usuario: { select: { email: true } } } })
  if (!cliente) {
    return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 })
  }

  if (session.user.role !== 'ADMIN' && !clienteMatchesSession(cliente, session.user)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  const formData = await req.formData()
  const file = formData.get('foto') as File | null

  if (!file) {
    return NextResponse.json({ error: 'Nenhuma foto enviada' }, { status: 400 })
  }

  const ext = file.name.split('.').pop() ?? 'jpg'
  const dir = path.join(UPLOAD_DIR, 'clientes', params.id)
  await mkdir(dir, { recursive: true })

  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const filePath = path.join(dir, filename)
  const buffer = Buffer.from(await file.arrayBuffer())
  await writeFile(filePath, buffer)

  const fotoPerfil = `/uploads/clientes/${params.id}/${filename}`

  await prisma.cliente.update({
    where: { id: params.id },
    data: { fotoPerfil },
  })

  return NextResponse.json({ fotoPerfil })
}
