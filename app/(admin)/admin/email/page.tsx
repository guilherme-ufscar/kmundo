'use client'

import { useState, useEffect, useCallback } from 'react'
import { Mail, Send, RefreshCw, Inbox, ChevronLeft, Reply, Loader2, PenLine, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface EmailSummary {
  uid: number
  subject: string
  from: string
  fromEmail: string
  date: string
  seen: boolean
  hasAttachment: boolean
}

interface EmailFull extends EmailSummary {
  to: string
  text: string | null
  html: string | null
  replyTo: string | null
}

function timeAgo(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 60) return `${mins}m atrás`
  if (hours < 24) return `${hours}h atrás`
  if (days < 7) return `${days}d atrás`
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

function ComposeModal({
  onClose,
  defaultTo = '',
  defaultSubject = '',
  defaultBody = '',
}: {
  onClose: () => void
  defaultTo?: string
  defaultSubject?: string
  defaultBody?: string
}) {
  const [to, setTo] = useState(defaultTo)
  const [subject, setSubject] = useState(defaultSubject)
  const [body, setBody] = useState(defaultBody)
  const [sending, setSending] = useState(false)

  async function handleSend() {
    if (!to || !subject || !body) {
      toast.error('Preencha todos os campos')
      return
    }
    setSending(true)
    try {
      const res = await fetch('/api/admin/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, subject, body }),
      })
      if (res.ok) {
        toast.success('Email enviado com sucesso!')
        onClose()
      } else {
        const json = await res.json()
        toast.error(json.error ?? 'Erro ao enviar')
      }
    } catch {
      toast.error('Erro de conexão')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl" style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <PenLine className="w-4 h-4" style={{ color: '#FF6B9D' }} />
            <span className="font-semibold text-sm" style={{ color: '#1A1A2E' }}>Novo Email</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
            <X className="w-4 h-4" style={{ color: '#6B7280' }} />
          </button>
        </div>

        {/* Fields */}
        <div className="px-6 py-4 space-y-3 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <span className="text-xs w-16 text-right shrink-0" style={{ color: '#9CA3AF' }}>Para</span>
            <Input
              value={to}
              onChange={e => setTo(e.target.value)}
              placeholder="destinatario@email.com"
              className="border-0 shadow-none focus-visible:ring-0 h-8 px-0 text-sm"
              style={{ color: '#1A1A2E' }}
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs w-16 text-right shrink-0" style={{ color: '#9CA3AF' }}>Assunto</span>
            <Input
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="Assunto do email"
              className="border-0 shadow-none focus-visible:ring-0 h-8 px-0 text-sm"
              style={{ color: '#1A1A2E' }}
            />
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 px-6 py-4 overflow-y-auto">
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder="Escreva sua mensagem aqui...

O email será enviado com o layout visual da KMundo Warehouse."
            className="w-full h-full min-h-48 resize-none text-sm border-0 outline-none"
            style={{ color: '#374151', lineHeight: '1.7' }}
          />
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs" style={{ color: '#9CA3AF' }}>
            Enviado por contato@kmundowarehouse.com com template KMundo
          </span>
          <Button
            onClick={handleSend}
            disabled={sending}
            className="h-9 px-5 text-sm font-semibold text-white flex items-center gap-2"
            style={{ background: 'linear-gradient(135deg, #FF6B9D, #FF4D8D)', borderRadius: '10px' }}
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {sending ? 'Enviando...' : 'Enviar'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function EmailAdminPage() {
  const [emails, setEmails] = useState<EmailSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selected, setSelected] = useState<EmailFull | null>(null)
  const [loadingEmail, setLoadingEmail] = useState(false)
  const [compose, setCompose] = useState(false)
  const [replyData, setReplyData] = useState<{ to: string; subject: string; body: string } | null>(null)

  const fetchEmails = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)
    try {
      const res = await fetch('/api/admin/email/inbox')
      if (res.ok) {
        const data = await res.json() as EmailSummary[]
        setEmails(data)
      } else {
        const json = await res.json()
        toast.error(json.error ?? 'Erro ao carregar emails')
      }
    } catch {
      toast.error('Erro de conexão com servidor de email')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    void fetchEmails()
  }, [fetchEmails])

  async function openEmail(uid: number) {
    setLoadingEmail(true)
    setSelected(null)
    try {
      const res = await fetch(`/api/admin/email/${uid}`)
      if (res.ok) {
        const data = await res.json() as EmailFull
        setSelected(data)
        // Marca como lido localmente
        setEmails(prev => prev.map(e => e.uid === uid ? { ...e, seen: true } : e))
      } else {
        toast.error('Erro ao abrir email')
      }
    } catch {
      toast.error('Erro de conexão')
    } finally {
      setLoadingEmail(false)
    }
  }

  function handleReply() {
    if (!selected) return
    setReplyData({
      to: selected.replyTo || selected.fromEmail,
      subject: selected.subject.startsWith('Re:') ? selected.subject : `Re: ${selected.subject}`,
      body: `\n\n---\nEm ${new Date(selected.date).toLocaleString('pt-BR')}, ${selected.from} <${selected.fromEmail}> escreveu:\n${selected.text ?? ''}`,
    })
    setCompose(true)
  }

  const unread = emails.filter(e => !e.seen).length

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white shrink-0">
        <div className="flex items-center gap-3">
          <Mail className="w-5 h-5" style={{ color: '#FF6B9D' }} />
          <h1 className="text-lg font-bold" style={{ color: '#1A1A2E' }}>Caixa de Entrada</h1>
          {unread > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold text-white" style={{ background: '#FF6B9D' }}>
              {unread}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => void fetchEmails(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm hover:bg-gray-100 transition-colors"
            style={{ color: '#6B7280' }}
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
          <Button
            onClick={() => { setReplyData(null); setCompose(true) }}
            className="h-9 px-4 text-sm font-semibold text-white flex items-center gap-2"
            style={{ background: 'linear-gradient(135deg, #FF6B9D, #FF4D8D)', borderRadius: '10px' }}
          >
            <PenLine className="w-4 h-4" />
            Novo email
          </Button>
        </div>
      </div>

      {/* Main */}
      <div className="flex flex-1 overflow-hidden">
        {/* Email list */}
        <div
          className="shrink-0 border-r border-gray-100 overflow-y-auto bg-white"
          style={{ width: selected ? '320px' : '100%', maxWidth: selected ? '320px' : undefined }}
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#FF6B9D' }} />
              <p className="text-sm" style={{ color: '#9CA3AF' }}>Conectando ao servidor de email...</p>
            </div>
          ) : emails.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <Inbox className="w-10 h-10" style={{ color: '#E5E7EB' }} />
              <p className="text-sm" style={{ color: '#9CA3AF' }}>Caixa de entrada vazia</p>
            </div>
          ) : (
            <div>
              {emails.map((email) => (
                <button
                  key={email.uid}
                  onClick={() => void openEmail(email.uid)}
                  className="w-full text-left px-5 py-4 border-b border-gray-50 hover:bg-gray-50 transition-colors"
                  style={{
                    background: selected?.uid === email.uid ? '#FFF1F5' : email.seen ? '#ffffff' : '#FAFAFA',
                    borderLeft: selected?.uid === email.uid ? '3px solid #FF6B9D' : '3px solid transparent',
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {!email.seen && (
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: '#FF6B9D' }} />
                      )}
                      <span
                        className="text-sm truncate"
                        style={{ color: '#1A1A2E', fontWeight: email.seen ? 400 : 600 }}
                      >
                        {email.from || email.fromEmail}
                      </span>
                    </div>
                    <span className="text-xs shrink-0" style={{ color: '#9CA3AF' }}>{timeAgo(email.date)}</span>
                  </div>
                  <p
                    className="text-sm truncate mt-0.5"
                    style={{ color: email.seen ? '#6B7280' : '#374151', fontWeight: email.seen ? 400 : 500 }}
                  >
                    {email.subject}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Email detail */}
        {(selected || loadingEmail) && (
          <div className="flex-1 flex flex-col overflow-hidden bg-white">
            {loadingEmail ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#FF6B9D' }} />
              </div>
            ) : selected ? (
              <>
                {/* Email header */}
                <div className="px-6 py-5 border-b border-gray-100 shrink-0">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <button
                      onClick={() => setSelected(null)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors shrink-0 sm:hidden"
                    >
                      <ChevronLeft className="w-4 h-4" style={{ color: '#6B7280' }} />
                    </button>
                    <h2 className="text-base font-bold flex-1" style={{ color: '#1A1A2E' }}>{selected.subject}</h2>
                    <Button
                      onClick={handleReply}
                      className="h-8 px-3 text-xs font-semibold text-white flex items-center gap-1.5 shrink-0"
                      style={{ background: 'linear-gradient(135deg, #FF6B9D, #FF4D8D)', borderRadius: '8px' }}
                    >
                      <Reply className="w-3.5 h-3.5" />
                      Responder
                    </Button>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ background: 'linear-gradient(135deg, #FF6B9D, #C77DFF)' }}>
                        {(selected.from || selected.fromEmail).charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium" style={{ color: '#1A1A2E' }}>
                          {selected.from || selected.fromEmail}
                          {selected.from && <span className="ml-1 font-normal" style={{ color: '#9CA3AF' }}>&lt;{selected.fromEmail}&gt;</span>}
                        </p>
                        <p className="text-xs" style={{ color: '#9CA3AF' }}>
                          Para: {selected.to} · {new Date(selected.date).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Email body */}
                <div className="flex-1 overflow-y-auto p-6">
                  {selected.html ? (
                    <iframe
                      srcDoc={selected.html}
                      className="w-full border-0 rounded-xl"
                      style={{ minHeight: '400px', height: '100%' }}
                      sandbox="allow-same-origin"
                      title="Email content"
                    />
                  ) : (
                    <div className="whitespace-pre-wrap text-sm leading-relaxed" style={{ color: '#374151' }}>
                      {selected.text ?? '(sem conteúdo)'}
                    </div>
                  )}
                </div>

                {/* Quick reply bar */}
                <div className="px-6 py-4 border-t border-gray-100 shrink-0">
                  <button
                    onClick={handleReply}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-dashed text-sm transition-colors hover:border-pink-300 hover:bg-pink-50"
                    style={{ borderColor: '#E5E7EB', color: '#9CA3AF' }}
                  >
                    <Reply className="w-4 h-4" />
                    Clique para responder a {selected.from || selected.fromEmail}...
                  </button>
                </div>
              </>
            ) : null}
          </div>
        )}
      </div>

      {/* Compose modal */}
      {compose && (
        <ComposeModal
          onClose={() => { setCompose(false); setReplyData(null) }}
          defaultTo={replyData?.to ?? ''}
          defaultSubject={replyData?.subject ?? ''}
          defaultBody={replyData?.body ?? ''}
        />
      )}
    </div>
  )
}
