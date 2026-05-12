'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { apiFetch } from '@/lib/api'
import { toast } from 'sonner'

interface User {
  id: string
  fullName: string
  phone: string
  email?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (phone: string, password: string) => Promise<void>
  register: (data: any) => Promise<void>
  logout: () => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  const checkAuth = async () => {
    try {
      const data = await apiFetch('/auth/me')
      setUser({
        id: data.id,
        fullName: data.full_name,
        phone: data.phone,
        email: data.email
      })
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
      setUser(data.user)
      toast.success('Welcome back!')
      router.push('/dashboard')
    } catch (error: any) {
      toast.error(error.message || 'Login failed')
      throw error
    }
  }

  const register = async (formData: any) => {
    try {
      const data = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify(formData),
      })
      setUser(data.user)
      toast.success('Registration successful!')
      router.push('/dashboard')
    } catch (error: any) {
      toast.error(error.message || 'Registration failed')
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
