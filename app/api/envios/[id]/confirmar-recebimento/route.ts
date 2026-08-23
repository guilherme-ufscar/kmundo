import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { clienteWhereFromSession } from '@/lib/cliente-session'
import { saveUpload } from '@/lib/files'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const cliente = await prisma.cliente.findFirst({ where: clienteWhereFromSession(session.user) })
  if (!cliente) return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 })

  const envio = await prisma.envio.findFirst({ where: { id: params.id, clienteId: cliente.id } })
  if (!envio) return NextResponse.json({ error: 'Envio não encontrado' }, { status: 404 })
  if (envio.status !== 'ENVIADO') return NextResponse.json({ error: 'Só é possível confirmar quando o envio estiver com status Enviado' }, { status: 400 })
  if (envio.caixaRecebidaEm) return NextResponse.json({ error: 'Caixa já confirmada como recebida' }, { status: 400 })

  const form = await req.formData()
  const files = form.getAll('files').filter((f): f is File => f instanceof File)
  const single = form.get('file')
  if (single instanceof File) files.push(single)

  const fotos: string[] = []
  for (const file of files.slice(0, 5)) {
    if (file.size > 0) {
      const url = await saveUpload(file, `envios/${envio.id}/recebimento`, 10 * 1024 * 1024)
      fotos.push(url)
    }
  }

  const atualizado = await prisma.envio.update({
    where: { id: params.id },
    data: {
      status: 'CAIXA_RECEBIDA',
      caixaRecebidaEm: new Date(),
      caixaRecebidaConfirmadaPor: cliente.id,
      fotosRecebimento: fotos.length > 0 ? { push: fotos } as unknown as string[] : undefined,
    },
  })

  await prisma.eventoEnvio.create({ data: { envioId: envio.id, titulo: 'Caixa recebida confirmada pelo cliente', descricao: fotos.length > 0 ? `${fotos.length} foto(s) anexada(s)` : undefined } })

  return NextResponse.json({ ok: true, status: atualizado.status, fotos })
}
