# Trace — Backend Service

The primary API server for the Trace platform. Handles all client requests, database persistence via Prisma/PostgreSQL, Squad payment integration, and acts as the gRPC client to the Python AI service.

---

## Tech Stack

| | |
|--|--|
| Framework | NestJS 11 |
| Language | TypeScript |
| Database | PostgreSQL via Prisma ORM (Neon serverless) |
| Auth | Phone OTP (Twilio) + JWT + HttpOnly Cookies |
| Internal Comm | gRPC client → Python AI service |
| Rate Limiting | NestJS Throttler |
| Package Manager | pnpm |

---

## Setup

### Prerequisites
- Node.js >= 18
- pnpm
- PostgreSQL database (local or Neon)
- Python AI Service running on port 50051 (for gRPC endpoints)

### 1. Install

```bash
pnpm install
```

### 2. Environment Variables

Create `backend/.env`:

```env
NODE_ENV=development
PORT=5001
DATABASE_URL="postgresql://user:pass@host:5432/db?schema=public"
JWT_SECRET="your_secure_random_string"
FRONTEND_URL="http://localhost:3001"
AI_SERVICE_URL="localhost:50051"

# Twilio — leave empty in development, mock SMS is used automatically
TWILIO_ACCOUNT_SID="ACxxxxxxxxxx"
TWILIO_AUTH_TOKEN="your_auth_token"
TWILIO_PHONE_NUMBER="+1234567890"

# Squad Payment Integration
SQUAD_PRIVATE_KEY="your_private_key"
SQUAD_PUBLIC_KEY="your_public_key"
SQUAD_SECRET_KEY="your_secret_key"
```

### 3. Database Setup

```bash
# Push schema to the database
pnpm prisma db push

# Generate Prisma client
pnpm prisma generate
```

### 4. Run

```bash
# Development (watch mode)
pnpm start:dev

# Production build
pnpm build
pnpm start:prod
```

---

## API Reference

All routes are prefixed with `/api/v1`. Protected routes require a valid JWT cookie (set on login).

### Auth — `POST /api/v1/auth/*`

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/auth/register` | — | Register with phone + password, sends OTP |
| POST | `/auth/login` | — | Login, returns JWT cookie |
| POST | `/auth/logout` | — | Clears JWT cookie |
| POST | `/auth/verify-otp` | — | Verify phone OTP |
| POST | `/auth/resend-otp` | — | Resend OTP (rate limited: 3/60s) |
| POST | `/auth/onboard` | JWT | Complete onboarding profile |
| POST | `/auth/forgot-password` | — | Initiate password reset via OTP |
| POST | `/auth/reset-password` | — | Set new password with OTP |
| GET | `/auth/me` | JWT | Get current authenticated user |

Rate limits: register/login 5 req/60s · resend-otp 3 req/60s · global 10 req/60s

### Users — `GET/PUT /api/v1/users/*`

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/users/profile` | JWT | Get full user profile |
| PUT | `/users/profile` | JWT | Update profile fields |
| POST | `/users/change-password` | JWT | Change password |

### Economic Profile — `/api/v1/economic-profile/*`

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/economic-profile/my-profile` | JWT | Get user's economic profile and score |
| PUT | `/economic-profile/skills` | JWT | Update skills and trade category |
| POST | `/economic-profile/recalculate-score` | JWT | Trigger gRPC score recalculation |

### Opportunities — `/api/v1/opportunities/*`

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/opportunities` | JWT | Post a new opportunity |
| GET | `/opportunities` | JWT | List all open opportunities |
| GET | `/opportunities/:id` | JWT | Get opportunity details + applicants |
| POST | `/opportunities/apply` | JWT | Apply for an opportunity |
| POST | `/opportunities/match` | JWT | Get AI-matched opportunities (calls gRPC) |

### Transactions — `/api/v1/transactions/*`

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/transactions` | JWT | Record a new transaction |
| GET | `/transactions` | JWT | List user's transactions (sent + received) |
| GET | `/transactions/:id` | JWT | Get transaction details |
| PATCH | `/transactions/:id/status` | JWT | Update status (triggers score recalc on success) |

---

## Database Schema

Five Prisma models:

```
User (1:1) EconomicProfile
User (1:many) Transaction
User (1:many) Opportunity (posted)
Opportunity (1:many) OpportunityApplication
```

Key fields on **EconomicProfile**: `identity_score`, `risk_tier`, `is_finance_eligible`, `max_recommended_loan`, `total_transaction_volume`, `vouch_count`, `verified_vouch_count`, `skills`, `trade_category`.

Full schema: [`prisma/schema.prisma`](./prisma/schema.prisma)

---

## Authentication Flow

1. User registers with phone + password
2. Password hashed with Argon2; 6-digit OTP generated and sent via Twilio
3. JWT issued immediately (user can proceed to onboarding)
4. OTP verification sets `is_phone_verified = true`
5. JWT is stored as an httpOnly, sameSite strict cookie (7-day expiry)
6. `JwtAuthGuard` validates the cookie on every protected route
7. `JWT_SECRET` from env is used to sign/verify tokens

---

## gRPC Integration

The backend calls the Python AI service via gRPC for two operations:

| Method | gRPC Call | Triggered By |
|--------|-----------|--------------|
| Score recalculation | `ScoringService.CalculateScore` | `POST /economic-profile/recalculate-score`, successful transaction |
| Opportunity matching | `MatchingService.MatchOpportunities` | `POST /opportunities/match` |

The shared contract is [`proto/trace.proto`](./proto/trace.proto). The `GrpcModule` manages the connection to `AI_SERVICE_URL` (default `localhost:50051`). The `GrpcService` provides typed wrapper methods.

The AI service must be running before any gRPC-dependent endpoint is called.

---

## Project Structure

```
src/
├── auth/                  # Registration, login, OTP, JWT strategy
├── users/                 # Profile read/update, password change
├── economic-profile/      # Score profile, skills, recalculation
├── transactions/          # Transaction CRUD, status updates
├── opportunities/         # Gig posting, applications, AI matching
├── grpc/                  # gRPC client module and service
├── sms/                   # Twilio SMS wrapper (mock in dev)
├── common/
│   ├── filters/           # Global HTTP exception filter
│   ├── interceptors/      # Response transform interceptor
│   └── interfaces/
├── app.module.ts
└── main.ts                # Bootstrap, CORS, global pipes/filters
```
