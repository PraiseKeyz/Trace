'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { CheckCircle2, XCircle, Clock, Loader2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'
import { walletKey } from '@/lib/api/hooks/use-wallet'

type Status = 'loading' | 'success' | 'failed' | 'pending' | 'error'

function CallbackContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const queryClient = useQueryClient()

  // Squad may use transaction_ref or transactionRef
  const transactionRef =
    searchParams.get('reference') ??
    searchParams.get('transaction_ref') ??
    searchParams.get('transactionRef')

  const [status, setStatus] = useState<Status>('loading')
  const [amount, setAmount] = useState<number | null>(null)

  useEffect(() => {
    if (!transactionRef) {
      // Log all params to help debug what Squad actually sends
      console.log('[Callback] Search params:', Object.fromEntries(searchParams.entries()))
      setStatus('error')
      return
    }

    console.log('[Callback] Verifying transaction:', transactionRef)

    api
      .get(`/squad/transactions/verify/${transactionRef}`, { silent: true })
      .then((res: any) => {
        const tx = res?.data ?? res
        const txStatus = (tx?.transaction_status ?? '').toLowerCase()
        console.log('[Callback] Verify response:', tx)

        if (txStatus === 'success' || txStatus === 'successful') {
          setStatus('success')
          // Squad verify returns amount in kobo
          setAmount(Number(tx.transaction_amount ?? 0) / 100)
          queryClient.invalidateQueries({ queryKey: walletKey })
          queryClient.invalidateQueries({ queryKey: ['transactions'] })
        } else if (txStatus === 'failed') {
          setStatus('failed')
        } else {
          setStatus('pending')
        }
      })
      .catch((err: any) => {
        console.error('[Callback] Verify failed:', err)
        setStatus('error')
      })
  }, [transactionRef, queryClient, searchParams])

  const STATE = {
    loading: {
      icon: <Loader2 className="h-14 w-14 text-trace-accent animate-spin" />,
      title: 'Verifying payment…',
      desc: 'Please wait while we confirm your transaction.',
      bg: 'bg-trace-accent/10',
    },
    success: {
      icon: <CheckCircle2 className="h-14 w-14 text-green-500" />,
      title: 'Payment successful!',
      desc: amount
        ? `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })} has been added to your Trace wallet.`
        : 'Your deposit has been credited to your Trace wallet.',
      bg: 'bg-green-50',
    },
    failed: {
      icon: <XCircle className="h-14 w-14 text-red-500" />,
      title: 'Payment failed',
      desc: 'Your transaction was not completed. No funds were deducted.',
      bg: 'bg-red-50',
    },
    pending: {
      icon: <Clock className="h-14 w-14 text-amber-500" />,
      title: 'Payment pending',
      desc: 'Your payment is being processed. Your wallet will be credited once confirmed.',
      bg: 'bg-amber-50',
    },
    error: {
      icon: <XCircle className="h-14 w-14 text-slate-400" />,
      title: 'Something went wrong',
      desc: transactionRef
        ? 'We could not verify this transaction. Contact support if your account was debited.'
        : 'No transaction reference found. Check that Squad redirected here correctly.',
      bg: 'bg-slate-50',
    },
  }

  const s = STATE[status]

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-white p-10 text-center shadow-sm">
        <div className={`mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full ${s.bg}`}>
          {s.icon}
        </div>

        <h1 className="text-2xl font-black text-slate-900 mb-3">{s.title}</h1>
        <p className="text-slate-500 text-sm leading-relaxed">{s.desc}</p>

        {transactionRef && (
          <p className="text-[11px] text-slate-400 font-mono mt-3">Ref: {transactionRef}</p>
        )}

        <div className="flex flex-col gap-3 mt-8">
          <Button onClick={() => router.push('/dashboard/finance-gateway')} className="w-full gap-2">
            Go to Wallet <ArrowRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={() => router.push('/dashboard')} className="w-full">
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[70vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-trace-accent" />
      </div>
    }>
      <CallbackContent />
    </Suspense>
  )
}
