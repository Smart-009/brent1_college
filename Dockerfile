FROM python:3.12-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY quant_engine/requirements-cloud.txt requirements.txt

# Upgrade pip & build tools
RUN pip install --no-cache-dir --upgrade pip setuptools wheel

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir --pre pandas-ta --no-deps

# Copy source code
COPY quant_engine /app/quant_engine

# Create database and logs directories
RUN mkdir -p /app/db /app/logs

# Expose default port
EXPOSE 8000

ENV PORT=8000
ENV PYTHONPATH=/app

# Start the cloud API server
CMD ["sh", "-c", "uvicorn quant_engine.server.api:app --host 0.0.0.0 --port ${PORT:-8000}"]
