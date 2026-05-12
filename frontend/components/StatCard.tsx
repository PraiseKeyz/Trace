'use client'

import React from 'react'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  icon: LucideIcon
  title: string
  value?: string | number
  description?: string
  onClick?: () => void
  className?: string
}

export function StatCard({ 
  icon: Icon, 
  title, 
  value, 
  description,
  onClick,
  className = ''
}: StatCardProps) {
  return (
    <div
      onClick={onClick}
      className={`rounded-lg border border-trace-border bg-white p-6 shadow-sm transition-all hover:shadow-md ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          {value && <p className="mt-2 text-3xl font-bold text-trace-primary">{value}</p>}
          {description && <p className="mt-1 text-xs text-gray-500">{description}</p>}
        </div>
        <Icon className="h-6 w-6 text-trace-accent" />
      </div>
    </div>
  )
}
