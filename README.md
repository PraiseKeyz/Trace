# Trace

Trace is an AI-powered economic identity platform for informal traders, gig workers, and job seekers. It turns payments, gigs, profile data, and community activity into a verifiable economic profile that can unlock matching, market intelligence, and financial products.

## Project Structure

- `backend/` - NestJS API, PostgreSQL/Prisma persistence, Squad payment integration, JWT auth, webhooks, and gRPC client for AI scoring.
- `frontend/` - Client application.
- `ai-service/` - Python AI service for scoring, matching, and intelligence generation.
- `document_pdf.pdf` - Architecture document used for the system design.

## Backend Setup

```bash
cd backend
npm install
npx prisma db push
npx prisma generate
npm run start:dev
```

The backend listens on `PORT` or `5000` by default. Versioned API routes are served under:

```text
http://localhost:5000/api/v1
```

## Backend Environment

Create `backend/.env`:

```env
DATABASE_URL="postgresql://user:pass@host:5432/db?schema=public"
JWT_SECRET="your_secure_random_string"
NODE_ENV="development"
PORT=5000
FRONTEND_URL="http://localhost:3000"

TWILIO_ACCOUNT_SID="your_twilio_sid"
TWILIO_AUTH_TOKEN="your_twilio_auth_token"
TWILIO_PHONE_NUMBER="+1234567890"

AI_SERVICE_URL="localhost:50051"

SQUAD_SECRET_KEY="your_squad_secret_key"
SQUAD_BASE_URL="https://sandbox-api-d.squadco.com"
```

## Squad Integration

The backend now includes a dedicated Squad module for the payment flows required by the Trace architecture.

Implemented services:

- Virtual account creation.
- Payment link generation.
- Bank account resolution.
- Account transfer.
- Transfer requery.
- Transfer listing.
- Nigerian bank list endpoint backed by a local JSON bank-code file.
- Squad webhook signature validation.
- Webhook transaction persistence.
- Economic profile transaction-stat updates after successful Squad payments.
- Score recalculation trigger after successful Squad webhook events.

## Squad Endpoints

All routes below are under `/api/v1`.

```text
GET  /squad/banks
POST /squad/virtual-accounts
POST /squad/payment-links
POST /squad/accounts/resolve
POST /squad/transfers
POST /squad/transfers/requery
GET  /squad/transfers
POST /webhooks/squad
```

Authenticated Squad routes use the same JWT auth guard as the rest of the backend. The webhook route is public and validates `x-squad-encrypted-body`.

## Onboarding and Virtual Accounts

`POST /api/v1/auth/onboard` updates the user profile and creates the initial economic profile. If the request includes Squad-required identity fields, it also creates a Squad virtual account and stores the returned customer identifier/account number on the user record.

Required fields for virtual account creation:

```json
{
  "email": "user@example.com",
  "bvn": "22222222222",
  "dob": "31/12/1990",
  "address": "1 Market Road, Lagos",
  "gender": "1",
  "firstName": "Tunde",
  "lastName": "Adebayo"
}
```

## Verification

Build the backend:

```bash
cd backend
npm.cmd run build
```

On Windows PowerShell, `npm.cmd` avoids execution-policy issues with `npm.ps1`.
