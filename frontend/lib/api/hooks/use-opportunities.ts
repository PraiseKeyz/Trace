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
  escrow_amount?: number
  funds_locked_at?: string
  worker_done_at?: string
  auto_release_at?: string
  selected_applicant?: string
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

export interface MatchedOpportunity extends Opportunity {
  match_score: number
}

export interface ApplicationApplicant {
  id: string
  full_name?: string
  city?: string
  state?: string
  economic_profile?: {
    identity_score: number
    risk_tier: string
    skills: string[]
  }
}

export interface MyApplication {
  id: string
  status: string
  match_score?: number
  cover_note?: string
  applied_at: string
  opportunity: {
    id: string
    title: string
    type: string
    status: string
    escrow_amount?: number
    worker_done_at?: string
    auto_release_at?: string
    pay_min?: number
    pay_max?: number
    currency: string
    city?: string
    state?: string
    poster: { id: string; full_name?: string }
  }
}

export interface PostedOpportunity extends Opportunity {
  applications: {
    id: string
    status: string
    match_score?: number
    cover_note?: string
    applied_at: string
    applicant: ApplicationApplicant
  }[]
}

// ── Query keys ────────────────────────────────────────────────────────────────

export const opportunitiesKey = (page: number, limit: number) =>
  ['opportunities', { page, limit }] as const
export const matchesKey = ['opportunities', 'matches'] as const
export const myApplicationsKey = ['opportunities', 'my-applications'] as const
export const myPostsKey = ['opportunities', 'my-posts'] as const

// ── Queries ───────────────────────────────────────────────────────────────────

export function useOpportunities(page = 1, limit = 20) {
  return useQuery({
    queryKey: opportunitiesKey(page, limit),
    queryFn: () =>
      api.get<OpportunitiesPage>(`/opportunities?page=${page}&limit=${limit}`, { silent: true }),
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

export function useMyApplications() {
  return useQuery({
    queryKey: myApplicationsKey,
    queryFn: () => api.get<MyApplication[]>('/opportunities/my-applications', { silent: true }),
  })
}

export function useMyPosts() {
  return useQuery({
    queryKey: myPostsKey,
    queryFn: () => api.get<PostedOpportunity[]>('/opportunities/my-posts', { silent: true }),
  })
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export function useApplyOpportunity() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: { opportunity_id: string; cover_note?: string }) =>
      api.post('/opportunities/apply', payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['opportunities'] }),
  })
}

export function useCreateOpportunity() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      title: string
      description?: string
      type: string
      skills_required?: string[]
      languages_required?: string[]
      state?: string
      city?: string
      is_remote?: boolean
      pay_min?: number
      pay_max?: number
    }) => api.post<Opportunity>('/opportunities', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['opportunities'] }),
  })
}

export function useApproveApplicant() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      opportunityId,
      applicantId,
      agreed_amount,
    }: {
      opportunityId: string
      applicantId: string
      agreed_amount: number
    }) =>
      api.post(`/opportunities/${opportunityId}/approve/${applicantId}`, { agreed_amount }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['opportunities'] })
      qc.invalidateQueries({ queryKey: ['wallet'] })
    },
  })
}

export function useMarkDone() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (opportunityId: string) =>
      api.post(`/opportunities/${opportunityId}/mark-done`, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['opportunities'] }),
  })
}

export function useConfirmCompletion() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (opportunityId: string) =>
      api.post(`/opportunities/${opportunityId}/confirm`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['opportunities'] })
      qc.invalidateQueries({ queryKey: ['wallet'] })
    },
  })
}

export function useRaiseDispute() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (opportunityId: string) =>
      api.post(`/opportunities/${opportunityId}/dispute`, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['opportunities'] }),
  })
}
