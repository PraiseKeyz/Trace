'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiFetch } from '@/lib/api'
import { toast } from 'sonner'

interface User {
  id: string
  fullName?: string
  phone: string
  email?: string
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
  onboardingComplete?: boolean
  onboarding_complete?: boolean
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (phone: string, password: string) => Promise<void>
  register: (data: RegisterPayload) => Promise<void>
  completeOnboarding: (data: OnboardingPayload) => Promise<void>
  logout: () => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: string }).message
    if (message) return message
  }
  return fallback
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const mapUser = (data: AuthApiUser): User => ({
    id: data.id,
    fullName: data.full_name,
    phone: data.phone,
    email: data.email,
    onboardingComplete: data.onboardingComplete ?? data.onboarding_complete,
  })

  const checkAuth = async () => {
    try {
      const data = await apiFetch('/users/me')
      setUser(mapUser(data))
    } catch (error) {
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkAuth()
  }, [])

  const login = async (phone: string, password: string) => {
    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ phone, password }),
      })
      const nextUser = mapUser(data.user)
      setUser(nextUser)
      toast.success('Welcome back!')
      router.push(nextUser.onboardingComplete ? '/dashboard' : '/onboarding')
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Login failed'))
      throw error
    }
  }

  const register = async (formData: RegisterPayload) => {
    try {
      const data = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify(formData),
      })
      setUser(mapUser(data.user))
      toast.success('Registration successful!')
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Registration failed'))
      throw error
    }
  }

  const completeOnboarding = async (payload: OnboardingPayload) => {
    try {
      await apiFetch('/auth/onboard', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      await checkAuth()
      toast.success('Onboarding completed!')
      router.push('/dashboard')
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Onboarding failed'))
      throw error
    }
  }

  const logout = async () => {
    try {
      await apiFetch('/auth/logout', { method: 'POST' })
      setUser(null)
      toast.success('Logged out successfully')
      router.push('/login')
    } catch (error) {
      toast.error('Logout failed')
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        completeOnboarding,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
