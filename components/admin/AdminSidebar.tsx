'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { LayoutDashboard, Users, List, Settings, LogOut, ShieldCheck, Link2, Truck, Mail } from 'lucide-react'
import { Logo } from '@/components/Logo'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/clientes', label: 'Clientes', icon: Users },
  { href: '/admin/itens', label: 'Itens', icon: List },
  { href: '/admin/envios', label: 'Envios', icon: Truck },
  { href: '/admin/convites', label: 'Convites', icon: Link2 },
  { href: '/admin/email', label: 'Email', icon: Mail },
  { href: '/admin/configuracoes', label: 'Configurações', icon: Settings },
]

export function AdminSidebar({ email }: { email: string }) {
  const pathname = usePathname()

  return (
    <aside className="w-64 flex flex-col shrink-0 h-full" style={{ background: '#1A1A2E' }}>
      <div className="p-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-3">
          <Logo size={36} color="white" />
          <div>
            <span className="text-white font-bold text-base block">KMundo Warehouse</span>
            <span className="text-xs" style={{ color: '#FF6B9D' }}>Painel Admin</span>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navLinks.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                isActive ? 'text-white' : 'text-white/50 hover:text-white/80 hover:bg-white/5'
              )}
              style={isActive ? { background: 'linear-gradient(135deg, rgba(255,107,157,0.2), rgba(199,125,255,0.2))', color: '#FF6B9D' } : {}}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,107,157,0.2)' }}>
            <ShieldCheck className="w-4 h-4" style={{ color: '#FF6B9D' }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-medium truncate">{email}</p>
            <p className="text-xs" style={{ color: '#FF6B9D' }}>Administrador</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm transition-colors hover:bg-white/5"
          style={{ color: 'rgba(255,255,255,0.4)' }}
        >
          <LogOut className="w-4 h-4" />
          Sair
        </button>
      </div>
    </aside>
  )
}
