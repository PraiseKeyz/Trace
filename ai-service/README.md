# Trace AI Microservice

The AI/ML intelligence engine for the Trace economic platform. Built with Python and FastAPI, this service handles identity score calculation, multilingual opportunity matching (powered by **AfroXLM-R**), and market intelligence generation.

> **AfroXLM-R Integration**: Uses `Davlan/afro-xlmr-large` — a transformer model pre-trained on **17 African languages** — to embed natural language skill descriptions into a shared vector space. A user can describe their skill in **Swahili, Twi, Wolof, Yoruba, Pidgin, Hausa, Igbo** or any supported language and be matched to a job posted in English.

## System Architecture

This service is called internally by the Node.js backend via HTTP. It exposes three core engines:

### Engine 1: Identity Engine — `POST /score/calculate`
Evaluates trustworthiness and calculates an alternative credit score based on:
| Signal | Weight | Question |
|---|---|---|
| Transaction history | 40% | Does money move through this person consistently? |
| Platform activity | 20% | Are they showing up and completing things? |
| Community vouching | 25% | Do people who've dealt with them vouch for them? |
| Profile completeness | 15% | Have they been honest about who they are? |

**Risk Tier Assignment:**
| Score | Risk Tier | Loan Eligibility |
|---|---|---|
| 0-29 | High | Not eligible |
| 30-54 | Medium | Up to ₦50,000 |
| 55-74 | Low | Up to ₦200,000 |
| 75-100 | Very Low | Up to ₦500,000 |

### Engine 2: Matching Engine — `POST /match/opportunities`
Returns ranked opportunities using AfroXLM-R multilingual embeddings:
| Factor | Weight | Method |
|---|---|---|
| Skill overlap | 40% | AfroXLM-R semantic similarity (cross-language) |
| Proximity | 25% | Haversine distance calculation |
| Language match | 15% | Direct language overlap check |
| Historical success | 20% | Past gig completion rate |

### Engine 3: Intelligence Engine — `POST /intelligence/generate`
Aggregates transaction data into market insights (weekly cron):
- Demand index (0-100) normalised against 4-week rolling average
- Trend direction (rising/falling/stable)
- Plain-English insight strings for trader's feed

### Learning Loop — `POST /match/retrain`
Monthly retraining adjusts matching weights based on actual gig outcomes.

## Project Structure

```text
ai-service/
├── api/
│   ├── intelligence.py        # Trade intelligence generation endpoints
│   ├── match.py               # Opportunity matching + embedding endpoints
│   └── score.py               # Identity score calculation endpoints
├── core/
│   ├── cache.py               # Redis cache layer
│   ├── config.py              # Environment variables & configuration
│   ├── database.py            # Async SQLAlchemy database connection
│   ├── embeddings.py          # AfroXLM-R embedding engine
│   ├── models.py              # SQLAlchemy ORM models (mirrors backend DB)
│   └── schemas.py             # Pydantic request/response schemas
├── engines/
│   ├── __init__.py            # Identity engine (score calculation)
│   ├── intelligence_engine.py # Market intelligence generation
│   ├── matching_engine.py     # Opportunity matching (AfroXLM-R)
│   └── retraining_engine.py   # Monthly model retraining
├── main.py                    # FastAPI application entry point
├── requirements.txt           # Python dependencies
├── Dockerfile                 # Container (pre-bakes AfroXLM-R model)
├── .env.example               # Environment configuration template
└── .gitignore
```

## Setup and Installation

1. Navigate to the `ai-service` directory.
2. Create a virtual environment:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Copy `.env.example` to `.env` and configure:
   ```bash
   cp .env.example .env
   ```
5. The AfroXLM-R model (~1.2GB) will be downloaded on first run.

## Running the Service

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**API Documentation:**
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
- Health: `http://localhost:8000/health`

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/score/calculate` | Calculate identity score |
| GET | `/score/cached/{user_id}` | Get cached score |
| DELETE | `/score/cache/{user_id}` | Invalidate cached score |
| POST | `/match/opportunities` | Match user to opportunities |
| POST | `/match/embed` | Encode text to embeddings |
| POST | `/match/skill-similarity` | Compare skills across languages |
| POST | `/match/retrain` | Monthly model retraining |
| POST | `/intelligence/generate` | Generate market intelligence |
| GET | `/intelligence/feed/{cat}/{city}` | Get cached intelligence |
| POST | `/intelligence/batch-generate` | Batch intelligence generation |
| GET | `/health` | Service health check |

## Multilingual Matching Examples

The AfroXLM-R model enables cross-language skill matching:

```
"I fit repair phone screen well well" (Pidgin)  ≈  "Phone repair" (English)
"Mimi ni fundi wa simu" (Swahili)                ≈  "Phone technician" (English)
"Mo le ṣe atunṣe foonu" (Yoruba)                 ≈  "Phone repair" (English)
"Ina iya gyaran wayar hannu" (Hausa)              ≈  "Phone repair" (English)
```

## Supported African Languages

AfroXLM-R was pre-trained on: Afrikaans, Amharic, Hausa, Igbo, Malagasy, Chichewa, Oromo, Naija (Pidgin), Kinyarwanda, Kirundi, Shona, Somali, Sesotho, Swahili, Tigrinya, Wolof, Yoruba — plus English and French.
