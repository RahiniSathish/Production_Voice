# 🏗️ System Architecture

## Overview

The AI Travel Voice Agent is built on a microservices architecture with real-time voice capabilities.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Layer                               │
│  ┌───────────┐      ┌───────────┐      ┌───────────┐          │
│  │  Browser  │      │   Mobile  │      │    API    │          │
│  │  (WebRTC) │      │    App    │      │  Clients  │          │
│  └─────┬─────┘      └─────┬─────┘      └─────┬─────┘          │
└────────┼──────────────────┼──────────────────┼────────────────┘
         │                  │                  │
         │                  ▼                  │
         │        ┌────────────────────┐      │
         │        │   LiveKit Cloud    │      │
         │        │  (WebRTC Gateway)  │      │
         │        └─────────┬──────────┘      │
         │                  │                  │
┌────────┼──────────────────┼──────────────────┼────────────────┐
│        │    Application Layer                │                 │
│        │                  │                  │                 │
│        ▼                  ▼                  ▼                 │
│  ┌──────────┐      ┌──────────┐      ┌──────────┐           │
│  │ Frontend │      │ LiveKit  │      │ Backend  │           │
│  │(Streamlit)│─────│  Agent   │──────│ (FastAPI)│           │
│  │  :8506   │      │  Worker  │      │  :8000   │           │
│  └──────────┘      └─────┬────┘      └─────┬────┘           │
│                           │                  │                 │
│                           ▼                  ▼                 │
│                    ┌──────────┐      ┌──────────┐           │
│                    │ OpenAI   │      │ Database │           │
│                    │Realtime  │      │ (SQLite) │           │
│                    │   API    │      │          │           │
│                    └──────────┘      └──────────┘           │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────┼────────────────────────────────────┐
│     External Services  │                                     │
│                        │                                     │
│   ┌──────────┐   ┌─────▼─────┐   ┌──────────┐            │
│   │ Deepgram │   │    MCP    │   │AviationStack│          │
│   │   STT    │   │  Flight   │   │ FlightAPI │           │
│   │          │   │  Server   │   │           │           │
│   └──────────┘   │   :8080   │   └──────────┘            │
│                  └───────────┘                             │
└────────────────────────────────────────────────────────────┘
```

---

## Components

### 1. Frontend (Streamlit)
**Purpose:** Web-based user interface

**Key Features:**
- User authentication and registration
- Voice chat interface
- Conversation history viewer
- Booking management dashboard

**Tech Stack:**
- Streamlit 1.28+
- JavaScript (LiveKit WebRTC client)
- HTML/CSS for custom components

**Port:** 8506

### 2. Backend (FastAPI)
**Purpose:** REST API and business logic

**Key Features:**
- User authentication (JWT)
- LiveKit token generation
- Conversation transcript storage
- Booking management APIs
- Integration with external services

**Tech Stack:**
- FastAPI 0.104+
- Pydantic for data validation
- SQLAlchemy for database ORM
- bcrypt for password hashing

**Port:** 8000

### 3. LiveKit Agent
**Purpose:** Real-time voice processing and AI conversation

**Key Features:**
- Speech-to-Text (Deepgram)
- Text-to-Speech (OpenAI)
- Voice Activity Detection (Silero VAD)
- Conversation management
- Transcript capture and storage

**Tech Stack:**
- LiveKit Agents SDK 1.2+
- OpenAI Realtime API
- Deepgram SDK
- asyncio for concurrency

**Connects to:** LiveKit Cloud (WebRTC gateway)

### 4. MCP Flight Server
**Purpose:** Flight data aggregation and API gateway

**Key Features:**
- Live flight search
- Flight status tracking
- Airport database
- Route information
- Multi-provider fallback

**Tech Stack:**
- Node.js 18+
- Express.js
- Axios for API calls
- CORS for cross-origin requests

**Port:** 8080

### 5. Database (SQLite)
**Purpose:** Data persistence

**Schema:**
```sql
-- Customers
CREATE TABLE customers (
    id INTEGER PRIMARY KEY,
    email TEXT UNIQUE,
    name TEXT,
    password_hash TEXT,
    created_at TIMESTAMP
);

-- LiveKit Sessions
CREATE TABLE livekit_sessions (
    id INTEGER PRIMARY KEY,
    room_name TEXT UNIQUE,
    customer_id INTEGER,
    started_at TIMESTAMP,
    ended_at TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- Transcripts
CREATE TABLE transcripts (
    id INTEGER PRIMARY KEY,
    session_id INTEGER,
    speaker TEXT,
    text TEXT,
    timestamp TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES livekit_sessions(id)
);
```

---

## Data Flow

### Voice Chat Session

```
1. User clicks "Start Voice Chat"
   ↓
2. Frontend requests LiveKit token from Backend
   Backend → POST /livekit/get-token
   ↓
3. Backend generates JWT token with LiveKit credentials
   ↓
4. Frontend establishes WebRTC connection to LiveKit Cloud
   LiveKit Cloud ↔ Browser WebRTC
   ↓
5. LiveKit dispatches job to Agent Worker
   Backend → POST /livekit/dispatch
   ↓
6. Agent connects to room and starts conversation
   Agent → LiveKit Cloud → Browser
   ↓
7. User speaks → Speech captured
   Browser → LiveKit → Agent
   ↓
8. Agent processes speech
   a) STT (Deepgram): Audio → Text
   b) LLM (OpenAI): Text → Response
   c) TTS (OpenAI): Response → Audio
   ↓
9. Agent sends audio back
   Agent → LiveKit → Browser
   ↓
10. Transcript saved to database
    Agent → Backend → POST /livekit/transcript
    ↓
11. User hears response and continues conversation
    (Loop back to step 7)
```

### Flight Data Query

```
1. User asks: "Show flights from Chennai to Delhi"
   ↓
2. Agent extracts intent and parameters
   LLM: Intent=search_flights, from=MAA, to=DEL
   ↓
3. Agent calls MCP Flight Client
   Agent → mcp_client.get_live_flights_for_ai("MAA", "DEL")
   ↓
4. MCP Client sends HTTP request to MCP Server
   Python → HTTP GET → Node.js Server
   ↓
5. MCP Server queries external APIs
   Node.js → AviationStack API
   Node.js → FlightAPI.io (fallback)
   ↓
6. MCP Server formats and returns data
   Node.js → JSON Response → Python
   ↓
7. Agent formats response for user
   LLM: Format flight data as natural speech
   ↓
8. Agent speaks response to user
   TTS → Audio → Browser
```

---

## Communication Protocols

### HTTP REST API
- **Frontend ↔ Backend:** REST over HTTP/HTTPS
- **Agent ↔ Backend:** REST over HTTP/HTTPS
- **Agent ↔ MCP Server:** REST over HTTP/HTTPS

### WebSocket
- **Frontend ↔ LiveKit:** WebRTC over WebSocket (secure)
- **Agent ↔ LiveKit:** WebSocket (LiveKit protocol)

### WebRTC
- **Frontend ↔ LiveKit Cloud:** WebRTC for audio streaming
- **Signaling:** Via LiveKit WebSocket protocol
- **Media:** DTLS-SRTP encrypted audio

---

## Security

### Authentication Flow
```
1. User registers/logs in
   Frontend → POST /register or /login
   ↓
2. Backend validates credentials
   bcrypt.checkpw(password, hash)
   ↓
3. Backend generates session token
   JWT signed with SECRET_KEY
   ↓
4. Frontend stores token
   LocalStorage or SessionStorage
   ↓
5. Subsequent requests include token
   Headers: Authorization: Bearer <token>
```

### Data Encryption
- **In Transit:** TLS 1.3 for all HTTP/WebSocket connections
- **At Rest:** bcrypt hashed passwords, encrypted database (optional)
- **Audio:** DTLS-SRTP for WebRTC streams

### API Key Management
- Stored in `.env` file (never committed)
- Loaded via `python-dotenv`
- Validated at application startup
- Rotated periodically (recommended)

---

## Scalability

### Current Setup (Single Server)
- Handles ~100 concurrent users
- SQLite database
- Single LiveKit agent worker
- Suitable for development/small production

### Scaling Strategies

**Horizontal Scaling:**
```
┌─────────┐     ┌─────────┐     ┌─────────┐
│Backend 1│     │Backend 2│     │Backend 3│
└────┬────┘     └────┬────┘     └────┬────┘
     │               │               │
     └───────────────┴───────────────┘
                     │
              ┌──────▼──────┐
              │Load Balancer│
              └─────────────┘
```

**Database Upgrade:**
- SQLite → PostgreSQL for production
- Add connection pooling (SQLAlchemy)
- Implement database replicas for reads

**LiveKit Agent Scaling:**
- Deploy multiple agent workers
- LiveKit automatically distributes load
- Workers can run on separate machines

**MCP Server Scaling:**
- Deploy behind load balancer
- Use Redis for caching API responses
- Implement rate limiting per API provider

---

## Monitoring

### Health Checks
```bash
# Backend
curl http://localhost:8000/health

# MCP Server
curl http://localhost:8080/

# Agent Status
Check logs: tail -f livekit/logs/agent.log
```

### Metrics to Track
- **API Latency:** p50, p95, p99 response times
- **Error Rate:** 5xx errors per minute
- **Concurrent Users:** Active WebRTC sessions
- **Transcript Quality:** STT accuracy percentage
- **Agent Availability:** Worker uptime percentage

### Logging
- **Backend:** uvicorn access logs + custom app logs
- **Agent:** LiveKit SDK logs + custom logs
- **Frontend:** Browser console + Streamlit logs
- **MCP:** Express.js access logs

---

## Deployment

### Development
```bash
python run.py --with-agent
```

### Production (Docker)
```bash
docker-compose up -d
```

### Production (Manual)
```bash
# Backend
gunicorn backend.api:app --workers 4 --bind 0.0.0.0:8000

# Frontend
streamlit run frontend/app.py --server.port 8506

# Agent
python livekit/agent.py start

# MCP
pm2 start mcp/index.js --name mcp-server
```

---

## Technology Choices

### Why LiveKit?
- ✅ Low-latency WebRTC infrastructure
- ✅ Built-in agent framework
- ✅ Scales automatically
- ✅ Open source with cloud option

### Why FastAPI?
- ✅ Fast and modern Python framework
- ✅ Automatic API documentation
- ✅ Type safety with Pydantic
- ✅ AsyncIO support

### Why Streamlit?
- ✅ Rapid UI development
- ✅ Python-native (no separate frontend stack)
- ✅ Built-in session management
- ✅ Easy deployment

### Why MCP?
- ✅ Standardized protocol for AI tool use
- ✅ Separates data layer from AI logic
- ✅ Supports multiple data providers
- ✅ Extensible architecture

---

## Future Enhancements

1. **Multi-language Support**
   - Automatic language detection
   - Real-time translation

2. **Advanced Booking Features**
   - Multi-city itineraries
   - Hotel and car rental integration
   - Travel insurance

3. **Analytics Dashboard**
   - Customer behavior insights
   - Revenue tracking
   - Agent performance metrics

4. **Mobile Apps**
   - Native iOS/Android apps
   - Push notifications
   - Offline mode

5. **Payment Integration**
   - Stripe/PayPal for bookings
   - Multi-currency support
   - Secure tokenization

---

**Last Updated:** October 2025  
**Version:** 2.0

