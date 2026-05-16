import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { FuncionarioForm } from '@/components/admin/FuncionarioForm'

export default function NovoFuncionarioPage() {
  return (
    <div className="p-4 sm:p-8 max-w-4xl">
      <Link href="/admin/funcionarios" className="inline-flex items-center gap-2 text-sm font-medium mb-6 hover:opacity-70 transition-opacity" style={{ color: '#FF6B9D' }}>
        <ArrowLeft className="w-4 h-4" />
        Voltar para funcionários
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: '#1A1A2E' }}>Novo funcionário</h1>
        <p style={{ color: '#6B7280' }}>Cadastre os dados básicos do funcionário.</p>
      </div>

      <FuncionarioForm />
    </div>
  )
}
