# Trace — Frontend

The Next.js web application for the Trace platform. Mobile-first, PWA-ready dashboard for informal workers and traders to build their economic identity, find gig opportunities, manage finances, and access credit products.

---

## Tech Stack

| | |
|--|--|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4, PostCSS |
| Components | shadcn/ui (Radix UI primitives) |
| State / Data Fetching | TanStack Query (React Query v5) |
| API Client | Custom `ApiClient` class (`lib/api/client.ts`) |
| Charts | Recharts |
| Calendar | react-day-picker v9 + date-fns |
| Icons | Lucide React |
| Toasts | Sonner |
| PWA | next-pwa (manifest + service worker) |
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
| `/signup` | Register with phone + password |
| `/verify` | Phone OTP verification (6-box input, auto-submits) |
| `/onboarding` | Multi-step profile setup — personal info (name, email, gender, DOB), location, languages, work & skills |

### Dashboard (JWT protected, persona-gated)

| Route | Persona | Description |
|-------|---------|-------------|
| `/dashboard` | All | Main dashboard — economic identity score, score breakdown, recent transactions, quick actions |
| `/dashboard/work-matcher` | Gig Worker | AI-matched job opportunities with skill/location filters, application tracking |
| `/dashboard/post-job` | Trader | Post a new job opportunity with type, budget, skills, and location |
| `/dashboard/my-jobs` | Trader | Manage posted jobs — review applicants, approve, confirm completion, raise disputes |
| `/dashboard/portfolio` | All | Skills portfolio, work history, persona badge, economic tier |
| `/dashboard/transactions` | All | Transaction history with search, type filter, and monthly chart overview |
| `/dashboard/finance-gateway` | All | Financial products (Quick Cash, loans) gated by risk tier; virtual account details |
| `/dashboard/community` | All | Community feed, top members, peer vouching |
| `/dashboard/settings` | All | Account settings — profile, security (password change), privacy, notifications |

> Traders see: Post a Job, My Jobs. Gig workers see: Work Matcher. Both navigation and page access are gated by `user.persona`.

---

## Auth Flow

1. `AuthProvider` calls `GET /api/v1/users/me` on app load to hydrate user state
2. Register → OTP sent to phone → 6-digit verification → onboarding → dashboard
3. Login → JWT httpOnly cookie set server-side → subsequent requests send cookie automatically (`credentials: 'include'`)
4. Middleware (`middleware.ts`) guards `/dashboard/*` routes — redirects unauthenticated users to `/login`
5. Individual pages guard by persona — wrong-persona users are redirected to `/dashboard`
6. Logout clears the cookie server-side and resets context

---

## API Client

All backend calls go through the `ApiClient` class in `lib/api/client.ts`. A singleton instance is exported as `api`:

```ts
import { api } from '@/lib/api'

const user = await api.get<User>('/users/me')
await api.post('/auth/login', { phone, password })
```

The client handles:
- Base URL from `NEXT_PUBLIC_API_URL` (falls back to `https://api.traceafrika.app`)
- `Content-Type: application/json`
- `credentials: 'include'` (sends JWT cookie)
- 15-second request timeout with `AbortController`
- Request and response interceptors
- 401 handling — redirects to `/login` if not on a public page
- Error toasts via Sonner (suppressible with `{ silent: true }`)

All data fetching hooks live in `lib/api/hooks/` and use TanStack Query for caching and background refetching.

---

## Brand Design

### Colour Palette

| Role | Colour | CSS Variable |
|------|--------|-------------|
| Accent (primary CTA) | Orange `#F97316` | `--trace-accent` |
| Surface (background) | Off White `#F9F6F0` | `--trace-surface` |
| Text | Rich Charcoal `#1A1A1A` | `--trace-text` |
| Border | Warm Grey `#D4CCC2` | `--trace-border` |

Defined in `app/globals.css` using Tailwind v4's `@theme inline` block.

### Button Variants

The `Button` component (`components/ui/button.tsx`) uses `class-variance-authority`:

| Variant | Use |
|---------|-----|
| `default` | Primary CTA — orange fill |
| `dark` | High-emphasis actions — slate-950 fill |
| `outline` | Secondary actions — white with border |
| `ghost` | Icon buttons, subtle actions |
| `danger` | Destructive actions — red border/text |
| `link` | Inline links |

---

## Project Structure

```
frontend/
├── app/
│   ├── layout.tsx                    # Root layout — QueryClient, AuthProvider, Toaster
│   ├── globals.css                   # Tailwind v4 theme + CSS variables
│   ├── page.tsx                      # Landing page
│   ├── login/page.tsx
│   ├── signup/page.tsx
│   ├── verify/page.tsx               # OTP verification (6-box input)
│   ├── onboarding/page.tsx           # Multi-step onboarding
│   └── (dashboard)/
│       ├── layout.tsx                # Dashboard shell — sidebar + PWA banner
│       └── dashboard/
│           ├── page.tsx              # Main dashboard
│           ├── work-matcher/         # Gig worker only
│           ├── post-job/             # Trader only
│           ├── my-jobs/              # Trader only
│           ├── portfolio/
│           ├── transactions/
│           ├── finance-gateway/
│           ├── community/
│           └── settings/
├── components/
│   ├── DashboardSidebar.tsx          # Persona-aware nav (desktop + mobile)
│   ├── PWAInstallBanner.tsx
│   └── ui/                           # shadcn/ui components (Button, Calendar, Popover, etc.)
├── context/
│   └── auth-context.tsx              # Global auth state (useAuth hook)
├── lib/
│   ├── api/
│   │   ├── client.ts                 # ApiClient class + singleton
│   │   ├── hooks/                    # TanStack Query hooks per domain
│   │   │   ├── use-current-user.ts
│   │   │   ├── use-transactions.ts
│   │   │   ├── use-opportunities.ts
│   │   │   ├── use-economic-profile.ts
│   │   │   └── ...
│   │   └── index.ts
│   └── utils.ts                      # cn() and other helpers
├── middleware.ts                      # Auth guard — redirects unauthenticated users
└── public/
    ├── manifest.json                  # PWA manifest
    └── sw.js                          # Service worker
```
