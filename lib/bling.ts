import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto'
import { prisma } from '@/lib/prisma'

type NotaFiscalInput = {
  tipo: 'NFE' | 'NFSE'
  descricao: string
  valor: number
  cliente: {
    nome: string
    documento: string
    telefone: string
    email: string
    endereco?: string | null
    numero?: string | null
    bairro?: string | null
    cidade?: string | null
    estado?: string | null
    cep?: string | null
  }
}

type BlingResponse = {
  id?: number | string
  numero?: string | number
  chaveAcesso?: string
  linkPDF?: string
  linkDanfe?: string
}

const baseUrl = 'https://api.bling.com.br/Api/v3'

type TokenResponse = { access_token: string; refresh_token: string; expires_in: number }

function encryptionKey() {
  const secret = process.env.BLING_TOKEN_ENCRYPTION_KEY ?? process.env.AUTH_SECRET
  if (!secret) throw new Error('AUTH_SECRET ou BLING_TOKEN_ENCRYPTION_KEY não configurado')
  return createHash('sha256').update(secret).digest()
}

function encrypt(value: string) {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', encryptionKey(), iv)
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()])
  return `${iv.toString('base64url')}.${cipher.getAuthTag().toString('base64url')}.${encrypted.toString('base64url')}`
}

function decrypt(value: string) {
  const [iv, tag, encrypted] = value.split('.')
  if (!iv || !tag || !encrypted) throw new Error('Token do Bling inválido')
  const decipher = createDecipheriv('aes-256-gcm', encryptionKey(), Buffer.from(iv, 'base64url'))
  decipher.setAuthTag(Buffer.from(tag, 'base64url'))
  return Buffer.concat([decipher.update(Buffer.from(encrypted, 'base64url')), decipher.final()]).toString('utf8')
}

function clientCredentials() {
  const id = process.env.BLING_CLIENT_ID
  const secret = process.env.BLING_CLIENT_SECRET
  if (!id || !secret) throw new Error('BLING_CLIENT_ID e BLING_CLIENT_SECRET não configurados')
  return `Basic ${Buffer.from(`${id}:${secret}`).toString('base64')}`
}

async function requestToken(params: URLSearchParams) {
  const response = await fetch(`${baseUrl}/oauth/token`, { method: 'POST', headers: { Authorization: clientCredentials(), 'Content-Type': 'application/x-www-form-urlencoded', Accept: '1.0', 'enable-jwt': '1' }, body: params })
  const json = await response.json().catch(() => ({})) as TokenResponse & { error?: { message?: string }; message?: string }
  if (!response.ok || !json.access_token || !json.refresh_token) throw new Error(json.error?.message ?? json.message ?? 'Não foi possível obter token do Bling')
  return json
}

export async function salvarTokensDoBling(code: string) {
  const token = await requestToken(new URLSearchParams({ grant_type: 'authorization_code', code }))
  const agora = new Date()
  const configuracao = await prisma.configuracao.findFirst()
  const data = { blingAccessToken: encrypt(token.access_token), blingRefreshToken: encrypt(token.refresh_token), blingExpiraEm: new Date(agora.getTime() + Math.max(0, token.expires_in - 300) * 1000), blingConectadoEm: agora }
  if (configuracao) await prisma.configuracao.update({ where: { id: configuracao.id }, data })
  else await prisma.configuracao.create({ data })
}

async function accessTokenDoBling() {
  const config = await prisma.configuracao.findFirst()
  if (config?.blingAccessToken && config.blingRefreshToken && config.blingExpiraEm && config.blingExpiraEm > new Date()) return decrypt(config.blingAccessToken)
  if (config?.blingRefreshToken) {
    const token = await requestToken(new URLSearchParams({ grant_type: 'refresh_token', refresh_token: decrypt(config.blingRefreshToken) }))
    const agora = new Date()
    await prisma.configuracao.update({ where: { id: config.id }, data: { blingAccessToken: encrypt(token.access_token), blingRefreshToken: encrypt(token.refresh_token), blingExpiraEm: new Date(agora.getTime() + Math.max(0, token.expires_in - 300) * 1000) } })
    return token.access_token
  }
  const legacy = process.env.BLING_ACCESS_TOKEN
  if (legacy) return legacy
  throw new Error('Bling ainda não foi conectado')
}

export async function emitirNotaNoBling(input: NotaFiscalInput) {
  const token = await accessTokenDoBling()

  const endpoint = input.tipo === 'NFE' ? 'nfe' : 'nfse'
  const documento = input.cliente.documento.replace(/\D/g, '')
  const payload = {
    contato: {
      nome: input.cliente.nome,
      numeroDocumento: documento,
      telefone: input.cliente.telefone,
      email: input.cliente.email,
      endereco: {
        geral: {
          endereco: input.cliente.endereco,
          numero: input.cliente.numero,
          bairro: input.cliente.bairro,
          municipio: input.cliente.cidade,
          uf: input.cliente.estado,
          cep: input.cliente.cep?.replace(/\D/g, ''),
        },
      },
    },
    itens: [{ codigo: process.env.BLING_SERVICO_CODIGO, descricao: input.descricao, quantidade: 1, valor: input.valor }],
    observacoes: `KMundo Warehouse | ${input.descricao}`,
  }

  const response = await fetch(`${baseUrl}/${endpoint}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', 'enable-jwt': '1' },
    body: JSON.stringify(payload),
  })
  const json = await response.json().catch(() => ({})) as { data?: BlingResponse; error?: { message?: string }; message?: string }
  if (!response.ok) throw new Error(json.error?.message ?? json.message ?? 'Bling recusou a emissão da nota')
  return (json.data ?? json) as BlingResponse
}
