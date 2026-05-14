'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Search, Download, Filter, ChevronDown, ArrowUpRight, ArrowDownLeft, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function TransactionsPage() {
  const [filterType, setFilterType] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const transactions = [
    { id: 1, type: 'income', title: 'Work Completion', desc: 'Digital Marketing Task', amount: '₦15,000', status: 'completed', date: 'Today at 2:30 PM', icon: '💼' },
    { id: 2, type: 'expense', title: 'Loan Repayment', desc: 'Monthly installment', amount: '-₦8,500', status: 'completed', date: 'Today at 10:15 AM', icon: '📊' },
    { id: 3, type: 'income', title: 'Trade Profit', desc: 'Retail merchandise sale', amount: '₦22,400', status: 'completed', date: 'Yesterday at 6:45 PM', icon: '🏪' },
    { id: 4, type: 'transfer', title: 'Withdrawal', desc: 'Mobile wallet transfer', amount: '-₦10,000', status: 'pending', date: 'Yesterday at 3:20 PM', icon: '💳' },
    { id: 5, type: 'income', title: 'Referral Bonus', desc: 'Friend signup reward', amount: '₦2,500', status: 'completed', date: '2 days ago', icon: '🎁' },
    { id: 6, type: 'expense', title: 'Service Fee', desc: 'Platform usage', amount: '-₦500', status: 'completed', date: '3 days ago', icon: '⚙️' },
    { id: 7, type: 'income', title: 'Commission', desc: 'Sales commission', amount: '₦5,200', status: 'completed', date: '4 days ago', icon: '📈' },
    { id: 8, type: 'transfer', title: 'Bank Transfer', desc: 'To primary account', amount: '-₦50,000', status: 'completed', date: '5 days ago', icon: '🏦' },
  ]

  const filtered = transactions.filter(t => {
    if (filterType !== 'all' && t.type !== filterType) return false
    if (searchQuery && !t.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const stats = [
    { label: 'Total Income', value: '₦45,100', change: '+12.5%', color: 'bg-green-100' },
    { label: 'Total Expenses', value: '₦19,000', change: '-3.2%', color: 'bg-red-100' },
    { label: 'Net Balance', value: '₦26,100', change: '+22.8%', color: 'bg-trace-primary/10' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="bg-white border-b border-trace-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Transactions</h1>
              <p className="text-muted-foreground">Track all your financial activities</p>
            </div>
            <button className="p-3 bg-trace-primary/10 rounded-lg hover:bg-trace-primary/20 transition">
              <Download size={20} className="text-trace-primary" />
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid sm:grid-cols-3 gap-4">
            {stats.map((stat) => (
              <div key={stat.label} className={`${stat.color} rounded-lg p-4`}>
                <p className="text-sm font-medium text-foreground/70 mb-2">{stat.label}</p>
                <p className="text-2xl font-bold text-foreground mb-2">{stat.value}</p>
                <p className="text-xs font-medium text-green-600">{stat.change} this month</p>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Filters & Search */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search size={20} className="absolute left-3 top-3 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 bg-white border-trace-border"
            />
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <button className="h-12 px-4 bg-white border border-trace-border rounded-lg font-medium text-foreground flex items-center gap-2 hover:bg-trace-surface transition">
                <Filter size={18} />
                <span>Filter</span>
                <ChevronDown size={16} />
              </button>
            </div>
            <div className="relative">
              <button className="h-12 px-4 bg-white border border-trace-border rounded-lg font-medium text-foreground flex items-center gap-2 hover:bg-trace-surface transition">
                <span>Month</span>
                <ChevronDown size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Transaction List */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No transactions found</p>
            </div>
          ) : (
            filtered.map((tx) => (
              <div key={tx.id} className="bg-white rounded-lg p-4 flex items-center justify-between hover:border-trace-primary/50 border border-trace-border/50 transition cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="text-3xl">{tx.icon}</div>
                  <div>
                    <p className="font-bold text-foreground">{tx.title}</p>
                    <p className="text-sm text-muted-foreground">{tx.desc}</p>
                    <p className="text-xs text-muted-foreground mt-1">{tx.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold text-lg ${tx.type === 'income' ? 'text-green-600' : tx.type === 'expense' ? 'text-red-600' : 'text-foreground'}`}>
                    {tx.amount}
                  </p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    tx.status === 'completed' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {tx.status === 'completed' ? 'Completed' : 'Pending'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}


