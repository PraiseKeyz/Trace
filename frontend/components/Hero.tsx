"use client"

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, CheckCircle2 } from 'lucide-react'

const slides = [
  {
    label: "QR Code Screen — Trader's unique QR code with name and Squad pay button",
    tone: 'from-[#F97316] via-[#FB923C] to-[#C2410C]',
  },
  {
    label: 'Economic Passport — Verified profile showing trust score, transaction volume, skill badges',
    tone: 'from-[#1F2937] via-[#374151] to-[#111827]',
  },
  {
    label: 'Gig Feed — Nearby opportunities matched by skill and location with match percentage',
    tone: 'from-[#EA580C] via-[#F59E0B] to-[#7C2D12]',
  },
  {
    label: 'Escrow Payment — Squad escrow confirmation screen showing funds locked and released',
    tone: 'from-[#0F172A] via-[#1E293B] to-[#334155]',
  },
  {
    label: 'Community Vouches — Vouch network showing connections and trust stakes',
    tone: 'from-[#C2410C] via-[#EA580C] to-[#7C2D12]',
  },
]

export default function Hero() {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length)
    }, 3000)

    return () => window.clearInterval(timer)
  }, [])

  return (
    <section className="relative z-10 mx-auto flex min-h-[calc(100vh-88px)] max-w-7xl items-center px-4 sm:px-6 lg:px-8 py-10 lg:py-12 overflow-hidden">
      <div className="grid w-full items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: 'easeOut' }}
          className="max-w-2xl"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-4 py-2 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-orange-500" />
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Fintech for the real economy</span>
          </div>

          <h1 className="max-w-xl text-5xl leading-[1.02] font-black tracking-tight text-slate-950 sm:text-6xl lg:text-[5.4rem]">
            Your hustle has a footprint.
          </h1>

          <p className="mt-6 text-3xl font-semibold tracking-tight text-orange-500 sm:text-4xl">
            We make it visible.
          </p>

          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-700">
            Trace turns invisible economic activity into a verifiable digital identity — giving traders, gig workers, and job seekers access to the financial services they&apos;ve always deserved.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link href="/onboarding">
              <Button className="h-14 rounded-2xl bg-orange-500 px-7 font-bold text-white shadow-[0_18px_40px_rgba(249,115,22,0.22)] transition hover:bg-orange-600 hover:-translate-y-0.5">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="#why-trace" className="inline-flex items-center">
              <Button variant="outline" className="h-14 rounded-2xl border-slate-300 bg-white px-7 font-bold text-slate-900 transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600">
                See How It Works
              </Button>
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-slate-700">
            {['Squad Powered', 'Verified Identities', 'Zero Bank History Required'].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-orange-500" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="flex h-full items-center justify-center lg:min-h-[680px]"
        >
          <div className="relative w-full max-w-xs">
            <div className="absolute inset-0 -z-10 translate-x-5 translate-y-6 rounded-[2.5rem] bg-black/25 blur-3xl" />
            <div className="relative mx-auto w-full max-w-xs rounded-[2.4rem] border border-white/10 bg-gradient-to-b from-[#111214] to-[#050607] p-2.5 shadow-[0_50px_120px_rgba(2,6,23,0.55)]">
              <div className="absolute left-0 top-28 h-10 w-1.5 rounded-r-full bg-gradient-to-b from-white/20 to-white/5" />
              <div className="absolute left-0 top-40 h-16 w-1.5 rounded-r-full bg-gradient-to-b from-white/20 to-white/5" />
              <div className="absolute right-0 top-32 h-20 w-1.5 rounded-l-full bg-gradient-to-b from-white/20 to-white/5" />

              <div className="relative overflow-hidden rounded-[2.55rem] bg-[#050608] p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                <div className="absolute left-1/2 top-2.5 z-20 h-8 w-36 -translate-x-1/2 rounded-full bg-black shadow-[0_8px_24px_rgba(0,0,0,0.55)]" />

                <div className="relative overflow-hidden rounded-[2.1rem] bg-black">
                  <div className="absolute inset-x-0 top-0 z-10 flex justify-center pt-2.5">
                    <div className="h-8 w-36 rounded-full bg-black shadow-[0_0_0_1px_rgba(255,255,255,0.04)]" />
                  </div>

                  <div className="relative min-h-130 overflow-hidden rounded-[2.1rem] bg-black pt-14">
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.div
                        key={activeIndex}
                        initial={{ opacity: 0, x: 28 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -28 }}
                        transition={{ duration: 0.45, ease: 'easeInOut' }}
                        className="absolute inset-0 p-3"
                      >
                        <div className={`flex h-full items-center justify-center rounded-[1.8rem] bg-gradient-to-br ${slides[activeIndex].tone} p-6 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]`}>
                          <p className="max-w-[18ch] text-[1.6rem] font-semibold leading-tight text-white sm:text-[1.85rem]">
                            {slides[activeIndex].label}
                          </p>
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex justify-center gap-2.5">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    aria-label={`Go to slide ${index + 1}`}
                    className={`h-2.5 rounded-full transition-all duration-300 ${index === activeIndex ? 'w-7 bg-orange-500' : 'w-2.5 bg-slate-400/50 hover:bg-slate-200/70'}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
