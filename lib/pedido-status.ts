export const pedidoStatusLabel: Record<string, string> = {
  AGUARDANDO_REVISAO: 'Aguardando revisão',
  AGUARDANDO_PAGAMENTO: 'Aguardando pagamento',
  AGUARDANDO_CONFIRMACAO: 'Aguardando confirmação',
  PAGO: 'Pago',
  COMPRADO: 'Comprado',
  CANCELADO: 'Cancelado',
}

export const pedidoStatusColors: Record<string, string> = {
  AGUARDANDO_REVISAO: '#F59E0B',
  AGUARDANDO_PAGAMENTO: '#8B5CF6',
  AGUARDANDO_CONFIRMACAO: '#F97316',
  PAGO: '#3B82F6',
  COMPRADO: '#22C55E',
  CANCELADO: '#EF4444',
}

// Agrupamento para tabs admin (Pago/Confirmado = PAGO + COMPRADO)
export const pedidoStatusTabs = [
  { label: 'Todos', value: '' },
  { label: 'Aguardando revisão', value: 'AGUARDANDO_REVISAO' },
  { label: 'Aguardando pagamento', value: 'AGUARDANDO_PAGAMENTO' },
  { label: 'Aguardando confirmação', value: 'AGUARDANDO_CONFIRMACAO' },
  { label: 'Pago/Confirmado', value: 'PAGO_COMPRADO' },
  { label: 'Cancelado', value: 'CANCELADO' },
] as const

export function isPagoConfirmado(status: string) {
  return status === 'PAGO' || status === 'COMPRADO'
}
