'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowUpFromLine, CheckCircle2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useWallet, useWithdraw } from '@/lib/api/hooks/use-wallet'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface Bank {
  code: string
  name: string
}

export default function WithdrawPage() {
  const router = useRouter()
  const { data: wallet } = useWallet()
  const { mutateAsync: withdraw, isPending } = useWithdraw()
  const { data: banksData } = useQuery<Bank[]>({
    queryKey: ['banks'],
    queryFn: () => api.get('/squad/banks', { silent: true }) as Promise<Bank[]>,
    staleTime: Infinity,
  })

  const [amount, setAmount] = useState('')
  const [bankCode, setBankCode] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [accountName, setAccountName] = useState('')
  const [resolving, setResolving] = useState(false)

  const balance = wallet?.balance ?? 0
  const banks = banksData ?? []
  const numAmount = Number(amount)
  const canResolve = accountNumber.length === 10 && !!bankCode && !resolving

  const handleResolve = async () => {
    if (!canResolve) return
    setResolving(true)
    try {
      const res = await api.post('/squad/accounts/resolve', {
        bank_code: bankCode,
        account_number: accountNumber,
      }) as any
      const name = res?.data?.account_name ?? res?.account_name ?? ''
      if (name) {
        setAccountName(name)
        toast.success(`Account verified: ${name}`)
      } else {
        toast.error('Could not resolve account name')
      }
    } catch {
    } finally {
      setResolving(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!numAmount || numAmount < 100) { toast.error('Minimum withdrawal is ₦100'); return }
    if (!bankCode) { toast.error('Select a bank'); return }
    if (accountNumber.length !== 10) { toast.error('Account number must be 10 digits'); return }
    if (!accountName) { toast.error('Verify your account first'); return }
    if (numAmount > balance) {
      toast.error(`Insufficient balance. Available: ₦${Number(balance).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`)
      return
    }

    try {
      await withdraw({ amount: numAmount, bank_code: bankCode, account_number: accountNumber, account_name: accountName })
      toast.success(`₦${numAmount.toLocaleString('en-NG', { minimumFractionDigits: 2 })} withdrawal initiated`)
      router.push('/dashboard/finance-gateway')
    } catch {
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center justify-center w-10 h-10 rounded-xl border border-trace-border bg-white hover:bg-trace-surface transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-slate-600" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-slate-950">Withdraw</h1>
          <p className="text-sm text-muted-foreground">Send money to your bank account</p>
        </div>
      </div>

      {/* Current balance */}
      <div className="rounded-2xl bg-slate-950 p-6 mb-6 text-white">
        <p className="text-sm text-white/50 font-semibold uppercase tracking-widest mb-1">Available Balance</p>
        <p className="text-4xl font-black">
          ₦{Number(balance).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Amount */}
        <div className="bg-white rounded-2xl border border-trace-border p-6 space-y-3">
          <label className="block text-sm font-bold text-slate-800">Amount</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">₦</span>
            <input
              type="number"
              min="100"
              max={balance}
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full rounded-xl border border-trace-border bg-trace-surface pl-9 pr-4 py-4 text-2xl font-black text-slate-950 outline-none focus:border-trace-accent focus:ring-2 focus:ring-trace-accent/10"
              required
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Minimum withdrawal: ₦100 · Available: ₦{Number(balance).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
          </p>
        </div>

        {/* Bank details */}
        <div className="bg-white rounded-2xl border border-trace-border p-6 space-y-4">
          <p className="text-sm font-bold text-slate-800">Bank Details</p>

          {/* Bank select */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Bank</label>
            <select
              value={bankCode}
              onChange={e => { setBankCode(e.target.value); setAccountName('') }}
              className="w-full rounded-xl border border-trace-border bg-trace-surface px-4 py-3 text-sm text-slate-950 outline-none focus:border-trace-accent focus:ring-2 focus:ring-trace-accent/10"
              required
            >
              <option value="">Select a bank…</option>
              {banks.map(b => (
                <option key={b.code} value={b.code}>{b.name}</option>
              ))}
            </select>
          </div>

          {/* Account number */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Account Number</label>
            <div className="flex gap-2">
              <input
                type="text"
                inputMode="numeric"
                maxLength={10}
                value={accountNumber}
                onChange={e => { setAccountNumber(e.target.value.replace(/\D/g, '')); setAccountName('') }}
                placeholder="0123456789"
                className="flex-1 rounded-xl border border-trace-border bg-trace-surface px-4 py-3 text-sm text-slate-950 outline-none focus:border-trace-accent focus:ring-2 focus:ring-trace-accent/10"
                required
              />
              <Button
                type="button"
                variant="outline"
                disabled={!canResolve}
                onClick={handleResolve}
                className="flex-shrink-0 h-[46px] px-4"
              >
                {resolving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verify'}
              </Button>
            </div>
          </div>

          {/* Verified account name */}
          {accountName && (
            <div className="flex items-center gap-2.5 rounded-xl bg-green-50 border border-green-200 px-4 py-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
              <div>
                <p className="text-xs text-green-600 font-semibold uppercase tracking-wide">Verified</p>
                <p className="text-sm font-bold text-green-900">{accountName}</p>
              </div>
            </div>
          )}
        </div>

        <Button
          type="submit"
          className="w-full h-14 text-base font-bold gap-2"
          disabled={isPending || !accountName || numAmount < 100}
        >
          {isPending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <ArrowUpFromLine className="h-5 w-5" />
          )}
          {isPending
            ? 'Processing…'
            : numAmount >= 100 && accountName
            ? `Withdraw ₦${numAmount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            : 'Complete the form above'}
        </Button>
      </form>
    </div>
  )
}
