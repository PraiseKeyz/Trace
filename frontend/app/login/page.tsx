'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowRight, CheckCircle, Eye, EyeOff, TrendingUp } from 'lucide-react'

import { useAuth } from '@/context/auth-context'

export default function LoginPage() {
  const { login } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await login(phone, password)
    } catch (error) {
      // Error handled by login function (toast)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-trace-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <Link href="/" className="flex items-center gap-3 w-fit">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-trace-primary to-trace-primary/80">
              <span className="font-bold text-white text-lg">T</span>
            </div>
            <div>
              <span className="text-xl font-bold text-trace-primary block">Trace</span>
              <span className="text-xs text-muted-foreground">Economic Identity</span>
            </div>
          </Link>
        </div>
      </header>

      <div className="min-h-[calc(100vh-80px)] grid lg:grid-cols-2">
        {/* Login Form Section */}
        <div className="flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 lg:py-0">
          <div className="w-full max-w-md">
            <div className="mb-12">
              <h1 className="text-4xl font-bold text-foreground mb-3">Welcome Back</h1>
              <p className="text-lg text-muted-foreground">Sign in to access your economic identity and opportunities</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6 mb-8">
              <div>
                <label className="block text-sm font-bold text-foreground mb-2">Phone Number</label>
                <Input
                  type="tel"
                  placeholder="08012345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-12 bg-trace-surface border-trace-border"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-bold text-foreground">Password</label>
                  <Link href="#" className="text-sm text-trace-primary hover:underline">Forgot?</Link>
                </div>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
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
                className="w-full h-12 bg-trace-primary hover:bg-trace-primary/90 font-bold text-base"
              >
                {isLoading ? 'Signing in...' : 'Sign In'} <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </form>

            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-trace-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <Button variant="outline" className="h-12 border-trace-border">
                Google
              </Button>
              <Button variant="outline" className="h-12 border-trace-border">
                WhatsApp
              </Button>
            </div>

            <p className="text-center text-muted-foreground">
              Don&apos;t have an account?{' '}
              <Link href="/onboarding" className="text-trace-primary font-bold hover:underline">
                Sign up here
              </Link>
            </p>
          </div>
        </div>

        {/* Right Section - Features */}
        <div className="hidden lg:flex items-center justify-center px-8 py-12 bg-gradient-to-br from-trace-primary/5 to-trace-accent/5">
          <div className="max-w-md">
            <h2 className="text-3xl font-bold text-foreground mb-12">What you can access</h2>
            
            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-trace-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CheckCircle size={24} className="text-trace-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground mb-1">Your Economic Score</h3>
                  <p className="text-muted-foreground text-sm">Track and improve your score across work, trade, and finance</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 bg-trace-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CheckCircle size={24} className="text-trace-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground mb-1">Work Opportunities</h3>
                  <p className="text-muted-foreground text-sm">Access verified gigs and jobs matched to your skills</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 bg-trace-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CheckCircle size={24} className="text-trace-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground mb-1">Financial Products</h3>
                  <p className="text-muted-foreground text-sm">Access credit, savings, and insurance products</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 bg-trace-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CheckCircle size={24} className="text-trace-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground mb-1">Market Intelligence</h3>
                  <p className="text-muted-foreground text-sm">Get insights to grow your business and trade smarter</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
