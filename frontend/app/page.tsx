'use client'

import Link from 'next/link'
import { motion, Variants } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Briefcase, TrendingUp, PiggyBank, ArrowRight, CheckCircle, Shield, Zap, Users, Award, Clock, ArrowUpRight, Star } from 'lucide-react'
import Hero from '@/components/Hero'

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
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-all duration-300">
              <span className="font-bold text-white text-lg font-mono">T</span>
            </div>
            <div>
              <span className="text-xl font-black text-slate-950 tracking-tight">Trace</span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-orange-500 block -mt-1">Economic Identity</span>
            </div>
          </Link>
          <nav className="hidden md:flex gap-10 items-center">
            {['Why Trace', 'Features', 'Impact'].map((item) => (
              <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`} className="text-sm font-bold text-slate-700 hover:text-orange-500 transition-colors relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-0.5 after:bg-orange-500 after:transition-all hover:after:w-full">
                {item}
              </a>
            ))}
          </nav>
          <div className="flex gap-4 items-center">
            <Link href="/login" className="text-sm font-bold text-trace-text hover:text-orange-500 transition-colors">
              Sign In
            </Link>
            <Link href="/onboarding">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-6 font-bold shadow-lg shadow-orange-500/20 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section (refactored) */}
      <Hero />

      {/* Why Trace Section */}
      <section id="why-trace" className="relative z-10 py-32 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-20">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-950 mb-6 leading-tight">
              Why we built Trace.
            </h2>
            <p className="text-xl text-slate-700 leading-relaxed font-medium">
              Billions of workers in Africa generate real economic value every day—but the financial system doesn't see them. They're locked out of credit, insurance, and formal opportunities because they lack a verifiable economic identity. We're changing that.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 mb-20">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <h3 className="text-2xl font-bold text-slate-950 mb-3 flex items-center gap-3">
                  <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                    <Shield className="w-6 h-6 text-orange-500" />
                  </motion.div>
                  Bank-grade security, on your terms.
                </h3>
                <p className="text-slate-700 leading-relaxed">
                  Your economic data is encrypted end-to-end. You own your identity. You control who sees it and when. No exploitative middlemen, no data brokers.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <h3 className="text-2xl font-bold text-slate-950 mb-3 flex items-center gap-3">
                  <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                    <Zap className="w-6 h-6 text-orange-500" />
                  </motion.div>
                  Verify instantly. No paperwork.
                </h3>
                <p className="text-slate-700 leading-relaxed">
                  QR codes, digital wallets, and voice verification mean you can prove your hustle in minutes—without office hours or bureaucracy. Mobile-first, always available.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <h3 className="text-2xl font-bold text-slate-950 mb-3 flex items-center gap-3">
                  <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                    <Award className="w-6 h-6 text-orange-500" />
                  </motion.div>
                  Every transaction builds your score.
                </h3>
                <p className="text-slate-700 leading-relaxed">
                  Work completed, trades settled, payments made—it all counts. Your economic footprint becomes a real asset that compounds over time.
                </p>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="space-y-8"
            >
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <h3 className="text-2xl font-bold text-slate-950 mb-3 flex items-center gap-3">
                  <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                    <Clock className="w-6 h-6 text-orange-500" />
                  </motion.div>
                  Always on, always accessible.
                </h3>
                <p className="text-slate-700 leading-relaxed">
                  No closing times. No minimum balance. No gatekeepers deciding if you're "creditworthy enough." Access opportunities and financial products 24/7.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <h3 className="text-2xl font-bold text-slate-950 mb-3 flex items-center gap-3">
                  <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                    <Users className="w-6 h-6 text-orange-500" />
                  </motion.div>
                  Community vouches build trust.
                </h3>
                <p className="text-slate-700 leading-relaxed">
                  Your peers know your work. Peer recommendations and verified reviews create a network effect—trust becomes tradeable capital.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.7 }}
              >
                <h3 className="text-2xl font-bold text-slate-950 mb-3 flex items-center gap-3">
                  <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                    <TrendingUp className="w-6 h-6 text-orange-500" />
                  </motion.div>
                  Tools to grow, not just survive.
                </h3>
                <p className="text-slate-700 leading-relaxed">
                  Real-time analytics, market intelligence, and income tracking help you make smarter decisions and scale your business intentionally.
                </p>
              </motion.div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-orange-50 to-white border border-orange-200 rounded-3xl p-12 text-center"
          >
            <p className="text-lg font-semibold text-slate-950 mb-4">
              The result: Your hustle becomes official. Your hustle becomes bankable. Your hustle becomes your future.
            </p>
            <p className="text-slate-700">
              50,000+ workers are already using Trace to unlock opportunities they never thought possible.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Three Pillars (Features) */}
      <section id="features" className="relative z-10 py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-20">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-950 mb-6 leading-tight">
              Three pillars of economic power.
            </h2>
            <p className="text-xl text-slate-700 leading-relaxed font-medium">
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
                color: 'bg-orange-500',
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
                color: 'bg-orange-500',
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
                color: 'bg-orange-500',
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
                    <h4 className="text-sm font-bold uppercase tracking-wider text-slate-600 mb-1">{col.key === 'work' ? 'The Work Pillar' : col.key === 'trade' ? 'The Trade Pillar' : 'The Finance Pillar'}</h4>
                    <h3 className="text-2xl font-black text-slate-900 mb-2">{col.title}</h3>
                    <p className="text-sm text-slate-700 mb-3">{col.intro}</p>
                    <ul className="space-y-3 text-left">
                      {col.items.map((item, j) => (
                        <motion.li key={j} initial={{ opacity: 0, x: -8 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.12 + j * 0.08 }} className="flex gap-3 items-start">
                          <CheckCircle className="w-5 h-5 text-orange-500 mt-1 flex-shrink-0" />
                          <div>
                            <p className="font-semibold text-slate-900">{item.label}</p>
                            <p className="text-sm text-slate-600">{item.desc}</p>
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
                <Link href="/onboarding">
                  <Button className="bg-trace-accent hover:bg-[#e0981d] text-slate-950 font-black text-lg px-8 h-14 rounded-2xl shadow-[0_8px_30px_rgb(244,168,38,0.3)] hover:-translate-y-1 transition-all duration-300">
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
                  className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/10 hover:border-orange-500/30 transition-colors"
                >
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 3, repeat: Infinity, delay: i * 0.2 }}
                  >
                    <item.icon className="w-8 h-8 text-orange-400 mb-4" />
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
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500">
                  <span className="font-bold text-white text-lg font-mono">T</span>
                </div>
                <span className="text-xl font-black text-slate-950 tracking-tight">Trace</span>
              </Link>
              <p className="text-trace-text/60 mb-6 max-w-sm font-medium leading-relaxed">
                Building the definitive economic identity platform for the African informal sector.
              </p>
            </div>
            
            <div>
              <h4 className="font-black text-trace-text mb-6 uppercase tracking-wider text-sm">Product</h4>
              <ul className="space-y-4">
                {['Work', 'Trade', 'Finance', 'Score'].map(link => (
                  <li key={link}><a href="#" className="text-trace-text/60 hover:text-orange-500 font-medium transition-colors">{link}</a></li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-black text-trace-text mb-6 uppercase tracking-wider text-sm">Company</h4>
              <ul className="space-y-4">
                {['About Us', 'Careers', 'Blog', 'Contact'].map(link => (
                  <li key={link}><a href="#" className="text-trace-text/60 hover:text-orange-500 font-medium transition-colors">{link}</a></li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-black text-trace-text mb-6 uppercase tracking-wider text-sm">Legal</h4>
              <ul className="space-y-4">
                {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(link => (
                  <li key={link}><a href="#" className="text-trace-text/60 hover:text-orange-500 font-medium transition-colors">{link}</a></li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-trace-border flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm font-medium text-trace-text/50">
              &copy; {new Date().getFullYear()} Trace Inc. All rights reserved.
            </p>
            <div className="flex gap-4">
              {/* Social placeholders */}
                <div className="w-8 h-8 rounded-full bg-trace-surface hover:bg-orange-500/10 cursor-pointer transition-colors" />
              <div className="w-8 h-8 rounded-full bg-trace-surface hover:bg-orange-500/10 cursor-pointer transition-colors" />
              <div className="w-8 h-8 rounded-full bg-trace-surface hover:bg-orange-500/10 cursor-pointer transition-colors" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
