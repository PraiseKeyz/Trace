'use client'

import React from 'react'
import { X, AlertCircle, CheckCircle, Info, TrendingUp } from 'lucide-react'

type NotificationType = 'success' | 'warning' | 'info' | 'score-update'

interface NotificationBannerProps {
  type: NotificationType
  title: string
  message: string
  onClose?: () => void
  autoClose?: boolean
  autoCloseDuration?: number
}

const typeConfig = {
  success: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    title: 'text-green-900',
    message: 'text-green-800',
    icon: CheckCircle,
    iconColor: 'text-green-600',
  },
  warning: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    title: 'text-yellow-900',
    message: 'text-yellow-800',
    icon: AlertCircle,
    iconColor: 'text-yellow-600',
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    title: 'text-blue-900',
    message: 'text-blue-800',
    icon: Info,
    iconColor: 'text-blue-600',
  },
  'score-update': {
    bg: 'bg-trace-accent/10',
    border: 'border-trace-accent/30',
    title: 'text-trace-primary',
    message: 'text-trace-primary/80',
    icon: TrendingUp,
    iconColor: 'text-trace-accent',
  },
}

export function NotificationBanner({
  type,
  title,
  message,
  onClose,
  autoClose = true,
  autoCloseDuration = 5000,
}: NotificationBannerProps) {
  const [isVisible, setIsVisible] = React.useState(true)

  React.useEffect(() => {
    if (autoClose && isVisible) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        onClose?.()
      }, autoCloseDuration)
      return () => clearTimeout(timer)
    }
  }, [autoClose, autoCloseDuration, isVisible, onClose])

  if (!isVisible) return null

  const config = typeConfig[type]
  const Icon = config.icon

  return (
    <div
      className={`rounded-lg border ${config.bg} ${config.border} p-4 ${config.message}`}
    >
      <div className="flex items-start gap-3">
        <Icon className={`mt-0.5 h-5 w-5 flex-shrink-0 ${config.iconColor}`} />
        <div className="flex-1">
          <h3 className={`font-semibold ${config.title}`}>{title}</h3>
          <p className="mt-1 text-sm">{message}</p>
        </div>
        {onClose && (
          <button
            onClick={() => {
              setIsVisible(false)
              onClose()
            }}
            className="flex-shrink-0 text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  )
}
