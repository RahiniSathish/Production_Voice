# 📦 Installation Guide

Complete installation instructions for the AI Travel Voice Agent.

---

## System Requirements

### Minimum Requirements
- **OS:** macOS 10.15+, Ubuntu 20.04+, Windows 10+
- **Python:** 3.10 or higher
- **Node.js:** 18.0 or higher
- **RAM:** 4GB minimum, 8GB recommended
- **Disk Space:** 2GB free space

### Development Tools
```bash
# macOS
xcode-select --install

# Ubuntu
sudo apt update
sudo apt install python3-dev build-essential

# Windows
# Install Python from python.org
# Install Node.js from nodejs.org
```

---

## Installation Steps

### 1. Clone Repository
```bash
git clone https://github.com/your-repo/AI-Travel-Voice-Agent.git
cd AI-Travel-Voice-Agent/Updated
```

### 2. Set Up Python Environment

**Using venv (Recommended):**
```bash
# Create virtual environment
python3 -m venv venv

# Activate (macOS/Linux)
source venv/bin/activate

# Activate (Windows)
venv\Scripts\activate
```

**Using conda:**
```bash
conda create -n travel-agent python=3.10
conda activate travel-agent
```

### 3. Install Python Dependencies

```bash
# Backend
cd backend
pip install -r requirements.txt
cd ..

# Frontend
cd frontend
pip install -r requirements.txt
cd ..

# LiveKit Agent
cd livekit
pip install -r requirements.txt
cd ..

# MCP Client
cd mcp
pip install -r requirements.txt
cd ..
```

### 4. Install Node.js Dependencies

```bash
cd mcp
npm install
cd ..
```

### 5. Configure Environment Variables

```bash
# Copy template
cp .env.example .env

# Edit with your API keys
nano .env  # or use your favorite editor
```

**Required API Keys:**

1. **OpenAI:**
   - Sign up: https://platform.openai.com
   - Create API key
   - Add to `.env`: `OPENAI_API_KEY=sk-...`

2. **LiveKit:**
   - Sign up: https://cloud.livekit.io
   - Create project
   - Get URL, API Key, and Secret
   - Add to `.env`:
     ```
     LIVEKIT_URL=wss://...
     LIVEKIT_API_KEY=...
     LIVEKIT_API_SECRET=...
     ```

3. **Deepgram:**
   - Sign up: https://deepgram.com
   - Create API key
   - Add to `.env`: `DEEPGRAM_API_KEY=...`

4. **AviationStack:**
   - Sign up: https://aviationstack.com
   - Get free API key
   - Add to `.env`: `AVIATIONSTACK_API_KEY=...`

5. **Optional - FlightAPI:**
   - Sign up: https://flightapi.io
   - Get API key
   - Add to `.env`: `FLIGHTAPI_KEY=...`

### 6. Initialize Database

```bash
# Database will be created automatically on first run
# Located at: database/customers.db
```

### 7. Verify Installation

```bash
# Check Python packages
pip list | grep -E "fastapi|streamlit|livekit|openai|deepgram"

# Check Node packages
cd mcp && npm list --depth=0
```

---

## Quick Start

### Start All Services
```bash
python run.py --with-agent
```

### Verify Services

**Check Backend:**
```bash
curl http://localhost:8000/
```

**Check Frontend:**
- Open browser: http://localhost:8506

**Check MCP Server:**
```bash
curl http://localhost:8080/
```

**Check Agent:**
- Look for "registered worker" in console logs

---

## Troubleshooting Installation

### Python Version Issues
```bash
# Check version
python --version  # Should be 3.10+

# Use specific version
python3.10 -m venv venv
```

### Permission Errors (macOS/Linux)
```bash
# Fix permissions
chmod +x run.py
chmod -R 755 backend/ frontend/ livekit/
```

### Node.js Issues
```bash
# Clear npm cache
npm cache clean --force

# Reinstall
cd mcp
rm -rf node_modules package-lock.json
npm install
```

### Port Already in Use
```bash
# Find and kill process
lsof -ti:8000 | xargs kill -9  # Backend
lsof -ti:8506 | xargs kill -9  # Frontend
lsof -ti:8080 | xargs kill -9  # MCP
```

### SSL/Certificate Errors
```bash
# Update certificates (macOS)
brew install openssl

# Update certificates (Ubuntu)
sudo apt update && sudo apt install ca-certificates

# Update certificates (Windows)
# Download from: https://curl.se/ca/cacert.pem
```

### Microphone Not Working
- **Chrome:** Check chrome://settings/content/microphone
- **Firefox:** Check about:preferences#privacy
- **Safari:** Check Safari > Preferences > Websites > Microphone

---

## Optional Components

### Redis (for caching)
```bash
# macOS
brew install redis
brew services start redis

# Ubuntu
sudo apt install redis-server
sudo systemctl start redis

# Windows
# Download from: https://github.com/microsoftarchive/redis/releases
```

### PostgreSQL (for production)
```bash
# macOS
brew install postgresql
brew services start postgresql

# Ubuntu
sudo apt install postgresql
sudo systemctl start postgresql

# Windows
# Download from: https://www.postgresql.org/download/windows/
```

### PM2 (for process management)
```bash
npm install -g pm2

# Start services with PM2
pm2 start ecosystem.config.js
```

---

## IDE Setup

### VS Code
**Recommended Extensions:**
- Python (Microsoft)
- Pylance
- Black Formatter
- ESLint
- Prettier

**Settings (.vscode/settings.json):**
```json
{
  "python.linting.enabled": true,
  "python.linting.pylintEnabled": true,
  "python.formatting.provider": "black",
  "editor.formatOnSave": true,
  "files.exclude": {
    "**/__pycache__": true,
    "**/*.pyc": true
  }
}
```

### PyCharm
1. Open project folder
2. Configure interpreter: File > Settings > Project > Python Interpreter
3. Enable type checking: Settings > Editor > Inspections > Python
4. Install Pylint plugin

---

## Environment Variables Reference

### Core Services
```env
# OpenAI
OPENAI_API_KEY=sk-...

# LiveKit
LIVEKIT_URL=wss://...
LIVEKIT_API_KEY=...
LIVEKIT_API_SECRET=...

# Deepgram (STT)
DEEPGRAM_API_KEY=...
```

### Flight Data
```env
# AviationStack
AVIATIONSTACK_API_KEY=...
AVIATIONSTACK_BASE_URL=https://api.aviationstack.com/v1

# FlightAPI (Optional)
FLIGHTAPI_KEY=...
FLIGHTAPI_BASE_URL=https://api.flightapi.io
```

### Optional Services
```env
# Azure Speech (Optional)
AZURE_SPEECH_KEY=...
AZURE_SPEECH_REGION=eastus

# Email (Optional)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=...
SMTP_PASSWORD=...

# Database (Optional)
DB_TYPE=sqlite  # or postgresql
DATABASE_URL=sqlite:///database/customers.db
```

---

## Next Steps

After installation:
1. ✅ Read [Quick Start Guide](docs/QUICKSTART.md)
2. ✅ Review [Architecture](docs/ARCHITECTURE.md)
3. ✅ Test with sample conversations
4. ✅ Customize system prompts
5. ✅ Deploy to production

---

## Support

- **Documentation:** [docs/](docs/)
- **Issues:** Create a GitHub issue
- **Email:** attartravel25@gmail.com

---

**Installation complete! 🎉**

Run `python run.py --with-agent` to start the system.

