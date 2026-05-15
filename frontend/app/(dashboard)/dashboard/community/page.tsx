'use client'

import { useState } from 'react'
import {
  HandshakeIcon,
  ShieldCheck,
  Loader2,
  Trash2,
  Search,
  UserCheck,
  ChevronRight,
  Briefcase,
  ShoppingBag,
  Star,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  useReceivedVouches,
  useGivenVouches,
  useCreateVouch,
  useRemoveVouch,
  useLookupUser,
  type Vouch,
} from '@/lib/api/hooks/use-vouches'
import { useAuth } from '@/context/auth-context'
import { useEconomicProfile } from '@/lib/api/hooks/use-economic-profile'

// ── Weight badge ──────────────────────────────────────────────────────────────

const WEIGHT_CONFIG = {
  1: { label: 'Basic', className: 'bg-slate-100 text-slate-600' },
  2: { label: 'Trusted', className: 'bg-orange-100 text-orange-700' },
  3: { label: 'Strong', className: 'bg-blue-100 text-blue-700' },
  5: { label: 'Partner', className: 'bg-amber-100 text-amber-700' },
} as const

function WeightBadge({ weight }: { weight: number }) {
  const cfg = WEIGHT_CONFIG[weight as keyof typeof WEIGHT_CONFIG] ?? WEIGHT_CONFIG[1]
  return (
    <div className="flex items-center gap-1">
      <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-bold', cfg.className)}>
        {weight}x · {cfg.label}
      </span>
      {weight >= 5 && <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />}
    </div>
  )
}

function PersonaIcon({ persona }: { persona?: string }) {
  if (persona === 'trader') return <ShoppingBag className="h-4 w-4 text-slate-400" />
  if (persona === 'gig_worker') return <Briefcase className="h-4 w-4 text-slate-400" />
  return null
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ── Received Vouches ──────────────────────────────────────────────────────────

function ReceivedTab() {
  const { data: vouches, isLoading } = useReceivedVouches()
  const { data: profile } = useEconomicProfile()

  const totalWeight = vouches?.reduce((sum, v) => sum + Number(v.weight), 0) ?? 0

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse rounded-2xl border border-border bg-white p-5">
            <div className="flex gap-4">
              <div className="h-10 w-10 rounded-full bg-slate-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 rounded bg-slate-200" />
                <div className="h-3 w-48 rounded bg-slate-200" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!vouches?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
          <ShieldCheck className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="font-semibold text-slate-800 mb-1">No vouches yet</h3>
        <p className="text-sm text-slate-500 max-w-xs">
          When peers in the community vouch for you, they&apos;ll appear here. Build your network and transaction history to receive higher-weight vouches.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Vouches', value: vouches.length },
          { label: 'Weighted Total', value: `${totalWeight.toFixed(1)}x` },
          { label: 'Vouch Score', value: profile?.vouch_score != null ? Number(profile.vouch_score).toFixed(1) : '—' },
        ].map(s => (
          <div key={s.label} className="rounded-2xl border border-border bg-white px-4 py-4 text-center">
            <p className="text-2xl font-bold text-slate-900">{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* List */}
      <div className="space-y-3">
        {vouches.map(v => (
          <VouchCard key={v.id} vouch={v} mode="received" />
        ))}
      </div>
    </div>
  )
}

// ── Given Vouches ─────────────────────────────────────────────────────────────

function GivenTab() {
  const { data: vouches, isLoading } = useGivenVouches()
  const { mutate: removeVouch, isPending } = useRemoveVouch()

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map(i => (
          <div key={i} className="animate-pulse rounded-2xl border border-border bg-white p-5">
            <div className="h-4 w-40 rounded bg-slate-200 mb-2" />
            <div className="h-3 w-56 rounded bg-slate-200" />
          </div>
        ))}
      </div>
    )
  }

  if (!vouches?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
          <HandshakeIcon className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="font-semibold text-slate-800 mb-1">You haven&apos;t vouched for anyone yet</h3>
        <p className="text-sm text-slate-500 max-w-xs">
          Switch to the &ldquo;Vouch Someone&rdquo; tab to support a peer and strengthen their economic identity.
        </p>
      </div>
    )
  }

  const handleRemove = (id: string) => {
    removeVouch(id, {
      onSuccess: () => toast.success('Vouch removed'),
    })
  }

  return (
    <div className="space-y-3">
      {vouches.map(v => (
        <VouchCard
          key={v.id}
          vouch={v}
          mode="given"
          onRemove={() => handleRemove(v.id)}
          removing={isPending}
        />
      ))}
    </div>
  )
}

// ── Vouch Card ────────────────────────────────────────────────────────────────

function VouchCard({
  vouch,
  mode,
  onRemove,
  removing,
}: {
  vouch: Vouch
  mode: 'received' | 'given'
  onRemove?: () => void
  removing?: boolean
}) {
  const person = mode === 'received' ? vouch.voucher : vouch.recipient
  const displayName = person?.full_name ?? person?.phone ?? '—'

  return (
    <div className="rounded-2xl border border-border bg-white p-5">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 font-bold text-sm">
          {displayName.charAt(0).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-900 truncate">{displayName}</span>
            <PersonaIcon persona={person?.persona} />
          </div>
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <WeightBadge weight={Number(vouch.weight)} />
            <span className="text-xs text-slate-400">{formatDate(vouch.created_at)}</span>
          </div>
          {vouch.message && (
            <p className="mt-2 text-sm text-slate-600 italic">&ldquo;{vouch.message}&rdquo;</p>
          )}
        </div>

        {mode === 'given' && onRemove && (
          <button
            onClick={onRemove}
            disabled={removing}
            className="flex-shrink-0 rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}

// ── Vouch Someone ─────────────────────────────────────────────────────────────

function VouchSomeoneTab() {
  const { user } = useAuth()
  const [phone, setPhone] = useState('')
  const [searchPhone, setSearchPhone] = useState('')
  const [message, setMessage] = useState('')
  const [vouched, setVouched] = useState(false)

  const { data: found, isLoading: searching, error: lookupError } = useLookupUser(searchPhone)
  const { mutate: createVouch, isPending } = useCreateVouch()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (phone.trim() === user?.phone) {
      toast.error('You cannot vouch for yourself')
      return
    }
    setVouched(false)
    setSearchPhone(phone.trim())
  }

  const handleVouch = () => {
    if (!found) return
    createVouch(
      { recipient_id: found.id, message: message.trim() || undefined },
      {
        onSuccess: () => {
          toast.success(`You vouched for ${found.full_name ?? 'this user'}`)
          setVouched(true)
          setPhone('')
          setSearchPhone('')
          setMessage('')
        },
      }
    )
  }

  const WEIGHT_EXPLANATION = [
    { range: '0 transactions', weight: '1x', label: 'Basic', className: 'bg-slate-100 text-slate-600' },
    { range: '1–2 transactions', weight: '2x', label: 'Trusted', className: 'bg-orange-100 text-orange-700' },
    { range: '3–5 transactions', weight: '3x', label: 'Strong', className: 'bg-blue-100 text-blue-700' },
    { range: '6+ transactions', weight: '5x', label: 'Partner', className: 'bg-amber-100 text-amber-700' },
  ]

  return (
    <div className="grid gap-8 lg:grid-cols-5">
      {/* Form */}
      <div className="lg:col-span-3 space-y-6">
        <div className="rounded-2xl border border-border bg-white p-6">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Search className="h-5 w-5 text-trace-accent" />
            Find by phone number
          </h3>

          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="tel"
              placeholder="e.g. 08012345678"
              value={phone}
              onChange={e => setPhone(e.target.value.replace(/[^\d+]/g, ''))}
              className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-trace-accent/30"
            />
            <Button type="submit" className="bg-trace-accent hover:bg-trace-accent/90 text-white" disabled={phone.length < 10}>
              {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          </form>

          {/* Result */}
          {searchPhone && !searching && (
            <div className="mt-4">
              {lookupError || !found ? (
                <div className="rounded-xl border border-border bg-slate-50 px-4 py-3 text-sm text-slate-500">
                  No user found with that phone number.
                </div>
              ) : vouched ? (
                <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 font-medium flex items-center gap-2">
                  <UserCheck className="h-4 w-4" />
                  You've vouched for {found.full_name ?? 'this user'}.
                </div>
              ) : (
                <div className="rounded-xl border border-border bg-slate-50 p-4 space-y-4">
                  {/* Found user card */}
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 font-bold text-slate-600 text-sm">
                      {(found.full_name ?? 'U').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{found.full_name ?? 'Unknown'}</p>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <PersonaIcon persona={found.persona} />
                        <span className="capitalize">{found.persona?.replace('_', ' ') ?? 'User'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                      Add a message <span className="font-normal text-slate-400">(optional)</span>
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Why are you vouching for this person?"
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      maxLength={500}
                      className="w-full rounded-xl border border-border px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-trace-accent/30"
                    />
                  </div>

                  <Button
                    onClick={handleVouch}
                    className="w-full bg-trace-accent hover:bg-trace-accent/90 text-white"
                    disabled={isPending}
                  >
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <HandshakeIcon className="h-4 w-4 mr-2" />}
                    {isPending ? 'Vouching…' : `Vouch for ${found.full_name ?? 'this user'}`}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Weight explainer */}
      <div className="lg:col-span-2">
        <div className="rounded-2xl border border-border bg-white p-6">
          <h3 className="font-semibold text-slate-900 mb-1">How vouch weight works</h3>
          <p className="text-xs text-slate-500 mb-5">
            Vouches from people you&apos;ve actually transacted with carry more weight — they signal real trust, not just familiarity.
          </p>
          <div className="space-y-3">
            {WEIGHT_EXPLANATION.map(w => (
              <div key={w.weight} className="flex items-center justify-between gap-2">
                <span className="text-xs text-slate-600">{w.range}</span>
                <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-bold flex-shrink-0', w.className)}>
                  {w.weight} · {w.label}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-slate-400 border-t border-border pt-4">
            Your vouch weight is calculated automatically from successful transactions between you and the recipient.
          </p>
        </div>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

const TABS = [
  { key: 'received', label: 'Vouches Received' },
  { key: 'given',    label: 'Vouches Given' },
  { key: 'vouch',   label: 'Vouch Someone' },
] as const

type Tab = (typeof TABS)[number]['key']

export default function CommunityPage() {
  const [tab, setTab] = useState<Tab>('received')

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">Community</h1>
        <p className="text-slate-500">Vouch for peers you trust and build a network of verified relationships.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-slate-100 p-1 w-fit">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'rounded-lg px-5 py-2 text-sm font-semibold transition-all',
              tab === t.key
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'received' && <ReceivedTab />}
      {tab === 'given'    && <GivenTab />}
      {tab === 'vouch'    && <VouchSomeoneTab />}
    </div>
  )
}
