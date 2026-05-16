'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowRight,
  Briefcase,
  ArrowDownToLine,
  ArrowUpFromLine,
  Users,
  Loader2,
  TrendingUp,
  Star,
  Wallet,
  ClipboardList,
} from 'lucide-react'
import { useCurrentUser } from '@/lib/api/hooks/use-current-user'
import { useEconomicProfile } from '@/lib/api/hooks/use-economic-profile'
import { useTransactions } from '@/lib/api/hooks/use-transactions'
import { useWallet } from '@/lib/api/hooks/use-wallet'

const RISK_TIER_LABEL: Record<string, string> = {
  very_low: 'Elite',
  low: 'Professional',
  medium: 'Standard',
  high: 'Starter',
}

const GIG_QUICK_ACTIONS = [
  {
    icon: Briefcase,
    label: 'Find Work',
    href: '/dashboard/work-matcher',
    bg: 'bg-trace-accent/10',
    color: 'text-trace-accent',
  },
  {
    icon: ArrowDownToLine,
    label: 'Deposit',
    href: '/dashboard/deposit',
    bg: 'bg-green-50',
    color: 'text-green-600',
  },
  {
    icon: ArrowUpFromLine,
    label: 'Withdraw',
    href: '/dashboard/withdraw',
    bg: 'bg-slate-950/5',
    color: 'text-slate-700',
  },
  {
    icon: Users,
    label: 'Community',
    href: '/dashboard/community',
    bg: 'bg-trace-accent/10',
    color: 'text-trace-accent',
  },
]

const TRADER_QUICK_ACTIONS = [
  {
    icon: ClipboardList,
    label: 'My Jobs',
    href: '/dashboard/my-jobs',
    bg: 'bg-trace-accent/10',
    color: 'text-trace-accent',
  },
  {
    icon: ArrowDownToLine,
    label: 'Deposit',
    href: '/dashboard/deposit',
    bg: 'bg-green-50',
    color: 'text-green-600',
  },
  {
    icon: ArrowUpFromLine,
    label: 'Withdraw',
    href: '/dashboard/withdraw',
    bg: 'bg-slate-950/5',
    color: 'text-slate-700',
  },
  {
    icon: Users,
    label: 'Community',
    href: '/dashboard/community',
    bg: 'bg-slate-950/5',
    color: 'text-slate-800',
  },
]

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function ScoreSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-52 bg-slate-950/10 rounded-2xl" />
      <div className="grid grid-cols-2 gap-4">
        <div className="h-28 bg-white rounded-2xl border border-trace-border" />
        <div className="h-28 bg-white rounded-2xl border border-trace-border" />
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const router = useRouter()
  const { data: user, isLoading: userLoading } = useCurrentUser()
  const { data: profile, isLoading: profileLoading } = useEconomicProfile()
  const { data: transactions, isLoading: txLoading } = useTransactions()
  const { data: wallet } = useWallet()

  useEffect(() => {
    if (!userLoading && user && !user.onboarding_complete) {
      router.replace('/onboarding')
    }
  }, [user, userLoading, router])

  const firstName = user?.full_name?.split(' ')[0] ?? 'there'
  const score = profile?.identity_score ?? 0
  const tier = RISK_TIER_LABEL[profile?.risk_tier ?? 'high'] ?? 'Starter'
  const scorePct = Math.round((score / 1000) * 100)

  const walletBalance = wallet?.balance ?? 0
  const isTrader = user?.persona === 'trader'
  const quickActions = isTrader ? TRADER_QUICK_ACTIONS : GIG_QUICK_ACTIONS

  const recentTx = (transactions ?? []).slice(0, 5)

  return (
    <div className="space-y-4">
      {/* Greeting */}
      <div className="pt-1">
        <h1 className="text-xl font-black text-slate-950">
          {getGreeting()}, {firstName} 👋
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Your economic identity at a glance
        </p>
      </div>

      {/* ── Top Section: score card + stat pills ─────────────────── */}
      {profileLoading ? (
        <ScoreSkeleton />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Score Card */}
          <div className="lg:col-span-2 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 rounded-2xl p-6 text-white relative overflow-hidden">
            {/* Decorative rings */}
            <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/[0.04] pointer-events-none" />
            <div className="absolute -bottom-16 right-8 w-64 h-64 rounded-full bg-trace-accent/[0.06] pointer-events-none" />

            <div className="relative">
              <div className="flex items-start justify-between mb-5">
                <p className="text-white/50 text-xs font-semibold uppercase tracking-widest">
                  Identity Score
                </p>
                <span className="bg-trace-accent/20 text-trace-accent text-xs font-bold px-3 py-1 rounded-full border border-trace-accent/20">
                  {tier} Tier
                </span>
              </div>

              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-5xl lg:text-6xl font-black tracking-tight">
                  {score.toLocaleString()}
                </span>
                <span className="text-white/30 text-xl font-light">/ 1,000</span>
              </div>

              <div className="mb-6">
                <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-trace-accent h-full transition-all duration-700 shadow-[0_0_12px_rgba(249,115,22,0.4)]"
                    style={{ width: `${scorePct}%` }}
                  />
                </div>
                <p className="text-white/40 text-xs mt-1.5">{scorePct}% of maximum score</p>
              </div>

              <Link
                href="/dashboard/finance-gateway"
                className="inline-flex items-center gap-1.5 bg-trace-accent hover:bg-trace-accent/90 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors active:scale-95"
              >
                Quick Cash <ArrowRight size={15} />
              </Link>
            </div>
          </div>

          {/* Stat Pills */}
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-trace-border">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-slate-950/5 flex items-center justify-center">
                  <Star className="h-4 w-4 text-slate-700" />
                </div>
                <p className="text-xs font-semibold text-muted-foreground">Vouches</p>
              </div>
              <p className="text-2xl font-black text-slate-950">
                {profile?.vouch_count ?? 0}
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">community trust signals</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-trace-border">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-trace-accent/10 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-trace-accent" />
                </div>
                <p className="text-xs font-semibold text-muted-foreground">Transactions</p>
              </div>
              <p className="text-2xl font-black text-slate-950">
                {(transactions ?? []).length}
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">recorded activities</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-trace-border col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-trace-accent/10 flex items-center justify-center">
                  <Wallet className="h-4 w-4 text-trace-accent" />
                </div>
                <p className="text-xs font-semibold text-muted-foreground">Wallet Balance</p>
              </div>
              <p className="text-2xl font-black text-slate-950">
                ₦{Number(walletBalance).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">available to withdraw</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Quick Actions ─────────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-3">
        {quickActions.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="flex flex-col items-center gap-2 bg-white rounded-2xl py-4 px-2 border border-trace-border hover:shadow-md transition-all active:scale-95"
          >
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${action.bg}`}>
              <action.icon className={`h-5 w-5 ${action.color}`} />
            </div>
            <span className="text-[11px] font-semibold text-slate-700 text-center leading-tight">
              {action.label}
            </span>
          </Link>
        ))}
      </div>

      {/* ── Recent Activity ───────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-trace-border overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-trace-border">
          <h3 className="font-bold text-slate-950 text-[15px]">Recent Activity</h3>
          <Link
            href="/dashboard/transactions"
            className="flex items-center gap-1 text-xs font-bold text-trace-accent hover:underline"
          >
            View all <ArrowRight size={12} />
          </Link>
        </div>

        {txLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-trace-accent" size={20} />
          </div>
        ) : recentTx.length === 0 ? (
          <div className="py-12 text-center px-5">
            <p className="text-2xl mb-2">💳</p>
            <p className="text-sm font-semibold text-slate-700">No transactions yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Your activity will appear here
            </p>
          </div>
        ) : (
          <div className="divide-y divide-trace-border/60">
            {recentTx.map((tx) => (
              <div key={tx.id} className="flex items-center gap-4 px-5 py-3.5">
                <div className="w-10 h-10 rounded-xl bg-trace-surface flex items-center justify-center text-base flex-shrink-0">
                  {tx.type === 'credit' ? '💰' : '💳'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-950 text-sm capitalize truncate">
                    {tx.category ?? tx.type}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(tx.created_at).toLocaleDateString('en-NG', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p
                    className={`font-bold text-sm ${
                      tx.type === 'credit' ? 'text-green-600' : 'text-slate-950'
                    }`}
                  >
                    {tx.type === 'credit' ? '+' : '-'}₦{Number(tx.amount).toLocaleString()}
                  </p>
                  <span
                    className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-semibold mt-0.5 ${
                      tx.status === 'successful'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {tx.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Score Build Card (only if score is low) ───────────────── */}
      {!profileLoading && score < 400 && (
        <div className="bg-white rounded-2xl border border-trace-border p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-trace-accent/10 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="h-6 w-6 text-trace-accent" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-slate-950 text-sm">Build your score</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Complete transactions, get vouched, and stay active to unlock finance.
            </p>
          </div>
          <Link
            href={isTrader ? '/dashboard/my-jobs' : '/dashboard/work-matcher'}
            className="flex-shrink-0 text-xs font-bold text-trace-accent flex items-center gap-1"
          >
            Start <ArrowRight size={12} />
          </Link>
        </div>
      )}
    </div>
  )
}
