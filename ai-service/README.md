# Trace — AI Microservice

The AI/ML layer for the Trace platform. Built with Python and FastAPI, this service handles economic identity score calculation, opportunity matching, and market intelligence generation. It is called internally by the NestJS backend over both gRPC (port 50051) and HTTP (port 8000).

---

## Tech Stack

| | |
|--|--|
| Framework | FastAPI |
| Language | Python 3.10+ |
| Embeddings | SentenceTransformers (`sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`) — multilingual, 50+ languages including major African languages |
| ML | scikit-learn, sentence-transformers, PyTorch |
| gRPC Server | grpcio + grpcio-tools |
| Database | PostgreSQL (SQLAlchemy async) |
| Server | Uvicorn |

---

## Setup

### 1. Create a virtual environment

```bash
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Environment Variables

Create `ai-service/.env`:

```env
DATABASE_URL="postgresql+asyncpg://user:pass@host:5432/db"
PORT=8000
```

### 4. Run

```bash
# Runs both FastAPI (port 8000) and gRPC server (port 50051)
python run_services.py
```

Or run them separately:

```bash
# FastAPI only
uvicorn main:app --reload --port 8000

# gRPC only
python grpc_server.py
```

API docs available at [http://localhost:8000/docs](http://localhost:8000/docs) (Swagger UI)

---

## Services

### 1. Identity Engine

Calculates a user's Economic Identity Score (0–1000) from four weighted signals:

| Signal | Weight | What It Measures |
|--------|--------|-----------------|
| Transaction History | 40% | Volume, frequency, consistency, recency |
| Community Vouching | 25% | Verified peer vouches (3x weight if verified) |
| Platform Activity | 20% | Gigs completed, logins, applications |
| Profile Completeness | 15% | Identity depth and verification |

Output includes `identity_score`, per-component breakdown, `risk_tier`, and `max_recommended_loan`.

**Risk Tiers:**

| Score | Tier | Max Loan |
|-------|------|----------|
| 0–299 | High | Not eligible |
| 300–549 | Medium | ₦50,000 |
| 550–749 | Low | ₦200,000 |
| 750–1000 | Very Low | ₦500,000 |

### 2. Matching Engine

Ranks open opportunities for a given user using:

| Factor | Weight |
|--------|--------|
| Skill Overlap | 40% |
| Proximity | 25% |
| Historical Success Rate | 20% |
| Language Match | 15% |

Skill similarity is computed using multilingual sentence embeddings, enabling semantic matching across languages. Proximity is scored via Haversine distance (max 100 km radius). Results are returned as a ranked list with per-opportunity match scores.

### 3. Intelligence Engine

Generates market intelligence for trade categories by location:
- **Demand index** — current transaction volume vs. 4-week rolling average
- **Trend** — rising / stable / falling
- **Confidence level** — High (50+ transactions), Medium (15+), Low
- Plain-language insights per category

---

## HTTP API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/` | Service info |
| GET | `/health` | Health check (model, DB status) |
| POST | `/score/calculate` | Calculate identity score for a user |
| POST | `/match/opportunities` | Match user to open opportunities |
| POST | `/match/embed` | Get text embeddings |
| POST | `/match/skill-similarity` | Compare user skills to job requirements |
| POST | `/intelligence/generate` | Generate market intelligence for a trade category |

---

## gRPC API

The gRPC server runs on port `50051`. The contract is defined in `proto/trace.proto` (shared with the backend).

Services exposed:
- `ScoringService.CalculateScore` — called by backend on score recalculation
- `MatchingService.MatchOpportunities` — called by backend on work-matcher requests

The proto file is kept in sync between `backend/proto/trace.proto` and `ai-service/proto/trace.proto`.

---

## Project Structure

```
ai-service/
├── main.py                     # FastAPI app, lifespan (model loading)
├── grpc_server.py              # Async gRPC server
├── run_services.py             # Runs FastAPI + gRPC concurrently
├── core/
│   ├── config.py               # Pydantic Settings — env vars + model config
│   ├── embeddings.py           # Embedding model loading, similarity helpers
│   ├── database.py             # SQLAlchemy async engine + session
│   ├── models.py               # SQLAlchemy ORM models
│   └── schemas.py              # Pydantic request/response schemas
├── engines/
│   ├── identity_engine.py      # Score calculation
│   ├── matching_engine.py      # Opportunity ranking
│   ├── intelligence_engine.py  # Market intelligence
│   └── retraining_engine.py    # Periodic model retraining
├── api/
│   ├── score.py                # /score/* routes
│   ├── match.py                # /match/* routes
│   └── intelligence.py         # /intelligence/* routes
├── proto/trace.proto           # gRPC service definitions (shared with backend)
├── requirements.txt
└── Dockerfile
```

---

## Notes

- The embedding model downloads automatically on first run. Set `MODEL_DEVICE=cuda` if a GPU is available.
- The gRPC server must be reachable by the NestJS backend before scoring or matching endpoints are called.
- In Docker Compose, the AI service exposes both port `8000` (HTTP) and port `50051` (gRPC).
