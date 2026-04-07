import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { z } from 'zod'
import nodemailer from 'nodemailer'

const sendSchema = z.object({
  to: z.string().email('Email inválido'),
  subject: z.string().min(1, 'Assunto obrigatório'),
  body: z.string().min(1, 'Mensagem obrigatória'),
  replyToMessageId: z.string().optional(),
})

const BASE_URL = process.env.NEXTAUTH_URL ?? 'https://kmundowarehouse.com'

function buildHtml(body: string) {
  const bodyHtml = body.replace(/\n/g, '<br/>')
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F3F4F6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F3F4F6;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr>
          <td style="background:linear-gradient(135deg,#1A1A2E,#16213E);border-radius:16px 16px 0 0;padding:28px 32px;text-align:center;">
            <img src="${BASE_URL}/logo.svg" alt="KMundo" height="40" style="filter:brightness(0) invert(1);display:block;margin:0 auto 8px;" />
            <span style="color:#ffffff;font-size:18px;font-weight:700;">KMundo Warehouse</span>
          </td>
        </tr>
        <tr>
          <td style="background:#ffffff;padding:32px;border-left:1px solid #E5E7EB;border-right:1px solid #E5E7EB;">
            <div style="color:#374151;font-size:15px;line-height:1.7;">${bodyHtml}</div>
          </td>
        </tr>
        <tr>
          <td style="background:#1A1A2E;border-radius:0 0 16px 16px;padding:20px 32px;text-align:center;">
            <p style="margin:0;color:#9CA3AF;font-size:12px;">KMundo Warehouse · <a href="mailto:contato@kmundowarehouse.com" style="color:#FF6B9D;text-decoration:none;">contato@kmundowarehouse.com</a></p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const body = await req.json()
  const parsed = sendSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { to, subject, body: messageBody } = parsed.data

  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST ?? 'mail.kmundowarehouse.com',
    port: parseInt(process.env.MAIL_SMTP_PORT ?? '587'),
    secure: false,
    auth: {
      user: process.env.MAIL_USER ?? 'contato@kmundowarehouse.com',
      pass: process.env.MAIL_PASSWORD ?? '',
    },
    tls: { rejectUnauthorized: false },
  })

  try {
    await transporter.sendMail({
      from: `"KMundo Warehouse" <${process.env.MAIL_USER ?? 'contato@kmundowarehouse.com'}>`,
      to,
      subject,
      html: buildHtml(messageBody),
      text: messageBody,
    })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[SMTP send error]', err)
    return NextResponse.json({ error: 'Erro ao enviar email' }, { status: 500 })
  }
}
