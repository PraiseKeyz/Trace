'use client'

import React, { useState } from 'react'

import { FinanceProductCard } from '@/components/FinanceProductCard'
import { ScoreBreakdown } from '@/components/ScoreBreakdown'
import { Button } from '@/components/ui/button'
import {
  Wallet,
  TrendingUp,
  Shield,
  ArrowUp,
  Zap,
  BarChart3,
  LucideIcon,
} from 'lucide-react'

interface FinanceProduct {
  id: string
  icon: LucideIcon
  title: string
  description: string
  minScore: number
  eligible: boolean
}

const FINANCE_PRODUCTS: FinanceProduct[] = [
  {
    id: '1',
    icon: Wallet,
    title: 'Micro-Loan',
    description: 'Flexible loans from ₦50,000 to ₦500,000 for business expansion',
    minScore: 50,
    eligible: true,
  },
  {
    id: '2',
    icon: TrendingUp,
    title: 'Savings Plan',
    description: 'Build emergency funds with competitive returns and flexibility',
    minScore: 40,
    eligible: true,
  },
  {
    id: '3',
    icon: Shield,
    title: 'Business Insurance',
    description: 'Protect your business with affordable coverage options',
    minScore: 60,
    eligible: false,
  },
]

const scoreComponents = [
  { label: 'Work History', percentage: 25, color: 'bg-trace-primary' },
  { label: 'Financial Activity', percentage: 20, color: 'bg-trace-accent' },
  { label: 'Reliability', percentage: 15, color: 'bg-green-500' },
  { label: 'Profile Completeness', percentage: 8, color: 'bg-trace-accent' },
]

export default function FinanceGatewayPage() {
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null)
  const currentScore = 68

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-trace-primary mb-2">
          Finance Gateway
        </h1>
        <p className="text-gray-600">
          Access financial products designed for informal workers and traders
        </p>
      </div>

      {/* Credit Score Overview */}
      <div className="mb-8 rounded-2xl border border-trace-border bg-gradient-to-br from-trace-primary/5 to-trace-accent/5 p-8">
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold text-trace-primary mb-4">
              Your Credit Position
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">Economic Identity Score</p>
                <div className="flex items-end gap-2">
                  <span className="text-5xl font-bold text-trace-primary">{currentScore}</span>
                  <span className="text-gray-600 mb-1">/ 100</span>
                </div>
              </div>
              <div className="pt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Progress to next tier</p>
                <div className="h-3 w-full rounded-full bg-gray-200 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-trace-accent to-trace-primary transition-all"
                    style={{ width: `${(currentScore / 75) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-gray-600 mt-2">7 more points to reach Professional tier</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between">
            <div>
              <h3 className="font-semibold text-trace-text mb-3">Available Products</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                {FINANCE_PRODUCTS.filter((p) => p.eligible).map((product) => (
                  <li key={product.id} className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-500" />
                    {product.title}
                  </li>
                ))}
              </ul>
            </div>
            <Button className="bg-trace-primary hover:bg-trace-primary/90">
              <ArrowUp className="mr-2 h-4 w-4" />
              Improve Score
            </Button>
          </div>
        </div>
      </div>

      {/* Financial Products */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-trace-text mb-6">Financial Products</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {FINANCE_PRODUCTS.map((product) => (
            <div
              key={product.id}
              onClick={() => setSelectedProduct(product.id)}
              className={`transition-all cursor-pointer ${
                selectedProduct === product.id ? 'ring-2 ring-offset-2 ring-trace-primary' : ''
              }`}
            >
              <FinanceProductCard {...product} />
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* How to Improve Score - Left Column */}
        <div className="lg:col-span-2 space-y-8">
          <ScoreBreakdown components={scoreComponents} title="What Impacts Your Credit Score" />

          {/* Actionable Tips */}
          <div className="rounded-lg border border-trace-border bg-white p-6">
            <h3 className="text-lg font-semibold text-trace-primary mb-6 flex items-center gap-2">
              <Zap className="h-5 w-5 text-trace-accent" />
              Ways to Improve Your Score
            </h3>
            <div className="space-y-4">
              {[
                {
                  action: 'Complete more work',
                  impact: 'Increases Work History score',
                  timeline: '30+ days',
                  points: '+5-10',
                },
                {
                  action: 'Use savings product',
                  impact: 'Shows financial responsibility',
                  timeline: 'Within 90 days',
                  points: '+8-15',
                },
                {
                  action: 'Maintain reliability',
                  impact: 'Get positive ratings',
                  timeline: 'Ongoing',
                  points: '+3-5/month',
                },
                {
                  action: 'Complete profile info',
                  impact: 'Improves verification',
                  timeline: 'Immediate',
                  points: '+2-3',
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-trace-light bg-gradient-to-r from-trace-surface to-transparent p-4"
                >
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <p className="font-semibold text-trace-text">{item.action}</p>
                      <p className="text-sm text-gray-600">{item.impact}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-trace-accent">{item.points}</p>
                      <p className="text-xs text-gray-600">{item.timeline}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Product Details - Right Column */}
        {selectedProduct && (
          <div className="rounded-lg border border-trace-border bg-white p-6 h-fit sticky top-8">
            {(() => {
              const product = FINANCE_PRODUCTS.find((p) => p.id === selectedProduct)
              const Icon = product?.icon
              return (
                product && (
                  <>
                    <div className="flex items-start gap-4 mb-6">
                      {Icon && (
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-trace-primary/10">
                          <Icon className="h-6 w-6 text-trace-primary" />
                        </div>
                      )}
                      <div>
                        <h3 className="text-lg font-bold text-trace-text">{product.title}</h3>
                        <p className="text-sm text-gray-600">{product.description}</p>
                      </div>
                    </div>

                    <div className="space-y-4 mb-6 pb-6 border-b border-trace-border">
                      <div>
                        <p className="text-xs font-medium text-gray-600 mb-1">ELIGIBILITY</p>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
                            <div
                              className={`h-full ${
                                currentScore >= product.minScore
                                  ? 'bg-green-500'
                                  : 'bg-yellow-500'
                              }`}
                              style={{
                                width: `${(currentScore / 100) * 100}%`,
                              }}
                            />
                          </div>
                          <span className="text-xs font-semibold">{currentScore}/{product.minScore}</span>
                        </div>
                        {currentScore >= product.minScore ? (
                          <p className="text-xs text-green-600 mt-1">✓ You're eligible!</p>
                        ) : (
                          <p className="text-xs text-yellow-600 mt-1">
                            Need {product.minScore - currentScore} more points
                          </p>
                        )}
                      </div>
                    </div>

                    <Button
                      className="w-full bg-trace-primary hover:bg-trace-primary/90"
                      disabled={!product.eligible}
                    >
                      {product.eligible ? 'Apply Now' : 'Unlock Product'}
                    </Button>
                  </>
                )
              )
            })()}
          </div>
        )}
      </div>
    </div>
  )
}

