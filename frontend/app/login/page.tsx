'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ArrowRight, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/context/auth-context'
import { AuthLayout } from '@/components/auth-layout'

const PANEL = {
  headline: 'Everything you need,',
  accentLine: 'right where you left off.',
  features: [
    { title: 'Your economic score', desc: 'Track and improve your score across work, trade, and finance.' },
    { title: 'Work opportunities', desc: 'Access verified gigs and jobs matched to your skills.' },
    { title: 'Financial products', desc: 'Credit, savings, and insurance built for workers like you.' },
    { title: 'Market intelligence', desc: 'Get insights to grow your business and trade smarter.' },
  ],
}

export default function LoginPage() {
  const { login } = useAuth()

  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await login(phone, password)
    } catch {
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout
      panel={PANEL}
      reversed
    >
      <div className="mb-10">
        <h1 className="text-4xl font-black text-slate-950 mb-3">Welcome back</h1>
        <p className="text-lg text-muted-foreground">Sign in to access your economic identity and opportunities.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div>
          <label className="block text-sm font-bold text-foreground mb-2">Phone Number</label>
          <Input
            type="tel"
            placeholder="+234 901 234 5678"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="h-12 bg-trace-surface border-trace-border"
            required
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-bold text-foreground">Password</label>
            <Link href="#" className="text-sm font-bold text-slate-950 hover:underline">Forgot?</Link>
          </div>
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 bg-trace-surface border-trace-border pr-12"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" id="remember" className="rounded border-trace-border" />
          <label htmlFor="remember" className="text-sm text-foreground">Keep me signed in</label>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 bg-trace-accent hover:bg-trace-accent/90 text-white rounded-full font-bold text-base mt-2"
        >
          {isLoading ? 'Signing in…' : 'Sign In'}
          {!isLoading && <ArrowRight className="ml-2 h-5 w-5" />}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground mt-8">
        New to Trace?{' '}
        <Link href="/signup" className="font-bold text-slate-950 hover:underline">
          Create an account
        </Link>
      </p>
    </AuthLayout>
  )
}
