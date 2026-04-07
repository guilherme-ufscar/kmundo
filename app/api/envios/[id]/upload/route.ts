import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? '/app/uploads'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const envio = await prisma.envio.findUnique({ where: { id: params.id } })
  if (!envio) {
    return NextResponse.json({ error: 'Envio não encontrado' }, { status: 404 })
  }

  const formData = await req.formData()
  const files = formData.getAll('fotos') as File[]

  if (!files || files.length === 0) {
    return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })
  }

  const dir = path.join(UPLOAD_DIR, 'envios', params.id)
  await mkdir(dir, { recursive: true })

  const paths: string[] = []

  for (const file of files) {
    const ext = file.name.split('.').pop() ?? 'jpg'
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const filePath = path.join(dir, filename)
    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(filePath, buffer)
    paths.push(`/uploads/envios/${params.id}/${filename}`)
  }

  // Adiciona os caminhos ao array de fotos do envio
  const atualizado = await prisma.envio.update({
    where: { id: params.id },
    data: { fotos: { push: paths } },
  })

  return NextResponse.json({ fotos: atualizado.fotos })
}
