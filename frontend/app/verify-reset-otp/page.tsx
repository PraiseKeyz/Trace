'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, ArrowRight, RotateCcw, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { AuthLayout } from '@/components/auth-layout'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'

const RESEND_COOLDOWN = 30
const OTP_LENGTH = 6

const PANEL = {
  headline: 'Confirm the code',
  accentLine: 'before changing access.',
  features: [
    { title: 'Same OTP behavior', desc: 'The reset code follows the same 6-digit flow as signup verification.' },
    { title: 'Secure recovery', desc: 'Only verified numbers can continue to the password reset step.' },
    { title: 'Quick return', desc: 'Verify, set a new password, and sign back in.' },
  ],
}

export default function VerifyResetOtpPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const phone = searchParams.get('phone') ?? ''

  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''))
  const [error, setError] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN)
  const inputRefs = useRef<(HTMLInputElement | null)[]>(Array(OTP_LENGTH).fill(null))
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const otp = digits.join('')
  const maskedPhone = phone ? `${phone.slice(0, 2)} ***** ${phone.slice(-4)}` : ''

  useEffect(() => {
    if (!phone) router.replace('/forgot-password')
  }, [phone, router])

  useEffect(() => {
    startCooldown()
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const startCooldown = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    setCooldown(RESEND_COOLDOWN)
    timerRef.current = setInterval(() => {
      setCooldown((seconds) => {
        if (seconds <= 1) {
          if (timerRef.current) clearInterval(timerRef.current)
          return 0
        }
        return seconds - 1
      })
    }, 1000)
  }

  const submit = async (code: string) => {
    if (!phone) return
    setIsVerifying(true)
    setError('')
    try {
      await api.post('/auth/verify-reset-otp', { phone, otp: code })
      sessionStorage.setItem('reset_phone', phone)
      sessionStorage.setItem('reset_otp', code)
      router.push('/reset-password')
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
    text.split('').forEach((digit, index) => { next[index] = digit })
    setDigits(next)
    setError('')
    inputRefs.current[Math.min(text.length, OTP_LENGTH - 1)]?.focus()
    if (text.length === OTP_LENGTH) submit(text)
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.length !== OTP_LENGTH) {
      setError('Enter the full 6-digit code')
      return
    }
    await submit(otp)
  }

  const handleResend = async () => {
    if (cooldown > 0 || !phone) return
    setIsResending(true)
    try {
      await api.post('/auth/forgot-password', { phone })
      toast.success('A new reset OTP has been sent.')
      setDigits(Array(OTP_LENGTH).fill(''))
      setError('')
      startCooldown()
      setTimeout(() => inputRefs.current[0]?.focus(), 0)
    } catch {
      // ApiClient shows toast
    } finally {
      setIsResending(false)
    }
  }

  return (
    <AuthLayout panel={PANEL} reversed>
      <div className="mb-8">
        <Link href="/forgot-password" className="inline-flex items-center gap-2 text-sm font-bold text-slate-950 hover:underline mb-6">
          <ArrowLeft size={16} />
          Change number
        </Link>
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-slate-950 rounded-2xl flex items-center justify-center shadow-xl">
            <ShieldCheck size={30} className="text-trace-accent" />
          </div>
        </div>
        <h1 className="text-4xl font-black text-slate-950 mb-3">Verify reset code</h1>
        <p className="text-lg text-muted-foreground">
          We sent a 6-digit code to <span className="font-bold text-slate-950">{maskedPhone}</span>.
        </p>
      </div>

      <form onSubmit={handleVerify} noValidate>
        <div className="flex gap-2 justify-between mb-2">
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={(element) => { inputRefs.current[index] = element }}
              type="text"
              inputMode="numeric"
              maxLength={2}
              value={digit}
              onChange={(e) => handleDigitChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              onFocus={(e) => e.target.select()}
              autoFocus={index === 0}
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

        {error && <p className="text-xs text-red-500 text-center mt-1 mb-5">{error}</p>}

        <Button
          type="submit"
          variant="dark"
          size="lg"
          disabled={isVerifying || otp.length !== OTP_LENGTH}
          className="w-full rounded-full mt-5"
        >
          {isVerifying ? 'Verifying...' : 'Verify Code'}
          {!isVerifying && <ArrowRight className="h-5 w-5" />}
        </Button>
      </form>

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
    </AuthLayout>
  )
}
