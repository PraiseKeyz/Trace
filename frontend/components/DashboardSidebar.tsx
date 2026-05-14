'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BarChart3,
  Briefcase,
  PiggyBank,
  Settings,
  Users,
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  LogOut,
  Bell,
  User,
} from 'lucide-react'
import { Button } from './ui/button'
import { cn } from '@/lib/utils'
import { useAuth } from '@/context/auth-context'
import { useEconomicProfile } from '@/lib/api/hooks/use-economic-profile'

const TIER_LABEL: Record<string, string> = {
  very_low: 'Elite Tier',
  low: 'Professional Tier',
  medium: 'Standard Tier',
  high: 'Starter Tier',
}

const SIDEBAR_NAV = [
  { name: 'Dashboard',       href: '/dashboard',                 icon: LayoutDashboard },
  { name: 'Work Matcher',    href: '/dashboard/work-matcher',    icon: Briefcase },
  { name: 'Portfolio',       href: '/dashboard/portfolio',       icon: Wallet },
  { name: 'Transactions',    href: '/dashboard/transactions',    icon: ArrowLeftRight },
  { name: 'Quick Cash', href: '/dashboard/finance-gateway', icon: PiggyBank },
  { name: 'Community',       href: '/dashboard/community',       icon: Users },
  { name: 'Settings',        href: '/dashboard/settings',        icon: Settings },
]

const BOTTOM_TABS_TRADER = [
  { name: 'Home',      href: '/dashboard',                 icon: LayoutDashboard },
  { name: 'Portfolio', href: '/dashboard/portfolio',       icon: Wallet },
  { name: 'Cash',   href: '/dashboard/finance-gateway', icon: PiggyBank },
  { name: 'Community', href: '/dashboard/community',       icon: Users },
  { name: 'Me',        href: '/dashboard/settings',        icon: User },
]

const BOTTOM_TABS_GIG = [
  { name: 'Home',      href: '/dashboard',                 icon: LayoutDashboard },
  { name: 'Work',      href: '/dashboard/work-matcher',    icon: Briefcase },
  { name: 'Cash',   href: '/dashboard/finance-gateway', icon: PiggyBank },
  { name: 'Community', href: '/dashboard/community',       icon: Users },
  { name: 'Me',        href: '/dashboard/settings',        icon: User },
]

const BOTTOM_TABS_ALL = [
  { name: 'Home',      href: '/dashboard',                 icon: LayoutDashboard },
  { name: 'Work',      href: '/dashboard/work-matcher',    icon: Briefcase },
  { name: 'Cash',   href: '/dashboard/finance-gateway', icon: PiggyBank },
  { name: 'Community', href: '/dashboard/community',       icon: Users },
  { name: 'Me',        href: '/dashboard/settings',        icon: User },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { data: profile } = useEconomicProfile()

  const displayName = user?.fullName ?? user?.phone ?? '—'
  const tierLabel = TIER_LABEL[profile?.risk_tier ?? 'high'] ?? 'Starter Tier'

  const bottomTabs =
    user?.persona === 'trader' ? BOTTOM_TABS_TRADER :
    user?.persona === 'gig_worker' ? BOTTOM_TABS_GIG :
    BOTTOM_TABS_ALL

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href)

  return (
    <>
      {/* ── Mobile Top Bar ─────────────────────────────────────────── */}
      <div className="fixed top-0 left-0 right-0 z-40 flex h-14 items-center justify-between bg-white border-b border-trace-border px-5 lg:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-950">
            <BarChart3 className="h-5 w-5 text-trace-accent" />
          </div>
          <span className="text-lg font-black text-slate-950 tracking-tight">Trace</span>
        </div>
        <button className="relative p-2 rounded-full hover:bg-trace-surface transition-colors">
          <Bell className="h-5 w-5 text-slate-600" />
        </button>
      </div>

      {/* ── Mobile Bottom Tab Bar ───────────────────────────────────── */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 bg-white border-t border-trace-border lg:hidden">
        {bottomTabs.map((tab) => {
          const active = isActive(tab.href)
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={cn(
                'flex flex-1 flex-col items-center justify-center gap-0.5 transition-colors',
                active ? 'text-trace-accent' : 'text-slate-400',
              )}
            >
              <tab.icon className="h-[22px] w-[22px]" />
              <span className="text-[10px] font-semibold">{tab.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* ── Desktop Sidebar ─────────────────────────────────────────── */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-slate-950 lg:flex">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-7">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
            <BarChart3 className="h-6 w-6 text-trace-accent" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tight text-white">Trace</span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-trace-accent/80">
              Economic Identity
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-0.5 px-4">
          {SIDEBAR_NAV.map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-150',
                  active
                    ? 'bg-trace-accent text-white'
                    : 'text-white/60 hover:bg-white/10 hover:text-white',
                )}
              >
                <item.icon
                  className={cn('h-5 w-5 flex-shrink-0', active ? 'text-white' : 'text-white/40')}
                />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* User + Logout */}
        <div className="border-t border-white/10 p-4 space-y-2">
          <div className="rounded-xl bg-white/10 px-4 py-3">
            <p className="text-sm font-bold text-white truncate">{displayName}</p>
            <p className="text-xs text-trace-accent font-semibold">{tierLabel}</p>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 rounded-xl text-white/50 hover:bg-white/10 hover:text-white text-sm"
            onClick={logout}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>
    </>
  )
}
