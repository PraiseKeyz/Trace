'use client'

import React from 'react'
import { Button } from './ui/button'

interface OnboardingStepProps {
  stepNumber: number
  totalSteps: number
  title: string
  description?: string
  children: React.ReactNode
  onNext: () => void
  onBack?: () => void
  nextDisabled?: boolean
}

export function OnboardingStep({
  stepNumber,
  totalSteps,
  title,
  description,
  children,
  onNext,
  onBack,
  nextDisabled = false,
}: OnboardingStepProps) {
  return (
    <div className="w-full max-w-md space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-trace-text">Step {stepNumber}</span>
          <span className="text-gray-600">{stepNumber}/{totalSteps}</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-trace-light">
          <div
            className="h-full bg-trace-primary transition-all"
            style={{ width: `${(stepNumber / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <div>
        <h2 className="text-2xl font-bold text-trace-text">{title}</h2>
        {description && <p className="mt-2 text-gray-600">{description}</p>}
      </div>

      {/* Form Content */}
      <div>{children}</div>

      {/* Actions */}
      <div className="flex gap-3">
        {onBack && (
          <Button
            variant="outline"
            onClick={onBack}
            className="flex-1"
          >
            Back
          </Button>
        )}
        <Button
          onClick={onNext}
          disabled={nextDisabled}
          className="flex-1 bg-trace-primary hover:bg-trace-primary/90"
        >
          {stepNumber === totalSteps ? 'Complete' : 'Next'}
        </Button>
      </div>
    </div>
  )
}
