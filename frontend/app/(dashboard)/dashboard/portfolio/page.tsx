'use client'

import { useCurrentUser } from '@/lib/api/hooks/use-current-user'
import { useEconomicProfile } from '@/lib/api/hooks/use-economic-profile'
import { useReceivedVouches } from '@/lib/api/hooks/use-vouches'
import { cn } from '@/lib/utils'
import { MapPin, Briefcase, ShoppingBag, CheckCircle2, XCircle } from 'lucide-react'

// ── Tier config ───────────────────────────────────────────────────────────────

const TIER = {
  very_low: { label: 'Elite Tier',        badge: 'bg-amber-400 text-amber-950' },
  low:      { label: 'Professional Tier', badge: 'bg-blue-500 text-white' },
  medium:   { label: 'Standard Tier',     badge: 'bg-slate-500 text-white' },
  high:     { label: 'Starter Tier',      badge: 'bg-slate-600 text-white' },
} as const

// ── Score ring ────────────────────────────────────────────────────────────────

function ScoreRing({ score }: { score: number }) {
  const r = 68
  const circ = 2 * Math.PI * r
  const filled = (score / 100) * circ
  return (
    <svg width="168" height="168" viewBox="0 0 168 168">
      <circle cx="84" cy="84" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="12" />
      <circle
        cx="84" cy="84" r={r}
        fill="none"
        stroke="#F97316"
        strokeWidth="12"
        strokeDasharray={`${filled} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 84 84)"
        style={{ transition: 'stroke-dasharray 0.8s ease' }}
      />
      <text x="84" y="78" textAnchor="middle" fill="white" fontSize="36" fontWeight="700" fontFamily="inherit">{score}</text>
      <text x="84" y="100" textAnchor="middle" fill="rgba(255,255,255,0.45)" fontSize="13" fontFamily="inherit">out of 100</text>
    </svg>
  )
}

// ── Component bar ─────────────────────────────────────────────────────────────

function ScoreBar({ label, value, max = 100 }: { label: string; value: number; max?: number }) {
  const pct = Math.min((value / max) * 100, 100)
  return (
    <div>
      <div className="flex justify-between mb-1.5">
        <span className="text-sm text-slate-600">{label}</span>
        <span className="text-sm font-semibold text-slate-800">{value.toFixed(1)}</span>
      </div>
      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
        <div
          className="h-full rounded-full bg-trace-accent transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function PortfolioSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="rounded-2xl bg-slate-200 h-64" />
      <div className="grid grid-cols-3 gap-4">
        {[1,2,3].map(i => <div key={i} className="h-24 rounded-2xl bg-slate-200" />)}
      </div>
      <div className="rounded-2xl bg-slate-200 h-48" />
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PortfolioPage() {
  const { data: user, isLoading: userLoading } = useCurrentUser()
  const { data: profile, isLoading: profileLoading } = useEconomicProfile()
  const { data: vouches } = useReceivedVouches()

  if (userLoading || profileLoading) return <PortfolioSkeleton />

  const displayName = user?.full_name ?? user?.phone ?? '—'
  const initials = displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const persona = user?.persona
  const location = [user?.city, user?.state].filter(Boolean).join(', ') || 'Location not set'
  const tier = TIER[profile?.risk_tier ?? 'high']
  const score = profile?.identity_score ?? 0
  const totalVouchWeight = vouches?.reduce((s, v) => s + Number(v.weight), 0) ?? 0

  const scoreComponents = [
    { label: 'Transaction Score',   value: Number(profile?.transaction_score ?? 0) },
    { label: 'Activity Score',      value: Number(profile?.activity_score ?? 0) },
    { label: 'Vouch Score',         value: Number(profile?.vouch_score ?? 0) },
    { label: 'Profile Completeness',value: Number(profile?.profile_completeness ?? 0) },
  ]

  return (
    <div className="space-y-6">
      {/* Identity Card */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-950 to-slate-800 p-8 text-white">
        <div className="flex flex-col md:flex-row md:items-center gap-8">
          {/* Left: avatar + name */}
          <div className="flex items-center gap-5">
            <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl bg-white/10 text-3xl font-black text-white ring-2 ring-white/20">
              {initials}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{displayName}</h2>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {persona && (
                  <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/80">
                    {persona === 'trader'
                      ? <ShoppingBag className="h-3.5 w-3.5" />
                      : <Briefcase className="h-3.5 w-3.5" />}
                    {persona === 'trader' ? 'Trader' : 'Gig Worker'}
                  </span>
                )}
                <span className={cn('rounded-full px-3 py-1 text-xs font-bold', tier.badge)}>
                  {tier.label}
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-2 text-sm text-white/50">
                <MapPin className="h-3.5 w-3.5" />
                {location}
              </div>
            </div>
          </div>

          {/* Right: score ring */}
          <div className="md:ml-auto flex flex-col items-center">
            <ScoreRing score={score} />
            <p className="mt-1 text-xs text-white/50 tracking-wider uppercase">Economic Identity Score</p>
          </div>
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Volume',    value: `₦${Number(profile?.total_transaction_volume ?? 0).toLocaleString()}` },
          { label: 'Transactions',    value: profile?.total_transaction_count ?? 0 },
          { label: 'Vouches',         value: profile?.vouch_count ?? 0 },
          { label: 'Vouch Weight',    value: `${totalVouchWeight.toFixed(1)}x` },
        ].map(s => (
          <div key={s.label} className="rounded-2xl border border-border bg-white px-5 py-4">
            <p className="text-2xl font-bold text-slate-900">{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Score breakdown */}
        <div className="rounded-2xl border border-border bg-white p-6">
          <h3 className="font-semibold text-slate-900 mb-5">Score Breakdown</h3>
          <div className="space-y-4">
            {scoreComponents.map(c => (
              <ScoreBar key={c.label} label={c.label} value={c.value} />
            ))}
          </div>
        </div>

        {/* Skills + eligibility */}
        <div className="space-y-4">
          {/* Skills */}
          <div className="rounded-2xl border border-border bg-white p-6">
            <h3 className="font-semibold text-slate-900 mb-4">
              Skills
              {profile?.trade_category && (
                <span className="ml-2 text-xs font-normal text-slate-400 capitalize">
                  · {profile.trade_category.replace('_', ' ')}
                  {profile.years_active ? ` · ${profile.years_active}yr${profile.years_active !== 1 ? 's' : ''} active` : ''}
                </span>
              )}
            </h3>
            {profile?.skills?.length ? (
              <div className="flex flex-wrap gap-2">
                {profile.skills.map(skill => (
                  <span key={skill} className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400">No skills added yet. Complete onboarding to add skills.</p>
            )}
          </div>

          {/* Finance eligibility */}
          <div className="rounded-2xl border border-border bg-white p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Finance Eligibility</h3>
            <div className="flex items-start gap-3">
              {profile?.is_finance_eligible ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-green-700">Eligible for Finance Products</p>
                    {Number(profile.max_recommended_loan) > 0 && (
                      <p className="text-sm text-slate-500 mt-0.5">
                        Max recommended loan: <span className="font-semibold text-slate-700">₦{Number(profile.max_recommended_loan).toLocaleString()}</span>
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-slate-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-600">Not yet eligible</p>
                    <p className="text-sm text-slate-400 mt-0.5">Build your score to unlock financial products.</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
