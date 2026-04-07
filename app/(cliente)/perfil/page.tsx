import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PerfilForm } from '@/components/cliente/PerfilForm'

export default async function PerfilPage() {
  const session = await auth()

  const cliente = await prisma.cliente.findFirst({
    where: { usuario: { id: session!.user!.id } },
    include: { usuario: { select: { email: true } } },
  })

  if (!cliente) return null

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: '#1A1A2E' }}>Meu Perfil</h1>
        <p style={{ color: '#6B7280' }}>Gerencie suas informações pessoais</p>
      </div>

      {/* Suite info (não editável) */}
      <div
        className="rounded-2xl p-5 mb-6"
        style={{ background: 'linear-gradient(135deg, #FFF1F5, #FAF5FF)', border: '1px solid #FFD6E7' }}
      >
        <p className="text-xs font-medium mb-1" style={{ color: '#9CA3AF' }}>Número de Suite (imutável)</p>
        <p className="text-3xl font-bold" style={{ color: '#FF6B9D' }}>
          #{String(cliente.numeroDeSuite).padStart(3, '0')}
        </p>
        <p className="text-xs mt-2" style={{ color: '#9CA3AF' }}>{cliente.usuario.email}</p>
      </div>

      <PerfilForm
        clienteId={cliente.id}
        defaultValues={{
          nomeCompleto: cliente.nomeCompleto,
          telefone: cliente.telefone,
          pais: cliente.pais,
          endereco: cliente.endereco ?? '',
          cidade: cliente.cidade ?? '',
          cep: cliente.cep ?? '',
        }}
      />
    </div>
  )
}
