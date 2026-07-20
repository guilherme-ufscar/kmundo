import { NextRequest, NextResponse } from 'next/server'
import { salvarTokensDoBling } from '@/lib/bling'

export async function GET(req: NextRequest) {
  const baseUrl = new URL(req.url).origin
  const code = req.nextUrl.searchParams.get('code')
  const state = req.nextUrl.searchParams.get('state')
  const error = req.nextUrl.searchParams.get('error')
  if (error || !code) return NextResponse.redirect(new URL('/admin/configuracoes?bling=erro', baseUrl))
  if (!state || state !== req.cookies.get('bling_oauth_state')?.value) return NextResponse.redirect(new URL('/admin/configuracoes?bling=state-invalido', baseUrl))
  try {
    await salvarTokensDoBling(code)
    const response = NextResponse.redirect(new URL('/admin/configuracoes?bling=conectado', baseUrl))
    response.cookies.delete('bling_oauth_state')
    return response
  } catch (error) {
    console.error('Erro ao conectar Bling', error)
    return NextResponse.redirect(new URL('/admin/configuracoes?bling=erro', baseUrl))
  }
}
