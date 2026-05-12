import { Prisma } from '../../../generated/prisma/client';

export const SafeUserSelect = {
  id: true,
  phone: true,
  full_name: true,
  state: true,
  city: true,
  latitude: true,
  longitude: true,
  role: true,
  squad_customer_id: true,
  virtual_account_no: true,
  is_phone_verified: true,
  languages: true,
  preferred_language: true,
  data_sharing_consent: true,
  onboarding_complete: true,
  created_at: true,
  updated_at: true,
} satisfies Prisma.UserSelect;

export type SafeUser = Prisma.UserGetPayload<{ select: typeof SafeUserSelect }>;
