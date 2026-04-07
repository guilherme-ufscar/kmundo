import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { ClienteSidebar } from '@/components/cliente/ClienteSidebar'

export default async function ClienteLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect('/login')
  if (session.user?.role === 'ADMIN') redirect('/admin/dashboard')

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#F8F9FA' }}>
      <ClienteSidebar
        nomeCompleto={session.user?.nomeCompleto ?? 'Cliente'}
        numeroDeSuite={session.user?.numeroDeSuite ?? 0}
      />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
