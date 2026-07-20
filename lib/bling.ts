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

export async function emitirNotaNoBling(input: NotaFiscalInput) {
  const token = process.env.BLING_ACCESS_TOKEN
  if (!token) throw new Error('BLING_ACCESS_TOKEN não configurado')

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
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const json = await response.json().catch(() => ({})) as { data?: BlingResponse; error?: { message?: string }; message?: string }
  if (!response.ok) throw new Error(json.error?.message ?? json.message ?? 'Bling recusou a emissão da nota')
  return (json.data ?? json) as BlingResponse
}
