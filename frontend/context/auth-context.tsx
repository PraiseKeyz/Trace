'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { toast } from 'sonner'

// ── Types ─────────────────────────────────────────────────────────────────────

interface User {
  id: string
  fullName?: string
  phone: string
  email?: string
  role?: string
  onboardingComplete?: boolean
}

interface RegisterPayload {
  phone: string
  password: string
}

interface OnboardingPayload {
  fullName?: string
  state?: string
  city?: string
  latitude?: number
  longitude?: number
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
    onboardingComplete: raw.onboardingComplete ?? raw.onboarding_complete,
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
    toast.success('Welcome back!')
    router.push(next.onboardingComplete ? '/dashboard' : '/onboarding')
  }

  const register = async (payload: RegisterPayload) => {
    const data = await api.post<{ user: AuthApiUser }>('/auth/register', payload)
    setUser(mapUser(data.user))
    toast.success('Account created! Please verify your phone.')
  }

  const completeOnboarding = async (payload: OnboardingPayload) => {
    await api.post('/auth/onboard', payload)
    await checkAuth()
    toast.success('You are all set!')
    router.push('/dashboard')
  }

  const logout = async () => {
    await api.post('/auth/logout', undefined, { silent: true })
    setUser(null)
    toast.success('Logged out successfully.')
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
