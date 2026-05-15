'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ArrowRight, RotateCcw, ShieldCheck } from 'lucide-react'
import { useAuth } from '@/context/auth-context'

const RESEND_COOLDOWN = 30

export default function VerifyPage() {
  const { user, isLoading, verifyOtp, resendOtp } = useAuth()
  const router = useRouter()

  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Guard: if no session at all, send to signup
  useEffect(() => {
    if (isLoading) return
    if (!user) { router.replace('/signup'); return }
    if (user.isPhoneVerified && !user.onboardingComplete) { router.replace('/onboarding'); return }
    if (user.isPhoneVerified && user.onboardingComplete) { router.replace('/dashboard'); return }
  }, [user, isLoading, router])

  // Start initial countdown
  useEffect(() => {
    startCooldown()
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const startCooldown = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    setCooldown(RESEND_COOLDOWN)
    timerRef.current = setInterval(() => {
      setCooldown((s) => {
        if (s <= 1) { clearInterval(timerRef.current!); return 0 }
        return s - 1
      })
    }, 1000)
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!otp.trim()) { setError('Enter the OTP sent to your phone'); return }
    if (!/^\d{6}$/.test(otp.trim())) { setError('OTP must be exactly 6 digits'); return }
    setIsVerifying(true)
    setError('')
    try {
      await verifyOtp(otp.trim())
      router.push('/onboarding')
    } catch {
      setError('Incorrect or expired OTP. Try again.')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResend = async () => {
    if (cooldown > 0) return
    setIsResending(true)
    try {
      await resendOtp()
      startCooldown()
    } catch {
      // ApiClient shows toast
    } finally {
      setIsResending(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-trace-surface flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-950 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-trace-surface flex flex-col">

      {/* Main */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          {/* Icon */}
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 bg-slate-950 rounded-2xl flex items-center justify-center shadow-xl">
              <ShieldCheck size={36} className="text-trace-accent" />
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-slate-950 mb-3">Verify your phone</h1>
            <p className="text-muted-foreground">
              We sent a 6-digit code to
            </p>
            <p className="font-bold text-slate-950 mt-1 tracking-wider">
              {user?.phone ? `${user.phone.slice(0, 2)} ••••• ${user.phone.slice(-4)}` : '—'}
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-4" noValidate>
            <div>
              <Input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                value={otp}
                onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '')); setError('') }}
                className={`h-16 text-center text-3xl tracking-[0.6em] font-black bg-white border-trace-border focus-visible:border-slate-950 focus-visible:ring-slate-950/20${error ? ' border-red-400' : ''}`}
                autoFocus
              />
              {error && <p className="text-xs text-red-500 mt-2 text-center">{error}</p>}
            </div>

            <Button
              type="submit"
              disabled={isVerifying || otp.length !== 6}
              className="w-full h-12 bg-slate-950 hover:bg-slate-800 text-white rounded-full font-bold text-base"
            >
              {isVerifying ? 'Verifying…' : 'Verify Phone'}
              {!isVerifying && <ArrowRight className="ml-2 h-5 w-5" />}
            </Button>
          </form>

          {/* Resend */}
          <div className="text-center mt-8 space-y-2">
            <p className="text-sm text-muted-foreground">Didn&apos;t receive the code?</p>
            <button
              type="button"
              onClick={handleResend}
              disabled={cooldown > 0 || isResending}
              className="inline-flex items-center gap-2 text-sm font-bold text-slate-950 hover:underline disabled:text-muted-foreground disabled:no-underline disabled:cursor-not-allowed transition-colors"
            >
              <RotateCcw size={14} className={cooldown > 0 || isResending ? '' : 'text-trace-accent'} />
              {isResending ? 'Resending...' : cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend OTP'}
            </button>
          </div>

          {/* <p className="text-center text-xs text-muted-foreground mt-10">
            Wrong number?{' '}
            <Link href="/signup" className="font-bold text-slate-950 hover:underline">
              Go back
            </Link>
          </p> */}
        </div>
      </div>
    </div>
  )
}
