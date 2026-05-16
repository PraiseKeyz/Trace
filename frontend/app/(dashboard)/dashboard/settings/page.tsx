'use client'

import { useState, useRef, KeyboardEvent } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ChevronRight, User, Lock, Bell, Shield, HelpCircle, Loader2, Eye, EyeOff, X, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCurrentUser, currentUserKey } from '@/lib/api/hooks/use-current-user'
import { useEconomicProfile, useUpdateSkills } from '@/lib/api/hooks/use-economic-profile'
import { useAuth } from '@/context/auth-context'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

// ── Profile Tab ───────────────────────────────────────────────────────────────

const LANGUAGES = ['en','fr','ar','pt','yo','ha','ig','pcm','wo','tw','ff','ee','sw','am','om','so','zu','xh','af','sn','st','ln']
const LANGUAGE_LABELS: Record<string, string> = {
  en:'English', fr:'French', ar:'Arabic', pt:'Portuguese', yo:'Yoruba', ha:'Hausa',
  ig:'Igbo', pcm:'Naija (Pidgin)', wo:'Wolof', tw:'Twi / Akan', ff:'Fula', ee:'Ewe',
  sw:'Swahili', am:'Amharic', om:'Oromo', so:'Somali', zu:'Zulu', xh:'Xhosa',
  af:'Afrikaans', sn:'Shona', st:'Sesotho', ln:'Lingala',
}

type Persona = 'trader' | 'gig_worker'

const TRADE_CATEGORIES: Record<Persona, { value: string; label: string }[]> = {
  trader: [
    { value: 'retail',      label: 'Retail & Reselling' },
    { value: 'food',        label: 'Food & Beverage' },
    { value: 'transport',   label: 'Transport & Logistics' },
    { value: 'agriculture', label: 'Agriculture & Farming' },
    { value: 'crafts',      label: 'Crafts & Handmade' },
    { value: 'services',    label: 'Services & Repairs' },
    { value: 'other',       label: 'Other' },
  ],
  gig_worker: [
    { value: 'tech',     label: 'Tech & Digital Services' },
    { value: 'gig',      label: 'Gig & Freelance Work' },
    { value: 'services', label: 'Services & Repairs' },
    { value: 'creative', label: 'Creative & Media' },
    { value: 'other',    label: 'Other' },
  ],
}

const SKILLS_MAP: Record<Persona, Record<string, string[]>> = {
  trader: {
    retail:      ['Customer Service', 'Inventory Management', 'Product Sourcing', 'Negotiation', 'Cash Flow Management', 'Social Media Marketing', 'Digital Payments', 'Supplier Relations'],
    food:        ['Food Preparation', 'Customer Service', 'Inventory Management', 'Cash Flow Management', 'Food Safety', 'Supplier Relations', 'Menu Planning', 'Packaging & Delivery'],
    transport:   ['Driving', 'Route Planning', 'Vehicle Maintenance', 'Dispatch', 'Customer Service', 'Fleet Management', 'Logistics'],
    agriculture: ['Crop Management', 'Livestock Care', 'Irrigation', 'Harvesting', 'Market Research', 'Supply Chain', 'Agro-processing'],
    crafts:      ['Tailoring', 'Weaving', 'Pottery', 'Woodwork', 'Jewelry Making', 'Product Photography', 'Online Selling'],
    services:    ['Customer Service', 'Plumbing', 'Electrical Work', 'Carpentry', 'Cleaning', 'Bookkeeping', 'Technical Repairs'],
    other:       ['Customer Service', 'Bookkeeping', 'Cash Flow Management', 'Social Media Marketing', 'Digital Payments', 'Negotiation'],
  },
  gig_worker: {
    tech:     ['Web Development', 'Mobile Development', 'Graphic Design', 'Video Editing', 'Content Writing', 'Digital Marketing', 'Data Entry', 'Social Media Management', 'UI/UX Design', 'SEO'],
    gig:      ['Customer Support', 'Translation', 'Research', 'Transcription', 'Virtual Assistance', 'Data Entry', 'Content Writing', 'Proofreading'],
    services: ['Plumbing', 'Electrical Work', 'Carpentry', 'Tailoring', 'Photography', 'Cleaning', 'Catering', 'Teaching', 'Hair Styling', 'Auto Repair'],
    creative: ['Photography', 'Videography', 'Graphic Design', 'Music Production', 'Copywriting', 'Animation', 'Content Creation', 'Voice Over'],
    other:    ['Customer Support', 'Teaching', 'Research', 'Data Entry', 'Translation', 'Virtual Assistance'],
  },
}

interface ProfileForm {
  full_name: string
  email: string
  state: string
  city: string
  gender: '1' | '2' | ''
  dob: string
  persona: 'trader' | 'gig_worker' | ''
  languages: string[]
  preferred_language: string
  data_sharing_consent: boolean
}

function ProfileTab() {
  const { data: user, isLoading } = useCurrentUser()
  const { data: profile } = useEconomicProfile()
  const qc = useQueryClient()
  const [editMode, setEditMode] = useState(false)
  const [form, setForm] = useState<ProfileForm>({
    full_name: '', email: '', state: '', city: '',
    gender: '', dob: '', persona: '',
    languages: [], preferred_language: '', data_sharing_consent: false,
  })

  // ── Skills state ─────────────────────────────────────────────────────────
  const [skills, setSkills] = useState<string[]>([])
  const [tradeCategory, setTradeCategory] = useState('')
  const [yearsActive, setYearsActive] = useState('')
  const [skillInput, setSkillInput] = useState('')
  const skillInputRef = useRef<HTMLInputElement>(null)
  const { mutate: saveSkills, isPending: savingSkills } = useUpdateSkills()

  const { mutate: save, isPending: saving } = useMutation({
    mutationFn: (data: Partial<ProfileForm>) => api.patch('/users/me', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: currentUserKey })
      toast.success('Profile updated')
      setEditMode(false)
    },
  })

  const addSkill = () => {
    const val = skillInput.trim()
    if (!val || skills.map(s => s.toLowerCase()).includes(val.toLowerCase())) return
    setSkills(s => [...s, val])
    setSkillInput('')
    skillInputRef.current?.focus()
  }

  const removeSkill = (skill: string) => setSkills(s => s.filter(x => x !== skill))

  const handleSkillKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { e.preventDefault(); addSkill() }
    if (e.key === 'Backspace' && !skillInput && skills.length) {
      setSkills(s => s.slice(0, -1))
    }
  }

  const handleSaveSkills = () => {
    saveSkills(
      {
        skills,
        trade_category: tradeCategory || undefined,
        years_active: yearsActive ? parseInt(yearsActive) : undefined,
      },
      { onSuccess: () => toast.success('Skills updated') },
    )
  }

  const activePersona = ((editMode ? form.persona : user?.persona) || undefined) as Persona | undefined
  const categoryOptions = activePersona ? TRADE_CATEGORIES[activePersona] : [
    ...TRADE_CATEGORIES.trader, ...TRADE_CATEGORIES.gig_worker.filter(c => !TRADE_CATEGORIES.trader.find(t => t.value === c.value)),
  ]
  const skillSuggestions: string[] = editMode && tradeCategory && activePersona
    ? (SKILLS_MAP[activePersona]?.[tradeCategory] ?? []).filter(
        s => !skills.map(x => x.toLowerCase()).includes(s.toLowerCase()),
      )
    : []

  const handleEdit = () => {
    setForm({
      full_name:            user?.full_name ?? '',
      email:                user?.email ?? '',
      state:                user?.state ?? '',
      city:                 user?.city ?? '',
      gender:               (user?.gender as '1' | '2') ?? '',
      dob:                  user?.dob ?? '',
      persona:              user?.persona ?? '',
      languages:            user?.languages ?? [],
      preferred_language:   user?.preferred_language ?? '',
      data_sharing_consent: user?.data_sharing_consent ?? false,
    })
    setSkills(profile?.skills ?? [])
    setTradeCategory(profile?.trade_category ?? '')
    setYearsActive(profile?.years_active?.toString() ?? '')
    setEditMode(true)
  }

  const handleSave = () => {
    const payload: Record<string, unknown> = {}
    if (form.full_name)          payload.full_name          = form.full_name
    if (form.email)              payload.email              = form.email
    if (form.state)              payload.state              = form.state
    if (form.city)               payload.city               = form.city
    if (form.gender)             payload.gender             = form.gender
    if (form.dob)                payload.dob                = form.dob
    if (form.persona)            payload.persona            = form.persona
    if (form.languages.length)   payload.languages          = form.languages
    if (form.preferred_language) payload.preferred_language = form.preferred_language
    payload.data_sharing_consent = form.data_sharing_consent
    save(payload)
  }

  const toggleLang = (code: string) => {
    setForm(f => ({
      ...f,
      languages: f.languages.includes(code)
        ? f.languages.filter(l => l !== code)
        : [...f.languages, code],
    }))
  }

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4 p-8">
        {[1,2,3,4,5,6].map(i => <div key={i} className="h-10 rounded-lg bg-slate-200" />)}
      </div>
    )
  }

  const displayName = user?.full_name ?? user?.phone ?? '—'
  const initials = displayName.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Profile Information</h2>
          <p className="text-sm text-slate-500 mt-0.5">Update your personal details</p>
        </div>
        {!editMode ? (
          <Button variant="outline" onClick={handleEdit}>Edit Profile</Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setEditMode(false)} disabled={saving}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Save Changes
            </Button>
          </div>
        )}
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-4 pb-6 border-b border-border">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-950 text-white text-xl font-bold flex-shrink-0">
          {initials}
        </div>
        <div>
          <p className="font-semibold text-slate-900">{displayName}</p>
          <p className="text-sm text-slate-500">{user?.phone}</p>
          {user?.persona && (
            <span className="mt-1 inline-block rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 capitalize">
              {user.persona.replace('_', ' ')}
            </span>
          )}
        </div>
      </div>

      {/* Basic info */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Basic Info</p>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { key: 'full_name', label: 'Full Name',  type: 'text',  placeholder: 'Your full name' },
            { key: 'email',     label: 'Email',       type: 'email', placeholder: 'you@example.com' },
            { key: 'dob',       label: 'Date of Birth (DD/MM/YYYY)', type: 'text', placeholder: '01/01/1990' },
          ].map(field => (
            <div key={field.key} className={field.key === 'full_name' ? 'sm:col-span-2' : ''}>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">{field.label}</label>
              <Input
                type={field.type}
                disabled={!editMode}
                value={editMode ? (form[field.key as keyof ProfileForm] as string) : ((user?.[field.key as keyof typeof user] as string) ?? '')}
                onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                placeholder={field.placeholder}
                className={cn('bg-slate-50', !editMode && 'opacity-70')}
              />
            </div>
          ))}

          {/* Gender */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Gender</label>
            {editMode ? (
              <select
                value={form.gender}
                onChange={e => setForm(f => ({ ...f, gender: e.target.value as '1' | '2' | '' }))}
                className="w-full h-10 px-3 bg-slate-50 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-trace-accent/30"
              >
                <option value="">Select gender</option>
                <option value="1">Male</option>
                <option value="2">Female</option>
              </select>
            ) : (
              <Input
                disabled
                value={user?.gender === '1' ? 'Male' : user?.gender === '2' ? 'Female' : ''}
                placeholder="Not set"
                className="bg-slate-50 opacity-70"
              />
            )}
          </div>

          {/* Persona */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Work Type</label>
            {editMode ? (
              <select
                value={form.persona}
                onChange={e => setForm(f => ({ ...f, persona: e.target.value as 'trader' | 'gig_worker' | '' }))}
                className="w-full h-10 px-3 bg-slate-50 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-trace-accent/30"
              >
                <option value="">Select work type</option>
                <option value="trader">Trader</option>
                <option value="gig_worker">Gig Worker</option>
              </select>
            ) : (
              <Input
                disabled
                value={user?.persona === 'trader' ? 'Trader' : user?.persona === 'gig_worker' ? 'Gig Worker' : ''}
                placeholder="Not set"
                className="bg-slate-50 opacity-70"
              />
            )}
          </div>
        </div>
      </div>

      {/* Location */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Location</p>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { key: 'state', label: 'State',  placeholder: 'Lagos' },
            { key: 'city',  label: 'City',   placeholder: 'Yaba' },
          ].map(field => (
            <div key={field.key}>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">{field.label}</label>
              <Input
                disabled={!editMode}
                value={editMode ? (form[field.key as keyof ProfileForm] as string) : ((user?.[field.key as keyof typeof user] as string) ?? '')}
                onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                placeholder={field.placeholder}
                className={cn('bg-slate-50', !editMode && 'opacity-70')}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Skills & Trade */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Skills & Trade</p>
          {editMode && (
            <Button size="sm" onClick={handleSaveSkills} disabled={savingSkills}>
              {savingSkills ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
              Save Skills
            </Button>
          )}
        </div>
        <p className="text-xs text-slate-500 mb-4">
          These skills are used by the AI to match you with relevant job opportunities.
        </p>

        {/* Skill pills + input */}
        <div
          onClick={() => editMode && skillInputRef.current?.focus()}
          className={cn(
            'min-h-[48px] flex flex-wrap gap-2 items-center rounded-xl border px-3 py-2 bg-slate-50',
            editMode ? 'border-slate-300 cursor-text' : 'border-slate-200 cursor-default opacity-70',
          )}
        >
          {(editMode ? skills : (profile?.skills ?? [])).map(skill => (
            <span
              key={skill}
              className="inline-flex items-center gap-1 rounded-full bg-slate-950 text-white text-xs font-medium px-2.5 py-1"
            >
              {skill}
              {editMode && (
                <button type="button" onClick={() => removeSkill(skill)} className="hover:text-slate-300 ml-0.5">
                  <X className="h-3 w-3" />
                </button>
              )}
            </span>
          ))}
          {editMode && (
            <input
              ref={skillInputRef}
              value={skillInput}
              onChange={e => setSkillInput(e.target.value)}
              onKeyDown={handleSkillKeyDown}
              placeholder={(editMode ? skills : (profile?.skills ?? [])).length === 0 ? 'Type a skill and press Enter…' : 'Add more…'}
              className="flex-1 min-w-[140px] bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
          )}
          {!editMode && (profile?.skills ?? []).length === 0 && (
            <span className="text-sm text-slate-400">No skills added yet</span>
          )}
        </div>
        {editMode && (
          <div className="flex gap-2 mt-2">
            <Button type="button" variant="outline" size="sm" onClick={addSkill} disabled={!skillInput.trim()}>
              <Plus className="h-3.5 w-3.5" />
              Add
            </Button>
          </div>
        )}

        {/* Skill suggestions from selected trade category */}
        {editMode && skillSuggestions.length > 0 && (
          <div className="mt-3">
            <p className="text-xs text-slate-500 mb-2">Suggested for your category — tap to add:</p>
            <div className="flex flex-wrap gap-1.5">
              {skillSuggestions.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSkills(prev => [...prev, s])}
                  className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 hover:border-slate-950 hover:bg-slate-100 transition-colors"
                >
                  <Plus className="h-2.5 w-2.5" />
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 mt-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Trade Category</label>
            {editMode ? (
              <select
                value={tradeCategory}
                onChange={e => setTradeCategory(e.target.value)}
                className="w-full h-10 px-3 bg-slate-50 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-trace-accent/30"
              >
                <option value="">Select category…</option>
                {categoryOptions.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            ) : (
              <Input
                disabled
                value={
                  profile?.trade_category
                    ? (categoryOptions.find(c => c.value === profile.trade_category)?.label ?? profile.trade_category)
                    : ''
                }
                placeholder="Not set"
                className="bg-slate-50 opacity-70"
              />
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Years Active in Trade</label>
            <Input
              disabled={!editMode}
              type="number"
              min={0}
              max={60}
              value={editMode ? yearsActive : (profile?.years_active?.toString() ?? '')}
              onChange={e => setYearsActive(e.target.value)}
              placeholder="e.g. 5"
              className={cn('bg-slate-50', !editMode && 'opacity-70')}
            />
          </div>
        </div>
      </div>

      {/* Languages */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Languages</p>
        <div className="mb-3">
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Preferred Language</label>
          {editMode ? (
            <select
              value={form.preferred_language}
              onChange={e => setForm(f => ({ ...f, preferred_language: e.target.value }))}
              className="w-full h-10 px-3 bg-slate-50 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-trace-accent/30"
            >
              <option value="">Select preferred language</option>
              {LANGUAGES.map(code => (
                <option key={code} value={code}>{LANGUAGE_LABELS[code]}</option>
              ))}
            </select>
          ) : (
            <Input
              disabled
              value={LANGUAGE_LABELS[user?.preferred_language ?? ''] ?? user?.preferred_language ?? ''}
              placeholder="Not set"
              className="bg-slate-50 opacity-70"
            />
          )}
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-2">Languages Spoken</label>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map(code => {
              const active = editMode
                ? form.languages.includes(code)
                : (user?.languages ?? []).includes(code)
              return (
                <button
                  key={code}
                  type="button"
                  disabled={!editMode}
                  onClick={() => editMode && toggleLang(code)}
                  className={cn(
                    'px-3 py-1 rounded-full text-xs font-medium border transition-all',
                    active
                      ? 'bg-trace-accent text-white border-trace-accent'
                      : 'bg-slate-50 text-slate-500 border-slate-200',
                    !editMode && 'cursor-default',
                    editMode && !active && 'hover:border-trace-accent/50 cursor-pointer',
                  )}
                >
                  {LANGUAGE_LABELS[code]}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Account */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Account</p>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Phone Number</label>
            <Input value={user?.phone ?? ''} disabled className="bg-slate-50 opacity-70" />
            <p className="text-xs text-slate-400 mt-1">Phone number cannot be changed</p>
          </div>
          {user?.virtual_account_no && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Virtual Account</label>
              <Input value={user.virtual_account_no} disabled className="bg-slate-50 opacity-70 font-mono tracking-widest" />
            </div>
          )}
          <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-slate-800">Data Sharing Consent</p>
              <p className="text-xs text-slate-500 mt-0.5">Allow Trace to use your economic activity data</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
              <input
                type="checkbox"
                disabled={!editMode}
                checked={editMode ? form.data_sharing_consent : (user?.data_sharing_consent ?? false)}
                onChange={e => setForm(f => ({ ...f, data_sharing_consent: e.target.checked }))}
                className="sr-only peer"
              />
              <div className={cn(
                'w-10 h-5 rounded-full peer peer-checked:after:translate-x-5 after:content-[\'\'] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all',
                'peer-checked:bg-trace-accent bg-slate-200',
                !editMode && 'opacity-60',
              )} />
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Security Tab ──────────────────────────────────────────────────────────────

function SecurityTab() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' })
  const [show, setShow] = useState({ current: false, next: false, confirm: false })

  const { mutate: changePw, isPending } = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      api.patch('/users/me/password', data),
    onSuccess: () => {
      toast.success('Password changed successfully')
      setForm({ currentPassword: '', newPassword: '', confirm: '' })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (form.newPassword !== form.confirm) {
      toast.error('New passwords do not match')
      return
    }
    if (form.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters')
      return
    }
    changePw({ currentPassword: form.currentPassword, newPassword: form.newPassword })
  }

  const PwField = ({
    id, label, field, showField,
  }: { id: string; label: string; field: keyof typeof form; showField: keyof typeof show }) => (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1.5">{label}</label>
      <div className="relative">
        <Input
          type={show[showField] ? 'text' : 'password'}
          value={form[field]}
          onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
          className="pr-10 bg-slate-50"
          required
        />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => setShow(s => ({ ...s, [showField]: !s[showField] }))}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
        >
          {show[showField] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  )

  return (
    <div className="p-8">
      <h2 className="text-xl font-bold text-slate-900 mb-1">Security</h2>
      <p className="text-sm text-slate-500 mb-8">Change your account password</p>

      <form onSubmit={handleSubmit} className="max-w-md space-y-5">
        <PwField id="curr" label="Current Password" field="currentPassword" showField="current" />
        <PwField id="next" label="New Password"     field="newPassword"     showField="next" />
        <PwField id="conf" label="Confirm New Password" field="confirm"     showField="confirm" />

        <Button
          type="submit"
          disabled={isPending || !form.currentPassword || !form.newPassword || !form.confirm}
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {isPending ? 'Updating…' : 'Change Password'}
        </Button>
      </form>
    </div>
  )
}

// ── Static tabs ───────────────────────────────────────────────────────────────

function NotificationsTab() {
  const items = [
    { name: 'Score Updates',     desc: 'Alerts when your identity score changes',    on: true  },
    { name: 'Finance Products',  desc: 'Notifications about new financial products', on: true  },
    { name: 'Vouch Activity',    desc: 'When someone vouches for you',               on: true  },
    { name: 'Work Opportunities',desc: 'New opportunities matching your skills',     on: false },
    { name: 'Community',         desc: 'Updates from the Trace community',           on: false },
  ]
  return (
    <div className="p-8">
      <h2 className="text-xl font-bold text-slate-900 mb-1">Notifications</h2>
      <p className="text-sm text-slate-500 mb-8">Choose what you want to be notified about</p>
      <div className="space-y-3 max-w-lg">
        {items.map(item => (
          <div key={item.name} className="flex items-center justify-between gap-4 rounded-xl border border-border px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-slate-800">{item.name}</p>
              <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
              <input type="checkbox" defaultChecked={item.on} className="sr-only peer" />
              <div className="w-10 h-5 bg-slate-200 peer-checked:bg-trace-accent rounded-full peer peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" />
            </label>
          </div>
        ))}
      </div>
    </div>
  )
}

function PrivacyTab() {
  return (
    <div className="p-8">
      <h2 className="text-xl font-bold text-slate-900 mb-1">Privacy</h2>
      <p className="text-sm text-slate-500 mb-8">Control how your data is used</p>
      <div className="space-y-3 max-w-lg">
        {[
          { title: 'Profile Visibility',   desc: 'Control who can see your economic profile' },
          { title: 'Data Sharing',          desc: 'Manage how your data is shared with partners' },
          { title: 'Download Your Data',    desc: 'Export a copy of all your personal data' },
        ].map(p => (
          <div key={p.title} className="flex items-start justify-between gap-4 rounded-xl border border-border px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-slate-800">{p.title}</p>
              <p className="text-xs text-slate-500 mt-0.5">{p.desc}</p>
            </div>
            <Button variant="link" size="sm" className="flex-shrink-0 h-auto p-0 text-xs">Manage</Button>
          </div>
        ))}
      </div>
    </div>
  )
}

function HelpTab() {
  return (
    <div className="p-8">
      <h2 className="text-xl font-bold text-slate-900 mb-1">Help & Support</h2>
      <p className="text-sm text-slate-500 mb-8">Get help with your Trace account</p>
      <div className="space-y-3 max-w-lg">
        {[
          { title: 'Documentation',   desc: 'Read guides and tutorials' },
          { title: 'Contact Support', desc: 'Get help from our team' },
          { title: 'Report a Bug',    desc: 'Report technical issues' },
          { title: 'FAQ',             desc: 'Answers to common questions' },
        ].map(h => (
          <button key={h.title} className="w-full flex items-center justify-between gap-4 rounded-xl border border-border px-4 py-3 hover:bg-slate-50 transition-colors text-left">
            <div>
              <p className="text-sm font-semibold text-slate-800">{h.title}</p>
              <p className="text-xs text-slate-500 mt-0.5">{h.desc}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400 flex-shrink-0" />
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

const TABS = [
  { key: 'profile',       label: 'Profile',       icon: User },
  { key: 'security',      label: 'Security',      icon: Lock },
  { key: 'notifications', label: 'Notifications', icon: Bell },
  { key: 'privacy',       label: 'Privacy',       icon: Shield },
  { key: 'help',          label: 'Help',           icon: HelpCircle },
] as const

type Tab = (typeof TABS)[number]['key']

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>('profile')
  const { logout } = useAuth()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">Settings</h1>
        <p className="text-slate-500">Manage your account and preferences</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-border bg-white overflow-hidden">
            {TABS.map(t => {
              const Icon = t.icon
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={cn(
                    'w-full flex items-center gap-3 px-5 py-3.5 text-sm font-medium transition-colors border-b border-border last:border-0',
                    tab === t.key
                      ? 'bg-slate-950 text-white'
                      : 'text-slate-600 hover:bg-slate-50'
                  )}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span className="flex-1 text-left">{t.label}</span>
                  {tab === t.key && <ChevronRight className="h-4 w-4" />}
                </button>
              )
            })}
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-5 py-3.5 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3 rounded-2xl border border-border bg-white overflow-hidden">
          {tab === 'profile'       && <ProfileTab />}
          {tab === 'security'      && <SecurityTab />}
          {tab === 'notifications' && <NotificationsTab />}
          {tab === 'privacy'       && <PrivacyTab />}
          {tab === 'help'          && <HelpTab />}
        </div>
      </div>
    </div>
  )
}
