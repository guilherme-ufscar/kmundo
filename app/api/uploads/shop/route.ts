import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { saveUpload } from '@/lib/files'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const form = await req.formData()
  const files = form.getAll('files').filter((file): file is File => file instanceof File)
  const single = form.get('file')
  if (single instanceof File) files.push(single)
  if (files.length === 0) return NextResponse.json({ error: 'Envie ao menos um arquivo' }, { status: 400 })
  if (files.length > 1) return NextResponse.json({ error: 'Envie apenas um arquivo' }, { status: 400 })

  try {
    const folder = `shop/${new Date().toISOString().slice(0, 10)}`
    const urls = await Promise.all(files.map((file) => saveUpload(file, folder, 5 * 1024 * 1024)))
    return NextResponse.json({ urls })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Erro ao salvar arquivo' }, { status: 400 })
  }
}
