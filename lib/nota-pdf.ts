import { mkdir, writeFile } from 'fs/promises'
import path from 'path'
import { uploadDir } from '@/lib/files'

type NotaPdfInput = {
  cobrancaId: string
  numero?: string | null
  clienteNome: string
  suite: number
  documento: string
  descricao: string
  valor: number
  moeda: string
  emitidaEm: Date
  remoteUrl?: string | null
}

function escapePdf(text: string) {
  return text.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')
}

function simplePdf(lines: string[]) {
  const body = lines.map((line, index) => `BT /F1 11 Tf 54 ${760 - index * 18} Td (${escapePdf(line)}) Tj ET`).join('\n')
  const objects = [
    '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj',
    '2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj',
    '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj',
    '4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj',
    `5 0 obj << /Length ${Buffer.byteLength(body)} >> stream\n${body}\nendstream endobj`,
  ]
  let offset = '%PDF-1.4\n'.length
  const xref = ['0000000000 65535 f ']
  const content = objects.map((obj) => {
    xref.push(String(offset).padStart(10, '0') + ' 00000 n ')
    offset += Buffer.byteLength(obj + '\n')
    return obj
  }).join('\n') + '\n'
  const startxref = Buffer.byteLength('%PDF-1.4\n' + content)
  return Buffer.from(`%PDF-1.4\n${content}xref\n0 ${objects.length + 1}\n${xref.join('\n')}\ntrailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${startxref}\n%%EOF`)
}

export async function salvarPdfNota(input: NotaPdfInput) {
  const dir = path.join(uploadDir, 'notas-fiscais', input.cobrancaId)
  await mkdir(dir, { recursive: true })
  const filename = `nota-${input.numero ?? input.cobrancaId}.pdf`.replace(/[^\w.-]/g, '-')
  const fullPath = path.join(dir, filename)

  if (input.remoteUrl) {
    const response = await fetch(input.remoteUrl)
    const type = response.headers.get('content-type') ?? ''
    if (response.ok && type.includes('pdf')) {
      await writeFile(fullPath, Buffer.from(await response.arrayBuffer()))
      return `/uploads/notas-fiscais/${input.cobrancaId}/${filename}`
    }
  }

  const pdf = simplePdf([
    'KMundo Warehouse - Nota fiscal emitida',
    `Numero: ${input.numero ?? 'aguardando retorno do Bling'}`,
    `Emissao: ${input.emitidaEm.toLocaleString('pt-BR')}`,
    `Cliente: ${input.clienteNome}`,
    `Suite: #${String(input.suite).padStart(3, '0')}`,
    `Documento: ${input.documento}`,
    `Servico: ${input.descricao}`,
    `Valor: ${input.moeda} ${input.valor.toFixed(2)}`,
    'Documento vinculado ao historico financeiro da suite.',
  ])
  await writeFile(fullPath, pdf)
  return `/uploads/notas-fiscais/${input.cobrancaId}/${filename}`
}
