'use client'

import { useState } from 'react'
import { Copy, Share2, Check, Users, Gift, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ReferralsPage() {
  const [copied, setCopied] = useState(false)
  const referralCode = 'TRACE2024JOHN'
  const referralLink = `https://trace.app/join/${referralCode}`

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const referrals = [
    { name: 'Amara Okafor', status: 'Active', joinDate: 'Nov 20, 2024', earnings: 5000, icon: '👩' },
    { name: 'Chisom Ezeh', status: 'Active', joinDate: 'Nov 18, 2024', earnings: 7500, icon: '👨' },
    { name: 'Blessing Adebayo', status: 'Active', joinDate: 'Nov 10, 2024', earnings: 6250, icon: '👩' },
    { name: 'Marcus Osei', status: 'Pending', joinDate: 'Nov 5, 2024', earnings: 0, icon: '👨' },
    { name: 'Joy Nwosu', status: 'Active', joinDate: 'Oct 28, 2024', earnings: 8000, icon: '👩' },
  ]

  const rewards = [
    { tier: 'Bronze', referrals: '1-5', bonus: '₦500/person', color: 'bg-amber-100' },
    { tier: 'Silver', referrals: '6-15', bonus: '₦1,000/person', color: 'bg-gray-100' },
    { tier: 'Gold', referrals: '16-50', bonus: '₦2,000/person', color: 'bg-yellow-100' },
    { tier: 'Platinum', referrals: '50+', bonus: '₦5,000/person', color: 'bg-blue-100' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="bg-white border-b border-trace-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold text-foreground mb-8">Referrals & Rewards</h1>

          {/* Stats */}
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-trace-primary/10 to-trace-primary/5 rounded-lg p-6 border border-trace-primary/20">
              <Users className="text-trace-primary mb-3" size={24} />
              <p className="text-sm text-muted-foreground mb-1">Total Referrals</p>
              <p className="text-3xl font-bold text-trace-primary">5</p>
              <p className="text-xs text-muted-foreground mt-2">4 active, 1 pending</p>
            </div>

            <div className="bg-gradient-to-br from-trace-accent/10 to-trace-accent/5 rounded-lg p-6 border border-trace-accent/20">
              <Gift className="text-trace-accent mb-3" size={24} />
              <p className="text-sm text-muted-foreground mb-1">Total Earned</p>
              <p className="text-3xl font-bold text-trace-accent">₦26,750</p>
              <p className="text-xs text-muted-foreground mt-2">From referral bonuses</p>
            </div>

            <div className="bg-gradient-to-br from-green-100 to-green-50 rounded-lg p-6 border border-green-200">
              <TrendingUp className="text-green-600 mb-3" size={24} />
              <p className="text-sm text-muted-foreground mb-1">Current Tier</p>
              <p className="text-3xl font-bold text-green-600">Silver</p>
              <p className="text-xs text-muted-foreground mt-2">3 more for Gold</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Referral Link Card */}
        <div className="bg-white rounded-lg p-8 border border-trace-border">
          <h2 className="text-xl font-bold text-foreground mb-6">Share Your Link</h2>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 p-4 bg-trace-surface rounded-lg border border-trace-border flex items-center justify-between">
              <code className="text-sm font-mono text-foreground truncate">{referralLink}</code>
            </div>
            <button
              onClick={copyToClipboard}
              className={`px-6 py-3 rounded-lg font-bold transition flex items-center gap-2 ${
                copied
                  ? 'bg-green-100 text-green-700'
                  : 'bg-trace-primary text-white hover:bg-trace-primary/90'
              }`}
            >
              {copied ? (
                <>
                  <Check size={18} /> Copied
                </>
              ) : (
                <>
                  <Copy size={18} /> Copy Link
                </>
              )}
            </button>
            <button className="px-6 py-3 rounded-lg font-bold bg-white border border-trace-border text-foreground hover:bg-trace-surface transition flex items-center gap-2">
              <Share2 size={18} /> Share
            </button>
          </div>

          <p className="text-sm text-muted-foreground">
            Your unique referral code: <span className="font-bold text-trace-primary">{referralCode}</span>
          </p>
        </div>

        {/* Reward Tiers */}
        <div className="bg-white rounded-lg p-8 border border-trace-border">
          <h2 className="text-xl font-bold text-foreground mb-6">Reward Tiers</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {rewards.map((reward, idx) => (
              <div key={idx} className={`${reward.color} rounded-lg p-6 border-2 ${idx === 1 ? 'border-trace-primary' : 'border-transparent'}`}>
                <p className="font-bold text-foreground mb-2">{reward.tier}</p>
                <p className="text-sm text-muted-foreground mb-4">
                  <span className="font-bold">{reward.referrals}</span> referrals
                </p>
                <p className="font-bold text-trace-primary text-lg">{reward.bonus}</p>
                {idx === 1 && <p className="text-xs text-trace-primary font-bold mt-2">Your current tier</p>}
              </div>
            ))}
          </div>
        </div>

        {/* Referrals List */}
        <div className="bg-white rounded-lg p-8 border border-trace-border">
          <h2 className="text-xl font-bold text-foreground mb-6">Your Referrals</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-trace-border">
                  <th className="text-left py-4 px-4 font-bold text-foreground">Name</th>
                  <th className="text-left py-4 px-4 font-bold text-foreground">Status</th>
                  <th className="text-left py-4 px-4 font-bold text-foreground">Join Date</th>
                  <th className="text-right py-4 px-4 font-bold text-foreground">Earnings</th>
                </tr>
              </thead>
              <tbody>
                {referrals.map((ref, idx) => (
                  <tr key={idx} className="border-b border-trace-border/50 hover:bg-trace-surface/50 transition">
                    <td className="py-4 px-4 flex items-center gap-3">
                      <span className="text-2xl">{ref.icon}</span>
                      <span className="font-medium text-foreground">{ref.name}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`text-xs px-3 py-1 rounded-full font-bold ${
                        ref.status === 'Active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {ref.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-muted-foreground">{ref.joinDate}</td>
                    <td className="py-4 px-4 text-right font-bold text-green-600">₦{(ref.earnings / 1000).toFixed(1)}K</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-lg p-8 border border-trace-border">
          <h2 className="text-xl font-bold text-foreground mb-6">How It Works</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { step: 1, title: 'Share Your Link', desc: 'Copy and share your unique referral code with friends' },
              { step: 2, title: 'They Sign Up', desc: 'Your friends join Trace using your referral code' },
              { step: 3, title: 'You Earn', desc: 'Get rewarded for each successful referral and their activity' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 bg-trace-primary text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}


