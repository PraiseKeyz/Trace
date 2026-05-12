'use client'

import React from 'react'
import { MapPin, DollarSign, Zap } from 'lucide-react'

interface OpportunityCardProps {
  id: string
  title: string
  skill: string
  location: string
  payRange: string
  matchPercentage: number
  onClick?: () => void
}

export function OpportunityCard({
  title,
  skill,
  location,
  payRange,
  matchPercentage,
  onClick,
}: OpportunityCardProps) {
  return (
    <div
      onClick={onClick}
      className="rounded-lg border border-trace-border bg-white p-4 transition-all hover:shadow-md sm:p-5 cursor-pointer"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h3 className="font-semibold text-trace-text">{title}</h3>
          <p className="mt-2 text-sm text-gray-600">{skill}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700">
            <Zap className="h-3 w-3" />
            {matchPercentage}%
          </span>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-3 text-sm text-gray-600">
        <div className="flex items-center gap-1">
          <MapPin className="h-4 w-4" />
          <span>{location}</span>
        </div>
        <div className="flex items-center gap-1">
          <DollarSign className="h-4 w-4" />
          <span>{payRange}</span>
        </div>
      </div>
    </div>
  )
}
