'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import { AuthLayout } from '@/components/auth-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { api } from '@/lib/api'

const PANEL = {
  headline: 'Get back into',
  accentLine: 'your economic identity.',
  features: [
    { title: 'Phone-first recovery', desc: 'Reset access with the same number tied to your Trace account.' },
    { title: 'Secure OTP check', desc: 'A short-lived code confirms it is really you before the password changes.' },
    { title: 'Back to work quickly', desc: 'Set a new password and return to opportunities, trade, and finance.' },
  ],
}

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [phone, setPhone] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validatePhone = () => {
    const next: Record<string, string> = {}
    if (!phone.trim()) next.phone = 'Phone number is required'
    else if (!/^\+?[\d\s-]{7,15}$/.test(phone.trim())) next.phone = 'Enter a valid phone number'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const requestResetOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validatePhone()) return

    const normalizedPhone = phone.trim()
    setIsLoading(true)
    try {
      await api.post('/auth/forgot-password', { phone: normalizedPhone })
      toast.success('Password reset OTP sent.')
      router.push(`/verify-reset-otp?phone=${encodeURIComponent(normalizedPhone)}`)
    } catch {
      // ApiClient shows toast
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout panel={PANEL} reversed>
      <div className="mb-10">
        <Link href="/login" className="inline-flex items-center gap-2 text-sm font-bold text-slate-950 hover:underline mb-6">
          <ArrowLeft size={16} />
          Back to sign in
        </Link>
        <h1 className="text-4xl font-black text-slate-950 mb-3">Reset password</h1>
        <p className="text-lg text-muted-foreground">Enter your phone number and we&apos;ll send a reset code.</p>
      </div>

      <form onSubmit={requestResetOtp} className="space-y-5" noValidate>
        <div>
          <label className="block text-sm font-bold text-foreground mb-2">Phone Number</label>
          <Input
            type="tel"
            placeholder="+234 901 234 5678"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value)
              setErrors((prev) => ({ ...prev, phone: '' }))
            }}
            className={`h-12 bg-trace-surface border-trace-border${errors.phone ? ' border-red-400' : ''}`}
            required
          />
          {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
        </div>

        <Button type="submit" size="lg" disabled={isLoading} className="w-full rounded-full mt-2">
          {isLoading ? 'Sending code...' : 'Send Reset Code'}
          {!isLoading && <ArrowRight className="h-5 w-5" />}
        </Button>
      </form>
    </AuthLayout>
  )
}
