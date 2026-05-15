'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ArrowRight, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/context/auth-context'
import { AuthLayout } from '@/components/auth-layout'

const PANEL = {
  headline: 'Your hustle deserves',
  accentLine: 'official recognition.',
  features: [
    { title: 'Build your economic identity', desc: 'Every transaction, skill, and activity builds a verifiable score.' },
    { title: 'Access financial products', desc: 'Credit, savings, and insurance designed for workers like you.' },
    { title: 'Find verified work', desc: 'Connect with real opportunities matched to your skills.' },
  ],
}

export default function SignupPage() {
  const { register } = useAuth()
  const router = useRouter()

  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const e: Record<string, string> = {}
    if (!phone.trim()) e.phone = 'Phone number is required'
    else if (!/^\+?[\d\s\-]{7,15}$/.test(phone.trim())) e.phone = 'Enter a valid phone number'
    if (!password) e.password = 'Password is required'
    else if (password.length < 8) e.password = 'At least 8 characters'
    else if (!/\d/.test(password)) e.password = 'Must include a number'
    else if (!/[^A-Za-z0-9]/.test(password)) e.password = 'Must include a symbol'
    if (password !== confirmPassword) e.confirmPassword = 'Passwords do not match'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setIsLoading(true)
    try {
      await register({ phone: phone.trim(), password })
      router.push('/verify')
    } catch {
      // ApiClient handles toast
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout
      panel={PANEL}
      headerRight={
        <>
          Already have an account?{' '}
          <Link href="/login" className="font-bold text-slate-950 hover:underline">Sign in</Link>
        </>
      }
    >
      <div className="mb-10">
        <h1 className="text-4xl font-black text-slate-950 mb-3">Create your account</h1>
        <p className="text-lg text-muted-foreground">Your phone number and a password — that&apos;s all you need to start.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div>
          <label className="block text-sm font-bold text-foreground mb-2">Phone Number</label>
          <Input
            type="tel"
            placeholder="+234 901 234 5678"
            value={phone}
            onChange={(e) => { setPhone(e.target.value); setErrors((p) => ({ ...p, phone: '' })) }}
            className={`h-12 bg-trace-surface border-trace-border${errors.phone ? ' border-red-400' : ''}`}
            required
          />
          {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
        </div>

        <div>
          <label className="block text-sm font-bold text-foreground mb-2">Password</label>
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: '' })) }}
              className={`h-12 bg-trace-surface border-trace-border pr-12${errors.password ? ' border-red-400' : ''}`}
              required
            />
            <Button type="button" variant="ghost" size="icon-sm"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </Button>
          </div>
          {errors.password
            ? <p className="text-xs text-red-500 mt-1">{errors.password}</p>
            : <p className="text-xs text-muted-foreground mt-1.5">8+ characters with a number and a symbol</p>
          }
        </div>

        <div>
          <label className="block text-sm font-bold text-foreground mb-2">Confirm Password</label>
          <div className="relative">
            <Input
              type={showConfirm ? 'text' : 'password'}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setErrors((p) => ({ ...p, confirmPassword: '' })) }}
              className={`h-12 bg-trace-surface border-trace-border pr-12${errors.confirmPassword ? ' border-red-400' : ''}`}
              required
            />
            <Button type="button" variant="ghost" size="icon-sm"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </Button>
          </div>
          {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>}
        </div>

        <Button
          type="submit"
          size="lg"
          disabled={isLoading}
          className="w-full rounded-full shadow-lg shadow-trace-accent/20 mt-2"
        >
          {isLoading ? 'Creating account…' : 'Create Account'}
          {!isLoading && <ArrowRight className="h-5 w-5" />}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground mt-8">
        By signing up you agree to our{' '}
        <a href="#" className="font-bold text-slate-950 hover:underline">Terms of Service</a>
        {' '}and{' '}
        <a href="#" className="font-bold text-slate-950 hover:underline">Privacy Policy</a>
      </p>
    </AuthLayout>
  )
}
