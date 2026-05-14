'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowRight, CheckCircle, User, Lock, MapPin, Briefcase, Store, Wallet } from 'lucide-react'
import { useAuth } from '@/context/auth-context'

type OnboardingSection = 'personal' | 'account' | 'location' | 'work' | 'business' | 'finance'

interface OnboardingFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
  confirmPassword: string
  userType: string
  country: string
  state: string
  city: string
  primaryIncome: string
  skills: string[]
  experience: string
  monthlyIncome: string
  paymentMethod: string
  businessName: string
  businessCategory: string
  agreeTerms: boolean
}

export default function OnboardingPage() {
  const { register, completeOnboarding } = useAuth()
  const [formData, setFormData] = useState<OnboardingFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    userType: '',
    country: '',
    state: '',
    city: '',
    primaryIncome: '',
    skills: [],
    experience: '',
    monthlyIncome: '',
    paymentMethod: '',
    businessName: '',
    businessCategory: '',
    agreeTerms: false,
  })

  const [isLoading, setIsLoading] = useState(false)
  const [currentSection, setCurrentSection] = useState<OnboardingSection>('personal')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const sections = [
    { id: 'personal', label: 'Personal', icon: User },
    { id: 'account', label: 'Account', icon: Lock },
    { id: 'location', label: 'Location', icon: MapPin },
    { id: 'work', label: 'Work', icon: Briefcase },
    { id: 'business', label: 'Business', icon: Store },
    { id: 'finance', label: 'Finance', icon: Wallet },
  ] as const

  const updateField = <K extends keyof OnboardingFormData>(name: K, value: OnboardingFormData[K]) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, type } = e.target
    const field = name as keyof OnboardingFormData
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      updateField(field, checked as OnboardingFormData[typeof field])
    } else if (field === 'skills') {
      const skillArray = e.target.value.split(',').map((s: string) => s.trim()).filter((s: string) => s)
      updateField('skills', skillArray)
    } else {
      updateField(field, e.target.value as OnboardingFormData[typeof field])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match')
      return
    }
    setIsLoading(true)
    try {
      await register({
        phone: formData.phone,
        password: formData.password,
      })

      await completeOnboarding({
        fullName: `${formData.firstName} ${formData.lastName}`.trim(),
        state: formData.state,
        city: formData.city,
      })

      localStorage.removeItem('onboardingDraft')
    } catch (error) {
      // Error handled by register function (toast)
    } finally {
      setIsLoading(false)
    }
  }

  // Helpers
  const currentIndex = sections.findIndex(s => s.id === currentSection)
  const percent = Math.round(((currentIndex + 1) / sections.length) * 100)

  const validateSection = (sectionId: string) => {
    const newErrors: Record<string, string> = {}
    if (sectionId === 'personal') {
      if (!formData.firstName) newErrors.firstName = 'First name is required'
      if (!formData.lastName) newErrors.lastName = 'Last name is required'
      if (!formData.phone) newErrors.phone = 'Phone number is required'
      if (!formData.userType) newErrors.userType = 'Please select your role'
    }
    if (sectionId === 'account') {
      if (!formData.email) newErrors.email = 'Email is required'
      if (!formData.password || formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters'
      if (formData.password && !/\d/.test(formData.password)) newErrors.password = 'Password must include a number'
      if (formData.password && !/[^A-Za-z0-9]/.test(formData.password)) newErrors.password = 'Password must include a symbol'
      if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match'
    }
    if (sectionId === 'location') {
      if (!formData.country) newErrors.country = 'Country is required'
      if (!formData.state) newErrors.state = 'State is required'
      if (!formData.city) newErrors.city = 'City is required'
    }
    if (sectionId === 'work') {
      if (!formData.primaryIncome) newErrors.primaryIncome = 'Select your primary income source'
      if (!formData.skills || formData.skills.length === 0) newErrors.skills = 'List at least one skill'
    }
    if (sectionId === 'business') {
      if (!formData.monthlyIncome) newErrors.monthlyIncome = 'Select estimated monthly income'
    }
    if (sectionId === 'finance') {
      if (!formData.paymentMethod) newErrors.paymentMethod = 'Select a payment method'
      if (!formData.agreeTerms) newErrors.agreeTerms = 'You must agree to the terms'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleContinue = () => {
    if (!validateSection(currentSection)) return
    const idx = sections.findIndex(s => s.id === currentSection)
    if (idx < sections.length - 1) setCurrentSection(sections[idx + 1].id)
  }

  // Persist draft to localStorage (omit passwords)
  useEffect(() => {
    try {
      const raw = localStorage.getItem('onboardingDraft')
      if (raw) {
        const parsed = JSON.parse(raw)
        setFormData(prev => ({ ...prev, ...parsed, password: '', confirmPassword: '' }))
      }
    } catch (e) {}
  }, [])

  useEffect(() => {
    try {
      const { password, confirmPassword, ...rest } = formData
      localStorage.setItem('onboardingDraft', JSON.stringify(rest))
    } catch (e) {}
  }, [formData])

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-trace-border sticky top-0 z-40 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <Link href="/" className="flex items-center gap-3 w-fit">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br from-trace-accent to-trace-accent/80">
              <span className="font-bold text-white text-lg">T</span>
            </div>
            <div>
              <span className="text-xl font-bold text-trace-accent block">Trace</span>
              <span className="text-xs text-muted-foreground">Economic Identity</span>
            </div>
          </Link>
        </div>
      </header>

      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          {/* Progress Indicator */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-foreground text-sm">SETUP PROGRESS</h3>
              <p className="text-xs font-medium text-muted-foreground">Step {currentIndex + 1} of {sections.length}</p>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-trace-border rounded-full h-2 mb-8">
              <div
                className="bg-trace-accent h-2 rounded-full transition-all duration-500"
                style={{ width: `${percent}%` }}
              ></div>
            </div>

            {/* Step Indicators */}
            <div className="flex gap-2 justify-center flex-wrap">
              {sections.map((section, idx) => {
                const Icon = section.icon
                const isActive = currentSection === section.id
                const isCompleted = idx < currentIndex
                
                return (
                  <button
                    key={section.id}
                    onClick={() => setCurrentSection(section.id)}
                    className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
                      isActive
                        ? 'bg-trace-accent text-white ring-2 ring-trace-accent/30 ring-offset-2'
                        : isCompleted
                        ? 'bg-trace-accent/20 text-trace-accent'
                        : 'bg-trace-light text-muted-foreground hover:bg-trace-border'
                    }`}
                    title={section.label}
                  >
                    <Icon size={20} />
                  </button>
                )
              })}
            </div>
          </div>

          {/* Form Container */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Section */}
            {currentSection === 'personal' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div>
                  <h2 className="text-3xl font-bold text-foreground mb-2">Tell us about yourself</h2>
                  <p className="text-muted-foreground">We&apos;ll use this to personalize your experience</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-foreground mb-2">First Name</label>
                    <Input
                      type="text"
                      name="firstName"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="h-12 bg-trace-surface border-trace-border"
                      required
                    />
                    {errors.firstName && <p className="text-xs text-red-600 mt-1">{errors.firstName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-foreground mb-2">Last Name</label>
                    <Input
                      type="text"
                      name="lastName"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="h-12 bg-trace-surface border-trace-border"
                      required
                    />
                    {errors.lastName && <p className="text-xs text-red-600 mt-1">{errors.lastName}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-foreground mb-2">Phone Number</label>
                  <Input
                    type="tel"
                    name="phone"
                    placeholder="+234 901 234 5678"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="h-12 bg-trace-surface border-trace-border"
                    required
                  />
                  {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-sm font-bold text-foreground mb-2">Who are you?</label>
                  <select
                    name="userType"
                    value={formData.userType}
                    onChange={handleInputChange}
                    className="w-full h-12 px-4 bg-trace-surface border border-trace-border rounded-lg font-medium text-foreground"
                    required
                  >
                    <option value="">Select your primary role</option>
                    <option value="trader">Trader/Merchant</option>
                    <option value="gig">Gig Worker</option>
                    <option value="both">Both Trader & Gig Worker</option>
                    <option value="freelancer">Freelancer</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.userType && <p className="text-xs text-red-600 mt-1">{errors.userType}</p>}
                </div>
              </div>
            )}

            {/* Account Section */}
            {currentSection === 'account' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div>
                  <h2 className="text-3xl font-bold text-foreground mb-2">Create your account</h2>
                  <p className="text-muted-foreground">Secure your Trace account with a strong password</p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-foreground mb-2">Email Address</label>
                  <Input
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="h-12 bg-trace-surface border-trace-border"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-foreground mb-2">Password</label>
                  <Input
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="h-12 bg-trace-surface border-trace-border"
                    required
                  />
                  {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
                  <p className="text-xs text-muted-foreground mt-2">At least 8 characters with numbers and symbols</p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-foreground mb-2">Confirm Password</label>
                  <Input
                    type="password"
                    name="confirmPassword"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="h-12 bg-trace-surface border-trace-border"
                    required
                  />
                  {errors.confirmPassword && <p className="text-xs text-red-600 mt-1">{errors.confirmPassword}</p>}
                </div>

                <div className="flex items-start gap-3 p-4 bg-trace-accent/5 rounded-lg border border-trace-accent/20">
                  <CheckCircle size={20} className="text-trace-accent shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-trace-accent">Your data is secure</p>
                    <p className="text-xs text-muted-foreground">We encrypt all information and never share without permission</p>
                  </div>
                </div>
              </div>
            )}

            {/* Location Section */}
            {currentSection === 'location' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div>
                  <h2 className="text-3xl font-bold text-foreground mb-2">Where are you based?</h2>
                  <p className="text-muted-foreground">This helps us match you with relevant opportunities</p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-foreground mb-2">Country</label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="w-full h-12 px-4 bg-trace-surface border border-trace-border rounded-lg font-medium text-foreground"
                    required
                  >
                    <option value="">Select your country</option>
                    <option value="ng">Nigeria</option>
                    <option value="gh">Ghana</option>
                    <option value="ke">Kenya</option>
                    <option value="za">South Africa</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.country && <p className="text-xs text-red-600 mt-1">{errors.country}</p>}
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-foreground mb-2">State/Region</label>
                    <Input
                      type="text"
                      name="state"
                      placeholder="e.g., Lagos"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="h-12 bg-trace-surface border-trace-border"
                      required
                    />
                    {errors.state && <p className="text-xs text-red-600 mt-1">{errors.state}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-foreground mb-2">City</label>
                    <Input
                      type="text"
                      name="city"
                      placeholder="e.g., Ikeja"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="h-12 bg-trace-surface border-trace-border"
                      required
                    />
                    {errors.city && <p className="text-xs text-red-600 mt-1">{errors.city}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Work Section */}
            {currentSection === 'work' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div>
                  <h2 className="text-3xl font-bold text-foreground mb-2">Tell us about your work</h2>
                  <p className="text-muted-foreground">This helps us recommend relevant opportunities</p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-foreground mb-2">Primary Income Source</label>
                  <select
                    name="primaryIncome"
                    value={formData.primaryIncome}
                    onChange={handleInputChange}
                    className="w-full h-12 px-4 bg-trace-surface border border-trace-border rounded-lg font-medium text-foreground"
                    required
                  >
                    <option value="">Select primary income source</option>
                    <option value="trading">Trading/Reselling</option>
                    <option value="services">Services</option>
                    <option value="gig">Gig Work</option>
                    <option value="employment">Employment</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.primaryIncome && <p className="text-xs text-red-600 mt-1">{errors.primaryIncome}</p>}
                </div>

                <div>
                  <label className="block text-sm font-bold text-foreground mb-2">Skills (comma-separated)</label>
                  <Input
                    type="text"
                    name="skills"
                    placeholder="e.g., Sales, Marketing, Customer Service"
                    value={formData.skills.join(', ')}
                    onChange={handleInputChange}
                    className="h-12 bg-trace-surface border-trace-border"
                  />
                  {errors.skills && <p className="text-xs text-red-600 mt-1">{errors.skills}</p>}
                </div>

                <div>
                  <label className="block text-sm font-bold text-foreground mb-2">Years of Experience</label>
                  <select
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    className="w-full h-12 px-4 bg-trace-surface border border-trace-border rounded-lg font-medium text-foreground"
                  >
                    <option value="">Select experience level</option>
                    <option value="0-1">Less than 1 year</option>
                    <option value="1-3">1-3 years</option>
                    <option value="3-5">3-5 years</option>
                    <option value="5+">5+ years</option>
                  </select>
                </div>
              </div>
            )}

            {/* Business Section */}
            {currentSection === 'business' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div>
                  <h2 className="text-3xl font-bold text-foreground mb-2">Your business</h2>
                  <p className="text-muted-foreground">Tell us about your trading or business activities</p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-foreground mb-2">Business Name (optional)</label>
                  <Input
                    type="text"
                    name="businessName"
                    placeholder="e.g., John&apos;s Trading Co."
                    value={formData.businessName}
                    onChange={handleInputChange}
                    className="h-12 bg-trace-surface border-trace-border"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-foreground mb-2">Business Category</label>
                  <select
                    name="businessCategory"
                    value={formData.businessCategory}
                    onChange={handleInputChange}
                    className="w-full h-12 px-4 bg-trace-surface border border-trace-border rounded-lg font-medium text-foreground"
                  >
                    <option value="">Select category</option>
                    <option value="retail">Retail/Reselling</option>
                    <option value="food">Food & Beverage</option>
                    <option value="service">Services</option>
                    <option value="craft">Crafts & Handmade</option>
                    <option value="tech">Tech/Digital</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-foreground mb-2">Estimated Monthly Income</label>
                  <select
                    name="monthlyIncome"
                    value={formData.monthlyIncome}
                    onChange={handleInputChange}
                    className="w-full h-12 px-4 bg-trace-surface border border-trace-border rounded-lg font-medium text-foreground"
                    required
                  >
                    <option value="">Select range</option>
                    <option value="0-50k">₦0 - ₦50,000</option>
                    <option value="50-100k">₦50,000 - ₦100,000</option>
                    <option value="100-250k">₦100,000 - ₦250,000</option>
                    <option value="250-500k">₦250,000 - ₦500,000</option>
                    <option value="500k+">₦500,000+</option>
                  </select>
                  {errors.monthlyIncome && <p className="text-xs text-red-600 mt-1">{errors.monthlyIncome}</p>}
                </div>
              </div>
            )}

            {/* Finance Section */}
            {currentSection === 'finance' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div>
                  <h2 className="text-3xl font-bold text-foreground mb-2">Financial information</h2>
                  <p className="text-muted-foreground">This helps us connect you with relevant financial products</p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-foreground mb-2">Preferred Payment Method</label>
                  <select
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleInputChange}
                    className="w-full h-12 px-4 bg-trace-surface border border-trace-border rounded-lg font-medium text-foreground"
                    required
                  >
                    <option value="">Select payment method</option>
                    <option value="bank">Bank Transfer</option>
                    <option value="wallet">Mobile Wallet</option>
                    <option value="ussd">USSD</option>
                    <option value="cash">Cash Pickup</option>
                  </select>
                  {errors.paymentMethod && <p className="text-xs text-red-600 mt-1">{errors.paymentMethod}</p>}
                </div>

                <div className="flex items-start gap-3 p-4 bg-trace-accent/5 rounded-lg border border-trace-accent/20">
                  <input
                    type="checkbox"
                    id="terms"
                    name="agreeTerms"
                    checked={formData.agreeTerms}
                    onChange={handleInputChange}
                    className="rounded border-trace-border mt-1"
                    required
                  />
                  <label htmlFor="terms" className="text-sm text-foreground">
                    I agree to Trace&apos;s{' '}
                    <a href="#" className="text-trace-accent font-bold hover:underline">Terms of Service</a>
                    {' '}and{' '}
                    <a href="#" className="text-trace-accent font-bold hover:underline">Privacy Policy</a>
                  </label>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between gap-4 pt-8">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const currentIndex = sections.findIndex(s => s.id === currentSection)
                  if (currentIndex > 0) {
                    setCurrentSection(sections[currentIndex - 1].id)
                  }
                }}
                disabled={currentSection === 'personal'}
                className="h-12 border-trace-border flex-1"
              >
                Back
              </Button>
              {currentSection !== 'finance' ? (
                <Button
                  type="button"
                  onClick={handleContinue}
                  className="h-12 bg-trace-accent hover:bg-trace-accent/90 font-bold flex-1"
                >
                  Continue <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isLoading || !formData.agreeTerms}
                  className="h-12 bg-trace-accent hover:bg-trace-accent/90 font-bold flex-1"
                >
                  {isLoading ? 'Creating your account...' : 'Complete Setup'} <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              )}
            </div>

            {currentSection === 'finance' && (
              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link href="/login" className="text-trace-accent font-bold hover:underline">Sign in</Link>
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
