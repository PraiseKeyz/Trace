'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { Menu, X, Briefcase, PiggyBank, Home } from 'lucide-react'
import { Button } from './ui/button'

interface AppLayoutProps {
  children: React.ReactNode
}

const navigationItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/dashboard/work-matcher', label: 'Work Matcher', icon: Briefcase },
  { href: '/dashboard/finance-gateway', label: 'Finance', icon: PiggyBank },
]

export function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen bg-trace-surface">
      {/* Mobile Menu Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 h-screen w-64 transform bg-white shadow-lg transition-transform duration-300 ease-in-out md:relative md:transform-none ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex flex-col gap-8 p-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image src="/trace-logo.svg" alt="Trace" width={32} height={32} className="rounded-lg" />
            <span className="text-xl font-bold text-trace-primary">Trace</span>
          </Link>

          {/* Navigation */}
          <nav className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-4 py-2 transition-colors ${
                    isActive
                      ? 'bg-trace-primary/10 text-trace-primary font-semibold'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Spacer */}
          <div className="flex-1" />

          {/* User Section */}
          <div className="space-y-3 border-t border-gray-200 pt-4">
            <p className="text-sm font-medium text-gray-700">John Trader</p>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                // Logout logic
                window.location.href = '/'
              }}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="border-b border-trace-border bg-white shadow-sm">
          <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden text-trace-primary"
            >
              {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            <h1 className="flex-1 text-lg font-semibold text-trace-text sm:text-2xl">Trace</h1>
            <div className="text-right text-sm text-gray-600">
              <p className="font-medium">Active Status</p>
              <p className="text-xs">Build your profile</p>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
