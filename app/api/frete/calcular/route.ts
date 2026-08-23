import { NextRequest, NextResponse } from 'next/server'
import { calcularFreteSchema } from '@/lib/validations/frete'
import { calcularFrete } from '@/lib/frete'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = calcularFreteSchema.safeParse({ ...body, peso: body.peso != null ? Number(body.peso) : undefined })
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const result = await calcularFrete(parsed.data)
  return NextResponse.json(result)
}
