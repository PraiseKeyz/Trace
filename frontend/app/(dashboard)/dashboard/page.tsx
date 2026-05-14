'use client'

import Link from 'next/link'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Button } from '@/components/ui/button'
import { ArrowRight, Loader2 } from 'lucide-react'
import { useCurrentUser } from '@/lib/api/hooks/use-current-user'
import { useEconomicProfile } from '@/lib/api/hooks/use-economic-profile'
import { useTransactions } from '@/lib/api/hooks/use-transactions'

const RISK_TIER_LABEL: Record<string, string> = {
  very_low: 'Elite',
  low: 'Professional',
  medium: 'Standard',
  high: 'Starter',
}

const SCORE_BREAKDOWN_LABELS = [
  { key: 'transaction_score', label: 'Transaction History', color: 'bg-trace-primary' },
  { key: 'vouch_score',       label: 'Community Vouching', color: 'bg-trace-accent' },
  { key: 'activity_score',    label: 'Platform Activity',  color: 'bg-green-600' },
  { key: 'profile_completeness', label: 'Profile Completeness', color: 'bg-trace-accent' },
] as const

function ScoreSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-36 bg-trace-primary/20 rounded-xl" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 bg-gray-100 rounded-lg" />
        ))}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { data: user } = useCurrentUser()
  const { data: profile, isLoading: profileLoading } = useEconomicProfile()
  const { data: transactions, isLoading: txLoading } = useTransactions()

  const firstName = user?.full_name?.split(' ')[0] ?? 'there'
  const score = profile?.identity_score ?? 0
  const tier = RISK_TIER_LABEL[profile?.risk_tier ?? 'high'] ?? 'Starter'
  const maxScore = 1000
  const scorePct = Math.round((score / maxScore) * 100)

  // Build a simple 5-point score trend from identity_score (real trend needs historical data)
  const scoreTrend = profile
    ? [
        { month: 'Base',  score: Math.max(0, score - 120) },
        { month: '',      score: Math.max(0, score - 90) },
        { month: '',      score: Math.max(0, score - 55) },
        { month: '',      score: Math.max(0, score - 20) },
        { month: 'Now',   score },
      ]
    : []

  const recentTx = (transactions ?? []).slice(0, 3)
  const totalIncome = (transactions ?? [])
    .filter((t) => t.status === 'successful' && t.type !== 'debit')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  if (profileLoading) return <ScoreSkeleton />

  return (
    <div className="space-y-6">
      {/* Score Banner */}
      <div className="bg-gradient-to-r from-trace-primary to-trace-primary/80 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between gap-8">
          <div className="flex-1">
            <p className="text-white/80 text-xs font-medium uppercase tracking-wider mb-1">
              Economic Identity Score
            </p>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-4xl font-bold">{score.toLocaleString()}</span>
              <span className="text-white/60 text-sm">/ {maxScore.toLocaleString()}</span>
            </div>
            <p className="text-white/90 text-sm mb-4">
              {tier} Tier · Hello, {firstName}
            </p>
            <div className="max-w-xs">
              <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden mb-2">
                <div
                  className="bg-trace-accent h-full shadow-[0_0_8px_rgba(244,168,38,0.5)] transition-all duration-700"
                  style={{ width: `${scorePct}%` }}
                />
              </div>
              <p className="text-[10px] text-white/70">{scorePct}% of maximum score</p>
            </div>
          </div>
          <div className="hidden sm:block">
            <Link href="/dashboard/finance-gateway">
              <button className="px-5 py-2 bg-white text-trace-primary rounded-lg text-sm font-bold shadow-lg hover:bg-slate-50 transition-all active:scale-95">
                Finance Gateway →
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            icon: '💳',
            label: 'Total Transactions',
            value: (transactions ?? []).length.toString(),
            color: 'bg-trace-primary/10',
          },
          {
            icon: '💰',
            label: 'Total Income',
            value: `₦${(totalIncome / 1000).toFixed(0)}K`,
            color: 'bg-trace-accent/10',
          },
          {
            icon: '⭐',
            label: 'Vouches Received',
            value: profile?.vouch_count?.toString() ?? '0',
            color: 'bg-green-100',
          },
          {
            icon: '🏦',
            label: 'Max Loan Eligible',
            value: profile?.is_finance_eligible
              ? `₦${((profile.max_recommended_loan ?? 0) / 1000).toFixed(0)}K`
              : 'Not yet',
            color: 'bg-trace-primary/10',
          },
        ].map((stat) => (
          <div key={stat.label} className={`${stat.color} rounded-lg p-6`}>
            <p className="text-3xl mb-2">{stat.icon}</p>
            <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Score Trend */}
          <div className="bg-white rounded-lg p-6 border border-trace-border">
            <h3 className="text-lg font-bold text-foreground mb-6">Score Trend</h3>
            {scoreTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={scoreTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8E4DC" />
                  <XAxis dataKey="month" stroke="#999" />
                  <YAxis stroke="#999" domain={[0, maxScore]} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#1B4332"
                    strokeWidth={3}
                    dot={{ fill: '#1B4332', r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-sm">No score history yet.</p>
            )}
          </div>

          {/* Score Breakdown */}
          <div className="bg-white rounded-lg p-6 border border-trace-border">
            <h3 className="text-lg font-bold text-foreground mb-6">What Builds Your Score</h3>
            <div className="space-y-5">
              {SCORE_BREAKDOWN_LABELS.map(({ key, label, color }) => {
                const raw = profile ? Number(profile[key]) : 0
                const pct = Math.round(Math.min(raw, 100))
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-foreground">{label}</span>
                      <span className="text-sm font-bold text-trace-primary">{pct}%</span>
                    </div>
                    <div className="h-3 bg-trace-surface rounded-full overflow-hidden">
                      <div
                        className={`${color} h-full transition-all duration-700`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          {/* Recent Transactions */}
          <div className="bg-white rounded-lg p-6 border border-trace-border">
            <h3 className="text-lg font-bold text-foreground mb-6">Recent Activity</h3>
            {txLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="animate-spin text-trace-primary" size={24} />
              </div>
            ) : recentTx.length === 0 ? (
              <p className="text-sm text-muted-foreground">No transactions yet.</p>
            ) : (
              <div className="space-y-4">
                {recentTx.map((tx) => (
                  <div key={tx.id} className="flex gap-4">
                    <div className="w-10 h-10 bg-trace-primary/10 rounded-lg flex items-center justify-center text-lg flex-shrink-0">
                      {tx.type === 'credit' ? '💰' : '💳'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground text-sm capitalize">
                        {tx.category ?? tx.type}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {tx.currency} {Number(tx.amount).toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(tx.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full h-fit ${
                        tx.status === 'successful'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {tx.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <Link
              href="/dashboard/transactions"
              className="mt-4 inline-flex items-center text-sm font-bold text-trace-primary hover:underline"
            >
              View all <ArrowRight size={14} className="ml-1" />
            </Link>
          </div>

          {/* Next Steps */}
          <div className="bg-white rounded-lg p-6 border border-trace-border space-y-4">
            <h3 className="text-lg font-bold text-foreground">Next Steps</h3>
            <Link href="/dashboard/work-matcher">
              <Button className="w-full bg-trace-primary hover:bg-trace-primary/90 font-bold">
                Find Work <ArrowRight size={18} className="ml-2" />
              </Button>
            </Link>
            <Link href="/dashboard/finance-gateway">
              <Button
                variant="outline"
                className="w-full border-trace-primary text-trace-primary hover:bg-trace-primary/5 font-bold"
              >
                Explore Finance <ArrowRight size={18} className="ml-2" />
              </Button>
            </Link>
          </div>

          {profile?.risk_tier === 'very_low' || profile?.risk_tier === 'low' ? (
            <div className="bg-gradient-to-br from-trace-accent to-trace-accent/70 rounded-lg p-6 text-white">
              <p className="text-3xl mb-3">🏆</p>
              <h4 className="font-bold mb-2">Top Performer</h4>
              <p className="text-sm text-white/80">
                Your score puts you in the top tier. Keep building your identity!
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
