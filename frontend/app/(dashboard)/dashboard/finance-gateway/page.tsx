'use client'

import { useState } from 'react'
import { useQueryClient, useQuery } from '@tanstack/react-query'
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
  ArrowDownToLine,
  ChevronDown,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCurrentUser, currentUserKey } from '@/lib/api/hooks/use-current-user'
import { useEconomicProfile } from '@/lib/api/hooks/use-economic-profile'
import { useWallet, useWithdraw } from '@/lib/api/hooks/use-wallet'
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

interface Bank {
  code: string
  name: string
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

// ── Wallet Section ────────────────────────────────────────────────────────────

function WalletSection() {
  const { data: wallet, isLoading } = useWallet()
  const { data: banksData } = useQuery<Bank[]>({
    queryKey: ['banks'],
    queryFn: () => api.get('/squad/banks', { silent: true }) as Promise<Bank[]>,
    staleTime: Infinity,
  })
  const { mutateAsync: withdraw, isPending } = useWithdraw()

  const [showForm, setShowForm] = useState(false)
  const [amount, setAmount] = useState('')
  const [bankCode, setBankCode] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [accountName, setAccountName] = useState('')
  const [resolving, setResolving] = useState(false)

  const balance = wallet?.balance ?? 0
  const banks = banksData ?? []

  const handleResolve = async () => {
    if (accountNumber.length !== 10 || !bankCode) return
    setResolving(true)
    try {
      const res = await api.post<{ data?: { account_name?: string } }>(
        '/squad/accounts/resolve',
        { bank_code: bankCode, account_number: accountNumber },
      ) as any
      const name = res?.data?.account_name ?? res?.account_name ?? ''
      if (name) {
        setAccountName(name)
        toast.success(`Account: ${name}`)
      } else {
        toast.error('Could not resolve account name')
      }
    } catch {
      // error toast handled by api client
    } finally {
      setResolving(false)
    }
  }

  const handleWithdraw = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const amt = Number(amount)
    if (!amt || amt < 100) { toast.error('Minimum withdrawal is ₦100'); return }
    if (!bankCode) { toast.error('Select a bank'); return }
    if (accountNumber.length !== 10) { toast.error('Account number must be 10 digits'); return }
    if (!accountName) { toast.error('Resolve account name first'); return }
    if (amt > balance) { toast.error(`Insufficient balance. Available: ₦${balance.toLocaleString()}`); return }

    try {
      await withdraw({ amount: amt, bank_code: bankCode, account_number: accountNumber, account_name: accountName })
      toast.success(`₦${amt.toLocaleString()} withdrawal initiated`)
      setShowForm(false)
      setAmount(''); setBankCode(''); setAccountNumber(''); setAccountName('')
    } catch {
      // handled by api client
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border bg-white p-6 animate-pulse">
        <div className="h-4 w-28 rounded bg-slate-200 mb-3" />
        <div className="h-10 w-40 rounded bg-slate-200" />
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-border bg-white overflow-hidden">
      {/* Balance Header */}
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-trace-accent/10">
            <Wallet className="h-5 w-5 text-trace-accent" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Trace Wallet</p>
            <p className="text-2xl font-black text-slate-900">₦{balance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowForm(v => !v)}
          className="gap-1.5"
        >
          <ArrowDownToLine className="h-3.5 w-3.5" />
          Withdraw
          <ChevronDown className={cn('h-3 w-3 transition-transform', showForm && 'rotate-180')} />
        </Button>
      </div>

      {/* Withdraw Form */}
      {showForm && (
        <form onSubmit={handleWithdraw} className="border-t border-border px-6 py-5 space-y-4 bg-slate-50">
          <div className="flex items-center justify-between mb-1">
            <p className="font-semibold text-slate-800 text-sm">Withdraw to Bank</p>
            <button type="button" onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Amount (₦)</label>
            <input
              type="number"
              min="100"
              max={balance}
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="e.g. 5000"
              className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm outline-none focus:border-trace-accent focus:ring-2 focus:ring-trace-accent/10"
              required
            />
            <p className="text-[11px] text-slate-400 mt-1">Available: ₦{balance.toLocaleString()}</p>
          </div>

          {/* Bank */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Bank</label>
            <select
              value={bankCode}
              onChange={e => { setBankCode(e.target.value); setAccountName('') }}
              className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm outline-none focus:border-trace-accent focus:ring-2 focus:ring-trace-accent/10"
              required
            >
              <option value="">Select bank…</option>
              {banks.map(b => (
                <option key={b.code} value={b.code}>{b.name}</option>
              ))}
            </select>
          </div>

          {/* Account Number + Resolve */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Account Number</label>
            <div className="flex gap-2">
              <input
                type="text"
                inputMode="numeric"
                maxLength={10}
                value={accountNumber}
                onChange={e => { setAccountNumber(e.target.value.replace(/\D/g, '')); setAccountName('') }}
                placeholder="0123456789"
                className="flex-1 rounded-xl border border-border bg-white px-4 py-2.5 text-sm outline-none focus:border-trace-accent focus:ring-2 focus:ring-trace-accent/10"
                required
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={accountNumber.length !== 10 || !bankCode || resolving}
                onClick={handleResolve}
                className="flex-shrink-0 h-[42px]"
              >
                {resolving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Verify'}
              </Button>
            </div>
          </div>

          {/* Account Name (read-only) */}
          {accountName && (
            <div className="flex items-center gap-2 rounded-xl bg-green-50 border border-green-200 px-4 py-2.5">
              <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
              <span className="text-sm font-semibold text-green-800">{accountName}</span>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isPending || !accountName}>
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {isPending ? 'Processing…' : `Withdraw ₦${Number(amount || 0).toLocaleString()}`}
          </Button>
        </form>
      )}
    </div>
  )
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
          <Button variant="outline" size="sm" onClick={handleCopy}>
            <Copy className="h-3.5 w-3.5" />
            Copy
          </Button>
        </div>
        <p className="mt-2 text-xs text-slate-500">Wema Bank · Send payments to this account to top up your Trace wallet</p>
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
      <Button onClick={handleGenerate} disabled={submitting}>
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {submitting ? 'Generating…' : 'Generate Account'}
      </Button>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function FinanceGatewayPage() {
  const { data: profile, isLoading: profileLoading } = useEconomicProfile()
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

      {/* Wallet Balance + Withdraw */}
      <WalletSection />

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
            <Button className="mt-4 md:mt-0">
              <ArrowUp className="h-4 w-4" />
              Improve Score
            </Button>
          </div>
        </div>
      </div>

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
    </div>
  )
}
