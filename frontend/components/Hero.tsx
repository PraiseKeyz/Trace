"use client"

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, CheckCircle2 } from 'lucide-react'

export default function Hero() {
  return (
    <section className="relative z-10 min-h-[calc(100vh-88px)] overflow-hidden bg-trace-surface">

      {/* ── BACKGROUND IMAGE — drop your image at: public/hero-bg.jpg ──────── */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/hero-bg.jpg"
          alt=""
          fill
          className="object-cover object-center"
          priority
        />
        {/* light overlay so text stays readable */}
        <div className="absolute inset-0 bg-white/80" />
      </div>

      {/* ── Content ──────────────────────────────────────────────────────────── */}
      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-88px)] max-w-7xl items-center px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid w-full items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">

          {/* Left — copy (unchanged) */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: 'easeOut' }}
            className="max-w-2xl"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-trace-accent/20 bg-white px-4 py-2 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-trace-accent" />
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                Fintech for the real economy
              </span>
            </div>

            <h1 className="max-w-xl text-5xl font-black leading-[1.02] tracking-tight text-slate-950 sm:text-6xl lg:text-[5.4rem]">
              Your hustle has a footprint.
            </h1>

            <p className="mt-6 text-3xl font-semibold tracking-tight text-trace-accent sm:text-4xl">
              We make it visible.
            </p>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-700">
              Trace turns invisible economic activity into a verifiable digital identity — giving
              traders, gig workers, and job seekers access to the financial services they&apos;ve
              always deserved.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link href="/onboarding">
                <Button className="h-14 rounded-2xl bg-trace-accent px-7 font-bold text-white shadow-[0_18px_40px_rgba(249,115,22,0.22)] transition hover:bg-trace-accent/90 hover:-translate-y-0.5">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="#why-trace">
                <Button
                  variant="outline"
                  className="h-14 rounded-2xl border-slate-300 bg-white px-7 font-bold text-slate-900 transition hover:border-trace-accent/40 hover:bg-trace-accent/5 hover:text-trace-accent/90"
                >
                  See How It Works
                </Button>
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-slate-700">
              {['Squad Powered', 'Verified Identities', 'Zero Bank History Required'].map(item => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-trace-accent" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right — DASHBOARD SCREENSHOT */}
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
            className="flex items-center justify-center"
          >
            <div className="relative w-full max-w-[420px]">
              {/* soft shadow behind */}
              <div className="absolute inset-0 -z-10 translate-x-4 translate-y-6 rounded-3xl bg-black/15 blur-3xl" />

              {/* image frame */}
                <Image
                  src="/dashboard-preview.png"
                  alt="Trace dashboard preview"
                  width={0}
                  height={0}
                  sizes="(max-width: 768px) 100vw, 420px"
                  className="w-full h-auto"
                  priority
                />
              </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
