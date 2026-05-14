'use client'

import { useState, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Search, ArrowUpRight, ArrowDownLeft, ArrowLeftRight, Download, TrendingUp, TrendingDown, Wallet, ChevronDown } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useTransactions } from '@/lib/api/hooks/use-transactions'
import type { Transaction } from '@/lib/api/hooks/use-transactions'
import { cn } from '@/lib/utils'

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtAmount(amount: number, currency: string) {
  const symbol = currency === 'NGN' ? '₦' : currency + ' '
  return `${symbol}${Number(amount).toLocaleString()}`
}

function fmtShort(n: number) {
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `₦${(n / 1_000).toFixed(1)}K`
  return `₦${n.toLocaleString()}`
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - date.getTime()) / 86_400_000)
  const time = date.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })
  if (diffDays === 0) return `Today · ${time}`
  if (diffDays === 1) return `Yesterday · ${time}`
  return date.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })
}

function monthLabel(iso: string) {
  return new Date(iso).toLocaleDateString('en-NG', { month: 'short', year: '2-digit' })
}

// ── Skeletons ─────────────────────────────────────────────────────────────────

function RowSkeleton() {
  return (
    <div className="animate-pulse bg-white rounded-2xl p-4 flex items-center gap-4 border border-trace-border">
      <div className="w-11 h-11 bg-slate-100 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-slate-100 rounded w-2/5" />
        <div className="h-3 bg-slate-100 rounded w-1/3" />
      </div>
      <div className="flex flex-col items-end gap-2">
        <div className="h-5 bg-slate-100 rounded w-20" />
        <div className="h-4 bg-slate-100 rounded-full w-16" />
      </div>
    </div>
  )
}

// ── Transaction row ───────────────────────────────────────────────────────────

function TransactionRow({ tx }: { tx: Transaction }) {
  const isCredit = tx.type === 'credit'
  const isDebit = tx.type === 'debit'
  return (
    <div className="bg-white rounded-2xl p-4 flex items-center gap-4 border border-trace-border hover:border-trace-accent/30 hover:shadow-sm transition-all">
      <div
        className={cn(
          'w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0',
          isCredit ? 'bg-green-50' : isDebit ? 'bg-red-50' : 'bg-slate-50',
        )}
      >
        {isCredit ? (
          <ArrowDownLeft size={18} className="text-green-600" />
        ) : isDebit ? (
          <ArrowUpRight size={18} className="text-red-500" />
        ) : (
          <ArrowLeftRight size={18} className="text-slate-500" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-slate-900 capitalize truncate">{tx.category ?? tx.type}</p>
        <p className="text-xs text-slate-400 mt-0.5">{formatDate(tx.created_at)}</p>
      </div>
      <div className="text-right flex-shrink-0">
        <p
          className={cn(
            'font-bold text-sm',
            isCredit ? 'text-green-600' : isDebit ? 'text-red-500' : 'text-slate-900',
          )}
        >
          {isDebit ? '−' : '+'}
          {fmtAmount(tx.amount, tx.currency)}
        </p>
        <span
          className={cn(
            'inline-block text-[10px] px-2 py-0.5 rounded-full font-semibold mt-0.5',
            tx.status === 'successful' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700',
          )}
        >
          {tx.status === 'successful' ? 'Successful' : 'Pending'}
        </span>
      </div>
    </div>
  )
}

// ── Empty state ───────────────────────────────────────────────────────────────

function Empty({ filtered }: { filtered: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 bg-trace-accent/10 rounded-2xl flex items-center justify-center mb-4">
        <ArrowLeftRight size={28} className="text-trace-accent" />
      </div>
      <h3 className="text-base font-bold text-slate-900 mb-1">
        {filtered ? 'No matching transactions' : 'No transactions yet'}
      </h3>
      <p className="text-sm text-slate-500 max-w-xs">
        {filtered
          ? 'Try adjusting your search or filter.'
          : 'Your financial activity will appear here once you start transacting.'}
      </p>
    </div>
  )
}

// ── Filter tabs ───────────────────────────────────────────────────────────────

const TYPE_TABS = [
  { key: 'all', label: 'All' },
  { key: 'credit', label: 'Income' },
  { key: 'debit', label: 'Expenses' },
]

// ── Overview tab ──────────────────────────────────────────────────────────────

function OverviewTab({
  totalIncome,
  totalExpenses,
  netBalance,
  creditCount,
  debitCount,
  totalCount,
  monthly,
}: {
  totalIncome: number
  totalExpenses: number
  netBalance: number
  creditCount: number
  debitCount: number
  totalCount: number
  monthly: { month: string; income: number; expenses: number }[]
}) {
  return (
    <div className="space-y-4">
      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4">
        <div className="bg-white rounded-2xl border border-trace-border p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="h-5 w-5 text-green-600" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Income
            </p>
            <p className="text-2xl font-black text-green-600 mt-0.5">{fmtShort(totalIncome)}</p>
          </div>
          <p className="text-xs text-muted-foreground">{creditCount} credits</p>
        </div>

        <div className="bg-white rounded-2xl border border-trace-border p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
            <TrendingDown className="h-5 w-5 text-red-500" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Expenses
            </p>
            <p className="text-2xl font-black text-red-500 mt-0.5">{fmtShort(totalExpenses)}</p>
          </div>
          <p className="text-xs text-muted-foreground">{debitCount} debits</p>
        </div>

        <div
          className={cn(
            'rounded-2xl border p-5 flex items-center gap-4',
            netBalance >= 0
              ? 'bg-trace-accent/5 border-trace-accent/20'
              : 'bg-red-50 border-red-100',
          )}
        >
          <div
            className={cn(
              'w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0',
              netBalance >= 0 ? 'bg-trace-accent/10' : 'bg-red-100',
            )}
          >
            <Wallet className={cn('h-5 w-5', netBalance >= 0 ? 'text-trace-accent' : 'text-red-500')} />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Net Balance
            </p>
            <p
              className={cn(
                'text-2xl font-black mt-0.5',
                netBalance >= 0 ? 'text-slate-950' : 'text-red-500',
              )}
            >
              {netBalance < 0 ? '−' : ''}
              {fmtShort(Math.abs(netBalance))}
            </p>
          </div>
          <p className="text-xs text-muted-foreground">{totalCount} total</p>
        </div>
      </div>

      {/* Monthly chart */}
      {monthly.length > 0 ? (
        <div className="bg-white rounded-2xl border border-trace-border p-5">
          <h3 className="font-bold text-slate-950 mb-4 text-[15px]">Monthly Overview</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthly} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="month"
                stroke="#94a3b8"
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                stroke="#94a3b8"
                tick={{ fontSize: 11 }}
                tickFormatter={fmtShort}
                axisLine={false}
                tickLine={false}
                width={48}
              />
              <Tooltip formatter={(v: number) => fmtShort(v)} />
              <Bar dataKey="income" name="Income" fill="#22c55e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" name="Expenses" fill="#f97316" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-trace-border p-8 text-center">
          <p className="text-sm text-muted-foreground">No monthly data yet</p>
        </div>
      )}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function TransactionsPage() {
  const { data: transactions, isLoading } = useTransactions()
  const [pageTab, setPageTab] = useState<'activity' | 'overview'>('activity')
  const [filterType, setFilterType] = useState('all')
  const [search, setSearch] = useState('')

  const all = transactions ?? []
  const successful = all.filter((t) => t.status === 'successful')
  const totalIncome = successful.filter((t) => t.type === 'credit').reduce((s, t) => s + Number(t.amount), 0)
  const totalExpenses = successful.filter((t) => t.type === 'debit').reduce((s, t) => s + Number(t.amount), 0)
  const netBalance = totalIncome - totalExpenses

  const monthly = useMemo(() => {
    const buckets: Record<string, { month: string; income: number; expenses: number }> = {}
    successful.forEach((t) => {
      const key = t.created_at.slice(0, 7)
      if (!buckets[key]) buckets[key] = { month: monthLabel(t.created_at), income: 0, expenses: 0 }
      if (t.type === 'credit') buckets[key].income += Number(t.amount)
      else buckets[key].expenses += Number(t.amount)
    })
    return Object.entries(buckets)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([, v]) => v)
  }, [transactions])

  const filtered = all.filter((t) => {
    if (filterType !== 'all' && t.type !== filterType) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        t.category?.toLowerCase().includes(q) ||
        t.type.toLowerCase().includes(q) ||
        t.status.toLowerCase().includes(q)
      )
    }
    return true
  })

  const isFiltered = filterType !== 'all' || search.length > 0

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-950">Transactions</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Your financial activity</p>
        </div>
        <div className="flex items-center gap-2">
          {/* View dropdown */}
          <div className="relative">
            <select
              value={pageTab}
              onChange={(e) => setPageTab(e.target.value as 'activity' | 'overview')}
              className="appearance-none bg-white border border-trace-border rounded-xl pl-4 pr-8 py-2 text-sm font-semibold text-slate-800 cursor-pointer focus:outline-none focus:ring-2 focus:ring-trace-accent/30"
            >
              <option value="activity">Activity</option>
              <option value="overview">Overview</option>
            </select>
            <ChevronDown
              size={14}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
          </div>
          <button
            className="h-9 w-9 flex items-center justify-center rounded-xl bg-slate-950 text-white hover:bg-slate-800 transition active:scale-95"
            title="Export"
          >
            <Download size={15} />
          </button>
        </div>
      </div>

      {/* ── Activity tab ────────────────────────────────────────── */}
      {pageTab === 'activity' && (
        <div className="space-y-4">
          {/* Type filter + search */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex gap-1 bg-white border border-trace-border rounded-xl p-1 w-fit">
              {TYPE_TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilterType(tab.key)}
                  className={cn(
                    'px-4 py-1.5 rounded-lg text-sm font-semibold transition-all',
                    filterType === tab.key
                      ? 'bg-trace-accent text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-900',
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="relative flex-1 max-w-sm">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search transactions…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-white rounded-xl border-trace-border"
              />
            </div>
          </div>

          {/* List */}
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <RowSkeleton key={i} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <Empty filtered={isFiltered} />
          ) : (
            <div className="space-y-2">
              {filtered.map((tx) => (
                <TransactionRow key={tx.id} tx={tx} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Overview tab ────────────────────────────────────────── */}
      {pageTab === 'overview' && (
        isLoading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-white rounded-2xl border border-trace-border" />
            ))}
            <div className="h-60 bg-white rounded-2xl border border-trace-border" />
          </div>
        ) : (
          <OverviewTab
            totalIncome={totalIncome}
            totalExpenses={totalExpenses}
            netBalance={netBalance}
            creditCount={all.filter((t) => t.type === 'credit').length}
            debitCount={all.filter((t) => t.type === 'debit').length}
            totalCount={all.length}
            monthly={monthly}
          />
        )
      )}
    </div>
  )
}
