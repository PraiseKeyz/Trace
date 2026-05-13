# Trace — Frontend

The Next.js web application for the Trace platform. Mobile-first, PWA-ready dashboard for informal workers and traders to view their economic identity score, find gig opportunities, and access financial products.

---

## Tech Stack

| | |
|--|--|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS 4, PostCSS |
| Components | Radix UI primitives + shadcn/ui |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| Animations | Framer Motion |
| Icons | Lucide React |
| Toasts | Sonner |
| Package Manager | pnpm |

---

## Setup

### Prerequisites
- Node.js >= 18
- pnpm
- Backend API running on port 5001

### 1. Install

```bash
pnpm install
```

### 2. Environment Variables

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5001
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3001
```

### 3. Run

```bash
# Development
pnpm dev

# Production build
pnpm build
pnpm start
```

Open [http://localhost:3001](http://localhost:3001)

---

## Pages

### Public
| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/login` | Login with phone + password |
| `/onboarding` | Post-registration onboarding flow (skills, location, language, consent) |

### Dashboard (JWT protected)
| Route | Description |
|-------|-------------|
| `/dashboard` | Main dashboard — economic score, score trend chart, recent activity |
| `/dashboard/work-matcher` | AI-matched gig opportunities with skill/location filters |
| `/dashboard/transactions` | Transaction history with search and type filters |
| `/dashboard/earnings` | Earnings breakdown and analytics |
| `/dashboard/portfolio` | Skills and work portfolio |
| `/dashboard/finance-gateway` | Financial products gated by risk tier |
| `/dashboard/community` | Community feed, top members, discussions |
| `/dashboard/learning` | Learning resources |
| `/dashboard/referrals` | Referral program |
| `/dashboard/settings` | Account settings |

---

## Project Structure

```
frontend/
├── app/
│   ├── layout.tsx                  # Root layout with AuthProvider
│   ├── page.tsx                    # Landing page
│   ├── login/page.tsx
│   ├── onboarding/page.tsx
│   └── (dashboard)/
│       ├── layout.tsx              # Dashboard shell with sidebar
│       └── dashboard/
│           ├── page.tsx            # Main dashboard
│           ├── work-matcher/
│           ├── transactions/
│           ├── finance-gateway/
│           └── ...
├── components/
│   ├── DashboardSidebar.tsx
│   ├── ActivityFeed.tsx
│   ├── CircleProgress.tsx
│   ├── FinanceProductCard.tsx
│   ├── OpportunityCard.tsx
│   ├── ScoreBreakdown.tsx
│   └── ui/                         # Radix UI wrapped components
├── context/
│   └── auth-context.tsx            # Global auth state (useAuth hook)
├── hooks/
│   ├── use-mobile.ts
│   └── use-toast.ts
├── lib/
│   ├── api.ts                      # Typed fetch wrapper (apiFetch)
│   └── utils.ts
└── styles/
    └── globals.css                 # Tailwind config + CSS variables
```

---

## Authentication

Authentication state is managed globally via `AuthContext` (`context/auth-context.tsx`).

**Flow:**
1. On app load, `AuthProvider` calls `GET /api/v1/auth/me`
2. If valid, user state is set; otherwise null
3. Login/register calls set an httpOnly JWT cookie server-side
4. All subsequent API requests include the cookie automatically (`credentials: 'include'`)
5. Logout calls the backend to clear the cookie, then resets context state

Protected dashboard routes check `useAuth()` and redirect to `/login` if unauthenticated.

---

## API Client

All backend calls go through `lib/api.ts`:

```ts
import { apiFetch } from '@/lib/api'

const profile = await apiFetch('/api/v1/economic-profile/my-profile')
```

The wrapper handles:
- Base URL from `NEXT_PUBLIC_API_URL`
- `Content-Type: application/json`
- `credentials: 'include'` (sends JWT cookie)
- Throws on non-2xx responses with parsed error message

---

## Colour Palette

| Role | Colour | CSS Variable |
|------|--------|-------------|
| Primary | Deep Forest Green `#1B4332` | `--trace-primary` |
| Accent | Warm Gold `#F4A826` | `--trace-accent` |
| Surface | Off White `#F9F6F0` | `--trace-surface` |
| Text | Rich Charcoal `#1A1A1A` | `--trace-text` |
| Border | Warm Grey | `--trace-border` |
