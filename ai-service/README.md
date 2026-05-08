# Trace AI Microservice

This is the AI/ML layer for the Trace economic platform. Built with Python and FastAPI, this service acts as the intelligence engine, handling score calculations, opportunity matching, and market intelligence generation. It is designed to be called internally by the Node.js backend.

## System Role

As defined in the Trace System Architecture, this service exposes endpoints to:
1. **Identity Engine**: Evaluate trustworthiness and risk tier (`POST /score/calculate`) based on transaction history, activity, vouches, and profile completeness.
2. **Matching Engine**: Provide intelligent ranking and matching of gig opportunities to users (`POST /match/opportunities`) leveraging skills, proximity, languages, and historical success.
3. **Intelligence Engine**: Aggregate and generate market/trade intelligence (`POST /intelligence/generate`) providing demand index and insights.

## Project Structure

```text
ai-service/
├── api/
│   ├── intelligence.py   # Trade intelligence generation route
│   ├── match.py          # Gig/opportunity matching route
│   └── score.py          # Identity score calculation route
├── core/
│   └── config.py         # Environment variables & configurations
├── main.py               # FastAPI application entry point
├── requirements.txt      # Python dependencies
├── Dockerfile            # Containerization instructions
├── .env.example          # Example environment configurations
└── .gitignore
```

## Setup and Installation

1. Navigate to the `ai-service` directory.
2. Create a virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Copy the `.env.example` to `.env` and adjust the configuration as necessary.

## Running the Service

You can start the development server using Uvicorn:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Once running, you can access the automatic interactive API documentation at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
