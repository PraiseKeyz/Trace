# Trace — Backend Service

The primary API server for the Trace platform. Handles all client requests, database persistence via Prisma/PostgreSQL, Squad payment integration, file uploads, community vouching, and acts as the gRPC client to the Python AI service.

---

## Tech Stack

| | |
|--|--|
| Framework | NestJS 11 |
| Language | TypeScript |
| Database | PostgreSQL via Prisma ORM (Neon serverless) |
| Auth | Phone OTP + JWT + HttpOnly Cookies |
| SMS | Twilio / Textbelt (configurable via `SMS_PROVIDER`) |
| Payments | Squad Co (virtual accounts, payment links, transfers, webhooks) |
| File Upload | Multer (disk storage, `/api/v1/uploads/`) |
| Job Queue | BullMQ + Redis |
| Rate Limiting | NestJS Throttler (120 req/60s global) |
| Internal Comm | gRPC client → Python AI service |
| Package Manager | pnpm |

---

## Setup

### Prerequisites
- Node.js >= 18
- pnpm
- PostgreSQL database (local or Neon)
- Redis instance
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

# SMS — set SMS_PROVIDER to "twilio" or "textbelt"
SMS_PROVIDER="textbelt"
TWILIO_ACCOUNT_SID="ACxxxxxxxxxx"
TWILIO_AUTH_TOKEN="your_auth_token"
TWILIO_PHONE_NUMBER="+1234567890"
TEXTBELT_API_KEY="textbelt"

# Redis (used by BullMQ job queue)
REDIS_HOST="localhost"
REDIS_PORT=6379
REDIS_PASSWORD=""

# Squad Payment Integration
SQUAD_PRIVATE_KEY="your_private_key"
SQUAD_PUBLIC_KEY="your_public_key"
SQUAD_SECRET_KEY="your_secret_key"
SQUAD_MERCHANT_ID="your_merchant_id"
SQUAD_BASE_URL="https://sandbox-api-d.squadco.com"
SQUAD_CALLBACK_URL="https://yourdomain.com/api/v1/webhooks/squad"
BVN="00000000000"
SQUAD_BENEFICIARY_ACCOUNT_NUMBER="your_account_number"
```

### 3. Database Setup

Run pending migrations (never use `db push` in shared environments):

```bash
pnpm prisma migrate deploy

# Regenerate Prisma client after schema changes
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

### Auth — `/api/v1/auth/*`

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/auth/register` | — | Register with phone + password, sends OTP |
| POST | `/auth/login` | — | Login, returns JWT cookie |
| POST | `/auth/logout` | JWT | Clears JWT cookie |
| POST | `/auth/verify-otp` | — | Verify phone OTP |
| POST | `/auth/resend-otp` | — | Resend OTP |
| POST | `/auth/onboard` | JWT | Complete onboarding profile + create virtual account |

### Users — `/api/v1/users/*`

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/users/me` | JWT | Get current authenticated user |
| PATCH | `/users/me` | JWT | Update profile fields |
| POST | `/users/change-password` | JWT | Change password |

### Economic Profile — `/api/v1/economic-profile/*`

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/economic-profile/me` | JWT | Get user's economic profile and score |
| PATCH | `/economic-profile/me/skills` | JWT | Update skills, trade category, years active |
| POST | `/economic-profile/me/recalculate` | JWT | Trigger gRPC score recalculation |

### Opportunities — `/api/v1/opportunities/*`

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/opportunities` | JWT | Post a new opportunity (trader) |
| GET | `/opportunities` | JWT | List all open opportunities |
| GET | `/opportunities/my-posts` | JWT | Get jobs posted by the current user |
| GET | `/opportunities/my-applications` | JWT | Get current user's job applications |
| POST | `/opportunities/:id/apply` | JWT | Apply for an opportunity |
| POST | `/opportunities/:id/approve` | JWT | Approve an applicant (poster only) |
| POST | `/opportunities/:id/confirm` | JWT | Confirm job completion (poster only) |
| POST | `/opportunities/:id/dispute` | JWT | Raise a dispute |
| POST | `/opportunities/:id/mark-done` | JWT | Mark job as done (worker) |
| GET | `/opportunities/matches` | JWT | Get AI-matched opportunities (calls gRPC) |

### Transactions — `/api/v1/transactions/*`

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/transactions` | JWT | Record a new transaction |
| GET | `/transactions` | JWT | List user's transactions |
| GET | `/transactions/:id` | JWT | Get transaction details |
| PATCH | `/transactions/:id/status` | JWT | Update status |

### Squad Payments — `/api/v1/squad/*`

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/squad/banks` | JWT | List Nigerian banks |
| POST | `/squad/virtual-accounts` | JWT | Create a virtual account |
| POST | `/squad/payment-links` | JWT | Generate a payment link |
| POST | `/squad/accounts/resolve` | JWT | Resolve bank account details |
| POST | `/squad/transfers` | JWT | Initiate a transfer |
| POST | `/squad/transfers/requery` | JWT | Requery transfer status |
| GET | `/squad/transfers` | JWT | List transfers |
| POST | `/webhooks/squad` | — | Squad payment webhook (validates signature) |

### Vouch — `/api/v1/vouch/*`

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/vouch` | JWT | Vouch for another user |
| GET | `/vouch/received` | JWT | Vouches received by current user |
| GET | `/vouch/given` | JWT | Vouches given by current user |
| DELETE | `/vouch/:id` | JWT | Remove a vouch |

### Upload — `/api/v1/upload/*`

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/upload` | — | Upload a file (returns URL path) |
| DELETE | `/upload/:filename` | — | Delete an uploaded file |

Uploaded files are served statically at `/api/v1/uploads/:filename`.

---

## Database Schema

Core Prisma models:

```
User (1:1) EconomicProfile
User (1:many) Transaction
User (1:many) Opportunity (posted)
Opportunity (1:many) OpportunityApplication
User (1:many) Vouch (giver)
User (1:many) Vouch (receiver)
```

Key fields on **User**: `phone`, `full_name`, `first_name`, `last_name`, `email`, `gender`, `dob`, `address`, `persona` (`trader` | `gig_worker`), `squad_customer_id`, `virtual_account_no`, `is_phone_verified`, `onboarding_complete`.

Key fields on **EconomicProfile**: `identity_score`, `risk_tier`, `is_finance_eligible`, `max_recommended_loan`, `total_transaction_volume`, `vouch_count`, `verified_vouch_count`, `skills`, `trade_category`, `years_active`, `languages`.

Full schema: [`prisma/schema.prisma`](./prisma/schema.prisma)

---

## Authentication Flow

1. User registers with phone + password
2. Password hashed with Argon2; 6-digit OTP sent via SMS
3. JWT issued immediately after registration
4. OTP verification sets `is_phone_verified = true`
5. JWT is stored as an httpOnly, sameSite strict cookie (7-day expiry)
6. `JwtAuthGuard` validates the cookie on every protected route

> **Dev shortcut:** OTP `123456` is accepted universally in development (hackathon bypass).

---

## Onboarding & Virtual Account

`POST /api/v1/auth/onboard` updates the user profile and bootstraps the economic profile. If identity fields are provided, it also creates a Squad virtual account and stores the returned `squad_customer_id` and `virtual_account_no` on the user record.

Fields required for virtual account creation:

```json
{
  "firstName": "Tunde",
  "lastName": "Adebayo",
  "email": "tunde@example.com",
  "dob": "31/12/1990",
  "gender": "1",
  "address": "1 Market Road, Lagos"
}
```

`dob` must be `DD/MM/YYYY`. `gender` is `"1"` (male) or `"2"` (female). BVN is read from the `BVN` environment variable — users do not provide it.

---

## gRPC Integration

The backend calls the Python AI service via gRPC for two operations:

| Method | gRPC Call | Triggered By |
|--------|-----------|--------------|
| Score recalculation | `ScoringService.ScoreUser` | Successful transaction, explicit recalculate endpoint |
| Opportunity matching | `MatchingService.MatchOpportunities` | `GET /opportunities/matches` |

The shared contract is [`proto/trace.proto`](./proto/trace.proto). The `GrpcModule` manages the connection to `AI_SERVICE_URL` (default `localhost:50051`).

---

## Rate Limiting

Global throttle: **120 requests per 60 seconds** per IP (NestJS `ThrottlerGuard`). All endpoints share this limit. Adjust in `app.module.ts` if needed.

---

## Project Structure

```
src/
├── auth/                  # Registration, login, OTP, JWT strategy, onboarding
├── users/                 # Profile read/update, password change
├── economic-profile/      # Score profile, skills, recalculation
├── transactions/          # Transaction CRUD, status updates
├── opportunities/         # Job posting, applications, AI matching, approval flow
├── squad/                 # Squad payment integration, webhooks
├── vouch/                 # Peer vouching system
├── upload/                # File upload (Multer, disk storage)
├── sms/                   # SMS abstraction (Twilio / Textbelt)
├── grpc/                  # gRPC client module and service
├── common/
│   ├── filters/           # Global HTTP exception filter
│   ├── interceptors/      # Response transform interceptor
│   └── utils/             # Gender mapping and other helpers
├── app.module.ts          # Root module, BullMQ, ThrottlerGuard
└── main.ts                # Bootstrap, CORS, global pipes/filters
```
