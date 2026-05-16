'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useWallet, useDeposit } from '@/lib/api/hooks/use-wallet'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const QUICK_AMOUNTS = [500, 1000, 2000, 5000, 10000, 20000]

export default function DepositPage() {
  const router = useRouter()
  const { data: wallet } = useWallet()
  const { mutateAsync: deposit, isPending } = useDeposit()

  const [amount, setAmount] = useState('')

  const numAmount = Number(amount)
  const balance = wallet?.balance ?? 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (numAmount < 500) { toast.error('Minimum deposit is ₦500'); return }

    try {
      const result = await deposit(numAmount)
      window.location.href = result.checkout_url
    } catch {
      // handled by api client
    }
  }

  return (
    <div className="max-w-md mx-auto px-1">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="-ml-1 mb-8 flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      {/* Title */}
      <div className="mb-10">
        <h1 className="text-3xl font-black text-slate-950 tracking-tight">Add money</h1>
        <p className="text-slate-400 mt-1 text-sm">
          Balance — <span className="font-semibold text-slate-700">
            ₦{Number(balance).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        {/* Giant amount input */}
        <div>
          <div className="flex items-end gap-1 border-b-2 border-slate-200 focus-within:border-slate-950 pb-2 transition-colors">
            <span className="text-2xl font-bold text-slate-300 mb-0.5">₦</span>
            <input
              type="number"
              min="500"
              step="100"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0"
              className="flex-1 bg-transparent text-5xl font-black text-slate-950 outline-none placeholder:text-slate-200 w-full"
              required
            />
          </div>
          <p className="text-xs text-slate-400 mt-2">Minimum ₦500</p>
        </div>

        {/* Quick amounts */}
        <div className="flex flex-wrap gap-2">
          {QUICK_AMOUNTS.map(amt => (
            <button
              key={amt}
              type="button"
              onClick={() => setAmount(String(amt))}
              className={cn(
                'rounded-full border px-4 py-1.5 text-sm font-semibold transition-all',
                amount === String(amt)
                  ? 'border-slate-950 bg-slate-950 text-white'
                  : 'border-slate-200 text-slate-600 hover:border-slate-400'
              )}
            >
              ₦{amt.toLocaleString('en-NG')}
            </button>
          ))}
        </div>

        <Button
          type="submit"
          className="w-full h-13 text-base font-bold rounded-2xl"
          disabled={isPending || numAmount < 500}
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : null}
          {isPending
            ? 'Opening payment…'
            : numAmount >= 500
            ? `Deposit ₦${numAmount.toLocaleString('en-NG')}`
            : 'Enter an amount'}
        </Button>

        <p className="text-center text-xs text-slate-400">
          Secured payment via card or bank transfer
        </p>
      </form>
    </div>
  )
}
