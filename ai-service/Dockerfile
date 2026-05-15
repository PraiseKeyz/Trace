FROM python:3.12-slim

WORKDIR /app

# Install system dependencies for ML libraries
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better layer caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Pre-download the embedding model to bake it into the image.
# Override EMBEDDING_MODEL_NAME at build time if needed.
ARG EMBEDDING_MODEL_NAME=sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2
RUN python -c "from sentence_transformers import SentenceTransformer; import os; SentenceTransformer(os.environ.get('EMBEDDING_MODEL_NAME', '${EMBEDDING_MODEL_NAME}'))"

# Copy application code
COPY . .

EXPOSE 8000 50051

CMD ["python", "run_services.py"]
