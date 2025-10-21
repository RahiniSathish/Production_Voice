#!/bin/bash

echo "🚀 Starting AI Travel Agency with LiveKit Voice Agent"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Kill existing services
echo "🧹 Cleaning up old processes..."
pkill -9 -f "uvicorn api:app"
pkill -9 -f "agent.py dev"
pkill -9 -f "npm run dev"
sleep 2

# Start Backend API
echo ""
echo -e "${GREEN}1️⃣ Starting Backend API (Port 8000)...${NC}"
cd "$SCRIPT_DIR/app/api"
/Users/apple/.pyenv/versions/3.10.13/bin/python -m uvicorn api:app --host 0.0.0.0 --port 8000 > /tmp/backend.log 2>&1 &
BACKEND_PID=$!
echo "   Backend PID: $BACKEND_PID"
sleep 3

# Check if backend started
if curl -s http://localhost:8000/docs > /dev/null; then
    echo -e "${GREEN}   ✅ Backend API is running${NC}"
else
    echo -e "${RED}   ❌ Backend failed to start${NC}"
    exit 1
fi

# Start LiveKit Agent
echo ""
echo -e "${GREEN}2️⃣ Starting LiveKit Voice Agent...${NC}"
cd "$SCRIPT_DIR/agent"
/Users/apple/.pyenv/versions/3.10.13/bin/python agent.py dev > /tmp/agent.log 2>&1 &
AGENT_PID=$!
echo "   Agent PID: $AGENT_PID"
sleep 5

# Check if agent registered
if tail -20 /tmp/agent.log | grep -q "registered worker"; then
    echo -e "${GREEN}   ✅ LiveKit Agent registered${NC}"
    WORKER_ID=$(tail -20 /tmp/agent.log | grep "registered worker" | grep -o '"id": "[^"]*"' | cut -d'"' -f4)
    echo "   Worker ID: $WORKER_ID"
else
    echo -e "${YELLOW}   ⚠️  Agent may still be starting...${NC}"
fi

# Start Frontend
echo ""
echo -e "${GREEN}3️⃣ Starting React Frontend (Port 3001)...${NC}"
cd "$SCRIPT_DIR/frontend"
npm run dev -- --port 3001 --host 0.0.0.0 > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "   Frontend PID: $FRONTEND_PID"
sleep 3

# Check if frontend started
if curl -s http://localhost:3001 > /dev/null; then
    echo -e "${GREEN}   ✅ Frontend is running${NC}"
else
    echo -e "${RED}   ❌ Frontend failed to start${NC}"
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}🎉 ALL SERVICES STARTED SUCCESSFULLY!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Service Status:"
echo "   ✅ Backend API:     http://localhost:8000"
echo "   ✅ Frontend:        http://localhost:3001"
echo "   ✅ LiveKit Agent:   Registered & Listening"
echo ""
echo "🎤 Voice Chat Ready:"
echo "   1. Open: http://localhost:3001/voice"
echo "   2. Login with your credentials"
echo "   3. Click: 'Start Real-Time Voice Chat'"
echo "   4. Allow microphone access"
echo "   5. Start talking!"
echo ""
echo "📊 View Logs:"
echo "   Backend:  tail -f /tmp/backend.log"
echo "   Agent:    tail -f /tmp/agent.log"
echo "   Frontend: tail -f /tmp/frontend.log"
echo ""
echo "🛑 Stop All Services:"
echo "   pkill -9 -f 'uvicorn api:app'"
echo "   pkill -9 -f 'agent.py dev'"
echo "   pkill -9 -f 'npm run dev'"
echo ""
echo "Press Ctrl+C to stop monitoring (services will keep running)"
echo ""

# Monitor services
echo "📡 Monitoring services (press Ctrl+C to exit)..."
echo ""

while true; do
    sleep 5
    
    # Check backend
    if ! ps -p $BACKEND_PID > /dev/null 2>&1; then
        echo -e "${RED}❌ Backend crashed!${NC}"
        tail -10 /tmp/backend.log
        break
    fi
    
    # Check agent
    if ! ps -p $AGENT_PID > /dev/null 2>&1; then
        echo -e "${RED}❌ Agent crashed!${NC}"
        tail -10 /tmp/agent.log
        break
    fi
    
    # Check frontend
    if ! ps -p $FRONTEND_PID > /dev/null 2>&1; then
        echo -e "${RED}❌ Frontend crashed!${NC}"
        tail -10 /tmp/frontend.log
        break
    fi
    
    echo -ne "✅ All services running... $(date '+%H:%M:%S')\r"
done

