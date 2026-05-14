import { useQuery } from '@tanstack/react-query'
import { api } from '../instance'

export interface Transaction {
  id: string
  user_id: string
  counterparty_id?: string
  squad_reference?: string
  type: string
  category?: string
  amount: number
  currency: string
  status: 'pending' | 'successful'
  metadata?: Record<string, unknown>
  created_at: string
}

export const transactionsKey = ['transactions'] as const

export function useTransactions() {
  return useQuery({
    queryKey: transactionsKey,
    queryFn: () => api.get<Transaction[]>('/transactions', { silent: true }),
  })
}
