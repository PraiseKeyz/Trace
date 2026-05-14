import { useQuery } from '@tanstack/react-query'
import { api } from '../instance'

export interface CurrentUser {
  id: string
  phone: string
  full_name?: string
  email?: string
  state?: string
  city?: string
  latitude?: number
  longitude?: number
  role?: string
  is_phone_verified: boolean
  onboarding_complete: boolean
}

export const currentUserKey = ['auth', 'me'] as const

export function useCurrentUser() {
  return useQuery({
    queryKey: currentUserKey,
    queryFn: () => api.get<CurrentUser>('/users/me', { silent: true }),
    staleTime: 1000 * 60 * 5, // user data stays fresh for 5 min
  })
}
