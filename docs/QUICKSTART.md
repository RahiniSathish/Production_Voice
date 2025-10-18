# 🚀 Quick Start Guide

Get the AI Travel Voice Agent running in **5 minutes**!

---

## Prerequisites

- ✅ Python 3.10 or higher
- ✅ Node.js 18 or higher
- ✅ OpenAI API key
- ✅ LiveKit account (free tier works)
- ✅ Deepgram API key (free tier works)

---

## Step 1: Install Dependencies

```bash
cd Updated

# Backend
cd backend && pip install -r requirements.txt && cd ..

# Frontend
cd frontend && pip install -r requirements.txt && cd ..

# LiveKit Agent
cd livekit && pip install -r requirements.txt && cd ..

# MCP Flight Server
cd mcp && npm install && cd ..
```

---

## Step 2: Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit with your API keys
nano .env
```

**Minimum Required:**
```env
OPENAI_API_KEY=sk-your-key-here
LIVEKIT_URL=wss://your-livekit-url
LIVEKIT_API_KEY=your-api-key
LIVEKIT_API_SECRET=your-api-secret
DEEPGRAM_API_KEY=your-deepgram-key
AVIATIONSTACK_API_KEY=your-aviationstack-key
```

---

## Step 3: Start Everything

```bash
python run.py --with-agent
```

Wait 10-15 seconds for all services to start.

---

## Step 4: Access the App

Open your browser:
- **Frontend:** http://localhost:8506
- **API Docs:** http://localhost:8000/docs

---

## Step 5: Test Voice Chat

1. **Register** a new account
2. Click **"Start Voice Chat"**
3. Allow microphone permissions
4. Say: *"Show me flights from Chennai to Delhi"*

---

## ✅ Success Indicators

You should see:
```
✅ Backend running on port 8000
✅ Frontend running on port 8506
✅ LiveKit agent registered
✅ MCP server running on port 8080
```

---

## 🆘 Quick Fixes

### Port Already in Use
```bash
lsof -ti:8000 | xargs kill -9
lsof -ti:8506 | xargs kill -9
```

### Agent Not Connecting
```bash
cd livekit
python agent.py dev
```

### MCP Server Issues
```bash
cd mcp
npm install
node index.js
```

---

## 🎉 Next Steps

- Read the [Full Documentation](../README.md)
- Check [API Documentation](API.md)
- Explore [Configuration Options](CONFIGURATION.md)

---

**Need Help?** Open an issue or email attartravel25@gmail.com

