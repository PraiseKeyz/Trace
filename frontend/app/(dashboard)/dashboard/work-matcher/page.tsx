'use client'

import { useState, useMemo } from 'react'
import {
  Briefcase, MapPin, Wifi, WifiOff, Search, X, Loader2, CheckCircle2,
  Sparkles, ChevronLeft, ChevronRight, ClipboardList, Clock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  useOpportunities,
  useOpportunityMatches,
  useApplyOpportunity,
  useMyApplications,
  useMarkDone,
  type Opportunity,
  type MatchedOpportunity,
  type MyApplication,
} from '@/lib/api/hooks/use-opportunities'
import { useEconomicProfile } from '@/lib/api/hooks/use-economic-profile'

const PAGE_LIMIT = 20

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(n?: number | null) {
  if (n == null) return null
  return n >= 1000 ? `₦${(n / 1000).toFixed(0)}K` : `₦${n}`
}

function payRange(opp: Opportunity) {
  const min = fmt(opp.pay_min)
  const max = fmt(opp.pay_max)
  if (min && max) return `${min} – ${max}`
  if (min) return `From ${min}`
  if (max) return `Up to ${max}`
  return 'Pay negotiable'
}

function locationStr(opp: Opportunity) {
  if (opp.is_remote) return 'Remote'
  return [opp.city, opp.state].filter(Boolean).join(', ') || 'Location not specified'
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function OpportunitySkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-white p-5 animate-pulse">
      <div className="h-4 w-2/3 rounded bg-slate-200 mb-3" />
      <div className="h-3 w-1/2 rounded bg-slate-200 mb-4" />
      <div className="flex gap-2 mb-4">
        <div className="h-5 w-16 rounded-full bg-slate-200" />
        <div className="h-5 w-20 rounded-full bg-slate-200" />
      </div>
      <div className="h-8 w-full rounded-lg bg-slate-200" />
    </div>
  )
}

// ── Match score badge ─────────────────────────────────────────────────────────

function MatchBadge({ score }: { score: number }) {
  const pct = Math.round(score * 100)
  const color =
    pct >= 80 ? 'bg-green-50 text-green-700 border-green-200' :
    pct >= 60 ? 'bg-amber-50 text-amber-700 border-amber-200' :
                'bg-slate-50 text-slate-600 border-slate-200'
  return (
    <span className={cn('rounded-full border px-2.5 py-1 text-xs font-bold', color)}>
      {pct}% match
    </span>
  )
}

// ── Opportunity Card ──────────────────────────────────────────────────────────

function OpportunityCard({
  opp, applied, onApply, onSelect, matchScore,
}: {
  opp: Opportunity
  applied: boolean
  onApply: () => void
  onSelect: () => void
  matchScore?: number
}) {
  return (
    <div className="rounded-2xl border border-border bg-white p-5 flex flex-col gap-4 hover:border-slate-300 transition-colors">
      <div>
        <div className="flex items-start justify-between gap-2 mb-0.5">
          <button onClick={onSelect} className="text-left flex-1">
            <h3 className="font-semibold text-slate-900 hover:text-trace-accent transition-colors line-clamp-2">
              {opp.title}
            </h3>
          </button>
          {matchScore !== undefined && <MatchBadge score={matchScore} />}
        </div>
        {opp.poster.full_name && (
          <p className="text-xs text-slate-400">by {opp.poster.full_name}</p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
          {opp.is_remote ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
          {opp.is_remote ? 'Remote' : 'On-site'}
        </span>
        <span className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-700 capitalize">
          {opp.type}
        </span>
      </div>

      <div className="space-y-1 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
          {locationStr(opp)}
        </div>
        <div className="flex items-center gap-1.5 font-semibold text-slate-700">
          {payRange(opp)}
        </div>
      </div>

      {opp.skills_required.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {opp.skills_required.slice(0, 3).map(s => (
            <span key={s} className="rounded-full bg-slate-50 border border-border px-2 py-0.5 text-xs text-slate-600">
              {s}
            </span>
          ))}
          {opp.skills_required.length > 3 && (
            <span className="text-xs text-slate-400">+{opp.skills_required.length - 3} more</span>
          )}
        </div>
      )}

      {applied ? (
        <div className="flex items-center gap-2 text-green-600 text-sm font-semibold">
          <CheckCircle2 className="h-4 w-4" />
          Applied
        </div>
      ) : (
        <Button onClick={onApply} className="w-full bg-trace-accent hover:bg-trace-accent/90 text-white">
          Apply Now
        </Button>
      )}
    </div>
  )
}

// ── Detail Modal ──────────────────────────────────────────────────────────────

function DetailModal({
  opp, applied, applying, onApply, onClose, matchScore,
}: {
  opp: Opportunity
  applied: boolean
  applying: boolean
  onApply: () => void
  onClose: () => void
  matchScore?: number
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl overflow-hidden">
        <div className="flex items-start justify-between gap-4 p-6 border-b border-border">
          <div className="flex-1">
            <h2 className="text-lg font-bold text-slate-900">{opp.title}</h2>
            {opp.poster.full_name && (
              <p className="text-sm text-slate-500 mt-0.5">Posted by {opp.poster.full_name}</p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {matchScore !== undefined && <MatchBadge score={matchScore} />}
            <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {opp.description && (
            <p className="text-sm text-slate-600 leading-relaxed">{opp.description}</p>
          )}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Type</p>
              <p className="font-medium text-slate-800 capitalize">{opp.type}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Location</p>
              <p className="font-medium text-slate-800">{locationStr(opp)}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Pay Range</p>
              <p className="font-bold text-slate-900">{payRange(opp)}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Mode</p>
              <p className="font-medium text-slate-800">{opp.is_remote ? 'Remote' : 'On-site'}</p>
            </div>
          </div>
          {opp.skills_required.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Skills Required</p>
              <div className="flex flex-wrap gap-2">
                {opp.skills_required.map(s => (
                  <span key={s} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">{s}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 p-6 border-t border-border">
          <Button variant="outline" onClick={onClose} className="flex-1">Close</Button>
          {applied ? (
            <div className="flex-1 flex items-center justify-center gap-2 text-green-600 font-semibold text-sm">
              <CheckCircle2 className="h-4 w-4" /> Applied
            </div>
          ) : (
            <Button
              onClick={onApply}
              disabled={applying}
              className="flex-1 bg-trace-accent hover:bg-trace-accent/90 text-white"
            >
              {applying ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {applying ? 'Applying…' : 'Apply Now'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Pagination controls ───────────────────────────────────────────────────────

function Pagination({
  page,
  totalPages,
  isLoading,
  onChange,
}: {
  page: number
  totalPages: number
  isLoading: boolean
  onChange: (p: number) => void
}) {
  if (totalPages <= 1) return null

  // Build visible page numbers — always show first, last, current ± 1
  const pages: (number | '...')[] = []
  const range = new Set([1, totalPages, page - 1, page, page + 1].filter(p => p >= 1 && p <= totalPages))
  let prev = 0
  for (const p of [...range].sort((a, b) => a - b)) {
    if (p - prev > 1) pages.push('...')
    pages.push(p)
    prev = p
  }

  return (
    <div className="flex items-center justify-center gap-1.5 pt-6">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1 || isLoading}
        className="flex items-center gap-1 rounded-lg border border-border bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        Prev
      </button>

      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`dots-${i}`} className="px-1 text-slate-400 text-sm">…</span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p as number)}
            disabled={isLoading}
            className={cn(
              'h-9 w-9 rounded-lg text-sm font-semibold transition-colors',
              p === page
                ? 'bg-trace-accent text-white'
                : 'border border-border bg-white text-slate-600 hover:bg-slate-50'
            )}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages || isLoading}
        className="flex items-center gap-1 rounded-lg border border-border bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        Next
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  )
}

// ── My Applications Tab ───────────────────────────────────────────────────────

const APP_STATUS_CONFIG: Record<string, { label: string; classes: string }> = {
  pending:  { label: 'Pending',  classes: 'bg-slate-100 text-slate-600' },
  accepted: { label: 'Selected', classes: 'bg-blue-100 text-blue-700' },
  rejected: { label: 'Passed',   classes: 'bg-slate-100 text-slate-400' },
}

const JOB_STATUS_CONFIG: Record<string, { label: string; classes: string }> = {
  open:        { label: 'Open',              classes: 'bg-green-50 text-green-700' },
  filled:      { label: 'In Progress',       classes: 'bg-blue-50 text-blue-700' },
  worker_done: { label: 'Done — Awaiting',   classes: 'bg-amber-50 text-amber-700' },
  confirmed:   { label: 'Completed',         classes: 'bg-slate-50 text-slate-500' },
  disputed:    { label: 'Disputed',          classes: 'bg-red-50 text-red-700' },
}

function fmtAmt(n?: number | null) {
  if (n == null) return null
  return n >= 1000 ? `₦${(n / 1000).toFixed(0)}K` : `₦${n}`
}

function ApplicationCard({ app }: { app: MyApplication }) {
  const { mutate: markDone, isPending: marking } = useMarkDone()
  const jobStatus = JOB_STATUS_CONFIG[app.opportunity.status] ?? { label: app.opportunity.status, classes: 'bg-slate-100 text-slate-600' }
  const appStatus = APP_STATUS_CONFIG[app.status] ?? { label: app.status, classes: 'bg-slate-100 text-slate-600' }

  const canMarkDone = app.status === 'accepted' && app.opportunity.status === 'filled'
  const escrow = app.opportunity.escrow_amount

  function handleMarkDone() {
    markDone(app.opportunity.id, {
      onSuccess: () => toast.success('Job marked as done! The poster has 7 days to confirm payment.'),
      onError: () => toast.error('Failed to mark done. Try again.'),
    })
  }

  return (
    <div className="bg-white rounded-2xl border border-trace-border p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-slate-950 leading-tight line-clamp-2">{app.opportunity.title}</h3>
          {app.opportunity.poster.full_name && (
            <p className="text-xs text-slate-400 mt-0.5">by {app.opportunity.poster.full_name}</p>
          )}
        </div>
        <span className={cn('text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0', appStatus.classes)}>
          {appStatus.label}
        </span>
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        <span className={cn('font-semibold px-2.5 py-1 rounded-full', jobStatus.classes)}>
          {jobStatus.label}
        </span>
        <span className="text-slate-500 capitalize bg-slate-50 px-2.5 py-1 rounded-full">
          {app.opportunity.type.replace('_', '-')}
        </span>
        {(app.opportunity.city || app.opportunity.state) && (
          <span className="flex items-center gap-1 text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full">
            <MapPin size={10} />
            {[app.opportunity.city, app.opportunity.state].filter(Boolean).join(', ')}
          </span>
        )}
      </div>

      {escrow && app.status === 'accepted' && (
        <div className="rounded-xl bg-blue-50 border border-blue-100 px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-blue-700">
            <CheckCircle2 size={13} />
            <span className="font-semibold">Escrow locked for you</span>
          </div>
          <span className="text-sm font-black text-blue-800">₦{Number(escrow).toLocaleString()}</span>
        </div>
      )}

      {app.opportunity.status === 'worker_done' && (
        <div className="rounded-xl bg-amber-50 border border-amber-100 px-4 py-2.5 flex items-center gap-2 text-xs text-amber-700">
          <Clock size={13} />
          <span className="font-semibold">
            Marked done — waiting for poster to confirm
            {app.opportunity.auto_release_at && (
              <span className="font-normal ml-1">
                (auto-release {new Date(app.opportunity.auto_release_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })})
              </span>
            )}
          </span>
        </div>
      )}

      {app.opportunity.status === 'confirmed' && app.status === 'accepted' && (
        <div className="rounded-xl bg-green-50 border border-green-100 px-4 py-2.5 flex items-center gap-2 text-xs text-green-700 font-semibold">
          <CheckCircle2 size={13} />
          Payment confirmed and released
        </div>
      )}

      {canMarkDone && (
        <button
          onClick={handleMarkDone}
          disabled={marking}
          className="w-full py-3 rounded-xl bg-trace-accent hover:bg-trace-accent/90 disabled:opacity-50 text-white text-sm font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2"
        >
          {marking ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
          {marking ? 'Updating…' : 'Mark Job as Done'}
        </button>
      )}

      <p className="text-[10px] text-slate-400">
        Applied {new Date(app.applied_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
      </p>
    </div>
  )
}

function MyApplicationsTab() {
  const { data: applications, isLoading } = useMyApplications()

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map(i => (
          <div key={i} className="bg-white rounded-2xl border border-trace-border p-5 animate-pulse space-y-3">
            <div className="h-4 w-2/3 rounded bg-slate-200" />
            <div className="h-3 w-1/3 rounded bg-slate-200" />
            <div className="h-8 w-full rounded-xl bg-slate-200" />
          </div>
        ))}
      </div>
    )
  }

  if (!applications?.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-trace-border bg-white py-20 text-center">
        <ClipboardList className="h-12 w-12 text-slate-300 mb-4" />
        <p className="font-semibold text-slate-500">No applications yet</p>
        <p className="text-sm text-slate-400 mt-1">Apply to jobs to see them here</p>
      </div>
    )
  }

  const active = applications.filter(a => ['open', 'filled', 'worker_done'].includes(a.opportunity.status) && a.status !== 'rejected')
  const past = applications.filter(a => ['confirmed', 'disputed'].includes(a.opportunity.status) || a.status === 'rejected')

  return (
    <div className="space-y-5">
      {active.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">Active</h3>
          {active.map(app => <ApplicationCard key={app.id} app={app} />)}
        </section>
      )}
      {past.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">Past</h3>
          {past.map(app => <ApplicationCard key={app.id} app={app} />)}
        </section>
      )}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function WorkMatcherPage() {
  const [tab, setTab] = useState<'find' | 'applications'>('find')
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [filterRemote, setFilterRemote] = useState<'all' | 'remote' | 'onsite'>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set())

  const { data: pageData, isLoading, isFetching } = useOpportunities(page, PAGE_LIMIT)
  const { data: aiMatches, isLoading: loadingMatches } = useOpportunityMatches()
  const { data: profile } = useEconomicProfile()
  const { mutate: applyFn, isPending: applying } = useApplyOpportunity()

  const opportunities = pageData?.items ?? []
  const totalPages = pageData?.totalPages ?? 1

  // Build match score lookup
  const matchScoreMap = useMemo<Map<string, MatchedOpportunity>>(() => {
    if (!Array.isArray(aiMatches)) return new Map()
    return new Map(aiMatches.map(m => [m.opportunity_id, m]))
  }, [aiMatches])

  // AI-matched section (only when AI service is up)
  const matchedOpportunities = useMemo(() => {
    if (!Array.isArray(aiMatches) || aiMatches.length === 0) return []
    return aiMatches
      .map(m => {
        const opp = opportunities.find(o => o.id === m.opportunity_id)
        return opp ? { opp, match: m } : null
      })
      .filter((x): x is { opp: Opportunity; match: MatchedOpportunity } => x !== null)
  }, [aiMatches, opportunities])

  const filtered = useMemo(() => {
    return opportunities.filter(opp => {
      const matchSearch = !search ||
        opp.title.toLowerCase().includes(search.toLowerCase()) ||
        (opp.description ?? '').toLowerCase().includes(search.toLowerCase()) ||
        opp.skills_required.some(s => s.toLowerCase().includes(search.toLowerCase()))
      const matchRemote =
        filterRemote === 'all' ||
        (filterRemote === 'remote' && opp.is_remote) ||
        (filterRemote === 'onsite' && !opp.is_remote)
      return matchSearch && matchRemote
    })
  }, [opportunities, search, filterRemote])

  const selectedOpp = opportunities.find(o => o.id === selectedId) ?? null

  const handlePageChange = (p: number) => {
    setPage(p)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleApply = (oppId: string) => {
    applyFn({ opportunity_id: oppId }, {
      onSuccess: () => {
        toast.success('Application submitted!')
        setAppliedIds(s => new Set(s).add(oppId))
        setSelectedId(null)
      },
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-1">Work Matcher</h1>
        <p className="text-slate-400 text-sm">Find jobs matched to your skills and location.</p>
      </div>

      {/* Tab switcher */}
      <div className="flex bg-slate-100 rounded-xl p-1">
        <button
          onClick={() => setTab('find')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all',
            tab === 'find' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700',
          )}
        >
          <Briefcase size={15} />
          Find Work
        </button>
        <button
          onClick={() => setTab('applications')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all',
            tab === 'applications' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700',
          )}
        >
          <ClipboardList size={15} />
          My Applications
        </button>
      </div>

      {tab === 'applications' && <MyApplicationsTab />}

      {tab === 'find' && <>

      {/* Profile hint */}
      {profile && (profile.skills?.length ?? 0) === 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
          Add skills in your profile to get better-matched opportunities.
        </div>
      )}

      {/* ── AI Best Matches ── */}
      {(loadingMatches || matchedOpportunities.length > 0) && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-trace-accent" />
            <h2 className="text-lg font-bold text-slate-900">Best Matches for You</h2>
            <span className="rounded-full bg-trace-accent/10 px-2.5 py-0.5 text-xs font-bold text-trace-accent">AI</span>
          </div>

          {loadingMatches ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map(i => <OpportunitySkeleton key={i} />)}
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {matchedOpportunities.map(({ opp, match }) => (
                <OpportunityCard
                  key={opp.id}
                  opp={opp}
                  applied={appliedIds.has(opp.id)}
                  matchScore={match.match_score}
                  onApply={() => handleApply(opp.id)}
                  onSelect={() => setSelectedId(opp.id)}
                />
              ))}
            </div>
          )}

          <div className="border-t border-border pt-2" />
        </section>
      )}

      {/* ── All Opportunities ── */}
      <section className="space-y-4">
        {matchedOpportunities.length > 0 && (
          <h2 className="text-lg font-bold text-slate-900">All Opportunities</h2>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, skill…"
              value={search}
              onChange={e => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="w-full rounded-xl border border-border bg-white pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-trace-accent/30"
            />
          </div>
          <div className="flex gap-1.5 rounded-xl bg-slate-100 p-1">
            {(['all', 'remote', 'onsite'] as const).map(f => (
              <button
                key={f}
                onClick={() => { setFilterRemote(f); setPage(1) }}
                className={cn(
                  'rounded-lg px-4 py-1.5 text-sm font-medium capitalize transition-all',
                  filterRemote === f
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className={cn('transition-opacity duration-200', isFetching && !isLoading ? 'opacity-60' : 'opacity-100')}>
          {isLoading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: PAGE_LIMIT }).map((_, i) => <OpportunitySkeleton key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-slate-50 py-20 text-center">
              <Briefcase className="h-12 w-12 text-slate-300 mb-4" />
              <p className="font-semibold text-slate-500">No opportunities found</p>
              <p className="text-sm text-slate-400 mt-1">
                {search ? 'Try a different search term' : 'Check back soon for new postings'}
              </p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map(opp => (
                <OpportunityCard
                  key={opp.id}
                  opp={opp}
                  applied={appliedIds.has(opp.id)}
                  matchScore={matchScoreMap.get(opp.id)?.match_score}
                  onApply={() => handleApply(opp.id)}
                  onSelect={() => setSelectedId(opp.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        <Pagination
          page={page}
          totalPages={totalPages}
          isLoading={isFetching}
          onChange={handlePageChange}
        />
      </section>

      {/* Detail modal */}
      {selectedOpp && (
        <DetailModal
          opp={selectedOpp}
          applied={appliedIds.has(selectedOpp.id)}
          applying={applying}
          matchScore={matchScoreMap.get(selectedOpp.id)?.match_score}
          onApply={() => handleApply(selectedOpp.id)}
          onClose={() => setSelectedId(null)}
        />
      )}

      </>}
    </div>
  )
}
