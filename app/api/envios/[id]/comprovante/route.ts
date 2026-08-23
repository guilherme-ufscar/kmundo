import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { clienteWhereFromSession } from '@/lib/cliente-session'
import { saveUpload } from '@/lib/files'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const envio = await prisma.envio.findUnique({ where: { id: params.id } })
  if (!envio) return NextResponse.json({ error: 'Envio não encontrado' }, { status: 404 })

  if (session.user.role === 'CLIENTE') {
    const cliente = await prisma.cliente.findFirst({ where: clienteWhereFromSession(session.user) })
    if (!cliente || envio.clienteId !== cliente.id) return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  const form = await req.formData()
  const file = form.get('file') as File | null
  if (!file || !(file instanceof File) || file.size === 0) return NextResponse.json({ error: 'Envie um arquivo' }, { status: 400 })

  try {
    const url = await saveUpload(file, `envios/${envio.id}/comprovante`, 10 * 1024 * 1024)
    const atualizado = await prisma.envio.update({
      where: { id: params.id },
      data: {
        comprovanteFreteUrl: url,
        comprovanteFreteEnviadoEm: new Date(),
        status: envio.status === 'AGUARDANDO_PAGAMENTO' || envio.status === 'PAGO' ? 'AGUARDANDO_CONFIRMACAO_PAGAMENTO' : envio.status,
      },
    })
    await prisma.eventoEnvio.create({ data: { envioId: envio.id, titulo: 'Comprovante de frete enviado', descricao: url } })
    return NextResponse.json({ ok: true, url, status: atualizado.status, message: 'Comprovante recebido! Vamos verificar o pagamento e confirmar em breve. Aguarde.' })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Erro ao salvar' }, { status: 400 })
  }
}
