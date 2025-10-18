#!/bin/bash

# ==========================================
# AI Travel Voice Agent - Deployment Script
# ==========================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  AI Travel Voice Agent - Deployment${NC}"
echo -e "${GREEN}========================================${NC}"

# Check if .env exists
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ Error: .env file not found${NC}"
    echo -e "${YELLOW}Please copy env.example to .env and configure it${NC}"
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Error: Docker is not installed${NC}"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Error: Docker Compose is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites check passed${NC}"

# Stop existing containers
echo -e "${YELLOW}🔻 Stopping existing containers...${NC}"
docker-compose down

# Build images
echo -e "${YELLOW}🔨 Building Docker images...${NC}"
docker-compose build

# Start services
echo -e "${YELLOW}🚀 Starting services...${NC}"
docker-compose up -d

# Wait for services to be healthy
echo -e "${YELLOW}⏳ Waiting for services to be ready...${NC}"
sleep 10

# Check service health
echo -e "${GREEN}🔍 Checking service health...${NC}"

# Check API
if curl -f http://localhost:8000/ > /dev/null 2>&1; then
    echo -e "${GREEN}✅ API is running on http://localhost:8000${NC}"
else
    echo -e "${RED}❌ API is not responding${NC}"
fi

# Check Frontend
if curl -f http://localhost:8506/ > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend is running on http://localhost:8506${NC}"
else
    echo -e "${RED}❌ Frontend is not responding${NC}"
fi

# Check MCP Server
if curl -f http://localhost:8080/ > /dev/null 2>&1; then
    echo -e "${GREEN}✅ MCP Server is running on http://localhost:8080${NC}"
else
    echo -e "${RED}❌ MCP Server is not responding${NC}"
fi

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}🎉 Deployment complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "Access URLs:"
echo -e "  Frontend: ${GREEN}http://localhost:8506${NC}"
echo -e "  API Docs: ${GREEN}http://localhost:8000/docs${NC}"
echo -e "  MCP Server: ${GREEN}http://localhost:8080${NC}"
echo ""
echo -e "Useful commands:"
echo -e "  View logs: ${YELLOW}docker-compose logs -f${NC}"
echo -e "  Stop all: ${YELLOW}docker-compose down${NC}"
echo -e "  Restart: ${YELLOW}docker-compose restart${NC}"
echo ""

