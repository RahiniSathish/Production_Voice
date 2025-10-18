# Multi-stage build for AI Travel Voice Agent
FROM python:3.10-slim as base

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    make \
    libffi-dev \
    libssl-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements
COPY requirements.txt .
COPY app/api/requirements.txt ./api_requirements.txt
COPY app/frontend/requirements.txt ./frontend_requirements.txt
COPY agent/requirements.txt ./agent_requirements.txt

# Install Python dependencies
RUN pip install --upgrade pip && \
    pip install -r requirements.txt && \
    pip install -r api_requirements.txt && \
    pip install -r frontend_requirements.txt && \
    pip install -r agent_requirements.txt

# Copy application code
COPY . .

# Create necessary directories
RUN mkdir -p logs db/data

# Expose ports
EXPOSE 8000 8506

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/ || exit 1

# Default command
CMD ["python", "run.py", "--with-agent"]

