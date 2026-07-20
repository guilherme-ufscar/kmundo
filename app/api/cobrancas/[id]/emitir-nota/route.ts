import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { emitirNotaNoBling } from '@/lib/bling'
import { z } from 'zod'

const schema = z.object({ tipo: z.enum(['NFE', 'NFSE']) })

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const parsed = schema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  const cobranca = await prisma.cobranca.findUnique({ where: { id: params.id }, include: { cliente: { include: { usuario: true } }, notaFiscal: true } })
  if (!cobranca) return NextResponse.json({ error: 'Cobrança não encontrada' }, { status: 404 })
  if (cobranca.status !== 'PAGO') return NextResponse.json({ error: 'Confirme o pagamento antes de emitir a nota' }, { status: 422 })
  if (!cobranca.cliente.documento) return NextResponse.json({ error: 'Cliente sem CPF/CNPJ cadastrado' }, { status: 422 })
  if (cobranca.notaFiscal?.status === 'EMITIDA') return NextResponse.json(cobranca.notaFiscal)
  const nota = await prisma.notaFiscal.upsert({ where: { cobrancaId: cobranca.id }, create: { cobrancaId: cobranca.id, tipo: parsed.data.tipo }, update: { tipo: parsed.data.tipo, status: 'PENDENTE', erro: null } })
  try {
    const resultado = await emitirNotaNoBling({ tipo: parsed.data.tipo, descricao: `${cobranca.descricao} | Suite #${cobranca.cliente.numeroDeSuite}`, valor: cobranca.valor, cliente: { nome: cobranca.cliente.nomeCompleto, documento: cobranca.cliente.documento, telefone: cobranca.cliente.telefone, email: cobranca.cliente.usuario.email, endereco: cobranca.cliente.endereco, numero: cobranca.cliente.numero, bairro: cobranca.cliente.bairro, cidade: cobranca.cliente.cidade, estado: cobranca.cliente.estado, cep: cobranca.cliente.cep } })
    const atualizada = await prisma.notaFiscal.update({ where: { id: nota.id }, data: { status: 'EMITIDA', numero: resultado.numero?.toString(), chaveAcesso: resultado.chaveAcesso, urlPdf: resultado.linkPDF ?? resultado.linkDanfe, blingDocumentoId: resultado.id?.toString(), emitidaEm: new Date() } })
    return NextResponse.json(atualizada)
  } catch (error) {
    const erro = error instanceof Error ? error.message : 'Erro desconhecido ao emitir nota'
    await prisma.notaFiscal.update({ where: { id: nota.id }, data: { status: 'ERRO', erro } })
    return NextResponse.json({ error: erro }, { status: 502 })
  }
}
