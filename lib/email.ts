import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST ?? 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT ?? '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function enviarEmailRecuperacaoSenha(email: string, token: string) {
  const url = `${process.env.NEXTAUTH_URL}/redefinir-senha?token=${token}`

  await transporter.sendMail({
    from: `"KMundo Warehouse" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Recuperação de senha — KMundo Warehouse',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #1A1A2E, #16213E); padding: 32px; border-radius: 16px 16px 0 0; text-align: center;">
          <img src="http://kmundowarehouse.com/logo.svg" alt="KMundo Warehouse" height="48" style="filter: brightness(0) invert(1);" />
        </div>
        <div style="background: #ffffff; padding: 32px; border-radius: 0 0 16px 16px; border: 1px solid #e5e7eb;">
          <h2 style="color: #1A1A2E; margin-top: 0;">Redefinir sua senha</h2>
          <p style="color: #6B7280;">Recebemos uma solicitação para redefinir a senha da sua conta. Clique no botão abaixo para criar uma nova senha.</p>
          <a href="${url}" style="display: inline-block; margin: 24px 0; padding: 12px 32px; background: linear-gradient(135deg, #FF6B9D, #FF4D8D); color: white; text-decoration: none; border-radius: 12px; font-weight: 600;">
            Redefinir minha senha
          </a>
          <p style="color: #9CA3AF; font-size: 13px;">Este link expira em 1 hora. Se você não solicitou a recuperação, ignore este e-mail.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          <p style="color: #9CA3AF; font-size: 12px; margin: 0;">KMundo Warehouse — Sistema de Gerenciamento de Armazém</p>
        </div>
      </div>
    `,
  })
}
