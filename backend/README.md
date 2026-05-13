# Trace Backend Service

NestJS backend for Trace. It handles authentication, economic profiles, opportunities, transactions, Squad payment integration, Squad webhooks, and gRPC calls to the Python AI service.

## Setup

```bash
npm install
npx prisma db push
npx prisma generate
npm run start:dev
```

The API runs at:

```text
http://localhost:5000/api/v1
```

## Environment Variables

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

## Squad Services

Implemented:

- `GET /api/v1/squad/banks` - returns Nigerian banks and bank codes from `src/squad/data/nigerian-banks.json`.
- `POST /api/v1/squad/virtual-accounts` - creates a Squad virtual account for the authenticated user.
- `POST /api/v1/squad/payment-links` - generates a Squad payment link.
- `POST /api/v1/squad/accounts/resolve` - resolves a bank account name.
- `POST /api/v1/squad/transfers` - transfers funds to a bank account.
- `POST /api/v1/squad/transfers/requery` - checks transfer status.
- `GET /api/v1/squad/transfers` - lists transfers.
- `POST /api/v1/webhooks/squad` - receives Squad webhook events.

The webhook validates `x-squad-encrypted-body`, records the transaction, updates economic profile transaction totals, and triggers score recalculation for successful payments. Duplicate successful webhook retries are handled idempotently.

## Onboarding Virtual Account Flow

`POST /api/v1/auth/onboard` still completes Trace onboarding. If the request includes the Squad-required identity data, the backend also creates a virtual account and saves Squad identifiers on the user.

Virtual-account fields:

```json
{
  "email": "user@example.com",
  "bvn": "22222222222",
  "dob": "31/12/1990",
  "address": "1 Market Road, Lagos",
  "gender": "1",
  "firstName": "Tunde",
  "lastName": "Adebayo",
  "beneficiaryAccount": "0123456789"
}
```

## Build

```bash
npm.cmd run build
```
