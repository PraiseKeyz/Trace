'use client'

import Link from 'next/link'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { Button } from '@/components/ui/button'
import {
  Briefcase,
  TrendingUp,
  PiggyBank,
  Clock,
  CheckCircle,
  Award,
  ArrowRight,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { useState } from 'react'

export default function DashboardPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const economicScore = 742
  
  const scoreData = [
    { month: 'Jan', score: 620 },
    { month: 'Feb', score: 650 },
    { month: 'Mar', score: 680 },
    { month: 'Apr', score: 710 },
    { month: 'May', score: 742 },
  ]

  const opportData = [
    { name: 'Work', value: 28 },
    { name: 'Trade', value: 15 },
    { name: 'Finance', value: 12 },
  ]

  const activities = [
    { icon: '✓', title: 'Completed Trade', desc: '₦15,000 from retail sale', time: '2 hours ago', color: 'bg-green-100' },
    { icon: '💰', title: 'Loan Approved', desc: '₦50,000 credit limit', time: '1 day ago', color: 'bg-blue-100' },
    { icon: '🎯', title: 'Job Completed', desc: 'Digital marketing task', time: '3 days ago', color: 'bg-trace-accent/10' },
  ]

  return (
    <div className="space-y-6">
      {/* Score Banner */}
      <div className="bg-gradient-to-r from-trace-primary to-trace-primary/80 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between gap-8">
          <div className="flex-1">
            <p className="text-white/80 text-xs font-medium uppercase tracking-wider mb-1">Economic Identity Score</p>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-4xl font-bold">{economicScore}</span>
              <span className="text-white/60 text-sm">/ 1000</span>
            </div>
            <p className="text-white/90 text-sm mb-4">Professional Tier • 95 points to Elite</p>
            <div className="max-w-xs">
              <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden mb-2">
                <div className="bg-trace-accent h-full shadow-[0_0_8px_rgba(244,168,38,0.5)]" style={{ width: '88%' }}></div>
              </div>
              <p className="text-[10px] text-white/70">88% of current tier completed</p>
            </div>
          </div>
          <div className="hidden sm:block">
            <button className="px-5 py-2 bg-white text-trace-primary rounded-lg text-sm font-bold shadow-lg hover:bg-slate-50 transition-all active:scale-95">
              View Analytics →
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: '💼', label: 'Work Opportunities', value: '28', color: 'bg-trace-primary/10' },
          { icon: '💰', label: 'Finance Products', value: '12', color: 'bg-trace-accent/10' },
          { icon: '📈', label: 'This Month Income', value: '₦125K', color: 'bg-green-100' },
          { icon: '⭐', label: 'Your Rating', value: '4.8/5', color: 'bg-blue-100' },
        ].map((stat) => (
          <div key={stat.label} className={`${stat.color} rounded-lg p-6`}>
            <p className="text-3xl mb-2">{stat.icon}</p>
            <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Charts & Quick Actions */}
        <div className="lg:col-span-2 space-y-8">
          {/* Score Trend */}
          <div className="bg-white rounded-lg p-6 border border-trace-border">
            <h3 className="text-lg font-bold text-foreground mb-6">Score Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={scoreData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8E4DC" />
                <XAxis dataKey="month" stroke="#999" />
                <YAxis stroke="#999" />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="#1B4332" strokeWidth={3} dot={{ fill: '#1B4332', r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Score Breakdown */}
          <div className="bg-white rounded-lg p-6 border border-trace-border">
            <h3 className="text-lg font-bold text-foreground mb-6">What Builds Your Score</h3>
            <div className="space-y-6">
              {[
                { label: 'Work History', pct: 35, color: 'bg-trace-primary' },
                { label: 'Financial Activity', pct: 28, color: 'bg-trace-accent' },
                { label: 'Trading Activity', pct: 22, color: 'bg-green-600' },
                { label: 'Reliability & Ratings', pct: 15, color: 'bg-blue-600' },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-foreground">{item.label}</span>
                    <span className="text-sm font-bold text-trace-primary">{item.pct}%</span>
                  </div>
                  <div className="h-3 bg-trace-surface rounded-full overflow-hidden">
                    <div className={`${item.color} h-full transition-all`} style={{ width: `${item.pct}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* How to Improve */}
          <div className="bg-trace-primary/5 rounded-lg p-6 border border-trace-primary/20">
            <h3 className="text-lg font-bold text-foreground mb-6">Boost Your Score</h3>
            <div className="space-y-4">
              {[
                { icon: '✓', title: 'Complete 5 Work Tasks', desc: '+15 points', done: true },
                { icon: '⏳', title: 'Apply for Finance Product', desc: '+10 points', done: false },
                { icon: '⏳', title: 'Get 5-star Rating', desc: '+8 points', done: false },
              ].map((action, idx) => (
                <div key={idx} className="flex items-center gap-4 p-3 bg-white rounded-lg">
                  <div className={`text-lg ${action.done ? 'opacity-100' : 'opacity-50'}`}>{action.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium ${action.done ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{action.title}</p>
                    <p className="text-xs text-muted-foreground">{action.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Activity & Next Steps */}
        <div className="space-y-8">
          {/* Recent Activity */}
          <div className="bg-white rounded-lg p-6 border border-trace-border">
            <h3 className="text-lg font-bold text-foreground mb-6">Recent Activity</h3>
            <div className="space-y-4">
              {activities.map((activity, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className={`w-10 h-10 ${activity.color} rounded-lg flex items-center justify-center text-lg flex-shrink-0`}>
                    {activity.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground text-sm">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">{activity.desc}</p>
                    <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link href="#" className="mt-4 inline-flex items-center text-sm font-bold text-trace-primary hover:underline">
              View all <ArrowRight size={14} className="ml-1" />
            </Link>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg p-6 border border-trace-border space-y-4">
            <h3 className="text-lg font-bold text-foreground mb-6">Next Steps</h3>
            <Link href="/dashboard/work-matcher">
              <Button className="w-full bg-trace-primary hover:bg-trace-primary/90 font-bold">
                Find Work <ArrowRight size={18} className="ml-2" />
              </Button>
            </Link>
            <Link href="/dashboard/finance-gateway">
              <Button variant="outline" className="w-full border-trace-primary text-trace-primary hover:bg-trace-primary/5 font-bold">
                Explore Finance <ArrowRight size={18} className="ml-2" />
              </Button>
            </Link>
            <button className="w-full px-4 py-2 border border-trace-border rounded-lg hover:bg-trace-surface transition text-foreground font-medium">
              Update Profile
            </button>
          </div>

          {/* Achievement Badge */}
          <div className="bg-gradient-to-br from-trace-accent to-trace-accent/70 rounded-lg p-6 text-white">
            <p className="text-3xl mb-3">🏆</p>
            <h4 className="font-bold mb-2">Top Performer</h4>
            <p className="text-sm text-white/80">You&apos;re in the top 5% of traders this month. Keep it up!</p>
          </div>
        </div>
      </div>
    </div>
  )
}

