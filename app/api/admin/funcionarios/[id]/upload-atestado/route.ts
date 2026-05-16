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

  const funcionario = await prisma.funcionario.findUnique({ where: { id: params.id } })
  if (!funcionario) {
    return NextResponse.json({ error: 'Funcionário não encontrado' }, { status: 404 })
  }

  const formData = await req.formData()
  const file = formData.get('arquivo') as File | null

  if (!file) {
    return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })
  }

  const ext = file.name.split('.').pop() ?? 'bin'
  const dir = path.join(UPLOAD_DIR, 'funcionarios', params.id, 'atestados')
  await mkdir(dir, { recursive: true })

  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const filePath = path.join(dir, filename)
  const buffer = Buffer.from(await file.arrayBuffer())
  await writeFile(filePath, buffer)

  return NextResponse.json({ arquivoUrl: `/uploads/funcionarios/${params.id}/atestados/${filename}` })
}
