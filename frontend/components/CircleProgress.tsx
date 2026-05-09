'use client'

import React from 'react'

interface CircleProgressProps {
  score: number // 0-100
  size?: number // diameter in pixels
  label?: string
}

export function CircleProgress({ score, size = 200, label }: CircleProgressProps) {
  const radius = (size - 12) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (score / 100) * circumference

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#E8E4DC"
            strokeWidth="8"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#1B4332"
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 0.5s ease',
            }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-trace-primary">{score}</span>
          <span className="text-sm text-gray-600">/ 100</span>
        </div>
      </div>
      {label && <p className="text-center text-sm font-medium text-gray-700">{label}</p>}
    </div>
  )
}
