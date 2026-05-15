import React from 'react'

interface TraceLogoProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string
  className?: string
}

export const TraceLogo = ({ size = 40, className = '', ...props }: TraceLogoProps) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Premium Gradient Background Plate */}
      <rect width="100" height="100" rx="22" fill="url(#trace-bg)" />
      
      {/* Ambient Backlight Trace (Represents historical data / history) */}
      <path 
        d="M20 50 L50 20 L80 50 M50 20 V80" 
        stroke="white" 
        strokeOpacity="0.2"
        strokeWidth="8" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />

      {/* Main Foreground T-Shape (Represents 'Trace' and current economic standing) */}
      <path 
        d="M32 38 H68 M50 38 V72" 
        stroke="white" 
        strokeWidth="12" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />

      {/* Economic Nodes (The network of the user) */}
      <circle cx="32" cy="38" r="6" fill="white" />
      <circle cx="68" cy="38" r="6" fill="white" />
      <circle cx="50" cy="72" r="6" fill="white" />
      
      {/* The Core Identity Node (Center) */}
      <circle cx="50" cy="38" r="4" fill="#ea580c" />

      <defs>
        <linearGradient id="trace-bg" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--color-trace-accent, #F97316)" />
          <stop offset="1" stopColor="#9A3412" />
        </linearGradient>
      </defs>
    </svg>
  )
}
