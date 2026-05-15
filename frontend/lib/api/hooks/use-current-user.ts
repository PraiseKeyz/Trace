import { useQuery } from '@tanstack/react-query'
import { api } from '../instance'

export interface CurrentUser {
  id: string
  phone: string
  full_name?: string
  email?: string
  state?: string
  city?: string
  gender?: string
  dob?: string
  persona?: 'trader' | 'gig_worker'
  languages?: string[]
  preferred_language?: string
  data_sharing_consent?: boolean
  virtual_account_no?: string
  squad_customer_id?: string
  is_phone_verified: boolean
  onboarding_complete: boolean
}

export const currentUserKey = ['auth', 'me'] as const

export function useCurrentUser() {
  return useQuery({
    queryKey: currentUserKey,
    queryFn: () => api.get<CurrentUser>('/users/me', { silent: true }),
    staleTime: 1000 * 60 * 5,
  })
}
