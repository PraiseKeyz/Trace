'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import { AuthLayout } from '@/components/auth-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { api } from '@/lib/api'

const PANEL = {
  headline: 'Choose a new',
  accentLine: 'secure password.',
  features: [
    { title: 'OTP already confirmed', desc: 'This step only updates the password after reset code verification.' },
    { title: 'Stronger access', desc: 'Use at least 8 characters with a number and symbol.' },
    { title: 'Back to Trace', desc: 'Once saved, sign in with your new password.' },
  ],
}

export default function ResetPasswordPage() {
  const router = useRouter()
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const storedPhone = sessionStorage.getItem('reset_phone') ?? ''
    const storedOtp = sessionStorage.getItem('reset_otp') ?? ''

    if (!storedPhone || !storedOtp) {
      router.replace('/forgot-password')
      return
    }

    setPhone(storedPhone)
    setOtp(storedOtp)
  }, [router])

  const validateReset = () => {
    const next: Record<string, string> = {}
    if (!newPassword) next.newPassword = 'Password is required'
    else if (newPassword.length < 8) next.newPassword = 'At least 8 characters'
    else if (!/\d/.test(newPassword)) next.newPassword = 'Must include a number'
    else if (!/[^A-Za-z0-9]/.test(newPassword)) next.newPassword = 'Must include a symbol'
    if (newPassword !== confirmPassword) next.confirmPassword = 'Passwords do not match'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phone || !otp || !validateReset()) return

    setIsLoading(true)
    try {
      await api.post('/auth/reset-password', {
        phone,
        otp,
        newPassword,
      })
      sessionStorage.removeItem('reset_phone')
      sessionStorage.removeItem('reset_otp')
      toast.success('Password reset successfully. Sign in with your new password.')
      router.push('/login')
    } catch {
      sessionStorage.removeItem('reset_phone')
      sessionStorage.removeItem('reset_otp')
      toast.error('Your reset code has expired. Please request a new one.')
      router.push('/forgot-password')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout panel={PANEL} reversed>
      <div className="mb-10">
        <Link href={`/verify-reset-otp?phone=${encodeURIComponent(phone)}`} className="inline-flex items-center gap-2 text-sm font-bold text-slate-950 hover:underline mb-6">
          <ArrowLeft size={16} />
          Back to code
        </Link>
        <h1 className="text-4xl font-black text-slate-950 mb-3">Set new password</h1>
        <p className="text-lg text-muted-foreground">Create a new password for your Trace account.</p>
      </div>

      <form onSubmit={handleResetPassword} className="space-y-5" noValidate>
        <div>
          <label className="block text-sm font-bold text-foreground mb-2">New Password</label>
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="********"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value)
                setErrors((prev) => ({ ...prev, newPassword: '' }))
              }}
              className={`h-12 bg-trace-surface border-trace-border pr-12${errors.newPassword ? ' border-red-400' : ''}`}
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </Button>
          </div>
          {errors.newPassword
            ? <p className="text-xs text-red-500 mt-1">{errors.newPassword}</p>
            : <p className="text-xs text-muted-foreground mt-1.5">8+ characters with a number and a symbol</p>
          }
        </div>

        <div>
          <label className="block text-sm font-bold text-foreground mb-2">Confirm Password</label>
          <div className="relative">
            <Input
              type={showConfirm ? 'text' : 'password'}
              placeholder="********"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value)
                setErrors((prev) => ({ ...prev, confirmPassword: '' }))
              }}
              className={`h-12 bg-trace-surface border-trace-border pr-12${errors.confirmPassword ? ' border-red-400' : ''}`}
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </Button>
          </div>
          {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>}
        </div>

        <Button
          type="submit"
          variant="dark"
          size="lg"
          disabled={isLoading}
          className="w-full rounded-full mt-2"
        >
          {isLoading ? 'Resetting...' : 'Reset Password'}
          {!isLoading && <ArrowRight className="h-5 w-5" />}
        </Button>
      </form>
    </AuthLayout>
  )
}
