import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { fetchEmail } from '@/lib/imap'

export async function GET(
  _req: NextRequest,
  { params }: { params: { uid: string } }
) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const uid = parseInt(params.uid)
  if (isNaN(uid)) {
    return NextResponse.json({ error: 'UID inválido' }, { status: 400 })
  }

  try {
    const email = await fetchEmail(uid)
    if (!email) return NextResponse.json({ error: 'Email não encontrado' }, { status: 404 })
    return NextResponse.json(email)
  } catch (err) {
    console.error('[IMAP fetch error]', err)
    return NextResponse.json({ error: 'Erro ao buscar email' }, { status: 500 })
  }
}
