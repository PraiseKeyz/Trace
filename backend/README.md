# Trace Backend Service

This is the main Node.js/NestJS backend for the Trace platform. It serves as the primary gateway for all client requests, handles database persistence via Prisma/PostgreSQL, manages Squad payment integration, and acts as a gRPC client to the Python AI service.

## Architecture

* **Framework:** NestJS
* **Language:** TypeScript
* **Database:** PostgreSQL via Prisma ORM
* **Authentication:** Phone-based OTP (Twilio) + JWT + HttpOnly Cookies
* **Internal Comm:** gRPC (to communicate with the Python AI microservice)

## Setup Instructions

### 1. Prerequisites
- Node.js >= 18
- PostgreSQL Database (running locally or Neon serverless)
- Python AI Service running (for gRPC features)

### 2. Environment Variables
Create a `.env` file in the `backend/` directory:
```env
DATABASE_URL="postgresql://user:pass@host:5432/db?schema=public"
JWT_SECRET="your_secure_random_string"
NODE_ENV="development"

# Twilio Settings
TWILIO_ACCOUNT_SID="your_sid"
TWILIO_AUTH_TOKEN="your_token"
TWILIO_PHONE_NUMBER="+1234567890"

# AI Service Settings
AI_SERVICE_URL="localhost:50051"
```

### 3. Installation
```bash
npm install
```

### 4. Database Setup
```bash
# Push the schema to the database
npx prisma db push

# Generate the Prisma Client
npx prisma generate
```

### 5. Running the Application
```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

## gRPC Integration

The backend communicates with the `ai-service` via gRPC for high-performance, strongly-typed internal calls. 

1. The shared contract is located at `proto/trace.proto`.
2. The `GrpcModule` handles connection pooling to `localhost:50051` (or whatever `AI_SERVICE_URL` is set to).
3. The `GrpcService` provides strongly typed methods to call the Python AI models (e.g. `this.grpcService.scoreUser(request)`).

*Note: Ensure the Python AI service is running before making requests that rely on AI logic, or the gRPC calls will fail.*
