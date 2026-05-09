'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, Target, Award } from 'lucide-react'

export default function EarningsPage() {
  const earningsData = [
    { week: 'Week 1', work: 12000, trade: 8000, finance: 2000 },
    { week: 'Week 2', work: 15000, trade: 10500, finance: 3000 },
    { week: 'Week 3', work: 18000, trade: 12000, finance: 2500 },
    { week: 'Week 4', work: 16500, trade: 14000, finance: 4000 },
  ]

  const sourceData = [
    { name: 'Work Opportunities', value: 61500, color: '#1B4332' },
    { name: 'Trade Activities', value: 44500, color: '#F4A826' },
    { name: 'Financial Services', value: 11500, color: '#40C057' },
  ]

  const topEarners = [
    { date: 'Dec 15', source: 'Digital Marketing Task', amount: 15000, client: 'Global Brands Co.' },
    { date: 'Dec 14', source: 'Retail Trade', amount: 22400, client: 'Personal business' },
    { date: 'Dec 13', source: 'Freelance Project', amount: 18000, client: 'Tech Startup' },
    { date: 'Dec 12', source: 'Commission', amount: 8500, client: 'Sales network' },
  ]

  const totalEarnings = 117500
  const monthlyGrowth = 24.5
  const avgDailyEarnings = 3792

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="bg-white border-b border-trace-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold text-foreground mb-8">Earnings & Income</h1>

          {/* Key Metrics */}
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-trace-primary/10 to-trace-primary/5 rounded-lg p-6 border border-trace-primary/20">
              <p className="text-sm font-medium text-muted-foreground mb-2">Total This Month</p>
              <p className="text-4xl font-bold text-trace-primary mb-2">₦{(totalEarnings / 1000).toFixed(1)}K</p>
              <p className="text-sm text-green-600 font-medium">↑ {monthlyGrowth}% from last month</p>
            </div>

            <div className="bg-gradient-to-br from-trace-accent/10 to-trace-accent/5 rounded-lg p-6 border border-trace-accent/20">
              <p className="text-sm font-medium text-muted-foreground mb-2">Average Daily</p>
              <p className="text-4xl font-bold text-trace-accent mb-2">₦{(avgDailyEarnings / 1000).toFixed(1)}K</p>
              <p className="text-sm text-muted-foreground font-medium">Over 31 days</p>
            </div>

            <div className="bg-gradient-to-br from-green-100 to-green-50 rounded-lg p-6 border border-green-200">
              <p className="text-sm font-medium text-muted-foreground mb-2">Projected This Year</p>
              <p className="text-4xl font-bold text-green-600 mb-2">₦1.41M</p>
              <p className="text-sm text-muted-foreground font-medium">At current pace</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Weekly Breakdown */}
        <div className="bg-white rounded-lg p-8 border border-trace-border">
          <h2 className="text-xl font-bold text-foreground mb-6">Weekly Breakdown</h2>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={earningsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8E4DC" />
              <XAxis dataKey="week" stroke="#999" />
              <YAxis stroke="#999" />
              <Tooltip />
              <Bar dataKey="work" fill="#1B4332" name="Work" />
              <Bar dataKey="trade" fill="#F4A826" name="Trade" />
              <Bar dataKey="finance" fill="#40C057" name="Finance" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Income Source Pie */}
          <div className="bg-white rounded-lg p-8 border border-trace-border">
            <h3 className="text-lg font-bold text-foreground mb-6">Income Sources</h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={sourceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {sourceData.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-3 mt-6">
              {sourceData.map((source) => (
                <div key={source.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: source.color }}></div>
                    <span className="text-sm text-foreground">{source.name}</span>
                  </div>
                  <span className="text-sm font-bold text-foreground">₦{(source.value / 1000).toFixed(0)}K</span>
                </div>
              ))}
            </div>
          </div>

          {/* Goals & Targets */}
          <div className="bg-white rounded-lg p-8 border border-trace-border">
            <h3 className="text-lg font-bold text-foreground mb-6">Goals</h3>
            <div className="space-y-6">
              {[
                { name: 'Monthly Target', current: 117500, target: 150000, icon: '🎯' },
                { name: 'Year Goal', current: 117500 * 12, target: 2000000, icon: '🏆' },
                { name: 'Streak Days', current: 28, target: 90, icon: '🔥' },
              ].map((goal) => {
                const percentage = (goal.current / goal.target) * 100
                return (
                  <div key={goal.name}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{goal.icon}</span>
                        <div>
                          <p className="font-bold text-foreground text-sm">{goal.name}</p>
                          <p className="text-xs text-muted-foreground">₦{(goal.current / 1000).toFixed(0)}K of ₦{(goal.target / 1000).toFixed(0)}K</p>
                        </div>
                      </div>
                    </div>
                    <div className="w-full h-3 bg-trace-surface rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-trace-primary to-trace-accent transition-all" style={{ width: `${Math.min(percentage, 100)}%` }}></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Insights */}
          <div className="bg-white rounded-lg p-8 border border-trace-border">
            <h3 className="text-lg font-bold text-foreground mb-6">Insights</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-trace-primary/5 rounded-lg border border-trace-primary/20">
                <TrendingUp className="text-trace-primary flex-shrink-0 mt-1" size={20} />
                <div>
                  <p className="font-bold text-foreground text-sm">Strong Growth</p>
                  <p className="text-xs text-muted-foreground mt-1">Your earnings increased 24.5% this month</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-trace-accent/5 rounded-lg border border-trace-accent/20">
                <Target className="text-trace-accent flex-shrink-0 mt-1" size={20} />
                <div>
                  <p className="font-bold text-foreground text-sm">Close to Target</p>
                  <p className="text-xs text-muted-foreground mt-1">You&apos;re 78% to your monthly goal</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <Award className="text-green-600 flex-shrink-0 mt-1" size={20} />
                <div>
                  <p className="font-bold text-foreground text-sm">Top Performer</p>
                  <p className="text-xs text-muted-foreground mt-1">You&apos;re in top 5% this month</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Earning Days */}
        <div className="bg-white rounded-lg p-8 border border-trace-border">
          <h3 className="text-lg font-bold text-foreground mb-6">Top Earning Days</h3>
          <div className="space-y-3">
            {topEarners.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 border border-trace-border/50 rounded-lg hover:border-trace-primary/50 transition">
                <div>
                  <p className="font-bold text-foreground">{item.source}</p>
                  <p className="text-sm text-muted-foreground">{item.client} • {item.date}</p>
                </div>
                <p className="text-lg font-bold text-green-600">+₦{(item.amount / 1000).toFixed(1)}K</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}


