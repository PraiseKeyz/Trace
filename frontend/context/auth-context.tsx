'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { toast } from 'sonner'

// ── Types ─────────────────────────────────────────────────────────────────────

interface User {
  id: string
  phone: string
  fullName?: string
  email?: string
  role?: string
  persona?: 'trader' | 'gig_worker'
  isPhoneVerified: boolean
  onboardingComplete: boolean
}

interface RegisterPayload {
  phone: string
  password: string
}

interface OnboardingPayload {
  persona?: 'trader' | 'gig_worker'
  fullName?: string
  firstName?: string
  lastName?: string
  email?: string
  state?: string
  city?: string
  latitude?: number
  longitude?: number
  languages?: string[]
  skills?: string[]
  tradeCategory?: string
  yearsActive?: number
}

interface AuthApiUser {
  id: string
  phone: string
  full_name?: string
  email?: string
  state?: string
  city?: string
  latitude?: number
  longitude?: number
  role?: string
  persona?: string
  squad_customer_id?: string | null
  virtual_account_no?: string | null
  is_phone_verified?: boolean
  languages?: string[]
  preferred_language?: string | null
  data_sharing_consent?: boolean
  onboardingComplete?: boolean
  onboarding_complete?: boolean
  created_at?: string
  updated_at?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (phone: string, password: string) => Promise<void>
  register: (data: RegisterPayload) => Promise<void>
  verifyOtp: (otp: string) => Promise<void>
  resendOtp: () => Promise<void>
  completeOnboarding: (data: OnboardingPayload) => Promise<void>
  logout: () => Promise<void>
}

// ── Context ───────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function mapUser(raw: AuthApiUser): User {
  return {
    id: raw.id,
    phone: raw.phone,
    email: raw.email,
    fullName: raw.full_name,
    persona: raw.persona as 'trader' | 'gig_worker' | undefined,
    isPhoneVerified: raw.is_phone_verified ?? false,
    onboardingComplete: raw.onboardingComplete ?? raw.onboarding_complete ?? false,
  }
}

// ── Provider ──────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const checkAuth = async () => {
    try {
      const raw = await api.get<AuthApiUser>('/users/me', { silent: true })
      setUser(mapUser(raw))
    } catch {
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkAuth()
  }, [])

  const login = async (phone: string, password: string) => {
    const data = await api.post<{ user: AuthApiUser }>('/auth/login', { phone, password })
    const next = mapUser(data.user)
    setUser(next)

    if (!next.isPhoneVerified) {
      // Account created but OTP never confirmed
      toast.info('Please verify your phone number to continue.')
      router.push('/verify')
      return
    }

    if (!next.onboardingComplete) {
      // Phone verified but profile not filled in yet
      toast.info('Welcome back! Let\'s finish setting up your profile.')
      router.push('/onboarding')
      return
    }

    toast.success('Welcome back!')
    router.push('/dashboard')
  }

  const register = async (payload: RegisterPayload) => {
    const data = await api.post<{ user: AuthApiUser }>('/auth/register', payload)
    setUser(mapUser(data.user))
    // Page handles navigation to verify step — no router.push here
  }

  const verifyOtp = async (otp: string) => {
    if (!user?.phone) throw new Error('No phone number on record')
    await api.post('/auth/verify-otp', { phone: user.phone, otp })
    // Refresh user so isPhoneVerified becomes true
    await checkAuth()
    toast.success('Phone verified! Let\'s set up your profile.')
  }

  const resendOtp = async () => {
    if (!user?.phone) throw new Error('No phone number on record')
    await api.post('/auth/resend-otp', { phone: user.phone })
    toast.success('A new OTP has been sent to your phone.')
  }

  const completeOnboarding = async (payload: OnboardingPayload) => {
    const { skills, tradeCategory, yearsActive, ...userPayload } = payload
    await api.post('/auth/onboard', userPayload)
    if (skills?.length || tradeCategory || yearsActive !== undefined) {
      await api.patch('/economic-profile/me/skills', {
        skills,
        trade_category: tradeCategory,
        years_active: yearsActive,
      }, { silent: true })
    }
    await checkAuth()
    toast.success('You\'re all set! Welcome to Trace.')
    router.push('/dashboard')
  }

  const logout = async () => {
    await api.post('/auth/logout', undefined, { silent: true })
    setUser(null)
    router.push('/login')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        verifyOtp,
        resendOtp,
        completeOnboarding,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
