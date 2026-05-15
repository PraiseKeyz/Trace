'use client'

import Link from 'next/link'
import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ArrowRight, ArrowLeft, User, MapPin, Briefcase, CheckCircle, ShoppingBag, Languages } from 'lucide-react'
import { useAuth } from '@/context/auth-context'
import { Country, State, City } from 'country-state-city'
import { cn } from '@/lib/utils'

// ── Types ─────────────────────────────────────────────────────────────────────

type Persona = 'trader' | 'gig_worker'
type Step = 'personal' | 'location' | 'language' | 'work'

const STEPS: { id: Step; label: string; icon: React.ElementType; title: string; subtitle: string }[] = [
  {
    id: 'personal',
    label: 'Personal',
    icon: User,
    title: 'Tell us about yourself',
    subtitle: 'This personalises your experience and builds your economic identity.',
  },
  {
    id: 'location',
    label: 'Location',
    icon: MapPin,
    title: 'Where are you based?',
    subtitle: 'We match you with nearby opportunities and relevant financial products.',
  },
  {
    id: 'language',
    label: 'Languages',
    icon: Languages,
    title: 'What languages do you speak?',
    subtitle: 'We use this to match you with opportunities in your language — including African languages.',
  },
  {
    id: 'work',
    label: 'Work & Skills',
    icon: Briefcase,
    title: 'Your work & expertise',
    subtitle: 'This powers your economic score and surfaces the right opportunities for you.',
  },
]

// ── Language data (AfroXLM-R supported + major African languages) ─────────────

const LANGUAGES: { code: string; label: string; region: string }[] = [
  // International
  { code: 'en',  label: 'English',           region: 'International' },
  { code: 'fr',  label: 'French',            region: 'International' },
  { code: 'ar',  label: 'Arabic',            region: 'International' },
  { code: 'pt',  label: 'Portuguese',        region: 'International' },
  // West Africa
  { code: 'yo',  label: 'Yoruba',            region: 'West Africa' },
  { code: 'ha',  label: 'Hausa',             region: 'West Africa' },
  { code: 'ig',  label: 'Igbo',              region: 'West Africa' },
  { code: 'pcm', label: 'Naija (Pidgin)',    region: 'West Africa' },
  { code: 'wo',  label: 'Wolof',             region: 'West Africa' },
  { code: 'tw',  label: 'Twi / Akan',        region: 'West Africa' },
  { code: 'ff',  label: 'Fula / Fulani',     region: 'West Africa' },
  { code: 'ee',  label: 'Ewe',               region: 'West Africa' },
  // East Africa
  { code: 'sw',  label: 'Swahili',           region: 'East Africa' },
  { code: 'am',  label: 'Amharic',           region: 'East Africa' },
  { code: 'om',  label: 'Oromo',             region: 'East Africa' },
  { code: 'so',  label: 'Somali',            region: 'East Africa' },
  { code: 'ti',  label: 'Tigrinya',          region: 'East Africa' },
  { code: 'lg',  label: 'Luganda',           region: 'East Africa' },
  // Southern Africa
  { code: 'zu',  label: 'Zulu',              region: 'Southern Africa' },
  { code: 'xh',  label: 'Xhosa',             region: 'Southern Africa' },
  { code: 'af',  label: 'Afrikaans',         region: 'Southern Africa' },
  { code: 'sn',  label: 'Shona',             region: 'Southern Africa' },
  { code: 'st',  label: 'Sesotho',           region: 'Southern Africa' },
  // Central Africa
  { code: 'ln',  label: 'Lingala',           region: 'Central Africa' },
  { code: 'mg',  label: 'Malagasy',          region: 'Central Africa' },
]

const LANGUAGE_REGIONS = [...new Set(LANGUAGES.map(l => l.region))]

// ── Persona + category + skill data ──────────────────────────────────────────

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
    { value: 'tech',      label: 'Tech & Digital Services' },
    { value: 'gig',       label: 'Gig & Freelance Work' },
    { value: 'services',  label: 'Services & Repairs' },
    { value: 'creative',  label: 'Creative & Media' },
    { value: 'other',     label: 'Other' },
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

// ── Form state ────────────────────────────────────────────────────────────────

interface FormData {
  firstName: string
  lastName: string
  email: string
  countryCode: string   // ISO code e.g. "NG"
  stateCode: string     // ISO code e.g. "LA"
  city: string
  languages: string[]   // language codes e.g. ["en", "yo"]
  persona: Persona | ''
  tradeCategory: string
  skills: string[]
  yearsActive: string
}

const INITIAL: FormData = {
  firstName: '', lastName: '', email: '',
  countryCode: '', stateCode: '', city: '',
  languages: [],
  persona: '', tradeCategory: '', skills: [], yearsActive: '',
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const { user, isLoading, completeOnboarding } = useAuth()
  const router = useRouter()

  const [step, setStep] = useState<Step>('personal')
  const [form, setForm] = useState<FormData>(INITIAL)
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isLoading) return
    if (!user) { router.replace('/signup'); return }
    if (!user.isPhoneVerified) { router.replace('/verify'); return }
    if (user.onboardingComplete) { router.replace('/dashboard'); return }
  }, [user, isLoading, router])

  // ── Country / State / City data ──────────────────────────────────────────

  const allCountries = useMemo(() => Country.getAllCountries(), [])

  const statesForCountry = useMemo(
    () => form.countryCode ? State.getStatesOfCountry(form.countryCode) : [],
    [form.countryCode]
  )

  const citiesForState = useMemo(
    () => form.countryCode && form.stateCode
      ? City.getCitiesOfState(form.countryCode, form.stateCode)
      : [],
    [form.countryCode, form.stateCode]
  )

  // ── Derived ──────────────────────────────────────────────────────────────

  const stepIndex = STEPS.findIndex((s) => s.id === step)
  const currentStep = STEPS[stepIndex]
  const progress = Math.round(((stepIndex + 1) / STEPS.length) * 100)

  const availableCategories = form.persona ? TRADE_CATEGORIES[form.persona] : []
  const availableSkills = form.persona && form.tradeCategory
    ? SKILLS_MAP[form.persona][form.tradeCategory] ?? []
    : []

  // ── Field helpers ─────────────────────────────────────────────────────────

  const set = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm((p) => ({ ...p, [field]: e.target.value }))
    setErrors((p) => { const n = { ...p }; delete n[field]; return n })
  }

  const setCountry = (code: string) => {
    setForm(p => ({ ...p, countryCode: code, stateCode: '', city: '' }))
    setErrors(p => { const n = { ...p }; delete n.countryCode; return n })
  }

  const setStateCode = (code: string) => {
    setForm(p => ({ ...p, stateCode: code, city: '' }))
    setErrors(p => { const n = { ...p }; delete n.stateCode; return n })
  }

  const setPersona = (p: Persona) => {
    setForm((prev) => ({ ...prev, persona: p, tradeCategory: '', skills: [] }))
    setErrors((prev) => { const n = { ...prev }; delete n.persona; return n })
  }

  const setTradeCategory = (cat: string) => {
    setForm((prev) => ({ ...prev, tradeCategory: cat, skills: [] }))
    setErrors((prev) => { const n = { ...prev }; delete n.tradeCategory; return n })
  }

  const toggleSkill = (skill: string) => {
    setForm((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : prev.skills.length < 8 ? [...prev.skills, skill] : prev.skills,
    }))
  }

  const toggleLanguage = (code: string) => {
    setForm(prev => ({
      ...prev,
      languages: prev.languages.includes(code)
        ? prev.languages.filter(l => l !== code)
        : [...prev.languages, code],
    }))
    setErrors(p => { const n = { ...p }; delete n.languages; return n })
  }

  const inputClass = (field: keyof FormData) =>
    `h-12 bg-white border-trace-border focus-visible:border-slate-950 focus-visible:ring-slate-950/20${errors[field] ? ' border-red-400' : ''}`

  const selectClass = (hasError?: boolean) =>
    `w-full h-12 px-4 bg-white border rounded-lg font-medium text-foreground outline-none transition focus:ring-2 focus:ring-trace-accent/30 focus:border-trace-accent${hasError ? ' border-red-400' : ' border-trace-border'}`

  // ── Validation ────────────────────────────────────────────────────────────

  const validate = (): boolean => {
    const e: Partial<Record<keyof FormData, string>> = {}

    if (step === 'personal') {
      if (!form.firstName.trim()) e.firstName = 'First name is required'
      if (!form.lastName.trim()) e.lastName = 'Last name is required'
      if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
        e.email = 'Enter a valid email address'
    }
    if (step === 'location') {
      if (!form.countryCode) e.countryCode = 'Please select your country'
      if (statesForCountry.length > 0 && !form.stateCode) e.stateCode = 'Please select your state / region'
    }
    if (step === 'language') {
      if (form.languages.length === 0) e.languages = 'Please select at least one language'
    }
    if (step === 'work') {
      if (!form.persona) e.persona = 'Please choose your work type'
      if (!form.tradeCategory) e.tradeCategory = 'Please select a category'
    }

    setErrors(e)
    return Object.keys(e).length === 0
  }

  // ── Navigation ────────────────────────────────────────────────────────────

  const handleContinue = () => {
    if (!validate()) return
    const next = STEPS[stepIndex + 1]
    if (next) setStep(next.id)
  }

  const handleBack = () => {
    const prev = STEPS[stepIndex - 1]
    if (prev) setStep(prev.id)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setIsSubmitting(true)
    try {
      const selectedCountry = Country.getCountryByCode(form.countryCode)
      const selectedState  = form.stateCode
        ? State.getStateByCodeAndCountry(form.stateCode, form.countryCode)
        : null

      const stateLabel = selectedState?.name !== undefined ? selectedState.name : form.stateCode
      const cityTrimmed = form.city.trim()
      const cityLabel = cityTrimmed !== '' ? cityTrimmed : (selectedState?.name ?? '')

      await completeOnboarding({
        persona: form.persona || undefined,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        fullName: `${form.firstName.trim()} ${form.lastName.trim()}`,
        email: form.email.trim() || undefined,
        state: stateLabel,
        city: cityLabel,
        languages: form.languages,
        skills: form.skills,
        tradeCategory: form.tradeCategory || undefined,
        yearsActive: form.yearsActive ? parseInt(form.yearsActive, 10) : undefined,
      })
    } catch {
      // ApiClient handles toast
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── Loading ────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="min-h-screen bg-trace-surface flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-trace-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-trace-surface">
      {/* Header */}
      <header className="border-b border-trace-border bg-trace-surface sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 w-fit">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950">
              <span className="font-bold text-white text-lg font-mono">T</span>
            </div>
            <div>
              <span className="text-xl font-black text-slate-950 block tracking-tight">Trace</span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-trace-accent block -mt-1">Economic Identity</span>
            </div>
          </Link>
          <p className="text-sm text-muted-foreground">
            Step <span className="font-bold text-slate-950">{stepIndex + 1}</span> of {STEPS.length}
          </p>
        </div>
      </header>

      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">

          {/* Progress */}
          <div className="mb-10">
            <div className="flex justify-between items-center mb-3">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Setting up your profile</p>
              <p className="text-xs font-bold text-slate-950">{progress}%</p>
            </div>
            <div className="h-1.5 bg-trace-light rounded-full overflow-hidden mb-6">
              <div className="h-full bg-trace-accent rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
            <div className="flex gap-2 flex-wrap">
              {STEPS.map((s, i) => {
                const Icon = s.icon
                const isActive = s.id === step
                const isDone = i < stepIndex
                return (
                  <div key={s.id} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${
                    isActive ? 'bg-trace-accent text-white' : isDone ? 'bg-trace-light text-slate-950' : 'bg-white border border-trace-border text-muted-foreground'
                  }`}>
                    {isDone ? <CheckCircle size={12} /> : <Icon size={12} />}
                    <span>{s.label}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Step header */}
          <div className="mb-8">
            <h1 className="text-3xl font-black text-slate-950 mb-2">{currentStep.title}</h1>
            <p className="text-muted-foreground">{currentStep.subtitle}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8" noValidate>

            {/* ── PERSONAL ── */}
            {step === 'personal' && (
              <div className="space-y-5 animate-in fade-in duration-300">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-foreground mb-2">First Name</label>
                    <Input type="text" placeholder="John" value={form.firstName} onChange={set('firstName')} className={inputClass('firstName')} />
                    {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-foreground mb-2">Last Name</label>
                    <Input type="text" placeholder="Doe" value={form.lastName} onChange={set('lastName')} className={inputClass('lastName')} />
                    {errors.lastName && <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-foreground mb-2">
                    Email Address <span className="font-normal text-muted-foreground">(optional)</span>
                  </label>
                  <Input type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} className={inputClass('email')} />
                  {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                  <p className="text-xs text-muted-foreground mt-1.5">Used for financial product notifications</p>
                </div>
              </div>
            )}

            {/* ── LOCATION ── */}
            {step === 'location' && (
              <div className="space-y-5 animate-in fade-in duration-300">

                {/* Country */}
                <div>
                  <label className="block text-sm font-bold text-foreground mb-2">Country</label>
                  <select
                    value={form.countryCode}
                    onChange={e => setCountry(e.target.value)}
                    className={selectClass(!!errors.countryCode)}
                  >
                    <option value="">Select your country</option>
                    {allCountries.map(c => (
                      <option key={c.isoCode} value={c.isoCode}>
                        {c.flag} {c.name}
                      </option>
                    ))}
                  </select>
                  {errors.countryCode && <p className="text-xs text-red-500 mt-1">{errors.countryCode}</p>}
                </div>

                {/* State — only shown if country has states */}
                {statesForCountry.length > 0 && (
                  <div className="animate-in fade-in duration-200">
                    <label className="block text-sm font-bold text-foreground mb-2">State / Region</label>
                    <select
                      value={form.stateCode}
                      onChange={e => setStateCode(e.target.value)}
                      className={selectClass(!!errors.stateCode)}
                    >
                      <option value="">Select state / region</option>
                      {statesForCountry.map(s => (
                        <option key={s.isoCode} value={s.isoCode}>{s.name}</option>
                      ))}
                    </select>
                    {errors.stateCode && <p className="text-xs text-red-500 mt-1">{errors.stateCode}</p>}
                  </div>
                )}

                {/* City — dropdown if available, text input as fallback */}
                {form.stateCode && (
                  <div className="animate-in fade-in duration-200">
                    <label className="block text-sm font-bold text-foreground mb-2">
                      City <span className="font-normal text-muted-foreground">(optional)</span>
                    </label>
                    {citiesForState.length > 0 ? (
                      <select
                        value={form.city}
                        onChange={set('city')}
                        className={selectClass()}
                      >
                        <option value="">Select city (optional)</option>
                        {citiesForState.map(c => (
                          <option key={c.name} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                    ) : (
                      <Input
                        type="text"
                        placeholder="Enter your city"
                        value={form.city}
                        onChange={set('city')}
                        className={inputClass('city')}
                      />
                    )}
                  </div>
                )}

                {/* No-states fallback (some countries like Vatican etc.) */}
                {form.countryCode && statesForCountry.length === 0 && (
                  <div className="animate-in fade-in duration-200">
                    <label className="block text-sm font-bold text-foreground mb-2">City</label>
                    <Input
                      type="text"
                      placeholder="Enter your city"
                      value={form.city}
                      onChange={set('city')}
                      className={inputClass('city')}
                    />
                  </div>
                )}
              </div>
            )}

            {/* ── LANGUAGE ── */}
            {step === 'language' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  Our AI uses <span className="font-bold">AfroXLM-R</span> — a model trained on African languages — to match you with opportunities in your language.
                </div>

                {errors.languages && (
                  <p className="text-xs text-red-500">{errors.languages}</p>
                )}

                {LANGUAGE_REGIONS.map(region => (
                  <div key={region}>
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">{region}</p>
                    <div className="flex flex-wrap gap-2">
                      {LANGUAGES.filter(l => l.region === region).map(lang => {
                        const selected = form.languages.includes(lang.code)
                        return (
                          <button
                            key={lang.code}
                            type="button"
                            onClick={() => toggleLanguage(lang.code)}
                            className={cn(
                              'px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-150',
                              selected
                                ? 'bg-trace-accent text-white border-trace-accent'
                                : 'bg-white text-slate-700 border-trace-border hover:border-trace-accent/60'
                            )}
                          >
                            {lang.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}

                {form.languages.length > 0 && (
                  <p className="text-xs text-trace-accent font-semibold">
                    {form.languages.length} language{form.languages.length > 1 ? 's' : ''} selected
                  </p>
                )}
              </div>
            )}

            {/* ── WORK ── */}
            {step === 'work' && (
              <div className="space-y-6 animate-in fade-in duration-300">

                {/* 1. Persona picker */}
                <div>
                  <label className="block text-sm font-bold text-foreground mb-3">What best describes you?</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPersona('trader')}
                      className={`relative flex flex-col items-start gap-2 p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                        form.persona === 'trader'
                          ? 'border-trace-accent bg-trace-accent/5'
                          : 'border-trace-border bg-white hover:border-trace-accent/40'
                      }`}
                    >
                      {form.persona === 'trader' && (
                        <CheckCircle size={16} className="absolute top-3 right-3 text-trace-accent" />
                      )}
                      <div className="w-10 h-10 bg-trace-accent/10 rounded-lg flex items-center justify-center">
                        <ShoppingBag size={20} className="text-trace-accent" />
                      </div>
                      <div>
                        <p className="font-black text-slate-950 text-sm">I run a trade</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Retail, food, crafts & more</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPersona('gig_worker')}
                      className={`relative flex flex-col items-start gap-2 p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                        form.persona === 'gig_worker'
                          ? 'border-trace-accent bg-trace-accent/5'
                          : 'border-trace-border bg-white hover:border-trace-accent/40'
                      }`}
                    >
                      {form.persona === 'gig_worker' && (
                        <CheckCircle size={16} className="absolute top-3 right-3 text-trace-accent" />
                      )}
                      <div className="w-10 h-10 bg-slate-950/5 rounded-lg flex items-center justify-center">
                        <Briefcase size={20} className="text-slate-950" />
                      </div>
                      <div>
                        <p className="font-black text-slate-950 text-sm">I seek work / gigs</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Tech, services, freelance</p>
                      </div>
                    </button>
                  </div>
                  {errors.persona && <p className="text-xs text-red-500 mt-2">{errors.persona}</p>}
                </div>

                {/* 2. Trade category */}
                {form.persona && (
                  <div className="animate-in fade-in duration-300">
                    <label className="block text-sm font-bold text-foreground mb-2">
                      {form.persona === 'trader' ? 'Trade Category' : 'Work Category'}
                    </label>
                    <select
                      value={form.tradeCategory}
                      onChange={(e) => setTradeCategory(e.target.value)}
                      className={selectClass(!!errors.tradeCategory)}
                    >
                      <option value="">Select a category</option>
                      {availableCategories.map((c) => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                    {errors.tradeCategory && <p className="text-xs text-red-500 mt-1">{errors.tradeCategory}</p>}
                  </div>
                )}

                {/* 3. Skill chips */}
                {availableSkills.length > 0 && (
                  <div className="animate-in fade-in duration-300">
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-bold text-foreground">
                        Skills <span className="font-normal text-muted-foreground">(pick up to 8)</span>
                      </label>
                      {form.skills.length > 0 && (
                        <span className="text-xs font-bold text-trace-accent">{form.skills.length} selected</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {availableSkills.map((skill) => {
                        const selected = form.skills.includes(skill)
                        const maxed = form.skills.length >= 8 && !selected
                        return (
                          <button
                            key={skill}
                            type="button"
                            disabled={maxed}
                            onClick={() => toggleSkill(skill)}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all duration-150 ${
                              selected
                                ? 'bg-trace-accent text-white border-trace-accent'
                                : maxed
                                ? 'bg-white text-muted-foreground border-trace-border opacity-40 cursor-not-allowed'
                                : 'bg-white text-slate-950 border-trace-border hover:border-trace-accent/60'
                            }`}
                          >
                            {skill}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* 4. Years active */}
                {form.tradeCategory && (
                  <div className="animate-in fade-in duration-300">
                    <label className="block text-sm font-bold text-foreground mb-2">
                      Years in this field <span className="font-normal text-muted-foreground">(optional)</span>
                    </label>
                    <select value={form.yearsActive} onChange={set('yearsActive')} className={selectClass()}>
                      <option value="">Select experience</option>
                      <option value="0">Less than 1 year</option>
                      <option value="1">1 – 2 years</option>
                      <option value="3">3 – 5 years</option>
                      <option value="6">6 – 10 years</option>
                      <option value="11">10+ years</option>
                    </select>
                  </div>
                )}

                {/* Consent */}
                <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-trace-border">
                  <input type="checkbox" id="consent" checked readOnly className="mt-1 h-4 w-4 rounded border-trace-border accent-trace-accent" />
                  <label htmlFor="consent" className="text-sm text-foreground leading-relaxed">
                    I allow Trace to use my economic activity data to calculate my identity score and match me with relevant opportunities and financial products.
                  </label>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex gap-3 pt-2">
              {stepIndex > 0 && (
                <Button type="button" variant="outline" size="lg" onClick={handleBack} className="rounded-full px-6">
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>
              )}
              {step !== 'work' ? (
                <Button type="button" size="lg" onClick={handleContinue} className="rounded-full flex-1 shadow-lg shadow-trace-accent/20">
                  Continue <ArrowRight className="h-5 w-5" />
                </Button>
              ) : (
                <Button type="submit" size="lg" disabled={isSubmitting} className="rounded-full flex-1 shadow-lg shadow-trace-accent/20">
                  {isSubmitting ? 'Setting up your profile…' : 'Launch My Dashboard'}
                  {!isSubmitting && <ArrowRight className="h-5 w-5" />}
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
