import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../instance'

export interface UserLookup {
  id: string
  full_name?: string
  persona?: 'trader' | 'gig_worker'
}

export interface VouchUser {
  id: string
  full_name?: string
  phone: string
  persona?: 'trader' | 'gig_worker'
}

export interface Vouch {
  id: string
  voucher_id: string
  recipient_id: string
  message?: string
  weight: number
  created_at: string
  voucher?: VouchUser
  recipient?: VouchUser
}

export const vouchKeys = {
  received: ['vouches', 'received'] as const,
  given: ['vouches', 'given'] as const,
}

export function useReceivedVouches() {
  return useQuery({
    queryKey: vouchKeys.received,
    queryFn: () => api.get<Vouch[]>('/vouches/received'),
  })
}

export function useGivenVouches() {
  return useQuery({
    queryKey: vouchKeys.given,
    queryFn: () => api.get<Vouch[]>('/vouches/given'),
  })
}

export function useCreateVouch() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { recipient_id: string; message?: string }) =>
      api.post<Vouch>('/vouches', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: vouchKeys.given })
    },
  })
}

export function useRemoveVouch() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (vouchId: string) => api.delete<{ message: string }>(`/vouches/${vouchId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: vouchKeys.given })
    },
  })
}

export function useLookupUser(phone: string) {
  return useQuery({
    queryKey: ['users', 'lookup', phone],
    queryFn: () => api.get<UserLookup>(`/users/lookup?phone=${encodeURIComponent(phone)}`, { silent: true }),
    enabled: phone.length >= 10,
    retry: false,
  })
}
