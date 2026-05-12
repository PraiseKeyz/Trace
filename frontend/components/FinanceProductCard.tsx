'use client'

import React from 'react'
import { LucideIcon, CheckCircle, Lock } from 'lucide-react'

interface FinanceProductCardProps {
  icon: LucideIcon
  title: string
  description: string
  minScore: number
  eligible: boolean
  onClick?: () => void
}

export function FinanceProductCard({
  icon: Icon,
  title,
  description,
  minScore,
  eligible,
  onClick,
}: FinanceProductCardProps) {
  return (
    <div
      onClick={onClick}
      className={`rounded-lg border p-6 transition-all ${
        eligible
          ? 'border-trace-accent bg-white hover:shadow-md cursor-pointer'
          : 'border-trace-light bg-gray-50 cursor-not-allowed'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <Icon className={`h-8 w-8 ${eligible ? 'text-trace-accent' : 'text-gray-400'}`} />
          <h3 className={`mt-3 font-semibold ${eligible ? 'text-trace-text' : 'text-gray-600'}`}>
            {title}
          </h3>
          <p className={`mt-2 text-sm ${eligible ? 'text-gray-600' : 'text-gray-500'}`}>
            {description}
          </p>
          <p className={`mt-3 text-xs ${eligible ? 'text-gray-600' : 'text-gray-500'}`}>
            Min score: <span className="font-semibold">{minScore}</span>
          </p>
        </div>
        <div>
          {eligible ? (
            <CheckCircle className="h-6 w-6 text-green-600" />
          ) : (
            <Lock className="h-6 w-6 text-gray-400" />
          )}
        </div>
      </div>
      {!eligible && (
        <p className="mt-4 text-xs font-medium text-gray-600">
          Improve your score to unlock
        </p>
      )}
    </div>
  )
}
