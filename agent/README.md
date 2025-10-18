# MCP Flight Data Server

Real-time flight data integration for AI Voice Travel Agent using Model Context Protocol (MCP).

## 🌟 Features

- ✈️ **Real-time Flight Data** - Live flight tracking and status
- 🔍 **Airport Search** - Search airports by city or country
- 🗺️ **Route Information** - Available routes between airports
- 🛫 **Flight Status** - Track specific flights by number
- 🌐 **Multi-API Support** - AviationStack + FlightAPI.io with automatic fallback

## 📦 Installation

### Node.js Server Setup

```bash
cd mcp
npm install
```

### Python Client Setup

```bash
cd mcp
pip install -r requirements.txt
```

## ⚙️ Configuration

1. **Copy environment template:**
   ```bash
   cp .env.template .env
   ```

2. **Add your API keys to `.env`:**
   - Get AviationStack API key: https://aviationstack.com/
   - Get FlightAPI.io key (optional): https://flightapi.io/

3. **Update .env file:**
   ```env
   AVIATIONSTACK_API_KEY=your_actual_key_here
   FLIGHTAPI_KEY=your_actual_key_here
   ```

## 🚀 Usage

### Start MCP Server

```bash
npm start
```

Server will run on: `http://localhost:8080`

### Test Python Client

```bash
python mcp_client.py
```

## 📡 API Endpoints

### Health Check
```
GET /
```

### MCP Manifest
```
GET /mcp/manifest
```

### Live Flights
```
GET /api/flights/live?from=MAA&to=DEL&date=2025-10-18
```

### Flight Status
```
GET /api/flights/status?flight_number=AI101&date=2025-10-18
```

### Airport Search
```
GET /api/airports?query=Mumbai
```

### Routes
```
GET /api/routes?from=MAA&to=DEL
```

### Airlines
```
GET /api/airlines?code=AI
```

## 🔌 Integration with AI Agent

### Python Usage

```python
from mcp.mcp_client import get_live_flights_for_ai, search_airports_for_ai

# Get flights
flights = get_live_flights_for_ai("MAA", "DEL")
print(flights)

# Search airports
airports = search_airports_for_ai("Mumbai")
print(airports)
```

### Add to Voice Agent Instructions

Update your agent's system prompt to include:

```python
instructions = """
...
When users ask about flights, you can:
1. Search for live flights between airports
2. Check specific flight status
3. Find airport information
4. Get route details

Available functions:
- get_live_flights_for_ai(from_airport, to_airport, date)
- get_flight_status_for_ai(flight_number, date)
- search_airports_for_ai(query)
...
"""
```

## 🧪 Testing

### Test MCP Server

```bash
# Health check
curl http://localhost:8080/

# Test flight search
curl "http://localhost:8080/api/flights/live?from=MAA&to=DEL"

# Test airport search
curl "http://localhost:8080/api/airports?query=Mumbai"
```

### Test Python Client

```bash
python mcp_client.py
```

## 🏗️ Architecture

```
┌─────────────────┐
│   AI Agent      │
│  (livekit/)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  MCP Client     │
│  (Python)       │
└────────┬────────┘
         │ HTTP
         ▼
┌─────────────────┐
│  MCP Server     │
│  (Node.js)      │
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌─────────┐ ┌──────────┐
│Aviation │ │FlightAPI │
│ Stack   │ │   .io    │
└─────────┘ └──────────┘
```

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | No (default: 8080) |
| `AVIATIONSTACK_API_KEY` | AviationStack API key | Yes |
| `AVIATIONSTACK_BASE_URL` | AviationStack base URL | Yes |
| `FLIGHTAPI_KEY` | FlightAPI.io key | Optional |
| `FLIGHTAPI_BASE_URL` | FlightAPI.io base URL | Optional |

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues or questions:
- Open an issue on GitHub
- Contact: attartravel25@gmail.com

## 🔗 Links

- AviationStack API: https://aviationstack.com/
- FlightAPI.io: https://flightapi.io/
- LiveKit Documentation: https://docs.livekit.io/

---

Made with ❤️ for Attar Travel AI Voice Agent

