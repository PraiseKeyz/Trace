import Image from 'next/image'
import Link from 'next/link'
import { WifiOff } from 'lucide-react'

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-6 text-center">
      {/* Logo */}
      <Image
        src="/trace-logo.svg"
        alt="Trace"
        width={72}
        height={72}
        className="mb-8 opacity-90"
      />

      {/* Icon */}
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 border border-white/10 mb-6">
        <WifiOff className="h-8 w-8 text-trace-accent" />
      </div>

      {/* Message */}
      <h1 className="text-2xl font-black text-white mb-3">You're offline</h1>
      <p className="text-slate-400 text-sm leading-relaxed max-w-xs mb-10">
        Connect to the internet to access your Trace dashboard, jobs, and economic identity score.
      </p>

      {/* Retry */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 bg-trace-accent hover:bg-trace-accent/90 text-white font-bold px-6 py-3 rounded-xl text-sm transition-all active:scale-[0.98]"
      >
        Try again
      </Link>

      <p className="text-slate-600 text-xs mt-8">Trace — Economic Identity</p>
    </div>
  )
}
