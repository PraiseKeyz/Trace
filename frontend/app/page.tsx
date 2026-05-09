'use client'

import Link from 'next/link'
import { motion, Variants } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Briefcase, TrendingUp, PiggyBank, ArrowRight, CheckCircle, Shield, Zap, Users, Award, Clock, ArrowUpRight, Star } from 'lucide-react'

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
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-trace-primary to-[#0a281a] shadow-lg shadow-trace-primary/20 group-hover:scale-105 transition-all duration-300">
              <span className="font-bold text-white text-lg font-mono">T</span>
            </div>
            <div>
              <span className="text-xl font-black text-trace-primary tracking-tight">Trace</span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-trace-primary/50 block -mt-1">Economic Identity</span>
            </div>
          </Link>
          <nav className="hidden md:flex gap-10 items-center">
            {['Why Trace', 'Features', 'Impact'].map((item) => (
              <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`} className="text-sm font-bold text-trace-text/70 hover:text-trace-primary transition-colors relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-0.5 after:bg-trace-accent after:transition-all hover:after:w-full">
                {item}
              </a>
            ))}
          </nav>
          <div className="flex gap-4 items-center">
            <Link href="/login" className="text-sm font-bold text-trace-text hover:text-trace-primary transition-colors">
              Sign In
            </Link>
            <Link href="/onboarding">
              <Button className="bg-trace-primary hover:bg-[#133224] text-white rounded-full px-6 font-bold shadow-lg shadow-trace-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial="hidden" 
            animate="show" 
            variants={staggerContainer}
            className="max-w-2xl"
          >
            <motion.div variants={fadeIn} className="inline-flex items-center gap-2 mb-8 px-4 py-2 bg-white/80 backdrop-blur-md rounded-full border border-white shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-trace-accent animate-pulse"></span>
              <span className="text-xs font-bold text-trace-text uppercase tracking-wider">Trusted by 50K+ Workers</span>
            </motion.div>
            
            <motion.h1 variants={fadeIn} className="text-5xl lg:text-7xl font-black text-trace-text mb-6 leading-[1.1] tracking-tight">
              Your hustle has a <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-trace-primary to-trace-accent">
                footprint.
              </span>
            </motion.h1>
            
            <motion.p variants={fadeIn} className="text-lg text-trace-text/70 mb-10 leading-relaxed font-medium">
              Build your Economic Identity Score and unlock access to verified work opportunities, trade intelligence, and financial products—all designed specifically for African informal traders and gig workers.
            </motion.p>
            
            <motion.div variants={fadeIn} className="flex flex-col sm:flex-row gap-4 mb-10">
              <Link href="/onboarding">
                <Button size="lg" className="bg-trace-primary hover:bg-[#133224] text-white w-full sm:w-auto font-bold text-base rounded-2xl h-14 px-8 shadow-[0_8px_30px_rgb(27,67,50,0.2)] hover:shadow-[0_8px_30px_rgb(27,67,50,0.4)] hover:-translate-y-1 transition-all duration-300">
                  Create Free Account <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <button className="h-14 px-8 rounded-2xl font-bold text-trace-primary bg-white border border-trace-primary/10 hover:border-trace-primary/30 hover:bg-trace-primary/5 shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-center gap-2">
                Watch Demo
              </button>
            </motion.div>

            <motion.div variants={fadeIn} className="flex items-center gap-8">
              <div className="flex -space-x-3">
                {[1,2,3,4].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-trace-surface bg-trace-light flex items-center justify-center text-xs">👨🏾‍t</div>
                ))}
              </div>
              <div className="flex flex-col">
                <div className="flex text-trace-accent">
                  {[1,2,3,4,5].map(i => <Star key={i} size={14} fill="currentColor" />)}
                </div>
                <span className="text-xs font-bold text-trace-text/60 mt-1">4.9/5 from 2,000+ reviews</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Hero Visual */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, rotate: 1 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative lg:h-[600px] flex items-center justify-center"
          >
            {/* Abstract decorations */}
            <div className="absolute top-10 right-10 w-24 h-24 bg-trace-accent/20 rounded-full blur-xl animate-pulse" />
            <div className="absolute bottom-10 left-10 w-32 h-32 bg-trace-primary/20 rounded-full blur-2xl" />

            {/* Main Glass Card */}
            <div className="relative w-full max-w-md bg-white/60 backdrop-blur-2xl rounded-[2.5rem] border border-white p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-2 transition-transform duration-700">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-trace-primary/30 to-transparent opacity-50" />
              
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h3 className="text-sm font-black text-trace-text/50 uppercase tracking-widest">Your Score</h3>
                  <p className="text-xs font-semibold text-trace-text mt-1">Updated just now</p>
                </div>
                <span className="px-4 py-1.5 bg-[#E8F5E9] text-[#2E7D32] rounded-full text-xs font-black tracking-wide border border-[#C8E6C9]">EXCELLENT</span>
              </div>

              <div className="flex flex-col items-center justify-center mb-10 relative">
                <svg className="w-48 h-48 drop-shadow-xl" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(27,67,50,0.1)" strokeWidth="6" />
                  <motion.circle 
                    initial={{ strokeDashoffset: 283 }}
                    animate={{ strokeDashoffset: 73 }} // Represents ~74%
                    transition={{ duration: 1.5, ease: "easeInOut", delay: 0.5 }}
                    cx="50" cy="50" r="45" fill="none" stroke="var(--primary)" strokeWidth="6" strokeDasharray="282.7" strokeLinecap="round" className="origin-center -rotate-90" 
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-black text-trace-primary tracking-tighter">742</span>
                  <span className="text-xs font-bold text-trace-text/50 mt-1 uppercase tracking-widest">Top 15%</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 bg-white rounded-2xl p-4 shadow-sm border border-trace-light">
                {[
                  { label: 'Work', score: '8.5', color: 'text-trace-primary' },
                  { label: 'Trade', score: '7.2', color: 'text-trace-accent' },
                  { label: 'Finance', score: '8.8', color: 'text-[#2E7D32]' }
                ].map((stat, i) => (
                  <div key={i} className="text-center p-2 rounded-xl hover:bg-trace-surface transition-colors cursor-pointer">
                    <p className="text-[10px] font-bold text-trace-text/50 uppercase tracking-wider mb-1">{stat.label}</p>
                    <p className={`text-xl font-black ${stat.color}`}>{stat.score}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-center">
                <Button variant="ghost" className="text-trace-primary font-bold hover:bg-trace-primary/5 rounded-xl w-full">
                  View Full Report <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Why Trace Section */}
      <section id="why-trace" className="relative z-10 py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="text-4xl font-black text-trace-text mb-6">Built for the <span className="text-trace-primary">Real Economy</span></h2>
            <p className="text-lg text-trace-text/70 font-medium">We designed Trace from the ground up to serve African informal workers, gig drivers, traders, and artisans.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Shield, title: 'Privacy First', desc: 'Your data is bank-grade encrypted and strictly yours to control.' },
              { icon: Zap, title: 'Instant Verification', desc: 'Get your economic identity verified in minutes via mobile.' },
              { icon: Award, title: 'Score Builder', desc: 'Every gig and trade helps build your score over time.' },
              { icon: Clock, title: '24/7 Access', desc: 'Opportunities and financial tools available around the clock.' },
              { icon: Users, title: 'Community Trust', desc: 'Leverage peer verification to boost your standing.' },
              { icon: TrendingUp, title: 'Growth Tools', desc: 'Analytics and insights to help you manage your hustle.' },
            ].map((item, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group p-8 rounded-3xl bg-trace-surface hover:bg-white border border-transparent hover:border-trace-primary/10 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-500 cursor-pointer"
              >
                <div className="w-14 h-14 bg-white group-hover:bg-trace-primary rounded-2xl flex items-center justify-center mb-6 shadow-sm transition-colors duration-500">
                  <item.icon className="w-6 h-6 text-trace-primary group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-trace-text mb-3 group-hover:text-trace-primary transition-colors">{item.title}</h3>
                <p className="text-trace-text/70 leading-relaxed text-sm font-medium">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Three Pillars (Features) */}
      <section id="features" className="relative z-10 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl font-black text-trace-text mb-6">Three Pillars of <br/> Economic Power</h2>
            <p className="text-lg text-trace-text/70 font-medium">A complete ecosystem connecting your hard work to tangible financial and career growth.</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Work Pillar */}
            <motion.div 
              whileHover={{ y: -10 }}
              className="group bg-white rounded-[2.5rem] p-8 shadow-sm hover:shadow-xl border border-trace-border/50 transition-all duration-500 flex flex-col"
            >
              <div className="w-16 h-16 rounded-2xl bg-trace-primary/10 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                <Briefcase className="w-8 h-8 text-trace-primary" />
              </div>
              <h3 className="text-2xl font-black text-trace-text mb-4">Work Opportunities</h3>
              <p className="text-trace-text/70 mb-8 flex-1 leading-relaxed font-medium">Find gig work, daily wages, and employment opportunities matched accurately to your skills and location.</p>
              
              <ul className="space-y-4 mb-8">
                {['Verified daily gigs', 'Skill-based matching', 'Instant digital payouts'].map((li, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-bold text-trace-text/80">
                    <CheckCircle className="w-5 h-5 text-trace-primary" /> {li}
                  </li>
                ))}
              </ul>
              
              <Button variant="outline" className="w-full rounded-xl border-trace-primary text-trace-primary hover:bg-trace-primary hover:text-white font-bold h-12">
                Explore Work
              </Button>
            </motion.div>

            {/* Trade Pillar */}
            <motion.div 
              whileHover={{ y: -10 }}
              className="group bg-gradient-to-b from-[#FFFDF9] to-white rounded-[2.5rem] p-8 shadow-sm hover:shadow-xl border border-trace-accent/20 hover:border-trace-accent/50 transition-all duration-500 flex flex-col relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-trace-accent/10 rounded-full blur-3xl" />
              <div className="w-16 h-16 rounded-2xl bg-trace-accent/10 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 relative z-10">
                <TrendingUp className="w-8 h-8 text-trace-accent" />
              </div>
              <h3 className="text-2xl font-black text-trace-text mb-4 relative z-10">Trade Intelligence</h3>
              <p className="text-trace-text/70 mb-8 flex-1 leading-relaxed font-medium relative z-10">Market insights and business intelligence to boost your trading success and grow your local business footprint.</p>
              
              <ul className="space-y-4 mb-8 relative z-10">
                {['Live market pricing', 'Supplier network access', 'Revenue tracking tools'].map((li, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-bold text-trace-text/80">
                    <CheckCircle className="w-5 h-5 text-trace-accent" /> {li}
                  </li>
                ))}
              </ul>
              
              <Button variant="outline" className="w-full rounded-xl border-trace-accent text-trace-accent hover:bg-trace-accent hover:text-white font-bold h-12 relative z-10">
                View Trade Tools
              </Button>
            </motion.div>

            {/* Finance Pillar */}
            <motion.div 
              whileHover={{ y: -10 }}
              className="group bg-white rounded-[2.5rem] p-8 shadow-sm hover:shadow-xl border border-trace-border/50 transition-all duration-500 flex flex-col"
            >
              <div className="w-16 h-16 rounded-2xl bg-[#E8F5E9] flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                <PiggyBank className="w-8 h-8 text-[#2E7D32]" />
              </div>
              <h3 className="text-2xl font-black text-trace-text mb-4">Financial Gateway</h3>
              <p className="text-trace-text/70 mb-8 flex-1 leading-relaxed font-medium">Access bespoke credit products, high-yield savings, and insurance tailored specifically for the informal sector.</p>
              
              <ul className="space-y-4 mb-8">
                {['Score-based micro-loans', 'Auto-savings accounts', 'Asset insurance'].map((li, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-bold text-trace-text/80">
                    <CheckCircle className="w-5 h-5 text-[#2E7D32]" /> {li}
                  </li>
                ))}
              </ul>
              
              <Button variant="outline" className="w-full rounded-xl border-[#2E7D32] text-[#2E7D32] hover:bg-[#2E7D32] hover:text-white font-bold h-12">
                Unlock Finance
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section id="impact" className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-trace-primary" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-trace-primary via-[#0f281e] to-[#0a1a13]" />
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl lg:text-5xl font-black text-white mb-6 leading-tight">Scale Your Impact. <br/><span className="text-trace-accent">Own Your Future.</span></h2>
              <p className="text-xl text-white/70 mb-10 font-medium leading-relaxed">
                We are building the trust layer for the African economy. Join thousands of workers who have transformed their hustle into formal economic power.
              </p>
              
              <Link href="/onboarding">
                <Button className="bg-trace-accent hover:bg-[#e0981d] text-trace-primary font-black text-lg px-8 h-14 rounded-2xl shadow-[0_8px_30px_rgb(244,168,38,0.3)] hover:-translate-y-1 transition-all duration-300">
                  Join the Movement <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              {[
                { number: '50K+', label: 'Active Users' },
                { number: '$2.5M', label: 'Gig Volume' },
                { number: '$850K', label: 'Finance Accessed' },
                { number: '4.9/5', label: 'App Rating' },
              ].map((stat, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/10 text-center"
                >
                  <p className="text-4xl lg:text-5xl font-black text-white mb-2 tracking-tighter">{stat.number}</p>
                  <p className="text-sm font-bold uppercase tracking-wider text-trace-accent">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-trace-border py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
            <div className="lg:col-span-2">
              <Link href="/" className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-trace-primary">
                  <span className="font-bold text-white text-lg font-mono">T</span>
                </div>
                <span className="text-xl font-black text-trace-primary tracking-tight">Trace</span>
              </Link>
              <p className="text-trace-text/60 mb-6 max-w-sm font-medium leading-relaxed">
                Building the definitive economic identity platform for the African informal sector.
              </p>
            </div>
            
            <div>
              <h4 className="font-black text-trace-text mb-6 uppercase tracking-wider text-sm">Product</h4>
              <ul className="space-y-4">
                {['Work', 'Trade', 'Finance', 'Score'].map(link => (
                  <li key={link}><a href="#" className="text-trace-text/60 hover:text-trace-primary font-medium transition-colors">{link}</a></li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-black text-trace-text mb-6 uppercase tracking-wider text-sm">Company</h4>
              <ul className="space-y-4">
                {['About Us', 'Careers', 'Blog', 'Contact'].map(link => (
                  <li key={link}><a href="#" className="text-trace-text/60 hover:text-trace-primary font-medium transition-colors">{link}</a></li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-black text-trace-text mb-6 uppercase tracking-wider text-sm">Legal</h4>
              <ul className="space-y-4">
                {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(link => (
                  <li key={link}><a href="#" className="text-trace-text/60 hover:text-trace-primary font-medium transition-colors">{link}</a></li>
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
              <div className="w-8 h-8 rounded-full bg-trace-surface hover:bg-trace-primary/10 cursor-pointer transition-colors" />
              <div className="w-8 h-8 rounded-full bg-trace-surface hover:bg-trace-primary/10 cursor-pointer transition-colors" />
              <div className="w-8 h-8 rounded-full bg-trace-surface hover:bg-trace-primary/10 cursor-pointer transition-colors" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
