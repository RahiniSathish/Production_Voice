# 🎙️ AI Travel Voice Agent - Professional Edition

**Enterprise-grade AI-powered voice travel assistant** with real-time flight data integration, built with production-ready architecture.

---

## 📊 **Project Structure**

```
Production/
├── agent/              # Voice agent (LiveKit + MCP Flight Server)
├── app/                # Application layer
│   ├── api/           # FastAPI backend
│   └── frontend/      # Streamlit UI
├── common/             # Shared utilities
├── config/             # Configuration management
├── db/                 # Database layer
├── deployment/         # Deployment configurations
├── docs/               # Documentation
├── knowledge_pack/     # AI prompts and knowledge
├── scripts/            # Automation scripts
├── tests/              # Test suite
├── .dockerignore       # Docker exclusions
├── .env                # Environment variables
├── .gitignore          # Git exclusions
├── alembic.ini         # Database migrations config
├── deploy.sh           # Deployment script
├── docker-compose.yml  # Docker orchestration
├── Dockerfile          # Container definition
├── env.example         # Environment template
├── pytest.ini          # Testing configuration
├── requirements.txt    # Python dependencies
├── run.py              # Main application launcher
└── README.md           # This file
```

---

## 🚀 **Quick Start**

### **1. Setup (First Time)**
```bash
# Run setup script
./scripts/setup.sh

# Configure environment
cp env.example .env
nano .env  # Add your API keys
```

### **2. Run Locally**
```bash
python run.py --with-agent
```

### **3. Run with Docker** (Recommended)
```bash
# Deploy everything
./deploy.sh

# Or manually
docker-compose up -d
```

---

## ✨ **Features**

- ✅ Real-time voice conversations (LiveKit + OpenAI)
- ✅ Flight data integration (AviationStack + FlightAPI.io)
- ✅ Speech-to-Text (Deepgram)
- ✅ Text-to-Speech (OpenAI)
- ✅ Multilingual support (20+ languages)
- ✅ Secure authentication (JWT)
- ✅ Conversation history
- ✅ Docker deployment
- ✅ Database migrations (Alembic)
- ✅ Comprehensive testing (Pytest)
- ✅ Professional logging
- ✅ Production-ready architecture

---

## 📦 **Services**

| Service | Port | Description |
|---------|------|-------------|
| **Backend API** | 8000 | FastAPI REST API |
| **Frontend** | 8506 | Streamlit web interface |
| **MCP Server** | 8080 | Flight data API |
| **LiveKit Agent** | - | Voice processing |
| **Redis** | 6379 | Caching (optional) |

---

## 🧪 **Testing**

```bash
# Run all tests
pytest

# With coverage
pytest --cov

# Specific tests
pytest tests/test_api.py
```

---

## 🚢 **Deployment**

### **Production Deployment**
```bash
# 1. Configure production environment
cp env.example .env
# Edit .env with production credentials

# 2. Deploy with Docker
./deploy.sh

# 3. Check logs
docker-compose logs -f
```

### **Kubernetes Deployment**
```bash
# Coming soon
kubectl apply -f deployment/k8s/
```

---

## 📚 **Documentation**

- [Quick Start Guide](docs/QUICKSTART.md)
- [Architecture Overview](docs/ARCHITECTURE.md)
- [API Documentation](http://localhost:8000/docs)
- [System Prompts](knowledge_pack/)

---

## 🛠️ **Development**

### **Code Style**
```bash
# Format code
black app/ agent/ common/

# Lint
flake8 app/ agent/ common/

# Type check
mypy app/ agent/
```

### **Database Migrations**
```bash
# Create migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

---

## 🔐 **Security**

- ✅ Password hashing (bcrypt)
- ✅ JWT authentication
- ✅ Environment variable management
- ✅ API key rotation support
- ✅ HTTPS/WSS encrypted connections
- ✅ Input validation (Pydantic)
- ✅ SQL injection prevention (ORM)

---

## 📊 **Monitoring**

### **Health Checks**
```bash
# Backend
curl http://localhost:8000/

# Frontend
curl http://localhost:8506/

# MCP Server
curl http://localhost:8080/
```

### **Logs**
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api
```

---

## 🤝 **Contributing**

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📞 **Support**

- **Documentation:** [docs/](docs/)
- **Issues:** Create a GitHub issue
- **Email:** attartravel25@gmail.com

---

## 📄 **License**

MIT License - See LICENSE file for details

---

## 🎯 **Project Status**

**✅ PRODUCTION READY**

- **Version:** 2.0
- **Last Updated:** October 18, 2025
- **Build:** Stable

---

**Made with ❤️ for Attar Travel**

