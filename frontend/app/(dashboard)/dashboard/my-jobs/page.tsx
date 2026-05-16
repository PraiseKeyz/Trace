'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Plus, ChevronDown, ChevronUp, User, Loader2,
  AlertTriangle, CheckCircle2, MapPin, Wifi, Briefcase, Clock,
  ShieldCheck, X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  useMyPosts,
  useApproveApplicant,
  useConfirmCompletion,
  useRaiseDispute,
  type PostedOpportunity,
} from '@/lib/api/hooks/use-opportunities'
import { useAuth } from '@/context/auth-context'

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(n?: number | null) {
  if (n == null) return null
  return `₦${Number(n).toLocaleString('en-NG')}`
}

function payRange(min?: number | null, max?: number | null) {
  const a = fmt(min)
  const b = fmt(max)
  if (a && b) return `${a} – ${b}`
  if (a) return `From ${a}`
  if (b) return `Up to ${b}`
  return 'Negotiable'
}

const STATUS_CONFIG: Record<string, { label: string; classes: string }> = {
  open:        { label: 'Open',               classes: 'bg-green-50 text-green-700 border-green-200' },
  filled:      { label: 'In Progress',        classes: 'bg-blue-50 text-blue-700 border-blue-200' },
  in_progress: { label: 'In Progress',        classes: 'bg-blue-50 text-blue-700 border-blue-200' },
  worker_done: { label: 'Awaiting Approval',  classes: 'bg-amber-50 text-amber-700 border-amber-200' },
  confirmed:   { label: 'Completed',          classes: 'bg-slate-50 text-slate-600 border-slate-200' },
  disputed:    { label: 'Disputed',           classes: 'bg-red-50 text-red-700 border-red-200' },
  closed:      { label: 'Closed',             classes: 'bg-slate-50 text-slate-500 border-slate-200' },
}

const ACTIVE_STATUSES = ['open', 'filled', 'in_progress', 'worker_done']
const PAST_STATUSES   = ['confirmed', 'disputed', 'closed']

type StatusFilter = 'all' | 'open' | 'active' | 'awaiting' | 'past'

const APP_STATUS: Record<string, { label: string; classes: string }> = {
  pending:  { label: 'Pending',  classes: 'bg-slate-100 text-slate-600' },
  accepted: { label: 'Selected', classes: 'bg-blue-100 text-blue-700' },
  rejected: { label: 'Passed',   classes: 'bg-slate-100 text-slate-400' },
}

function riskTierLabel(tier?: string) {
  const map: Record<string, string> = {
    very_low: 'Elite', low: 'Pro', medium: 'Standard', high: 'Starter',
  }
  return map[tier ?? ''] ?? tier ?? '—'
}

function riskTierColor(tier?: string) {
  if (tier === 'very_low') return 'text-green-600'
  if (tier === 'low') return 'text-blue-600'
  if (tier === 'medium') return 'text-amber-600'
  return 'text-slate-500'
}

// ── Approval Modal ────────────────────────────────────────────────────────────

function ApprovalModal({
  job,
  applicantId,
  applicantName,
  onClose,
}: {
  job: PostedOpportunity
  applicantId: string
  applicantName: string
  onClose: () => void
}) {
  const [amount, setAmount] = useState(
    job.pay_max ? String(Math.round(Number(job.pay_max))) : ''
  )
  const { mutate: approve, isPending } = useApproveApplicant()

  function handleApprove() {
    const num = Number(amount)
    if (!num || num < 1) { toast.error('Enter the agreed amount'); return }

    approve(
      { opportunityId: job.id, applicantId, agreed_amount: num },
      {
        onSuccess: (res) => {
          toast.success('Worker approved! Funds locked in escrow.')
          if ((res as any)?.checkout_url) {
            window.open((res as any).checkout_url, '_blank')
          }
          onClose()
        },
        onError: () => {},
      },
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-trace-border">
          <div>
            <h3 className="font-bold text-slate-950">Approve Worker</h3>
            <p className="text-xs text-slate-500 mt-0.5">You're hiring <span className="font-semibold text-slate-700">{applicantName}</span></p>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={onClose}>
            <X size={18} className="text-slate-400" />
          </Button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Agreed amount */}
          <div>
            <label className="text-sm font-bold text-slate-950 block mb-2">
              Agreed amount (₦) <span className="text-red-500">*</span>
            </label>
            {(job.pay_min || job.pay_max) && (
              <p className="text-xs text-slate-400 mb-2">
                Job range: {payRange(job.pay_min != null ? Number(job.pay_min) : undefined, job.pay_max != null ? Number(job.pay_max) : undefined)}
              </p>
            )}
            <input
              type="number"
              min={1}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 5000"
              className="w-full border border-trace-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-trace-accent/30 bg-trace-surface font-semibold"
            />
          </div>

          {/* Disclaimer */}
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 space-y-2">
            <div className="flex items-center gap-2">
              <AlertTriangle size={15} className="text-amber-600 flex-shrink-0" />
              <p className="text-xs font-bold text-amber-800">Escrow Agreement</p>
            </div>
            <ul className="space-y-1.5 text-xs text-amber-700 leading-relaxed pl-1">
              <li>• The agreed amount will be deducted from your Trace wallet when you approve.</li>
              <li>• Funds are held safely in escrow until the job is completed.</li>
              <li>• Once the worker marks the job as done, you have <strong>7 days</strong> to confirm or raise a dispute.</li>
              <li>• If you take no action within 7 days, <strong>the money is automatically released</strong> to the worker.</li>
              <li>• Disputes are reviewed by our team within 48 hours.</li>
            </ul>
          </div>
        </div>

        <div className="flex gap-3 px-6 pb-6">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleApprove}
            disabled={isPending || !amount}
            className="flex-1"
          >
            {isPending ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
            {isPending ? 'Locking funds…' : 'Approve & Lock Funds'}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ── Job Card ──────────────────────────────────────────────────────────────────

function JobCard({ job }: { job: PostedOpportunity }) {
  const [expanded, setExpanded] = useState(false)
  const [approving, setApproving] = useState<{ id: string; name: string } | null>(null)

  const { mutate: confirm, isPending: confirming } = useConfirmCompletion()
  const { mutate: dispute, isPending: disputing } = useRaiseDispute()

  const status = STATUS_CONFIG[job.status] ?? { label: job.status, classes: 'bg-slate-100 text-slate-600 border-slate-200' }
  const pendingApplicants = job.applications.filter(a => a.status === 'pending')
  const selectedApplicant = job.applications.find(a => a.status === 'accepted')

  function handleConfirm() {
    confirm(job.id, {
      onSuccess: () => toast.success('Payment released to the worker!'),
      onError: () => toast.error('Failed to confirm. Try again.'),
    })
  }

  function handleDispute() {
    dispute(job.id, {
      onSuccess: () => toast.success('Dispute raised. Our team will review within 48 hours.'),
      onError: () => toast.error('Failed to raise dispute. Try again.'),
    })
  }

  return (
    <>
      <div className="bg-white rounded-2xl border border-trace-border overflow-hidden">
        {/* Job header */}
        <div className="p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-slate-950 leading-tight line-clamp-2">{job.title}</h3>
              <div className="flex items-center gap-2 mt-1.5">
                <span className={cn('text-xs font-semibold px-2.5 py-0.5 rounded-full border', status.classes)}>
                  {status.label}
                </span>
                <span className="text-xs text-slate-400 capitalize">{job.type.replace('_', '-')}</span>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-sm font-bold text-slate-900">
                {payRange(job.pay_min != null ? Number(job.pay_min) : undefined, job.pay_max != null ? Number(job.pay_max) : undefined)}
              </p>
              {job.escrow_amount && (
                <p className="text-xs text-blue-600 font-semibold">
                  ₦{Number(job.escrow_amount).toLocaleString()} locked
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400">
            {job.is_remote ? (
              <span className="flex items-center gap-1"><Wifi size={12} />Remote</span>
            ) : (
              <span className="flex items-center gap-1">
                <MapPin size={12} />{[job.city, job.state].filter(Boolean).join(', ') || 'Location TBD'}
              </span>
            )}
            <span>·</span>
            <span>{job.applications.length} applicant{job.applications.length !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* Worker done actions */}
        {job.status === 'worker_done' && (
          <div className="px-5 pb-4 space-y-3">
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 flex items-start gap-2">
              <Clock size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-amber-800">Worker marked job as done</p>
                {job.auto_release_at && (
                  <p className="text-xs text-amber-700 mt-0.5">
                    Auto-release on {new Date(job.auto_release_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="danger"
                onClick={handleDispute}
                disabled={disputing || confirming}
                className="flex-1"
              >
                {disputing ? <Loader2 size={14} className="animate-spin" /> : null}
                {disputing ? '' : 'Raise Dispute'}
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={confirming || disputing}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {confirming ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                {confirming ? 'Releasing…' : 'Confirm & Release'}
              </Button>
            </div>
          </div>
        )}

        {/* Completed/disputed status */}
        {job.status === 'confirmed' && (
          <div className="mx-5 mb-4 rounded-xl bg-green-50 border border-green-200 px-4 py-3 flex items-center gap-2 text-xs text-green-700 font-semibold">
            <CheckCircle2 size={14} />
            Payment released — job complete
          </div>
        )}

        {job.status === 'disputed' && (
          <div className="mx-5 mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 flex items-center gap-2 text-xs text-red-700 font-semibold">
            <AlertTriangle size={14} />
            Dispute under review — funds frozen
          </div>
        )}

        {/* Expand applicants */}
        {job.applications.length > 0 && job.status !== 'confirmed' && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-between px-5 py-3 border-t border-trace-border text-sm font-semibold text-slate-600 hover:bg-trace-surface/50 transition-colors"
          >
            <span>
              {job.status === 'open'
                ? `${pendingApplicants.length} pending applicant${pendingApplicants.length !== 1 ? 's' : ''}`
                : selectedApplicant
                  ? `Worker: ${selectedApplicant.applicant.full_name ?? 'Unknown'}`
                  : 'Applicants'}
            </span>
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        )}

        {/* Applicants list */}
        {expanded && (
          <div className="border-t border-trace-border divide-y divide-trace-border/60">
            {job.applications.length === 0 ? (
              <p className="text-center text-sm text-slate-400 py-6">No applicants yet</p>
            ) : (
              job.applications.map((app) => {
                const appStatus = APP_STATUS[app.status] ?? { label: app.status, classes: 'bg-slate-100 text-slate-600' }
                const profile = app.applicant.economic_profile
                const tier = profile?.risk_tier

                return (
                  <div key={app.id} className="flex items-center gap-3 px-5 py-4">
                    <div className="h-9 w-9 rounded-full bg-trace-surface border border-trace-border flex items-center justify-center flex-shrink-0">
                      <User size={16} className="text-slate-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {app.applicant.full_name ?? 'Anonymous'}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {profile && (
                          <span className={cn('text-xs font-bold', riskTierColor(tier))}>
                            {riskTierLabel(tier)} · Score {profile.identity_score}
                          </span>
                        )}
                        {app.applicant.city && (
                          <span className="text-xs text-slate-400">{app.applicant.city}</span>
                        )}
                      </div>
                      {profile?.skills && profile.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {profile.skills.slice(0, 3).map((s: string) => (
                            <span key={s} className="text-[10px] bg-trace-surface border border-trace-border rounded-full px-2 py-0.5 text-slate-600">
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full', appStatus.classes)}>
                        {appStatus.label}
                      </span>
                      {app.status === 'pending' && job.status === 'open' && (
                        <Button
                          variant="link"
                          size="sm"
                          className="h-auto p-0 text-xs"
                          onClick={() => setApproving({ id: app.applicant.id, name: app.applicant.full_name ?? 'this worker' })}
                        >
                          Approve
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>

      {approving && (
        <ApprovalModal
          job={job}
          applicantId={approving.id}
          applicantName={approving.name}
          onClose={() => setApproving(null)}
        />
      )}
    </>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

const FILTER_OPTIONS: { key: StatusFilter; label: string }[] = [
  { key: 'all',     label: 'All' },
  { key: 'open',    label: 'Open' },
  { key: 'active',  label: 'In Progress' },
  { key: 'awaiting', label: 'Awaiting' },
  { key: 'past',    label: 'Completed' },
]

function FilterDropdown({
  options,
  value,
  counts,
  onChange,
}: {
  options: { key: StatusFilter; label: string }[]
  value: StatusFilter
  counts: Record<StatusFilter, number>
  onChange: (v: StatusFilter) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selected = options.find(o => o.key === value)!

  return (
    <div ref={ref} className="relative w-full">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-2 rounded-xl border border-trace-accent bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-trace-accent/20"
      >
        <span>
          {selected.label}
          {counts[value] > 0 && (
            <span className="ml-1.5 text-xs font-bold text-trace-accent">({counts[value]})</span>
          )}
        </span>
        <ChevronDown size={15} className={cn('text-trace-accent transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute z-20 mt-1.5 w-full rounded-xl border border-trace-accent/30 bg-white shadow-lg overflow-hidden">
          {options.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => { onChange(key); setOpen(false) }}
              className={cn(
                'w-full flex items-center justify-between px-4 py-2.5 text-sm font-semibold transition-colors',
                key === value
                  ? 'bg-trace-accent text-white'
                  : 'text-slate-700 hover:bg-trace-accent/10 hover:text-trace-accent'
              )}
            >
              {label}
              {counts[key] > 0 && (
                <span className={cn(
                  'text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center',
                  key === value ? 'bg-white/20 text-white' : 'bg-trace-accent/10 text-trace-accent'
                )}>
                  {counts[key]}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function MyJobsPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [filter, setFilter] = useState<StatusFilter>('all')

  useEffect(() => {
    if (authLoading) return
    if (user && user.persona !== 'trader') router.replace('/dashboard')
  }, [user, authLoading, router])

  const { data: jobs, isLoading } = useMyPosts()

  if (authLoading || !user || user.persona !== 'trader') return null

  const allJobs = jobs ?? []
  const visibleJobs = allJobs.filter(j => {
    if (filter === 'all')     return true
    if (filter === 'open')    return j.status === 'open'
    if (filter === 'active')  return ['filled', 'in_progress'].includes(j.status)
    if (filter === 'awaiting') return j.status === 'worker_done'
    if (filter === 'past')    return PAST_STATUSES.includes(j.status)
    return true
  })

  const counts: Record<StatusFilter, number> = {
    all:      allJobs.length,
    open:     allJobs.filter(j => j.status === 'open').length,
    active:   allJobs.filter(j => ['filled', 'in_progress'].includes(j.status)).length,
    awaiting: allJobs.filter(j => j.status === 'worker_done').length,
    past:     allJobs.filter(j => PAST_STATUSES.includes(j.status)).length,
  }

  return (
    <div className="space-y-5 pb-4">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-950 to-slate-800 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/[0.04] pointer-events-none" />
        <p className="text-trace-accent text-xs font-bold uppercase tracking-widest mb-2">My Jobs</p>
        <h1 className="text-2xl font-black leading-tight mb-1">Jobs you've posted</h1>
        <p className="text-white/60 text-sm leading-relaxed mb-4">
          Track applicants, approve workers, and release payments.
        </p>
        <Button asChild size="sm">
          <Link href="/dashboard/post-job">
            <Plus size={16} />
            Post a New Job
          </Link>
        </Button>
      </div>

      {/* Filter dropdown */}
      <FilterDropdown
        options={FILTER_OPTIONS}
        value={filter}
        counts={counts}
        onChange={setFilter}
      />

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-trace-border p-5 animate-pulse space-y-3">
              <div className="h-4 w-2/3 rounded bg-slate-200" />
              <div className="h-3 w-1/3 rounded bg-slate-200" />
              <div className="h-8 w-full rounded-xl bg-slate-200" />
            </div>
          ))}
        </div>
      ) : allJobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-trace-border bg-white py-20 text-center">
          <Briefcase className="h-12 w-12 text-slate-300 mb-4" />
          <p className="font-semibold text-slate-500">No jobs posted yet</p>
          <p className="text-sm text-slate-400 mt-1 mb-5">Post your first job and find trusted workers nearby</p>
        </div>
      ) : visibleJobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-trace-border bg-white py-12 text-center">
          <Briefcase className="h-10 w-10 text-slate-300 mb-3" />
          <p className="font-semibold text-slate-500">No jobs in this category</p>
        </div>
      ) : (
        <div className="space-y-3">
          {visibleJobs.map(job => <JobCard key={job.id} job={job} />)}
        </div>
      )}
    </div>
  )
}
