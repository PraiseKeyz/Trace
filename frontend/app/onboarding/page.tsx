'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowRight, CheckCircle } from 'lucide-react'
import { useAuth } from '@/context/auth-context'

export default function OnboardingPage() {
  const { register } = useAuth()
  const [formData, setFormData] = useState({
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
    skills: [] as string[],
    experience: '',
    monthlyIncome: '',
    paymentMethod: '',
    businessName: '',
    businessCategory: '',
    agreeTerms: false,
  })

  const [isLoading, setIsLoading] = useState(false)
  const [currentSection, setCurrentSection] = useState<'personal' | 'account' | 'location' | 'work' | 'business' | 'finance'>('personal')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as any
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked
      }))
    } else if (name === 'skills') {
      const skillArray = (value as string).split(',').map((s: string) => s.trim()).filter((s: string) => s)
      setFormData(prev => ({
        ...prev,
        skills: skillArray
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
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
        fullName: `${formData.firstName} ${formData.lastName}`.trim(),
        phone: formData.phone,
        email: formData.email,
        password: formData.password,
      })
    } catch (error) {
      // Error handled by register function (toast)
    } finally {
      setIsLoading(false)
    }
  }

  const sections = [
    { id: 'personal', label: 'Personal', icon: '👤' },
    { id: 'account', label: 'Account', icon: '🔐' },
    { id: 'location', label: 'Location', icon: '📍' },
    { id: 'work', label: 'Work', icon: '💼' },
    { id: 'business', label: 'Business', icon: '🏪' },
    { id: 'finance', label: 'Finance', icon: '💰' },
  ] as const

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-trace-border sticky top-0 z-40 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Progress Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <h3 className="font-bold text-foreground mb-6 text-sm">SETUP PROGRESS</h3>
              <div className="space-y-3">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setCurrentSection(section.id as any)}
                    className={`w-full text-left px-4 py-3 rounded-lg font-medium transition flex items-center gap-3 ${
                      currentSection === section.id
                        ? 'bg-trace-primary text-white'
                        : 'bg-trace-surface text-foreground hover:bg-trace-border'
                    }`}
                  >
                    <span>{section.icon}</span>
                    <span className="text-sm">{section.label}</span>
                  </button>
                ))}
              </div>
              <div className="mt-8 p-4 bg-trace-primary/5 rounded-lg border border-trace-primary/20">
                <p className="text-xs font-bold text-trace-primary mb-2">COMPLETION</p>
                <div className="w-full bg-trace-border rounded-full h-2">
                  <div
                    className="bg-trace-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(sections.indexOf(sections.find(s => s.id === currentSection) as any) + 1) * 16.67}%` }}
                  ></div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">{Math.round((sections.indexOf(sections.find(s => s.id === currentSection) as any) + 1) * 16.67)}% Complete</p>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Personal Section */}
              {currentSection === 'personal' && (
                <div className="space-y-6">
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
                  </div>
                </div>
              )}

              {/* Account Section */}
              {currentSection === 'account' && (
                <div className="space-y-6">
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
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                    <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-900">Your data is secure</p>
                      <p className="text-xs text-green-700">We encrypt all information and never share without permission</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Location Section */}
              {currentSection === 'location' && (
                <div className="space-y-6">
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
                      <option value="">Select country</option>
                      <option value="Nigeria">Nigeria</option>
                      <option value="Kenya">Kenya</option>
                      <option value="Ghana">Ghana</option>
                      <option value="Uganda">Uganda</option>
                      <option value="Tanzania">Tanzania</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-foreground mb-2">State/Province</label>
                    <Input
                      type="text"
                      name="state"
                      placeholder="e.g., Lagos"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="h-12 bg-trace-surface border-trace-border"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-foreground mb-2">City</label>
                    <Input
                      type="text"
                      name="city"
                      placeholder="e.g., Victoria Island"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="h-12 bg-trace-surface border-trace-border"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Work Section */}
              {currentSection === 'work' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-3xl font-bold text-foreground mb-2">Your work experience</h2>
                    <p className="text-muted-foreground">Help us understand your background and expertise</p>
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
                      <option value="">Select source</option>
                      <option value="self">Self-employed</option>
                      <option value="gig">Gig work</option>
                      <option value="salary">Salary/Employment</option>
                      <option value="mixed">Multiple sources</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-foreground mb-2">Your Skills (comma-separated)</label>
                    <textarea
                      name="skills"
                      placeholder="e.g., Digital marketing, Video editing, Content creation"
                      value={formData.skills.join(', ')}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-trace-surface border border-trace-border rounded-lg font-medium text-foreground min-h-24 resize-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-foreground mb-2">Years of Experience</label>
                    <select
                      name="experience"
                      value={formData.experience}
                      onChange={handleInputChange}
                      className="w-full h-12 px-4 bg-trace-surface border border-trace-border rounded-lg font-medium text-foreground"
                      required
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
                <div className="space-y-6">
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
                  </div>
                </div>
              )}

              {/* Finance Section */}
              {currentSection === 'finance' && (
                <div className="space-y-6">
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
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-trace-primary/5 rounded-lg border border-trace-primary/20">
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
                      <a href="#" className="text-trace-primary font-bold hover:underline">Terms of Service</a>
                      {' '}and{' '}
                      <a href="#" className="text-trace-primary font-bold hover:underline">Privacy Policy</a>
                    </label>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading || !formData.agreeTerms}
                    className="w-full h-12 bg-trace-primary hover:bg-trace-primary/90 font-bold text-base"
                  >
                    {isLoading ? 'Creating your account...' : 'Complete Setup'} <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>

                  <p className="text-center text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <Link href="/login" className="text-trace-primary font-bold hover:underline">Sign in</Link>
                  </p>
                </div>
              )}

              {/* Navigation Buttons */}
              {currentSection !== 'finance' && (
                <div className="flex justify-between pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const currentIndex = sections.findIndex(s => s.id === currentSection)
                      if (currentIndex > 0) {
                        setCurrentSection(sections[currentIndex - 1].id as any)
                      }
                    }}
                    disabled={currentSection === 'personal'}
                    className="h-12 border-trace-border"
                  >
                    Back
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      const currentIndex = sections.findIndex(s => s.id === currentSection)
                      if (currentIndex < sections.length - 1) {
                        setCurrentSection(sections[currentIndex + 1].id as any)
                      }
                    }}
                    className="h-12 bg-trace-primary hover:bg-trace-primary/90 font-bold"
                  >
                    Continue <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
