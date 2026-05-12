'use client'

import React from 'react'

interface ScoreComponent {
  label: string
  percentage: number
  color: string
}

interface ScoreBreakdownProps {
  components: ScoreComponent[]
  title?: string
}

export function ScoreBreakdown({ components, title = 'Score Breakdown' }: ScoreBreakdownProps) {
  return (
    <div className="rounded-lg border border-trace-border bg-white p-6">
      <h3 className="mb-4 text-lg font-semibold text-trace-text">{title}</h3>
      <div className="space-y-4">
        {components.map((component, index) => (
          <div key={index}>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-700">{component.label}</span>
              <span className="font-semibold text-trace-text">{component.percentage}%</span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className={`h-full ${component.color}`}
                style={{ width: `${component.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
