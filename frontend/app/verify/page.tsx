'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowRight, RotateCcw, ShieldCheck } from 'lucide-react'
import { useAuth } from '@/context/auth-context'
import { cn } from '@/lib/utils'

const RESEND_COOLDOWN = 30
const OTP_LENGTH = 6

export default function VerifyPage() {
  const { user, isLoading, verifyOtp, resendOtp } = useAuth()
  const router = useRouter()

  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''))
  const [error, setError] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN)
  const inputRefs = useRef<(HTMLInputElement | null)[]>(Array(OTP_LENGTH).fill(null))
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const otp = digits.join('')

  useEffect(() => {
    if (isLoading) return
    if (!user) { router.replace('/signup'); return }
    if (user.isPhoneVerified && !user.onboardingComplete) { router.replace('/onboarding'); return }
    if (user.isPhoneVerified && user.onboardingComplete) { router.replace('/dashboard'); return }
  }, [user, isLoading, router])

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

  const submit = async (code: string) => {
    setIsVerifying(true)
    setError('')
    try {
      await verifyOtp(code)
      router.push('/onboarding')
    } catch {
      setError('Incorrect or expired OTP. Try again.')
      setDigits(Array(OTP_LENGTH).fill(''))
      setTimeout(() => inputRefs.current[0]?.focus(), 0)
    } finally {
      setIsVerifying(false)
    }
  }

  const handleDigitChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[index] = digit
    setDigits(next)
    setError('')

    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
    }

    const code = next.join('')
    if (code.length === OTP_LENGTH) {
      submit(code)
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (digits[index]) {
        const next = [...digits]
        next[index] = ''
        setDigits(next)
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus()
      }
    }
    if (e.key === 'ArrowLeft' && index > 0) inputRefs.current[index - 1]?.focus()
    if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus()
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH)
    if (!text) return
    const next = Array(OTP_LENGTH).fill('')
    text.split('').forEach((d, i) => { next[i] = d })
    setDigits(next)
    setError('')
    const focusIndex = Math.min(text.length, OTP_LENGTH - 1)
    inputRefs.current[focusIndex]?.focus()
    if (text.length === OTP_LENGTH) submit(text)
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.length !== OTP_LENGTH) { setError('Enter the full 6-digit code'); return }
    await submit(otp)
  }

  const handleResend = async () => {
    if (cooldown > 0) return
    setIsResending(true)
    try {
      await resendOtp()
      startCooldown()
      setDigits(Array(OTP_LENGTH).fill(''))
      setError('')
      setTimeout(() => inputRefs.current[0]?.focus(), 0)
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
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">

          {/* Icon */}
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 bg-slate-950 rounded-2xl flex items-center justify-center shadow-xl">
              <ShieldCheck size={36} className="text-trace-accent" />
            </div>
          </div>

          <div className="text-center mb-10">
            <h1 className="text-3xl font-black text-slate-950 mb-3">Verify your phone</h1>
            <p className="text-muted-foreground">We sent a 6-digit code to</p>
            <p className="font-bold text-slate-950 mt-1 tracking-wider">
              {user?.phone ? `${user.phone.slice(0, 2)} ••••• ${user.phone.slice(-4)}` : '—'}
            </p>
          </div>

          <form onSubmit={handleVerify} noValidate>
            {/* OTP boxes */}
            <div className="flex gap-2 justify-center mb-3">
              {digits.map((digit, i) => (
                <input
                  key={i}
                  ref={el => { inputRefs.current[i] = el }}
                  type="text"
                  inputMode="numeric"
                  maxLength={2}
                  value={digit}
                  onChange={e => handleDigitChange(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  onPaste={handlePaste}
                  onFocus={e => e.target.select()}
                  autoFocus={i === 0}
                  className={cn(
                    'w-12 h-14 text-center text-2xl font-black rounded-2xl border-2 bg-white outline-none transition-all duration-150 select-none',
                    'focus:ring-4',
                    error
                      ? 'border-red-400 text-red-500 focus:border-red-500 focus:ring-red-100'
                      : digit
                      ? 'border-slate-950 text-slate-950 focus:border-slate-950 focus:ring-slate-950/10'
                      : 'border-trace-border text-slate-400 focus:border-slate-950 focus:ring-slate-950/10',
                  )}
                />
              ))}
            </div>

            {error && (
              <p className="text-xs text-red-500 text-center mb-5">{error}</p>
            )}

            <Button
              type="submit"
              variant="dark"
              size="lg"
              disabled={isVerifying || otp.length !== OTP_LENGTH}
              className="w-full rounded-full mt-5"
            >
              {isVerifying ? 'Verifying…' : 'Verify Phone'}
              {!isVerifying && <ArrowRight className="h-5 w-5" />}
            </Button>
          </form>

          {/* Resend */}
          <div className="text-center mt-8 space-y-2">
            <p className="text-sm text-muted-foreground">Didn&apos;t receive the code?</p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleResend}
              disabled={cooldown > 0 || isResending}
              className="font-bold text-slate-950 disabled:text-muted-foreground"
            >
              <RotateCcw size={14} className={cooldown > 0 || isResending ? '' : 'text-trace-accent'} />
              {isResending ? 'Resending...' : cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend OTP'}
            </Button>
          </div>

        </div>
      </div>
    </div>
  )
}
