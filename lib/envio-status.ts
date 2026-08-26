export const envioStatusLabel: Record<string, string> = {
  AGUARDANDO_CONFIRMACAO: 'Aguardando confirmação',
  AGUARDANDO_PAGAMENTO: 'Aguardando pagamento',
  AGUARDANDO_CONFIRMACAO_PAGAMENTO: 'Aguardando confirmação do pagamento',
  PAGAMENTO_FEITO: 'Pagamento feito',
  CONFIRMADO: 'Confirmado',
  EMBALANDO: 'Embalando',
  PAGO: 'Aguardando pagamento',
  ENVIADO: 'Enviado',
  ENTREGUE: 'Caixa recebida',
  CAIXA_RECEBIDA: 'Caixa recebida',
}

export const envioStatusColors: Record<string, string> = {
  AGUARDANDO_CONFIRMACAO: '#F59E0B',
  AGUARDANDO_PAGAMENTO: '#8B5CF6',
  AGUARDANDO_CONFIRMACAO_PAGAMENTO: '#F97316',
  PAGAMENTO_FEITO: '#22C55E',
  CONFIRMADO: '#3B82F6',
  EMBALANDO: '#F97316',
  PAGO: '#8B5CF6',
  ENVIADO: '#FF6B9D',
  ENTREGUE: '#22C55E',
  CAIXA_RECEBIDA: '#22C55E',
}

export const envioStatusTabs = [
  { label: 'Todos', value: '' },
  { label: 'Aguardando confirmação', value: 'AGUARDANDO_CONFIRMACAO' },
  { label: 'Aguardando pagamento', value: 'AGUARDANDO_PAGAMENTO' },
  { label: 'Ag. confirmação pag.', value: 'AGUARDANDO_CONFIRMACAO_PAGAMENTO' },
  { label: 'Pagamento feito', value: 'PAGAMENTO_FEITO' },
  { label: 'Confirmado', value: 'CONFIRMADO' },
  { label: 'Embalando', value: 'EMBALANDO' },
  { label: 'Enviado', value: 'ENVIADO' },
  { label: 'Caixa recebida', value: 'CAIXA_RECEBIDA' },
] as const

// Agrupamentos legados: PAGO compartilha label/cor com AGUARDANDO_PAGAMENTO, ENTREGUE com CAIXA_RECEBIDA
export const statusFiltroAgrupado: Record<string, string[]> = {
  AGUARDANDO_PAGAMENTO: ['AGUARDANDO_PAGAMENTO', 'PAGO'],
  CAIXA_RECEBIDA: ['CAIXA_RECEBIDA', 'ENTREGUE'],
}
