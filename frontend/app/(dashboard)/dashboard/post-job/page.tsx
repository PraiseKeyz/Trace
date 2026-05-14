'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, Wifi, Briefcase, ChevronRight, X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useCreateOpportunity } from '@/lib/api/hooks/use-opportunities'
import { useCurrentUser } from '@/lib/api/hooks/use-current-user'

const JOB_TYPES = [
  { value: 'gig',       label: 'Quick Gig',   desc: 'One-time task or delivery' },
  { value: 'part_time', label: 'Part-Time',   desc: 'Few hours a day or week' },
  { value: 'full_time', label: 'Full-Time',   desc: 'Daily, ongoing work' },
]

const LOCATION_TYPES = [
  { value: 'onsite',  label: 'Onsite',  icon: MapPin },
  { value: 'remote',  label: 'Remote',  icon: Wifi },
  { value: 'both',    label: 'Both OK', icon: Briefcase },
]

export default function PostJobPage() {
  const router = useRouter()
  const { data: user } = useCurrentUser()
  const { mutate: createJob, isPending } = useCreateOpportunity()

  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'gig',
    location_type: 'onsite',
    city: user?.city ?? '',
    state: user?.state ?? '',
    pay_min: '',
    pay_max: '',
    skill_input: '',
    skills_required: [] as string[],
  })

  const set = (key: keyof typeof form, val: string | string[]) =>
    setForm((f) => ({ ...f, [key]: val }))

  function addSkill() {
    const s = form.skill_input.trim()
    if (!s || form.skills_required.includes(s)) return
    set('skills_required', [...form.skills_required, s])
    set('skill_input', '')
  }

  function removeSkill(skill: string) {
    set('skills_required', form.skills_required.filter((s) => s !== skill))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) { toast.error('Give your job a title'); return }

    const payMin = form.pay_min ? Number(form.pay_min) : undefined
    const payMax = form.pay_max ? Number(form.pay_max) : undefined
    if (payMin && payMax && payMax < payMin) {
      toast.error('Max pay cannot be less than minimum pay')
      return
    }

    createJob(
      {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        type: form.type,
        is_remote: form.location_type === 'remote' || form.location_type === 'both',
        city: form.city.trim() || undefined,
        state: form.state.trim() || undefined,
        skills_required: form.skills_required,
        pay_min: payMin,
        pay_max: payMax,
      },
      {
        onSuccess: () => {
          toast.success('Job posted! Workers in your area will see it.')
          router.push('/dashboard/my-jobs')
        },
        onError: () => toast.error('Failed to post job. Try again.'),
      },
    )
  }

  return (
    <div className="space-y-6 pb-4">
      {/* Hero header */}
      <div className="bg-gradient-to-br from-slate-950 to-slate-800 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/[0.04] pointer-events-none" />
        <p className="text-trace-accent text-xs font-bold uppercase tracking-widest mb-2">
          Post a Job
        </p>
        <h1 className="text-2xl font-black leading-tight mb-1">
          Need someone today?
        </h1>
        <p className="text-white/60 text-sm leading-relaxed">
          Post in minutes and connect with trusted workers right in your area —
          delivery riders, handymen, shop assistants and more.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title */}
        <div className="bg-white rounded-2xl border border-trace-border p-5 space-y-3">
          <label className="block text-sm font-bold text-slate-950">
            What do you need done? <span className="text-red-500">*</span>
          </label>
          <input
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            placeholder='e.g. "Shop assistant for today", "Delivery to Ikeja"'
            className="w-full border border-trace-border rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-trace-accent/30 bg-trace-surface"
          />
          <textarea
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            placeholder="Add more details — hours, tools needed, what to expect..."
            rows={3}
            className="w-full border border-trace-border rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-trace-accent/30 bg-trace-surface resize-none"
          />
        </div>

        {/* Job type */}
        <div className="bg-white rounded-2xl border border-trace-border p-5 space-y-3">
          <label className="block text-sm font-bold text-slate-950">Type of work</label>
          <div className="grid grid-cols-3 gap-2">
            {JOB_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => set('type', t.value)}
                className={cn(
                  'flex flex-col items-center gap-1 py-3 px-2 rounded-xl border text-center transition-all',
                  form.type === t.value
                    ? 'border-trace-accent bg-trace-accent/5 text-trace-accent'
                    : 'border-trace-border text-slate-600 hover:border-slate-300',
                )}
              >
                <span className="text-xs font-bold">{t.label}</span>
                <span className="text-[10px] text-current opacity-60 leading-tight">{t.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Location */}
        <div className="bg-white rounded-2xl border border-trace-border p-5 space-y-3">
          <label className="block text-sm font-bold text-slate-950">Where is the work?</label>
          <div className="flex gap-2">
            {LOCATION_TYPES.map((l) => (
              <button
                key={l.value}
                type="button"
                onClick={() => set('location_type', l.value)}
                className={cn(
                  'flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl border text-xs font-semibold transition-all',
                  form.location_type === l.value
                    ? 'border-trace-accent bg-trace-accent/5 text-trace-accent'
                    : 'border-trace-border text-slate-600 hover:border-slate-300',
                )}
              >
                <l.icon size={16} />
                {l.label}
              </button>
            ))}
          </div>

          {form.location_type !== 'remote' && (
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">City</label>
                <input
                  value={form.city}
                  onChange={(e) => set('city', e.target.value)}
                  placeholder="e.g. Yaba"
                  className="w-full border border-trace-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-trace-accent/30 bg-trace-surface"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">State</label>
                <input
                  value={form.state}
                  onChange={(e) => set('state', e.target.value)}
                  placeholder="e.g. Lagos"
                  className="w-full border border-trace-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-trace-accent/30 bg-trace-surface"
                />
              </div>
            </div>
          )}
        </div>

        {/* Pay */}
        <div className="bg-white rounded-2xl border border-trace-border p-5 space-y-3">
          <label className="block text-sm font-bold text-slate-950">
            Pay range <span className="text-xs font-normal text-muted-foreground">(optional)</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Minimum (₦)</label>
              <input
                type="number"
                min={0}
                value={form.pay_min}
                onChange={(e) => set('pay_min', e.target.value)}
                placeholder="e.g. 3000"
                className="w-full border border-trace-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-trace-accent/30 bg-trace-surface"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Maximum (₦)</label>
              <input
                type="number"
                min={0}
                value={form.pay_max}
                onChange={(e) => set('pay_max', e.target.value)}
                placeholder="e.g. 5000"
                className="w-full border border-trace-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-trace-accent/30 bg-trace-surface"
              />
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Leave blank if pay is negotiable. You'll agree the exact amount when you approve a worker.
          </p>
        </div>

        {/* Skills */}
        <div className="bg-white rounded-2xl border border-trace-border p-5 space-y-3">
          <label className="block text-sm font-bold text-slate-950">
            Skills needed <span className="text-xs font-normal text-muted-foreground">(optional)</span>
          </label>
          <div className="flex gap-2">
            <input
              value={form.skill_input}
              onChange={(e) => set('skill_input', e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill() } }}
              placeholder="e.g. driving, tailoring, cooking..."
              className="flex-1 border border-trace-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-trace-accent/30 bg-trace-surface"
            />
            <button
              type="button"
              onClick={addSkill}
              className="px-4 py-2.5 bg-slate-950 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition"
            >
              Add
            </button>
          </div>
          {form.skills_required.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {form.skills_required.map((s) => (
                <span
                  key={s}
                  className="flex items-center gap-1.5 bg-trace-accent/10 text-trace-accent text-xs font-semibold px-3 py-1.5 rounded-full"
                >
                  {s}
                  <button type="button" onClick={() => removeSkill(s)}>
                    <X size={11} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isPending || !form.title.trim()}
          className="w-full flex items-center justify-center gap-2 bg-trace-accent hover:bg-trace-accent/90 disabled:opacity-50 text-white font-bold py-4 rounded-2xl text-sm transition-all active:scale-[0.98]"
        >
          {isPending ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <>Post Job <ChevronRight size={18} /></>
          )}
        </button>
      </form>
    </div>
  )
}
