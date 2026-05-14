# Trace — Economic Identity Platform

> *"Your hustle has a footprint. We make it visible."*

**Squad Hackathon 3.0 | Challenge 02: Intelligent Economic Platform**
Built by **Team Neuralstack**

- `backend/` - NestJS API, PostgreSQL/Prisma persistence, Squad payment integration, JWT auth, webhooks, and gRPC client for AI scoring.
- `frontend/` - Client application.
- `ai-service/` - Python AI service for scoring, matching, and intelligence generation.
- `document_pdf.pdf` - Architecture document used for the system design.

<<<<<<< HEAD
## What Is Trace?

Trace is an AI-powered platform that turns invisible informal economic activity into a verifiable digital identity — giving African traders, gig workers, and job seekers access to financial services they have always been excluded from.

The informal economy provides up to 70% of employment in sub-Saharan Africa. Traders are locked out of financial services not because they are not creditworthy, but because no system has ever tracked them. Trace is the data layer that bridges both sides.

### The Three Pillars

| Pillar | What It Does |
|--------|--------------|
| **Work Matcher** | AI matches gig workers to opportunities by skill, location, and language |
| **Trade Intelligence** | Gives traders real-time market demand signals and pricing insights |
| **Finance Gateway** | Exposes verified credit profiles to financial institution partners |

Everything feeds into one central record: **The Economic Identity Profile** — a composite score (0–1000) that grows with every transaction, gig, and interaction.

---

## Architecture

```
┌─────────────────────┐
│   Frontend (3001)   │  Next.js 16 · React 19 · Tailwind CSS · TypeScript
└────────┬────────────┘
         │ REST  (HTTPS + JWT cookie)
┌────────▼────────────┐
│   Backend  (5001)   │  NestJS 11 · TypeScript · Prisma · PostgreSQL
└────────┬────────────┘
         │ gRPC  (port 50051)
┌────────▼────────────┐
│  AI Service (8000)  │  FastAPI · Python · AfroXLM-R · scikit-learn
└─────────────────────┘
         │
    PostgreSQL (Neon) + Redis
```

- **Frontend → Backend:** REST over HTTPS, JWT stored in httpOnly cookies
- **Backend → AI Service:** gRPC for typed, low-latency internal calls (contract at `backend/proto/trace.proto`)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS 4, Radix UI, shadcn/ui |
| Backend | NestJS 11, TypeScript, Prisma ORM, PostgreSQL |
| AI Service | FastAPI, Python, AfroXLM-R (17 African languages), scikit-learn |
| Auth | Phone-based OTP (Twilio) + JWT + HttpOnly Cookies |
| Payments | Squad API (virtual accounts, escrow, webhooks) |
| Transport | gRPC / HTTP2 (backend ↔ AI service) |
| Containers | Docker + Docker Compose |
| CI/CD | GitHub Actions → Docker Hub → SSH deploy |
| Database | Neon (serverless PostgreSQL) |

---

## Repository Structure

```
squad-hackathon/
├── frontend/                  # Next.js application
├── backend/                   # NestJS REST API + gRPC client
├── ai-service/                # FastAPI HTTP + gRPC server (AI/ML)
├── docs/
│   ├── Trace_System_Architecture.md
│   └── API documentation/
├── docker-compose.yml
├── frontend.env
└── .github/workflows/deploy.yml

## Quick Start (Local Development)

### Prerequisites
- Node.js >= 18, pnpm
- Python >= 3.10
- PostgreSQL (local or [Neon](https://neon.tech))
- Redis

### 1. Install dependencies

```bash
# Backend
cd backend && pnpm install

# Frontend
cd ../frontend && pnpm install

# AI Service
cd ../ai-service && pip install -r requirements.txt
```

### 2. Configure environment variables

**`backend/.env`**
```env
NODE_ENV=development
PORT=5001
DATABASE_URL="postgresql://user:pass@host:5432/db?schema=public"
JWT_SECRET="your_secure_random_string"
FRONTEND_URL="http://localhost:3001"
AI_SERVICE_URL="localhost:50051"

# Twilio — omit in development, mock SMS is used automatically
TWILIO_ACCOUNT_SID="ACxxxxxxxxxx"
TWILIO_AUTH_TOKEN="your_token"
TWILIO_PHONE_NUMBER="+1234567890"

# Squad Payment
SQUAD_PRIVATE_KEY="your_key"
SQUAD_PUBLIC_KEY="your_key"
SQUAD_SECRET_KEY="your_key"
```

**`frontend/.env.local`**
```env
NEXT_PUBLIC_API_URL=http://localhost:5001
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3001
```

**`ai-service/.env`**
```env
DATABASE_URL="postgresql://user:pass@host:5432/db?schema=public"
REDIS_URL="redis://localhost:6379/0"
BACKEND_URL="http://localhost:5001"
EMBEDDING_MODEL_NAME="Davlan/afro-xlmr-large"
MODEL_DEVICE="cpu"
```

### 3. Database setup

```bash
cd backend
pnpm prisma db push
pnpm prisma generate
```

### 4. Run all services

```bash
# Terminal 1 — AI Service (FastAPI on :8000 + gRPC on :50051)
cd ai-service && python run_services.py

# Terminal 2 — Backend API
cd backend && pnpm start:dev

# Terminal 3 — Frontend
cd frontend && pnpm dev
```

Open [http://localhost:3001](http://localhost:3001)

---

## Docker Compose

```bash
# Copy and fill in the .env files, then:
docker compose pull
docker compose up -d
```

| Service | Port |
|---------|------|
| Frontend | 3001 |
| Backend API | 5001 |
| AI Service (HTTP) | 8000 |
| AI Service (gRPC) | 50051 |

> Redis is required by the AI service. Add a Redis service to docker-compose or point `REDIS_URL` at a managed instance.

---

## CI/CD Pipeline

Push to `main` triggers the GitHub Actions workflow in `.github/workflows/deploy.yml`:

1. Build and push Docker images (`praisekeyz6/trace:{frontend,backend,ai-service}`)
2. SSH into the production server
3. Write environment files from GitHub Secrets
4. Pull and restart with `docker compose up -d --force-recreate`

**Required GitHub Secrets:** `DATABASE_URL`, `JWT_SECRET`, `AI_SERVICE_URL`, `FRONTEND_URL`, `BACKEND_URL`, `SQUAD_PRIVATE_KEY`, `SQUAD_PUBLIC_KEY`, `SQUAD_SECRET_KEY`, `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`, `DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN`, `SERVER_HOST`, `SERVER_USER`, `SSH_PRIVATE_KEY`

---

## Economic Identity Score

| Signal | Weight | What It Measures |
|--------|--------|-----------------|
| Transaction History | 40% | Volume, frequency, consistency, recency |
| Community Vouching | 25% | Verified peer vouches |
| Platform Activity | 20% | Gigs completed, applications, logins |
| Profile Completeness | 15% | Identity verification and profile depth |

### Risk Tiers

| Score | Tier | Max Recommended Loan |
|-------|------|---------------------|
| 0–299 | High | Not eligible |
| 300–549 | Medium | ₦50,000 |
| 550–749 | Low | ₦200,000 |
| 750–1000 | Very Low | ₦500,000 |

---

## Further Reading

- [Backend README](./backend/README.md) — API reference, gRPC integration, database
- [AI Service README](./ai-service/README.md) — Scoring engine, matching engine, gRPC server
- [Frontend README](./frontend/README.md) — Pages, components, auth flow
- [System Architecture](./docs/Trace_System_Architecture.md) — Full technical design doc

---

## Team

**Team Neuralstack** — Squad Hackathon 3.0

- **Praise Adebayo** — Backend & AI/ML Engineer
- **Rebecca Ayodele** — Frontend Engineer
