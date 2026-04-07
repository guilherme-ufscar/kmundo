import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const ADMIN_EMAIL = 'contato@kmundowarehouse.com'
const FROM = 'KMundo Warehouse <noreply@kmundowarehouse.com>'
const BASE_URL = process.env.NEXTAUTH_URL ?? 'https://kmundowarehouse.com'

// ─── Template base ────────────────────────────────────────────────────────────

function layout(content: string) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>KMundo Warehouse</title></head>
<body style="margin:0;padding:0;background:#F3F4F6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F3F4F6;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1A1A2E,#16213E);border-radius:16px 16px 0 0;padding:28px 32px;text-align:center;">
            <img src="${BASE_URL}/logo.svg" alt="KMundo" height="40" style="filter:brightness(0) invert(1);display:block;margin:0 auto 8px;" />
            <span style="color:#ffffff;font-size:18px;font-weight:700;letter-spacing:0.5px;">KMundo Warehouse</span>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="background:#ffffff;padding:32px;border-left:1px solid #E5E7EB;border-right:1px solid #E5E7EB;">
            ${content}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#1A1A2E;border-radius:0 0 16px 16px;padding:20px 32px;text-align:center;">
            <p style="margin:0;color:#9CA3AF;font-size:12px;">KMundo Warehouse · <a href="mailto:${ADMIN_EMAIL}" style="color:#FF6B9D;text-decoration:none;">${ADMIN_EMAIL}</a></p>
            <p style="margin:6px 0 0;color:#6B7280;font-size:11px;">Sistema de Gerenciamento de Armazém — Coreia do Sul</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function btnPink(href: string, texto: string) {
  return `<a href="${href}" style="display:inline-block;margin:24px 0 0;padding:13px 32px;background:linear-gradient(135deg,#FF6B9D,#FF4D8D);color:#ffffff;text-decoration:none;border-radius:12px;font-weight:600;font-size:15px;">${texto}</a>`
}

function badge(label: string, cor: string) {
  return `<span style="display:inline-block;padding:6px 16px;border-radius:99px;background:${cor};color:#fff;font-size:13px;font-weight:600;">${label}</span>`
}

function infoRow(label: string, value: string) {
  return `<tr>
    <td style="padding:8px 0;color:#6B7280;font-size:13px;width:45%;">${label}</td>
    <td style="padding:8px 0;color:#1A1A2E;font-size:13px;font-weight:600;">${value}</td>
  </tr>`
}

// ─── Status labels ─────────────────────────────────────────────────────────────

const statusEnvioLabel: Record<string, string> = {
  AGUARDANDO_CONFIRMACAO: 'Aguardando confirmação',
  CONFIRMADO: 'Confirmado',
  EMBALANDO: 'Embalando',
  PAGO: 'Aguardando pagamento',
  ENVIADO: 'Enviado',
  ENTREGUE: 'Entregue',
}
const statusEnvioCor: Record<string, string> = {
  AGUARDANDO_CONFIRMACAO: '#F59E0B',
  CONFIRMADO: '#3B82F6',
  EMBALANDO: '#F97316',
  PAGO: '#8B5CF6',
  ENVIADO: '#FF6B9D',
  ENTREGUE: '#22C55E',
}

const statusItemLabel: Record<string, string> = {
  RECEBIDO: 'Recebido',
  EM_ARMAZEM: 'No Armazém',
  EM_ENVIO: 'Em Envio',
  ENVIADO: 'Enviado',
  ENTREGUE: 'Entregue',
}
const statusItemCor: Record<string, string> = {
  RECEBIDO: '#3B82F6',
  EM_ARMAZEM: '#FF6B9D',
  EM_ENVIO: '#F59E0B',
  ENVIADO: '#8B5CF6',
  ENTREGUE: '#22C55E',
}

// ─── Convite de cadastro → cliente ────────────────────────────────────────────

export async function enviarEmailConvite(email: string, link: string, expiresAt: Date) {
  const expira = expiresAt.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: '🎉 Você foi convidado para o KMundo Warehouse',
    html: layout(`
      <h2 style="color:#1A1A2E;margin:0 0 12px;">Bem-vindo ao KMundo Warehouse!</h2>
      <p style="color:#6B7280;margin:0 0 20px;">Você recebeu um convite para criar sua conta e começar a usar nossa suíte de compras na Coreia do Sul.</p>
      ${btnPink(link, 'Criar minha conta')}
      <p style="color:#9CA3AF;font-size:13px;margin:20px 0 0;">Este convite expira em <strong>${expira}</strong>. Se você não esperava este convite, ignore este e-mail.</p>
    `),
  })
}

// ─── Boas-vindas ao novo cliente ───────────────────────────────────────────────

export async function enviarEmailBoasVindas(params: {
  email: string
  nomeCompleto: string
  numeroDeSuite: number
}) {
  const { email, nomeCompleto, numeroDeSuite } = params
  const suite = String(numeroDeSuite).padStart(3, '0')
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: `🎊 Sua suite #${suite} está pronta — KMundo Warehouse`,
    html: layout(`
      <p style="color:#6B7280;margin:0 0 4px;">Olá, <strong style="color:#1A1A2E;">${nomeCompleto}</strong>!</p>
      <h2 style="color:#1A1A2E;margin:8px 0 16px;">Sua conta foi criada com sucesso</h2>
      <div style="background:linear-gradient(135deg,#FF6B9D,#FF4D8D);border-radius:16px;padding:24px;text-align:center;margin:0 0 24px;">
        <p style="color:rgba(255,255,255,0.8);margin:0 0 4px;font-size:13px;">Seu número de suite</p>
        <p style="color:#ffffff;font-size:48px;font-weight:800;margin:0;letter-spacing:2px;">#${suite}</p>
        <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:13px;">Use este número ao fazer compras na Coreia</p>
      </div>
      <p style="color:#6B7280;margin:0 0 24px;">Agora você pode acompanhar seus itens, solicitar envios e gerenciar seus pedidos diretamente pela plataforma.</p>
      ${btnPink(`${BASE_URL}/dashboard`, 'Acessar minha conta')}
    `),
  })
}

// ─── Recuperação de senha ──────────────────────────────────────────────────────

export async function enviarEmailRecuperacaoSenha(email: string, token: string) {
  const url = `${BASE_URL}/redefinir-senha?token=${token}`
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: 'Recuperação de senha — KMundo Warehouse',
    html: layout(`
      <h2 style="color:#1A1A2E;margin:0 0 8px;">Redefinir sua senha</h2>
      <p style="color:#6B7280;margin:0 0 4px;">Recebemos uma solicitação para redefinir a senha da sua conta.</p>
      <p style="color:#6B7280;margin:0 0 24px;">Clique no botão abaixo para criar uma nova senha.</p>
      ${btnPink(url, 'Redefinir minha senha')}
      <p style="color:#9CA3AF;font-size:13px;margin:20px 0 0;">Este link expira em 1 hora. Se você não solicitou a recuperação, ignore este e-mail.</p>
    `),
  })
}

// ─── Item: novo item registrado → cliente ──────────────────────────────────────

export async function notificarClienteNovoItem(params: {
  emailCliente: string
  nomeCliente: string
  suite: number
  descricao: string
  lojaOrigem?: string | null
  itemId: string
}) {
  const { emailCliente, nomeCliente, suite, descricao, lojaOrigem, itemId } = params
  await resend.emails.send({
    from: FROM,
    to: emailCliente,
    subject: '📦 Novo item registrado na sua suite — KMundo Warehouse',
    html: layout(`
      <p style="color:#6B7280;margin:0 0 4px;">Olá, <strong style="color:#1A1A2E;">${nomeCliente}</strong>!</p>
      <h2 style="color:#1A1A2E;margin:8px 0 16px;">Um novo item foi registrado</h2>
      <div style="background:#F9FAFB;border-radius:12px;padding:20px;margin:0 0 24px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          ${infoRow('Suite', `#${String(suite).padStart(3, '0')}`)}
          ${infoRow('Descrição', descricao)}
          ${lojaOrigem ? infoRow('Loja de Origem', lojaOrigem) : ''}
          ${infoRow('Status', badge('Recebido', '#3B82F6'))}
        </table>
      </div>
      ${btnPink(`${BASE_URL}/meus-itens/${itemId}`, 'Ver meu item')}
    `),
  })
}

// ─── Item: novo item registrado → admin ───────────────────────────────────────

export async function notificarAdminNovoItem(params: {
  nomeCliente: string
  suite: number
  descricao: string
  lojaOrigem?: string | null
  itemId: string
}) {
  const { nomeCliente, suite, descricao, lojaOrigem, itemId } = params
  await resend.emails.send({
    from: FROM,
    to: ADMIN_EMAIL,
    subject: `📦 Novo item registrado — Suite #${String(suite).padStart(3, '0')}`,
    html: layout(`
      <h2 style="color:#1A1A2E;margin:0 0 16px;">Novo item cadastrado</h2>
      <div style="background:#F9FAFB;border-radius:12px;padding:20px;margin:0 0 24px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          ${infoRow('Cliente', nomeCliente)}
          ${infoRow('Suite', `#${String(suite).padStart(3, '0')}`)}
          ${infoRow('Descrição', descricao)}
          ${lojaOrigem ? infoRow('Loja de Origem', lojaOrigem) : ''}
        </table>
      </div>
      ${btnPink(`${BASE_URL}/admin/itens/${itemId}`, 'Ver item no painel')}
    `),
  })
}

// ─── Item: mudança de status → cliente ────────────────────────────────────────

export async function notificarClienteStatusItem(params: {
  emailCliente: string
  nomeCliente: string
  suite: number
  descricao: string
  novoStatus: string
  itemId: string
}) {
  const { emailCliente, nomeCliente, suite, descricao, novoStatus, itemId } = params
  const label = statusItemLabel[novoStatus] ?? novoStatus
  const cor = statusItemCor[novoStatus] ?? '#6B7280'
  await resend.emails.send({
    from: FROM,
    to: emailCliente,
    subject: `🔄 Status do item atualizado — ${label}`,
    html: layout(`
      <p style="color:#6B7280;margin:0 0 4px;">Olá, <strong style="color:#1A1A2E;">${nomeCliente}</strong>!</p>
      <h2 style="color:#1A1A2E;margin:8px 0 16px;">Status do seu item foi atualizado</h2>
      <div style="background:#F9FAFB;border-radius:12px;padding:20px;margin:0 0 24px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          ${infoRow('Suite', `#${String(suite).padStart(3, '0')}`)}
          ${infoRow('Descrição', descricao)}
          ${infoRow('Novo status', badge(label, cor))}
        </table>
      </div>
      ${btnPink(`${BASE_URL}/meus-itens/${itemId}`, 'Ver meu item')}
    `),
  })
}

// ─── Envio: cliente solicitou → admin ─────────────────────────────────────────

export async function notificarAdminNovoEnvio(params: {
  nomeCliente: string
  suite: number
  metodo: string
  itens: string[]
  envioId: string
}) {
  const { nomeCliente, suite, metodo, itens, envioId } = params
  const metodoLabel: Record<string, string> = { FEDEX: 'FedEx', EMS: 'EMS', ENVIO_EM_GRUPO: 'Envio em Grupo' }
  await resend.emails.send({
    from: FROM,
    to: ADMIN_EMAIL,
    subject: `🚚 Nova solicitação de envio — Suite #${String(suite).padStart(3, '0')}`,
    html: layout(`
      <h2 style="color:#1A1A2E;margin:0 0 16px;">Nova solicitação de envio</h2>
      <div style="background:#F9FAFB;border-radius:12px;padding:20px;margin:0 0 24px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          ${infoRow('Cliente', nomeCliente)}
          ${infoRow('Suite', `#${String(suite).padStart(3, '0')}`)}
          ${infoRow('Método', metodoLabel[metodo] ?? metodo)}
          ${infoRow('Qtd. de itens', String(itens.length))}
        </table>
      </div>
      <p style="color:#6B7280;font-size:13px;margin:0 0 8px;font-weight:600;">Itens solicitados:</p>
      <ul style="margin:0 0 24px;padding-left:20px;color:#1A1A2E;font-size:13px;">
        ${itens.map(i => `<li style="margin:4px 0;">${i}</li>`).join('')}
      </ul>
      ${btnPink(`${BASE_URL}/admin/envios/${envioId}`, 'Gerenciar envio')}
    `),
  })
}

// ─── Envio: cliente solicitou → cliente (confirmação) ─────────────────────────

export async function notificarClienteEnvioSolicitado(params: {
  emailCliente: string
  nomeCliente: string
  suite: number
  metodo: string
  itens: string[]
  envioId: string
}) {
  const { emailCliente, nomeCliente, suite, metodo, itens, envioId } = params
  const metodoLabel: Record<string, string> = { FEDEX: 'FedEx', EMS: 'EMS', ENVIO_EM_GRUPO: 'Envio em Grupo' }
  await resend.emails.send({
    from: FROM,
    to: emailCliente,
    subject: '🚚 Sua solicitação de envio foi recebida — KMundo Warehouse',
    html: layout(`
      <p style="color:#6B7280;margin:0 0 4px;">Olá, <strong style="color:#1A1A2E;">${nomeCliente}</strong>!</p>
      <h2 style="color:#1A1A2E;margin:8px 0 16px;">Solicitação de envio recebida</h2>
      <p style="color:#6B7280;margin:0 0 20px;">Recebemos sua solicitação. Nossa equipe irá analisar e entrar em contato em breve.</p>
      <div style="background:#F9FAFB;border-radius:12px;padding:20px;margin:0 0 24px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          ${infoRow('Suite', `#${String(suite).padStart(3, '0')}`)}
          ${infoRow('Método', metodoLabel[metodo] ?? metodo)}
          ${infoRow('Qtd. de itens', String(itens.length))}
          ${infoRow('Status', badge('Aguardando confirmação', '#F59E0B'))}
        </table>
      </div>
      <p style="color:#6B7280;font-size:13px;margin:0 0 8px;font-weight:600;">Itens solicitados:</p>
      <ul style="margin:0 0 24px;padding-left:20px;color:#1A1A2E;font-size:13px;">
        ${itens.map(i => `<li style="margin:4px 0;">${i}</li>`).join('')}
      </ul>
      ${btnPink(`${BASE_URL}/meus-envios/${envioId}`, 'Acompanhar envio')}
    `),
  })
}

// ─── Envio: mudança de status → cliente ───────────────────────────────────────

export async function notificarClienteStatusEnvio(params: {
  emailCliente: string
  nomeCliente: string
  suite: number
  novoStatus: string
  metodo: string
  tracking?: string | null
  itens: string[]
  envioId: string
}) {
  const { emailCliente, nomeCliente, suite, novoStatus, metodo, tracking, itens, envioId } = params
  const label = statusEnvioLabel[novoStatus] ?? novoStatus
  const cor = statusEnvioCor[novoStatus] ?? '#6B7280'
  const metodoLabel: Record<string, string> = { FEDEX: 'FedEx', EMS: 'EMS', ENVIO_EM_GRUPO: 'Envio em Grupo' }
  await resend.emails.send({
    from: FROM,
    to: emailCliente,
    subject: `🔄 Seu envio foi atualizado — ${label}`,
    html: layout(`
      <p style="color:#6B7280;margin:0 0 4px;">Olá, <strong style="color:#1A1A2E;">${nomeCliente}</strong>!</p>
      <h2 style="color:#1A1A2E;margin:8px 0 8px;">Status do envio atualizado</h2>
      <div style="text-align:center;margin:16px 0 24px;">${badge(label, cor)}</div>
      <div style="background:#F9FAFB;border-radius:12px;padding:20px;margin:0 0 24px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          ${infoRow('Suite', `#${String(suite).padStart(3, '0')}`)}
          ${infoRow('Método', metodoLabel[metodo] ?? metodo)}
          ${tracking ? infoRow('Rastreamento', `<span style="font-family:monospace;">${tracking}</span>`) : ''}
        </table>
      </div>
      <p style="color:#6B7280;font-size:13px;margin:0 0 8px;font-weight:600;">Itens no envio:</p>
      <ul style="margin:0 0 24px;padding-left:20px;color:#1A1A2E;font-size:13px;">
        ${itens.map(i => `<li style="margin:4px 0;">${i}</li>`).join('')}
      </ul>
      ${btnPink(`${BASE_URL}/meus-envios/${envioId}`, 'Ver detalhes do envio')}
    `),
  })
}

// ─── Envio: cliente confirmou → admin ─────────────────────────────────────────

export async function notificarAdminClienteConfirmou(params: {
  nomeCliente: string
  suite: number
  envioId: string
}) {
  const { nomeCliente, suite, envioId } = params
  await resend.emails.send({
    from: FROM,
    to: ADMIN_EMAIL,
    subject: `✅ Cliente confirmou o envio — Suite #${String(suite).padStart(3, '0')}`,
    html: layout(`
      <h2 style="color:#1A1A2E;margin:0 0 16px;">Cliente confirmou o envio</h2>
      <div style="background:#F9FAFB;border-radius:12px;padding:20px;margin:0 0 24px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          ${infoRow('Cliente', nomeCliente)}
          ${infoRow('Suite', `#${String(suite).padStart(3, '0')}`)}
        </table>
      </div>
      ${btnPink(`${BASE_URL}/admin/envios/${envioId}`, 'Ver envio no painel')}
    `),
  })
}
