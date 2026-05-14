import { useQuery } from '@tanstack/react-query'
import { api } from '../instance'

export interface EconomicProfile {
  id: string
  user_id: string
  identity_score: number
  transaction_score: number
  activity_score: number
  vouch_score: number
  profile_completeness: number
  skills: string[]
  trade_category?: string
  years_active?: number
  is_profile_verified: boolean
  is_finance_eligible: boolean
  total_transaction_volume: number
  total_transaction_count: number
  avg_monthly_volume: number
  vouch_count: number
  verified_vouch_count: number
  risk_tier: 'high' | 'medium' | 'low' | 'very_low'
  max_recommended_loan: number
  last_transaction_at?: string
  last_active?: string
  updated_at: string
}

export const economicProfileKey = ['economic-profile', 'me'] as const

export function useEconomicProfile() {
  return useQuery({
    queryKey: economicProfileKey,
    queryFn: () => api.get<EconomicProfile>('/economic-profile/me', { silent: true }),
  })
}
