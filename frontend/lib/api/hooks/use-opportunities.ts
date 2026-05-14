import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../instance'

export interface OpportunityPoster {
  id: string
  full_name?: string
  city?: string
  state?: string
}

export interface Opportunity {
  id: string
  posted_by: string
  title: string
  description?: string
  type: string
  skills_required: string[]
  languages_required: string[]
  state?: string
  city?: string
  is_remote: boolean
  pay_min?: number
  pay_max?: number
  currency: string
  status: string
  created_at: string
  poster: OpportunityPoster
}

export interface OpportunitiesPage {
  items: Opportunity[]
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface MatchedOpportunity {
  opportunity_id: string
  match_score: number
  title: string
}

export const opportunitiesKey = (page: number, limit: number) =>
  ['opportunities', { page, limit }] as const

export const matchesKey = ['opportunities', 'matches'] as const

export function useOpportunities(page = 1, limit = 20) {
  return useQuery({
    queryKey: opportunitiesKey(page, limit),
    queryFn: () =>
      api.get<OpportunitiesPage>(
        `/opportunities?page=${page}&limit=${limit}`,
        { silent: true },
      ),
    placeholderData: (prev) => prev,
  })
}

export function useOpportunityMatches() {
  return useQuery({
    queryKey: matchesKey,
    queryFn: () => api.get<MatchedOpportunity[]>('/opportunities/matches', { silent: true }),
    retry: false,
    staleTime: 5 * 60 * 1000,
  })
}

export function useApplyOpportunity() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (opportunity_id: string) =>
      api.post('/opportunities/apply', { opportunity_id }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['opportunities'] })
    },
  })
}
