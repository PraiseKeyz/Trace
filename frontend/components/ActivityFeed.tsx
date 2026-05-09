'use client'

import React from 'react'
import { LucideIcon } from 'lucide-react'

interface ActivityItem {
  id: string
  icon: LucideIcon
  title: string
  description: string
  timestamp: string
  color?: string
}

interface ActivityFeedProps {
  activities: ActivityItem[]
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <div className="space-y-4">
      {activities.map((activity) => {
        const Icon = activity.icon
        return (
          <div key={activity.id} className="flex gap-3">
            <div
              className={`mt-1 flex h-8 w-8 items-center justify-center rounded-full ${
                activity.color || 'bg-trace-accent/10'
              }`}
            >
              <Icon className={`h-4 w-4 ${activity.color?.replace('bg-', 'text-') || 'text-trace-accent'}`} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-trace-text">{activity.title}</p>
              <p className="text-xs text-gray-600">{activity.description}</p>
              <p className="mt-1 text-xs text-gray-500">{activity.timestamp}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
