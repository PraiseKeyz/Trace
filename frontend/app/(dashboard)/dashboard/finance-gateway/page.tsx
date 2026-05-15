'use client'

import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  Wallet,
  TrendingUp,
  Shield,
  ArrowUp,
  Zap,
  Copy,
  AlertCircle,
  CheckCircle2,
  Loader2,
  LucideIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCurrentUser, currentUserKey } from '@/lib/api/hooks/use-current-user'
import { useEconomicProfile } from '@/lib/api/hooks/use-economic-profile'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface FinanceProduct {
  id: string
  icon: LucideIcon
  title: string
  description: string
  minScore: number
}

const FINANCE_PRODUCTS: FinanceProduct[] = [
  {
    id: '1',
    icon: Wallet,
    title: 'Micro-Loan',
    description: 'Flexible loans from ₦50,000 to ₦500,000 for business expansion',
    minScore: 50,
  },
  {
    id: '2',
    icon: TrendingUp,
    title: 'Savings Plan',
    description: 'Build emergency funds with competitive returns and flexibility',
    minScore: 40,
  },
  {
    id: '3',
    icon: Shield,
    title: 'Business Insurance',
    description: 'Protect your business with affordable coverage options',
    minScore: 60,
  },
]

const TIER_NEXT: Record<string, { label: string; target: number }> = {
  high:     { label: 'Starter', target: 30 },
  medium:   { label: 'Standard', target: 50 },
  low:      { label: 'Professional', target: 70 },
  very_low: { label: 'Elite', target: 100 },
}

// ── Virtual Account Section ──────────────────────────────────────────────────

function VirtualAccountSection() {
  const { data: user, isLoading } = useCurrentUser()
  const qc = useQueryClient()
  const [submitting, setSubmitting] = useState(false)

  const handleCopy = () => {
    if (user?.virtual_account_no) {
      navigator.clipboard.writeText(user.virtual_account_no)
      toast.success('Account number copied')
    }
  }

  const handleGenerate = async () => {
    setSubmitting(true)
    try {
      await api.post('/squad/my-virtual-account', undefined)
      toast.success('Virtual account created!')
      qc.invalidateQueries({ queryKey: currentUserKey })
    } catch {
      // error toast handled by api client
    } finally {
      setSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border bg-white p-6 animate-pulse">
        <div className="h-4 w-32 rounded bg-slate-200 mb-3" />
        <div className="h-8 w-48 rounded bg-slate-200" />
      </div>
    )
  }

  if (user?.virtual_account_no) {
    return (
      <div className="rounded-2xl border border-border bg-white p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Squad Virtual Account</p>
            <p className="text-sm text-slate-600">Your dedicated payment account</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl bg-slate-50 border border-border px-4 py-3">
          <span className="text-xl font-bold tracking-widest text-slate-900 flex-1">
            {user.virtual_account_no}
          </span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-lg bg-white border border-border px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <Copy className="h-3.5 w-3.5" />
            Copy
          </button>
        </div>
        <p className="mt-2 text-xs text-slate-500">Wema Bank · Send payments to this account</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
      <div className="flex items-start gap-3 mb-4">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-amber-100">
          <AlertCircle className="h-5 w-5 text-amber-600" />
        </div>
        <div>
          <p className="font-semibold text-amber-900">No Virtual Account Yet</p>
          <p className="text-sm text-amber-700 mt-0.5">
            Generate one now to start receiving payments directly to your Trace wallet.
          </p>
        </div>
      </div>
      <Button
        onClick={handleGenerate}
        disabled={submitting}
        className="bg-trace-accent hover:bg-trace-accent/90 text-white"
      >
        {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
        {submitting ? 'Generating…' : 'Generate Account'}
      </Button>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function FinanceGatewayPage() {
  const { data: profile, isLoading: profileLoading } = useEconomicProfile()
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null)

  const score = profile?.identity_score ?? 0
  const isEligible = profile?.is_finance_eligible ?? false
  const maxLoan = profile?.max_recommended_loan ?? 0
  const tier = profile?.risk_tier ?? 'high'
  const nextTier = TIER_NEXT[tier] ?? TIER_NEXT.high

  const eligibleProducts = FINANCE_PRODUCTS.filter(p => score >= p.minScore)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">Quick Cash</h1>
        <p className="text-slate-500">Money when you need it — loans and financial products built for you</p>
      </div>

      {/* Virtual Account */}
      <VirtualAccountSection />

      {/* Credit Score Overview */}
      <div className="rounded-2xl border border-border bg-gradient-to-br from-slate-950 to-slate-800 p-8 text-white">
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="text-xl font-bold text-white/80 mb-4">Your Credit Position</h2>
            {profileLoading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-14 w-32 rounded bg-white/10" />
                <div className="h-3 w-full rounded-full bg-white/10" />
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-white/60 mb-1">Economic Identity Score</p>
                  <div className="flex items-end gap-2">
                    <span className="text-6xl font-bold text-white">{score}</span>
                    <span className="text-white/50 mb-1">/ 100</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-white/60 mb-2">Progress to {nextTier.label} tier</p>
                  <div className="h-2.5 w-full rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-trace-accent transition-all"
                      style={{ width: `${Math.min((score / nextTier.target) * 100, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-white/50 mt-1">
                    {score >= nextTier.target
                      ? `You've reached ${nextTier.label} tier!`
                      : `${nextTier.target - score} more points to reach ${nextTier.label} tier`}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col justify-between">
            <div>
              <h3 className="font-semibold text-white/80 mb-3">
                {isEligible ? 'You qualify for:' : 'Available once you build your score:'}
              </h3>
              {profileLoading ? (
                <div className="space-y-2 animate-pulse">
                  {[1, 2].map(i => <div key={i} className="h-4 w-36 rounded bg-white/10" />)}
                </div>
              ) : (
                <ul className="space-y-2 text-sm text-white/70">
                  {(eligibleProducts.length > 0 ? eligibleProducts : FINANCE_PRODUCTS).map(p => (
                    <li key={p.id} className="flex items-center gap-2">
                      <span className={cn('h-2 w-2 rounded-full', score >= p.minScore ? 'bg-green-400' : 'bg-white/20')} />
                      {p.title}
                      {score < p.minScore && <span className="text-white/40 text-xs">(need {p.minScore} pts)</span>}
                    </li>
                  ))}
                </ul>
              )}
              {isEligible && maxLoan > 0 && (
                <p className="mt-3 text-sm font-semibold text-trace-accent">
                  Max recommended loan: ₦{Number(maxLoan).toLocaleString()}
                </p>
              )}
            </div>
            <Button className="bg-trace-accent hover:bg-trace-accent/90 text-white mt-4 md:mt-0">
              <ArrowUp className="mr-2 h-4 w-4" />
              Improve Score
            </Button>
          </div>
        </div>
      </div>

      {/* Financial Products */}
      {/* <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Financial Products</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {FINANCE_PRODUCTS.map((product) => {
            const eligible = score >= product.minScore
            const Icon = product.icon
            return (
              <div
                key={product.id}
                onClick={() => setSelectedProduct(product.id === selectedProduct ? null : product.id)}
                className={cn(
                  'cursor-pointer rounded-2xl border bg-white p-6 transition-all',
                  selectedProduct === product.id
                    ? 'border-trace-accent ring-2 ring-trace-accent/20'
                    : 'border-border hover:border-slate-300',
                  !eligible && 'opacity-60'
                )}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
                    <Icon className="h-6 w-6 text-slate-700" />
                  </div>
                  <span className={cn(
                    'rounded-full px-2.5 py-0.5 text-xs font-semibold',
                    eligible ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                  )}>
                    {eligible ? 'Eligible' : `${product.minScore} pts`}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 mb-1">{product.title}</h3>
                <p className="text-sm text-slate-500">{product.description}</p>
              </div>
            )
          })}
        </div>
      </div> */}

      {/* Actionable Tips */}
      <div className="rounded-2xl border border-border bg-white p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-5 flex items-center gap-2">
          <Zap className="h-5 w-5 text-trace-accent" />
          Ways to Improve Your Score
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { action: 'Complete more work', impact: 'Increases Work History score', points: '+5–10 pts' },
            { action: 'Get vouched by peers', impact: 'Boosts Vouch Score', points: '+3–8 pts' },
            { action: 'Record transactions', impact: 'Shows financial activity', points: '+5–15 pts' },
            { action: 'Complete your profile', impact: 'Immediate boost', points: '+2–3 pts' },
          ].map((item, idx) => (
            <div key={idx} className="flex items-start justify-between gap-4 rounded-xl border border-border bg-slate-50 p-4">
              <div>
                <p className="font-semibold text-slate-800 text-sm">{item.action}</p>
                <p className="text-xs text-slate-500 mt-0.5">{item.impact}</p>
              </div>
              <span className="text-xs font-bold text-trace-accent flex-shrink-0">{item.points}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Selected product detail panel */}
      {selectedProduct && (() => {
        const product = FINANCE_PRODUCTS.find(p => p.id === selectedProduct)!
        const eligible = score >= product.minScore
        const Icon = product.icon
        return (
          <div className="rounded-2xl border border-border bg-white p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
                <Icon className="h-6 w-6 text-slate-700" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">{product.title}</h3>
                <p className="text-sm text-slate-500">{product.description}</p>
              </div>
            </div>
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Eligibility</p>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={cn('h-full transition-all', eligible ? 'bg-green-500' : 'bg-trace-accent')}
                    style={{ width: `${Math.min((score / product.minScore) * 100, 100)}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-slate-700">{score}/{product.minScore}</span>
              </div>
              <p className={cn('text-xs mt-1.5', eligible ? 'text-green-600' : 'text-slate-500')}>
                {eligible ? '✓ You\'re eligible!' : `Need ${product.minScore - score} more points`}
              </p>
            </div>
            <Button className="w-full bg-trace-accent hover:bg-trace-accent/90 text-white" disabled={!eligible}>
              {eligible ? 'Apply Now' : 'Unlock Product'}
            </Button>
          </div>
        )
      })()}
    </div>
  )
}
