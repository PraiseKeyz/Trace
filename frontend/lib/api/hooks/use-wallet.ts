import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../instance'

export interface WalletBalance {
  balance: number
  currency: string
  updated_at: string
}

export interface WithdrawPayload {
  amount: number
  bank_code: string
  account_number: string
  account_name: string
  remark?: string
}

export interface WithdrawResult {
  message: string
  transfer_reference: string
  amount: number
  new_balance: number
}

export const walletKey = ['wallet'] as const

export function useWallet() {
  return useQuery({
    queryKey: walletKey,
    queryFn: () => api.get<WalletBalance>('/wallet/me', { silent: true }),
  })
}

export function useWithdraw() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: WithdrawPayload) =>
      api.post<WithdrawResult>('/wallet/withdraw', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: walletKey })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
    },
  })
}
