import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { fetchInbox } from '@/lib/imap'

export async function GET() {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const emails = await fetchInbox(30)
    return NextResponse.json(emails)
  } catch (err) {
    console.error('[IMAP inbox error]', err)
    return NextResponse.json({ error: 'Erro ao conectar ao servidor de email' }, { status: 500 })
  }
}
