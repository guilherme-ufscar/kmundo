import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { clienteWhereFromSession } from '@/lib/cliente-session'
import { mkdir, unlink, writeFile } from 'fs/promises'
import path from 'path'

const uploadDir = process.env.UPLOAD_DIR ?? '/app/uploads'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const cobranca = await prisma.cobranca.findUnique({ where: { id: params.id } })
  if (!cobranca) return NextResponse.json({ error: 'Cobrança não encontrada' }, { status: 404 })
  const cliente = session.user.role === 'CLIENTE' ? await prisma.cliente.findFirst({ where: clienteWhereFromSession(session.user) }) : null
  if (cliente && cobranca.clienteId !== cliente.id) return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  const file = (await req.formData()).get('comprovante')
  if (!(file instanceof File) || file.size === 0 || file.size > 10 * 1024 * 1024) return NextResponse.json({ error: 'Envie um comprovante de até 10 MB' }, { status: 400 })
  const extensoes: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'application/pdf': 'pdf' }
  const ext = extensoes[file.type]
  if (!ext) return NextResponse.json({ error: 'Envie imagem JPG, PNG ou PDF' }, { status: 400 })
  const dir = path.join(uploadDir, 'comprovantes', cobranca.id)
  await mkdir(dir, { recursive: true })
  const filename = `${Date.now()}.${ext}`
  await writeFile(path.join(dir, filename), Buffer.from(await file.arrayBuffer()))
  const comprovanteUrl = `/uploads/comprovantes/${cobranca.id}/${filename}`
  await prisma.cobranca.update({ where: { id: cobranca.id }, data: { comprovanteUrl, status: 'COMPROVANTE_ENVIADO' } })
  return NextResponse.json({ comprovanteUrl })
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const cobranca = await prisma.cobranca.findUnique({ where: { id: params.id }, include: { notaFiscal: true } })
  if (!cobranca) return NextResponse.json({ error: 'Cobrança não encontrada' }, { status: 404 })

  const cliente = session.user.role === 'CLIENTE' ? await prisma.cliente.findFirst({ where: clienteWhereFromSession(session.user) }) : null
  if (cliente && cobranca.clienteId !== cliente.id) return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  if (session.user.role === 'CLIENTE' && (cobranca.status === 'PAGO' || cobranca.notaFiscal?.status === 'EMITIDA')) {
    return NextResponse.json({ error: 'Comprovante já confirmado não pode ser apagado pela cliente' }, { status: 422 })
  }
  if (!cobranca.comprovanteUrl) return NextResponse.json({ ok: true })

  const relativePath = cobranca.comprovanteUrl.replace(/^\/uploads\//, '')
  const fullPath = path.resolve(uploadDir, relativePath)
  const base = path.resolve(uploadDir)
  if (fullPath.startsWith(base)) await unlink(fullPath).catch(() => undefined)

  const status = cobranca.status === 'COMPROVANTE_ENVIADO' ? 'PENDENTE' : cobranca.status
  await prisma.cobranca.update({ where: { id: cobranca.id }, data: { comprovanteUrl: null, status } })
  return NextResponse.json({ ok: true })
}
