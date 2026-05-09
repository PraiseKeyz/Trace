'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { TrendingUp, Wallet, PiggyBank, Zap, ArrowUpRight, ArrowDownLeft } from 'lucide-react'

export default function PortfolioPage() {
  const portfolioData = [
    { month: 'Jan', savings: 50000, loans: 20000, investments: 15000 },
    { month: 'Feb', savings: 65000, loans: 18000, investments: 22000 },
    { month: 'Mar', savings: 80000, loans: 15000, investments: 35000 },
    { month: 'Apr', savings: 95000, loans: 12000, investments: 48000 },
    { month: 'May', savings: 120000, loans: 10000, investments: 62000 },
  ]

  const netWorthData = [
    { month: 'Jan', worth: 45000 },
    { month: 'Feb', worth: 69000 },
    { month: 'Mar', worth: 100000 },
    { month: 'Apr', worth: 131000 },
    { month: 'May', worth: 172000 },
  ]

  const assets = [
    { name: 'Savings Account', value: 120000, percent: 40, icon: '🏦', color: 'bg-green-100' },
    { name: 'Investments', value: 62000, percent: 21, icon: '📈', color: 'bg-blue-100' },
    { name: 'Trade Business', value: 95000, percent: 32, icon: '🏪', color: 'bg-trace-accent/10' },
    { name: 'Crypto Holdings', value: 15000, percent: 5, icon: '₿', color: 'bg-yellow-100' },
  ]

  const liabilities = [
    { name: 'Active Loans', value: -10000, percent: 100, icon: '📊' },
  ]

  const totalAssets = assets.reduce((sum, a) => sum + a.value, 0)
  const totalLiabilities = liabilities.reduce((sum, l) => sum + l.value, 0)
  const netWorth = totalAssets + totalLiabilities

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="bg-white border-b border-trace-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold text-foreground mb-8">Portfolio</h1>

          {/* Key Metrics */}
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg p-6 border border-blue-200">
              <div className="flex items-center gap-3 mb-2">
                <Wallet className="text-blue-600" size={24} />
                <p className="text-sm font-medium text-muted-foreground">Total Assets</p>
              </div>
              <p className="text-3xl font-bold text-foreground">₦{(totalAssets / 1000).toFixed(0)}K</p>
              <p className="text-xs text-muted-foreground mt-2">+12.5% from last month</p>
            </div>

            <div className="bg-gradient-to-br from-red-100 to-red-50 rounded-lg p-6 border border-red-200">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="text-red-600" size={24} />
                <p className="text-sm font-medium text-muted-foreground">Total Liabilities</p>
              </div>
              <p className="text-3xl font-bold text-foreground">₦{Math.abs(totalLiabilities / 1000).toFixed(0)}K</p>
              <p className="text-xs text-muted-foreground mt-2">-8% from last month</p>
            </div>

            <div className="bg-gradient-to-br from-green-100 to-green-50 rounded-lg p-6 border border-green-200">
              <div className="flex items-center gap-3 mb-2">
                <PiggyBank className="text-green-600" size={24} />
                <p className="text-sm font-medium text-muted-foreground">Net Worth</p>
              </div>
              <p className="text-3xl font-bold text-foreground">₦{(netWorth / 1000).toFixed(0)}K</p>
              <p className="text-xs text-green-600 font-medium mt-2">↑ 18.2% this month</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Net Worth Growth */}
        <div className="bg-white rounded-lg p-8 border border-trace-border">
          <h2 className="text-xl font-bold text-foreground mb-6">Net Worth Growth</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={netWorthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8E4DC" />
              <XAxis dataKey="month" stroke="#999" />
              <YAxis stroke="#999" />
              <Tooltip formatter={(value) => `₦${(value / 1000).toFixed(0)}K`} />
              <Line
                type="monotone"
                dataKey="worth"
                stroke="#1B4332"
                strokeWidth={3}
                dot={{ fill: '#1B4332', r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Asset Allocation */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Assets */}
          <div className="bg-white rounded-lg p-8 border border-trace-border">
            <h3 className="text-lg font-bold text-foreground mb-6">Assets</h3>
            <div className="space-y-4">
              {assets.map((asset, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{asset.icon}</span>
                      <div>
                        <p className="font-bold text-foreground">{asset.name}</p>
                        <p className="text-xs text-muted-foreground">₦{(asset.value / 1000).toFixed(0)}K</p>
                      </div>
                    </div>
                    <p className="font-bold text-foreground">{asset.percent}%</p>
                  </div>
                  <div className="w-full h-3 bg-trace-surface rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-trace-primary to-trace-accent" style={{ width: `${asset.percent}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 pt-8 border-t border-trace-border">
              <p className="text-sm text-muted-foreground mb-2">Total Assets</p>
              <p className="text-2xl font-bold text-foreground">₦{(totalAssets / 1000).toFixed(0)}K</p>
            </div>
          </div>

          {/* Asset Composition Chart */}
          <div className="bg-white rounded-lg p-8 border border-trace-border">
            <h3 className="text-lg font-bold text-foreground mb-6">Composition Over Time</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={portfolioData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8E4DC" />
                <XAxis dataKey="month" stroke="#999" />
                <YAxis stroke="#999" />
                <Tooltip />
                <Area type="monotone" dataKey="savings" stackId="1" fill="#1B4332" name="Savings" />
                <Area type="monotone" dataKey="investments" stackId="1" fill="#F4A826" name="Investments" />
                <Area type="monotone" dataKey="loans" stackId="1" fill="#E0E0E0" name="Loans" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detailed Holdings */}
        <div className="bg-white rounded-lg p-8 border border-trace-border">
          <h3 className="text-lg font-bold text-foreground mb-6">Detailed Holdings</h3>
          <div className="space-y-4">
            {[
              { name: 'Trace Savings Account', value: 120000, rate: '+2.5% APY', icon: '🏦' },
              { name: 'Stock Portfolio', value: 40000, rate: '+8.2% YTD', icon: '📊' },
              { name: 'Real Estate', value: 95000, rate: '+5% YTD', icon: '🏠' },
              { name: 'Business Equipment', value: 22000, rate: 'Stable', icon: '⚙️' },
              { name: 'Cryptocurrency', value: 15000, rate: '-12% YTD', icon: '₿' },
            ].map((holding, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 border border-trace-border/50 rounded-lg hover:border-trace-primary/50 transition">
                <div className="flex items-center gap-4">
                  <span className="text-3xl">{holding.icon}</span>
                  <div>
                    <p className="font-bold text-foreground">{holding.name}</p>
                    <p className="text-sm text-muted-foreground">₦{(holding.value / 1000).toFixed(0)}K • {holding.rate}</p>
                  </div>
                </div>
                <button className="text-trace-primary font-bold hover:underline">Manage →</button>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Goals */}
        <div className="bg-white rounded-lg p-8 border border-trace-border">
          <h3 className="text-lg font-bold text-foreground mb-6">Financial Goals</h3>
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              { goal: 'Save ₦500K', current: 172000, target: 500000, deadline: 'Dec 2025', icon: '🎯' },
              { goal: 'Clear Loans', current: 10000, target: 0, deadline: 'Mar 2025', icon: '🏁' },
              { goal: 'Investment Fund', current: 62000, target: 150000, deadline: 'Jun 2026', icon: '📈' },
              { goal: 'Business Growth', current: 95000, target: 250000, deadline: 'Dec 2025', icon: '🚀' },
            ].map((item, idx) => {
              const percentage = (item.current / item.target) * 100
              return (
                <div key={idx} className="p-6 border border-trace-border/50 rounded-lg">
                  <div className="flex items-start gap-3 mb-4">
                    <span className="text-2xl">{item.icon}</span>
                    <div className="flex-1">
                      <p className="font-bold text-foreground">{item.goal}</p>
                      <p className="text-xs text-muted-foreground">Due {item.deadline}</p>
                    </div>
                  </div>
                  <div className="h-2 bg-trace-surface rounded-full overflow-hidden mb-2">
                    <div className="h-full bg-gradient-to-r from-trace-primary to-trace-accent" style={{ width: `${Math.min(percentage, 100)}%` }}></div>
                  </div>
                  <p className="text-xs text-muted-foreground">₦{(item.current / 1000).toFixed(0)}K of ₦{(item.target / 1000).toFixed(0)}K</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}


