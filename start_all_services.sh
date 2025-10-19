#!/bin/bash

# Complete Startup Script for Attar Travel Voice Agent
# This script starts all three required components

set -e

PROJECT_DIR="/Users/sathishk/Documents/Production_Voice"
cd "$PROJECT_DIR"

echo "🚀 ============================================"
echo "🚀 Attar Travel Voice Agent - Complete Startup"
echo "🚀 ============================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Kill any existing processes
log_warn "Cleaning up old processes..."
pkill -f "python.*agent.py" || true
pkill -f "uvicorn" || true
pkill -f "streamlit" || true
sleep 2

# Step 1: Start Agent Worker
log_info "Starting LiveKit Agent Worker..."
python agent/agent.py dev > /tmp/agent_worker.log 2>&1 &
AGENT_PID=$!
log_success "Agent Worker started (PID: $AGENT_PID)"
sleep 3

# Step 2: Start Backend API
log_info "Starting Backend API..."
cd app/api
python -m uvicorn api:app --host 0.0.0.0 --port 8000 > /tmp/api_backend.log 2>&1 &
API_PID=$!
log_success "Backend API started (PID: $API_PID)"
sleep 2
cd "$PROJECT_DIR"

# Step 3: Start Frontend
log_info "Starting Streamlit Frontend..."
cd app/frontend
python -m streamlit run app.py --server.headless=true --server.port 8506 > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!
log_success "Frontend started (PID: $FRONTEND_PID)"
sleep 3
cd "$PROJECT_DIR"

echo ""
log_success "============================================"
log_success "✅ ALL SERVICES STARTED SUCCESSFULLY!"
log_success "============================================"
echo ""

echo "📍 Access URLs:"
echo "   🌐 Web UI:  http://localhost:8506"
echo "   🔌 API:     http://localhost:8000"
echo ""

echo "📊 Service Status:"
echo "   🤖 Agent Worker (PID: $AGENT_PID): $(if kill -0 $AGENT_PID 2>/dev/null; then echo 'RUNNING'; else echo 'FAILED'; fi)"
echo "   🔙 Backend API (PID: $API_PID): $(if kill -0 $API_PID 2>/dev/null; then echo 'RUNNING'; else echo 'FAILED'; fi)"
echo "   🎨 Frontend (PID: $FRONTEND_PID): $(if kill -0 $FRONTEND_PID 2>/dev/null; then echo 'RUNNING'; else echo 'FAILED'; fi)"
echo ""

echo "📋 Live Logs:"
echo "   tail -f /tmp/agent_worker.log     (Agent Worker)"
echo "   tail -f /tmp/api_backend.log      (API Backend)"
echo "   tail -f /tmp/frontend.log         (Frontend)"
echo ""

log_success "🎤 LiveKit is NOW LISTENING for voice input!"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Wait for all processes
wait $AGENT_PID $API_PID $FRONTEND_PID
