'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ChevronRight, User, Lock, Bell, Shield, HelpCircle, Loader2, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCurrentUser, currentUserKey } from '@/lib/api/hooks/use-current-user'
import { useAuth } from '@/context/auth-context'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

// ── Profile Tab ───────────────────────────────────────────────────────────────

function ProfileTab() {
  const { data: user, isLoading } = useCurrentUser()
  const qc = useQueryClient()
  const [editMode, setEditMode] = useState(false)
  const [form, setForm] = useState({ full_name: '', email: '', state: '', city: '' })

  const { mutate: save, isPending: saving } = useMutation({
    mutationFn: (data: typeof form) => api.patch('/users/me', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: currentUserKey })
      toast.success('Profile updated')
      setEditMode(false)
    },
  })

  const handleEdit = () => {
    setForm({
      full_name: user?.full_name ?? '',
      email:     user?.email ?? '',
      state:     user?.state ?? '',
      city:      user?.city ?? '',
    })
    setEditMode(true)
  }

  const handleSave = () => {
    const payload: Record<string, string> = {}
    if (form.full_name) payload.full_name = form.full_name
    if (form.email)     payload.email     = form.email
    if (form.state)     payload.state     = form.state
    if (form.city)      payload.city      = form.city
    save(payload as typeof form)
  }

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4 p-8">
        {[1,2,3,4].map(i => <div key={i} className="h-10 rounded-lg bg-slate-200" />)}
      </div>
    )
  }

  const displayName = user?.full_name ?? user?.phone ?? '—'
  const initials = displayName.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Profile Information</h2>
          <p className="text-sm text-slate-500 mt-0.5">Update your personal details</p>
        </div>
        {!editMode ? (
          <Button variant="outline" onClick={handleEdit}>Edit Profile</Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setEditMode(false)} disabled={saving}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-trace-accent hover:bg-trace-accent/90 text-white">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save Changes
            </Button>
          </div>
        )}
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-4 mb-8 pb-8 border-b border-border">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-950 text-white text-xl font-bold">
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

      {/* Fields */}
      <div className="grid gap-5 sm:grid-cols-2">
        {[
          { key: 'full_name', label: 'Full Name',  value: user?.full_name, type: 'text',  placeholder: 'Your full name' },
          { key: 'email',     label: 'Email',       value: user?.email,     type: 'email', placeholder: 'you@example.com' },
          { key: 'state',     label: 'State',       value: user?.state,     type: 'text',  placeholder: 'Lagos' },
          { key: 'city',      label: 'City',        value: user?.city,      type: 'text',  placeholder: 'Yaba' },
        ].map(field => (
          <div key={field.key}>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">{field.label}</label>
            <Input
              type={field.type}
              disabled={!editMode}
              value={editMode ? form[field.key as keyof typeof form] : (field.value ?? '')}
              onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
              placeholder={field.placeholder}
              className={cn('bg-slate-50', !editMode && 'opacity-70')}
            />
          </div>
        ))}
      </div>

      {/* Phone — read-only */}
      <div className="mt-5">
        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Phone Number</label>
        <Input value={user?.phone ?? ''} disabled className="bg-slate-50 opacity-70" />
        <p className="text-xs text-slate-400 mt-1">Phone number cannot be changed</p>
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
        <button
          type="button"
          onClick={() => setShow(s => ({ ...s, [showField]: !s[showField] }))}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
        >
          {show[showField] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
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
          className="bg-trace-accent hover:bg-trace-accent/90 text-white"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
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
            <button className="text-xs font-semibold text-trace-accent hover:underline flex-shrink-0">Manage</button>
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
