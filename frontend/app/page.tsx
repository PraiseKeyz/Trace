'use client'

import Link from 'next/link'
import { motion, Variants } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Briefcase, TrendingUp, PiggyBank, ArrowRight, CheckCircle, Shield, Zap, Users, Award, Clock } from 'lucide-react'
import Hero from '@/components/Hero'
import Image from 'next/image'

export default function LandingPage() {
  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const fadeIn: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  }

  return (
    <div className="min-h-screen bg-trace-surface selection:bg-trace-primary selection:text-white font-sans overflow-hidden">
      
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-trace-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-trace-accent/10 rounded-full blur-[120px]" />
      </div>

      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-[0_4px_30px_rgba(0,0,0,0.03)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
          <Image src="/icon-light-32x32.png" alt="Trace Logo" width={50} height={50} className='pt-[10px]' />
            <div>
              <span className="text-xl font-black text-trace-text tracking-tight">Trace</span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-trace-accent block -mt-1">Economic Identity</span>
            </div>
          </Link>
          <nav className="hidden md:flex gap-10 items-center">
            {['Why Trace', 'Features', 'Impact'].map((item) => (
              <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`} className="text-sm font-bold text-trace-text/65 hover:text-trace-accent transition-colors relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-0.5 after:bg-trace-accent after:transition-all hover:after:w-full">
                {item}
              </a>
            ))}
          </nav>
          <div className="flex gap-4 items-center">
            <Link href="/login" className="text-sm font-bold text-trace-text hover:text-trace-accent transition-colors">
              Sign In
            </Link>
            <Link href="/signup">
              <Button className="bg-trace-accent hover:bg-trace-accent/90 text-white rounded-full px-6 font-bold shadow-lg shadow-trace-accent/20 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section (refactored) */}
      <Hero />

      {/* Why Trace Section */}
      <section id="why-trace" className="relative z-10 py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="max-w-2xl mb-16">
            <p className="text-xs font-bold uppercase tracking-widest text-trace-accent mb-4">
              Why we built Trace
            </p>
            <h2 className="text-4xl sm:text-5xl font-black text-trace-text leading-tight mb-5">
              The system was never<br />built for them.
            </h2>
            <p className="text-lg text-trace-text/45 leading-relaxed">
              Millions of workers across Africa generate real economic value every day — and have nothing to show for it. No credit history. No financial identity. No way in. Trace fixes the data layer that was always missing.
            </p>
          </div>

          {/* 3×2 card grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                icon: Award,
                title: 'Every transaction builds your score',
                body: 'Work completed, trades settled, payments made — it all counts. Your economic footprint becomes a verifiable asset that compounds over time.',
              },
              {
                icon: Users,
                title: 'Your community vouches for you',
                body: 'Peers who have worked alongside you can vouch for your reliability. Verified endorsements carry real weight in your identity score.',
              },
              {
                icon: TrendingUp,
                title: 'Tools to grow, not just survive',
                body: 'Market intelligence, income tracking, and opportunity matching help you make smarter decisions and scale your work intentionally.',
              },
              {
                icon: Shield,
                title: 'You own your data',
                body: 'Your economic data is encrypted and controlled by you. You decide who sees it and when. No middlemen, no data brokers.',
              },
              {
                icon: Zap,
                title: 'No paperwork. No office hours.',
                body: 'Prove your economic activity in minutes through your phone — not through bank statements or paper payslips that most workers don\'t have.',
              },
              {
                icon: Clock,
                title: 'Available when you need it',
                body: 'No closing times. No minimum balance. No gatekeepers. Access opportunities and financial products on your schedule, not the bank\'s.',
              },
            ].map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.07 }}
                className="rounded-2xl border border-slate-200 bg-white p-6"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-trace-accent/10 mb-5">
                  <card.icon className="h-5 w-5 text-trace-accent" />
                </div>
                <h3 className="text-base font-bold text-trace-text mb-2">{card.title}</h3>
                <p className="text-sm text-trace-text/45 leading-relaxed">{card.body}</p>
              </motion.div>
            ))}
          </div>

          {/* Bottom statement */}
          <div className="mt-14 pt-10 border-t border-slate-100">
            <p className="text-trace-text/40 text-sm font-medium max-w-xl">
              Your hustle has always been real.{' '}
              <span className="text-trace-text font-semibold">Now it's verifiable.</span>
            </p>
          </div>

        </div>
      </section>

      {/* Three Pillars (Features) */}
      <section id="features" className="relative z-10 py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-20">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-trace-text mb-6 leading-tight">
              Three pillars of economic power.
            </h2>
            <p className="text-xl text-trace-text/65 leading-relaxed font-medium">
              Trace connects three critical dimensions of the informal economy: access to work, business intelligence, and financial services.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-10">
            {[
              {
                key: 'work',
                icon: Briefcase,
                title: 'From gig to verified employment.',
                intro: 'Browse nearby daily gigs, freelance projects, and formal job opportunities. Trace matches you based on your skills, availability, and location—then handles verification and direct payment to your wallet.',
                items: [
                  { label: 'Verified daily gigs', desc: 'Real work from vetted employers' },
                  { label: 'Skill-based matching', desc: 'AI-powered job recommendations' },
                  { label: 'Instant payouts', desc: 'Funds to your wallet in minutes' },
                ],
                color: 'bg-trace-accent',
                iconColor: 'text-white',
              },
              {
                key: 'trade',
                icon: TrendingUp,
                title: 'Intelligence for traders, by traders.',
                intro: 'Real-time market prices, supplier networks, and competitor intelligence. Track your revenue, forecast demand, and make data-driven decisions.',
                items: [
                  { label: 'Live market pricing', desc: 'Real prices from regional markets' },
                  { label: 'Supplier network', desc: 'Direct access to bulk sellers' },
                  { label: 'Revenue tracking', desc: 'See what sells and when' },
                ],
                color: 'bg-trace-accent',
                iconColor: 'text-white',
              },
              {
                key: 'finance',
                icon: PiggyBank,
                title: 'Financial tools built for you.',
                intro: 'Access credit, savings, and insurance designed for workers and traders without traditional bank accounts.',
                items: [
                  { label: 'Flexible micro-credit', desc: 'Borrow what you need, when you need it' },
                  { label: 'Savings products', desc: 'Grow your money with your economic activity' },
                  { label: 'Comprehensive protection', desc: 'Guard your income, tools, and inventory' },
                ],
                color: 'bg-trace-accent',
                iconColor: 'text-white',
              },
            ].map((col, i) => (
              <motion.div
                key={col.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="relative bg-white rounded-3xl p-8 border border-slate-100 shadow-sm"
              >
                <div className="flex flex-col items-center text-center gap-4">
                  <div className={`p-4 rounded-xl ${col.color} ${col.iconColor} shadow-md backdrop-blur-sm border border-white/10`}> 
                    <col.icon className="w-8 h-8" />
                  </div>

                  <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.12 }} className="w-full">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-trace-text/55 mb-1">{col.key === 'work' ? 'The Work Pillar' : col.key === 'trade' ? 'The Trade Pillar' : 'The Finance Pillar'}</h4>
                    <h3 className="text-2xl font-black text-trace-text mb-2">{col.title}</h3>
                    <p className="text-sm text-trace-text/65 mb-3">{col.intro}</p>
                    <ul className="space-y-3 text-left">
                      {col.items.map((item, j) => (
                        <motion.li key={j} initial={{ opacity: 0, x: -8 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.12 + j * 0.08 }} className="flex gap-3 items-start">
                          <CheckCircle className="w-5 h-5 text-trace-accent mt-1 flex-shrink-0" />
                          <div>
                            <p className="font-semibold text-trace-text">{item.label}</p>
                            <p className="text-sm text-trace-text/55">{item.desc}</p>
                          </div>
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section id="impact" className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-slate-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-slate-900 via-[#0f172a] to-black" />
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" style={{ maskImage: 'radial-gradient(ellipse 60% 50% at 50% 50%, #000 70%, transparent 100%)' }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl lg:text-5xl font-black text-white mb-6 leading-tight">Scale Your Impact. <br/><span className="text-trace-accent">Own Your Future.</span></h2>
              <p className="text-xl text-white/70 mb-10 font-medium leading-relaxed">
                We are building the trust layer for the African economy. Join thousands of workers who have transformed their hustle into formal economic power.
              </p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Link href="/signup">
                  <Button className="bg-trace-accent hover:bg-[#e0981d] text-trace-text font-black text-lg px-8 h-14 rounded-2xl shadow-[0_8px_30px_rgb(244,168,38,0.3)] hover:-translate-y-1 transition-all duration-300">
                    Join the Movement <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="grid grid-cols-2 gap-6"
            >
              {[
                { icon: Users, label: 'Build Your Identity', desc: 'Create your economic record' },
                { icon: TrendingUp, label: 'Access Opportunities', desc: 'Connect with real work' },
                { icon: Shield, label: 'Own Your Data', desc: 'Control your information' },
                { icon: Award, label: 'Unlock Potential', desc: 'Build your future' },
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/10 hover:border-trace-accent/30 transition-colors"
                >
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 3, repeat: Infinity, delay: i * 0.2 }}
                  >
                    <item.icon className="w-8 h-8 text-trace-accent/80 mb-4" />
                  </motion.div>
                  <p className="text-lg font-bold text-white mb-1">{item.label}</p>
                  <p className="text-sm text-white/60">{item.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-trace-border py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
            <div className="lg:col-span-2">
              <Link href="/" className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-trace-accent">
                  <span className="font-bold text-white text-lg font-mono">T</span>
                </div>
                <span className="text-xl font-black text-trace-text tracking-tight">Trace</span>
              </Link>
              <p className="text-trace-text/60 mb-6 max-w-sm font-medium leading-relaxed">
                Building the definitive economic identity platform for the African informal sector.
              </p>
            </div>
            
            <div>
              <h4 className="font-black text-trace-text mb-6 uppercase tracking-wider text-sm">Product</h4>
              <ul className="space-y-4">
                {['Work', 'Trade', 'Finance', 'Score'].map(link => (
                  <li key={link}><a href="#" className="text-trace-text/60 hover:text-trace-accent font-medium transition-colors">{link}</a></li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-black text-trace-text mb-6 uppercase tracking-wider text-sm">Company</h4>
              <ul className="space-y-4">
                {['About Us', 'Careers', 'Blog', 'Contact'].map(link => (
                  <li key={link}><a href="#" className="text-trace-text/60 hover:text-trace-accent font-medium transition-colors">{link}</a></li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-black text-trace-text mb-6 uppercase tracking-wider text-sm">Legal</h4>
              <ul className="space-y-4">
                {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(link => (
                  <li key={link}><a href="#" className="text-trace-text/60 hover:text-trace-accent font-medium transition-colors">{link}</a></li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-trace-border flex flex-col md:flex-row items-center justify-center">
            <p className="text-sm font-medium text-trace-text/50">
              &copy; {new Date().getFullYear()} Trace Africa. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
