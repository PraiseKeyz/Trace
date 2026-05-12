'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Menu, 
  X, 
  BarChart3, 
  Briefcase, 
  PiggyBank, 
  Home, 
  Settings, 
  Users, 
  BookOpen, 
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  TrendingUp,
  Gift,
  LogOut
} from 'lucide-react'
import { Button } from './ui/button'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Portfolio', href: '/dashboard/portfolio', icon: Wallet },
  { name: 'Earnings', href: '/dashboard/earnings', icon: TrendingUp },
  { name: 'Transactions', href: '/dashboard/transactions', icon: ArrowLeftRight },
  { name: 'Work Matcher', href: '/dashboard/work-matcher', icon: Briefcase },
  { name: 'Finance Gateway', icon: PiggyBank, href: '/dashboard/finance-gateway' },
  { name: 'Learning', icon: BookOpen, href: '/dashboard/learning' },
  { name: 'Referrals', icon: Gift, href: '/dashboard/referrals' },
  { name: 'Community', icon: Users, href: '/dashboard/community' },
  { name: 'Settings', icon: Settings, href: '/dashboard/settings' },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(href)
  }

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-8">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-trace-primary shadow-lg shadow-trace-primary/20">
          <BarChart3 className="h-6 w-6 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-bold tracking-tight text-trace-primary">Trace</span>
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Economic Identity</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-4 py-4">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            onClick={() => setIsMobileOpen(false)}
            className={cn(
              'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200',
              isActive(item.href)
                ? 'bg-trace-primary text-white shadow-md shadow-trace-primary/20'
                : 'text-muted-foreground hover:bg-trace-primary/5 hover:text-trace-primary'
            )}
          >
            <item.icon className={cn("h-5 w-5", isActive(item.href) ? "text-white" : "text-muted-foreground")} />
            {item.name}
          </Link>
        ))}
      </nav>

      {/* Logout / Bottom Section */}
      <div className="border-t border-border p-4">
        <div className="mb-4 px-4 py-2">
          <p className="text-sm font-semibold text-foreground">John Trader</p>
          <p className="text-xs text-muted-foreground">Professional Tier</p>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          onClick={() => {
            window.location.href = '/'
          }}
        >
          <LogOut className="h-5 w-5" />
          Sign Out
        </Button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-40 flex h-16 items-center justify-between border-b border-border bg-white px-4 shadow-sm lg:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-trace-primary">
            <BarChart3 className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold text-trace-primary">Trace</span>
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="text-trace-primary"
        >
          {isMobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Mobile Sidebar - Backdrop */}
      <div 
        className={cn(
          "fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
          isMobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsMobileOpen(false)}
      />

      {/* Mobile Sidebar - Content */}
      <div className={cn(
        "fixed left-0 top-0 z-50 h-full w-72 bg-white flex flex-col transition-transform duration-300 ease-in-out shadow-2xl lg:hidden",
        isMobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <SidebarContent />
      </div>

      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border bg-white lg:flex">
        <SidebarContent />
      </aside>
    </>
  )
}
