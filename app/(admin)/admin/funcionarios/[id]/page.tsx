import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { FuncionarioForm } from '@/components/admin/FuncionarioForm'
import { LancamentoFuncionarioForm } from '@/components/admin/LancamentoFuncionarioForm'
import { DeleteButton } from '@/components/admin/DeleteButton'

const tipoLabel: Record<string, string> = {
  PAGAMENTO: 'Pagamento',
  HORA_EXTRA: 'Hora extra',
  ATESTADO: 'Atestado',
  DESCONTO: 'Desconto',
  OBSERVACAO: 'Observação',
}

export default async function FuncionarioDetalhePage({ params }: { params: { id: string } }) {
  const funcionario = await prisma.funcionario.findUnique({
    where: { id: params.id },
    include: { lancamentos: { orderBy: { dataReferencia: 'desc' } } },
  })

  if (!funcionario) notFound()

  const totalPagamentos = funcionario.lancamentos
    .filter((l) => l.tipo === 'PAGAMENTO')
    .reduce((acc, l) => acc + (l.valor ?? 0), 0)

  const totalHorasExtras = funcionario.lancamentos
    .filter((l) => l.tipo === 'HORA_EXTRA')
    .reduce((acc, l) => acc + (l.horas ?? 0), 0)

  const totalDescontos = funcionario.lancamentos
    .filter((l) => l.tipo === 'DESCONTO')
    .reduce((acc, l) => acc + (l.valor ?? 0), 0)

  const valorHoraBase = funcionario.salarioBase ? funcionario.salarioBase / 220 : 0
  const valorHorasExtras = totalHorasExtras * valorHoraBase
  const totalEstimado = totalPagamentos + valorHorasExtras - totalDescontos

  return (
    <div className="p-4 sm:p-8 max-w-5xl">
      <div className="flex flex-wrap items-start gap-3 mb-6 sm:mb-8">
        <Link href="/admin/funcionarios">
          <button className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-colors shrink-0" style={{ color: '#6B7280' }}>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg sm:text-2xl font-bold leading-tight" style={{ color: '#1A1A2E' }}>{funcionario.nomeCompleto}</h1>
          <p className="text-sm" style={{ color: '#6B7280' }}>{funcionario.cargo ?? 'Sem cargo definido'}</p>
        </div>
        <DeleteButton url={`/api/admin/funcionarios/${funcionario.id}`} confirmar="Tem certeza que deseja excluir este funcionário?" redirectTo="/admin/funcionarios" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <FuncionarioForm
            funcionario={{
              id: funcionario.id,
              nomeCompleto: funcionario.nomeCompleto,
              email: funcionario.email,
              telefone: funcionario.telefone,
              cargo: funcionario.cargo,
              dataAdmissao: funcionario.dataAdmissao?.toISOString() ?? null,
              salarioBase: funcionario.salarioBase,
              status: funcionario.status,
              observacoes: funcionario.observacoes,
            }}
          />
        </div>
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-6" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h2 className="font-semibold mb-4" style={{ color: '#1A1A2E' }}>Resumo</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span style={{ color: '#6B7280' }}>Pagamentos</span><span style={{ color: '#1A1A2E', fontWeight: 600 }}>{totalPagamentos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>
              <div className="flex justify-between"><span style={{ color: '#6B7280' }}>Horas extras</span><span style={{ color: '#1A1A2E', fontWeight: 600 }}>{totalHorasExtras.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}h</span></div>
              <div className="flex justify-between"><span style={{ color: '#6B7280' }}>Valor estimado horas extras</span><span style={{ color: '#1A1A2E', fontWeight: 600 }}>{valorHorasExtras.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>
              <div className="flex justify-between"><span style={{ color: '#6B7280' }}>Descontos</span><span style={{ color: '#EF4444', fontWeight: 600 }}>{totalDescontos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>
              <div className="flex justify-between pt-3 border-t border-gray-100"><span style={{ color: '#6B7280' }}>Total estimado</span><span style={{ color: '#16A34A', fontWeight: 700 }}>{totalEstimado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LancamentoFuncionarioForm funcionarioId={funcionario.id} />

        <div className="bg-white rounded-2xl p-6" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <h2 className="font-semibold mb-4" style={{ color: '#1A1A2E' }}>Histórico</h2>
          {funcionario.lancamentos.length === 0 ? (
            <p className="text-sm" style={{ color: '#9CA3AF' }}>Nenhum lançamento registrado.</p>
          ) : (
            <div className="space-y-3">
              {funcionario.lancamentos.map((lancamento) => (
                <div key={lancamento.id} className="rounded-xl p-4" style={{ background: '#F9FAFB' }}>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <p className="font-medium text-sm" style={{ color: '#1A1A2E' }}>{tipoLabel[lancamento.tipo]}</p>
                      <p className="text-xs" style={{ color: '#9CA3AF' }}>{new Date(lancamento.dataReferencia).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <div className="text-right text-xs" style={{ color: '#6B7280' }}>
                      {lancamento.valor !== null && lancamento.valor !== undefined && <p>Valor: {lancamento.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>}
                      {lancamento.horas !== null && lancamento.horas !== undefined && <p>Horas: {lancamento.horas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>}
                      {lancamento.quantidadeDias !== null && lancamento.quantidadeDias !== undefined && <p>Dias: {lancamento.quantidadeDias}</p>}
                    </div>
                  </div>
                  {lancamento.descricao && <p className="text-sm" style={{ color: '#374151' }}>{lancamento.descricao}</p>}
                  {lancamento.arquivoAtestado && <a href={lancamento.arquivoAtestado} target="_blank" rel="noopener noreferrer" className="text-xs mt-2 inline-block hover:underline" style={{ color: '#FF6B9D' }}>Abrir atestado</a>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
