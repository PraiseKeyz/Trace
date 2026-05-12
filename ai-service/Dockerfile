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

# Pre-download the AfroXLM-R model to bake it into the image
# This avoids downloading the model at runtime (~1.2GB)
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('Davlan/afro-xlmr-large')"

# Copy application code
COPY . .

EXPOSE 8000 50051

CMD ["python", "run_services.py"]
