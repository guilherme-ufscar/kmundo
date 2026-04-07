import { ImapFlow, ImapFlowOptions } from 'imapflow'
import { simpleParser, ParsedMail } from 'mailparser'

const MAIL_CONFIG: ImapFlowOptions = {
  host: process.env.MAIL_HOST ?? 'mail.kmundowarehouse.com',
  port: parseInt(process.env.MAIL_IMAP_PORT ?? '993'),
  secure: true,
  auth: {
    user: process.env.MAIL_USER ?? 'contato@kmundowarehouse.com',
    pass: process.env.MAIL_PASSWORD ?? '',
  },
  logger: false,
  tls: { rejectUnauthorized: false },
}

export interface EmailSummary {
  uid: number
  subject: string
  from: string
  fromEmail: string
  date: string
  seen: boolean
  hasAttachment: boolean
}

export interface EmailFull extends EmailSummary {
  to: string
  text: string | null
  html: string | null
  replyTo: string | null
}

function createClient() {
  return new ImapFlow(MAIL_CONFIG)
}

export async function fetchInbox(limit = 30): Promise<EmailSummary[]> {
  const client = createClient()
  await client.connect()
  const emails: EmailSummary[] = []

  try {
    const lock = await client.getMailboxLock('INBOX')
    try {
      const status = await client.status('INBOX', { messages: true })
      const total = status.messages ?? 0
      if (total === 0) return []

      const from = Math.max(1, total - limit + 1)
      const messages = client.fetch(`${from}:*`, {
        uid: true,
        flags: true,
        envelope: true,
        bodyStructure: true,
      })

      for await (const msg of messages) {
        const envelope = msg.envelope
        if (!envelope) continue
        const fromAddr = envelope.from?.[0]
        emails.unshift({
          uid: msg.uid,
          subject: envelope.subject ?? '(sem assunto)',
          from: fromAddr?.name || fromAddr?.address || '',
          fromEmail: fromAddr?.address ?? '',
          date: envelope.date?.toISOString() ?? new Date().toISOString(),
          seen: msg.flags?.has('\\Seen') ?? false,
          hasAttachment: !!(msg.bodyStructure && JSON.stringify(msg.bodyStructure).includes('attachment')),
        })
      }
    } finally {
      lock.release()
    }
  } finally {
    await client.logout()
  }

  return emails
}

export async function fetchEmail(uid: number): Promise<EmailFull | null> {
  const client = createClient()
  await client.connect()

  try {
    const lock = await client.getMailboxLock('INBOX')
    try {
      const messages = client.fetch(String(uid), {
        uid: true,
        flags: true,
        envelope: true,
        source: true,
      }, { uid: true })

      for await (const msg of messages) {
        if (!msg.source || !msg.envelope) continue
        const parsed: ParsedMail = await simpleParser(msg.source)
        const envelope = msg.envelope
        const fromAddr = envelope.from?.[0]

        // Marcar como lido
        await client.messageFlagsAdd(String(uid), ['\\Seen'], { uid: true })

        return {
          uid: msg.uid,
          subject: parsed.subject ?? '(sem assunto)',
          from: fromAddr?.name || fromAddr?.address || '',
          fromEmail: fromAddr?.address ?? '',
          date: envelope.date?.toISOString() ?? new Date().toISOString(),
          seen: true,
          hasAttachment: (parsed.attachments?.length ?? 0) > 0,
          to: Array.isArray(parsed.to) ? parsed.to.map(a => a.text).join(', ') : (parsed.to?.text ?? ''),
          text: parsed.text ?? null,
          html: parsed.html || null,
          replyTo: Array.isArray(parsed.replyTo) ? parsed.replyTo.map(a => a.text).join(', ') : (parsed.replyTo?.text ?? null),
        }
      }
    } finally {
      lock.release()
    }
  } finally {
    await client.logout()
  }

  return null
}
