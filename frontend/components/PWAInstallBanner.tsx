'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Download, X, Share2 } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const DISMISSED_KEY = 'trace-pwa-dismissed'

export function PWAInstallBanner() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [show, setShow]     = useState(false)
  const [isIOS, setIsIOS]   = useState(false)

  useEffect(() => {
    // Already running as installed PWA
    if (window.matchMedia('(display-mode: standalone)').matches) return
    // User already dismissed
    if (localStorage.getItem(DISMISSED_KEY)) return

    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent.toLowerCase())
    setIsIOS(ios)

    if (ios) {
      // iOS has no install event — just show the manual instructions
      setShow(true)
      return
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setPrompt(e as BeforeInstallPromptEvent)
      setShow(true)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  function dismiss() {
    localStorage.setItem(DISMISSED_KEY, '1')
    setShow(false)
  }

  async function install() {
    if (!prompt) return
    await prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') setShow(false)
    setPrompt(null)
  }

  if (!show) return null

  return (
    <div className="fixed bottom-[4.5rem] lg:bottom-6 left-3 right-3 z-50 mx-auto max-w-sm animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-slate-950 border border-white/10 rounded-2xl shadow-2xl px-4 py-3.5 flex items-center gap-3">

        {/* Logo */}
        <Image
          src="/trace-logo.svg"
          alt="Trace"
          width={40}
          height={40}
          className="rounded-xl flex-shrink-0"
        />

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-bold leading-tight">
            Install Trace
          </p>
          {isIOS ? (
            <p className="text-slate-400 text-xs mt-0.5 leading-snug">
              Tap <Share2 className="inline h-3 w-3 mx-0.5" /> then{' '}
              <span className="text-white font-semibold">"Add to Home Screen"</span>
            </p>
          ) : (
            <p className="text-slate-400 text-xs mt-0.5">
              Get the full app experience — works offline too
            </p>
          )}
        </div>

        {/* Install button — Android/Chrome only */}
        {!isIOS && (
          <button
            onClick={install}
            className="flex-shrink-0 flex items-center gap-1.5 bg-trace-accent hover:bg-trace-accent/90 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all active:scale-95"
          >
            <Download size={13} />
            Install
          </button>
        )}

        {/* Dismiss */}
        <button
          onClick={dismiss}
          className="flex-shrink-0 p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Dismiss"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  )
}
