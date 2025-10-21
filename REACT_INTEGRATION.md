# React Frontend Integration Guide

## Overview

Your AI Travel Agency now has **two frontend options**:

1. **Streamlit Frontend** (existing) - `/app/frontend/app.py`
2. **React Frontend** (new) - `/frontend/` with Vite + Tailwind + Framer Motion

Both frontends connect to the same FastAPI backend without any changes to your existing working functions.

---

## 🚀 Quick Start

### Option 1: Run with React Frontend

```bash
# Install dependencies (first time only)
cd frontend
npm install
cd ..

# Run backend + React frontend
python run.py --react
```

The React app will be available at: **http://localhost:3000**

### Option 2: Run with Streamlit Frontend (Default)

```bash
# Run backend + Streamlit frontend (existing)
python run.py
```

The Streamlit app will be available at: **http://localhost:8506**

### Option 3: Run Backend Only

```bash
# Run only the FastAPI backend
python run.py --no-frontend
```

Backend API will be available at: **http://localhost:8000**

---

## 📁 Project Structure

```
Production/
├── app/
│   ├── api/              # FastAPI backend (unchanged)
│   │   └── api.py        # All your working endpoints
│   └── frontend/         # Streamlit frontend (existing)
│       └── app.py
├── frontend/             # NEW React frontend
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── api/          # API integration
│   │   └── styles/       # Tailwind CSS
│   ├── package.json
│   └── vite.config.js
└── run.py                # Updated to support both frontends
```

---

## 🔌 API Integration

The React frontend integrates with your **existing backend endpoints**:

### Flights
- `GET /flight_classes` - Flight pricing options
- `POST /create_flight_booking` - Book a flight

### Hotels
- `POST /book_travel` - Book a hotel (using service_type="Hotel")

### Bookings
- `GET /my_bookings/{email}` - Get customer bookings
- `POST /cancel_booking` - Cancel a booking
- `POST /reschedule_booking` - Reschedule a booking

### Voice/Chat
- `POST /voice_chat` - Send text/voice query to AI
- `GET /welcome` - Get welcome message
- `GET /chat_history/{email}` - Get conversation history
- `POST /clear_session` - Clear chat session

### Authentication
- `POST /register` - Register new customer
- `POST /login` - Customer login
- `GET /check_customer/{email}` - Check if customer exists

**No backend changes were made** - all existing functions work exactly as before!

---

## 🎨 React Frontend Features

### Pages
1. **Home** - Landing page with call-to-action buttons
2. **Flights** - Browse and book flights with animated cards
3. **Hotels** - Browse and book hotels with ratings
4. **Itinerary** - View trip schedule and bookings
5. **Voice Agent** - Talk to AI assistant with speech recognition

### Components
- `FlightCard` - Animated flight display
- `HotelCard` - Hotel listings with amenities
- `ItineraryCard` - Timeline-style trip items
- `VoiceMic` - Speech-to-text input
- `AnimatedLoader` - Loading animations
- `Navbar` - Navigation bar
- `Footer` - Page footer

### Tech Stack
- **React 18** - UI library
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Axios** - HTTP requests
- **React Router** - Client-side routing

---

## 🛠️ Development Commands

### React Frontend

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Integrated Launch (Recommended)

```bash
# Backend + React frontend
python run.py --react

# Backend + Streamlit frontend (default)
python run.py

# Backend + React + Voice Agent
python run.py --react --with-agent

# Custom ports
python run.py --react --react-port 3001 --backend-port 8001
```

---

## 🎯 Sample Data

The React frontend displays **sample flights and hotels** for demonstration:

### Sample Flights
- Saudia Airlines: New York → Riyadh
- Emirates: London → Jeddah
- Flynas: Dubai → Riyadh
- Qatar Airways: Paris → Jeddah
- And more...

### Sample Hotels
- Ritz-Carlton Riyadh
- Al Mashreq Boutique Hotel (Jeddah)
- Banyan Tree AlUla
- Hilton Jeddah
- Shaza Riyadh
- Habitas AlUla

### Sample Itinerary
- Day 1: Arrival in Riyadh
- Day 2: Explore Riyadh
- Day 3: Journey to AlUla
- Day 4: Jeddah and the Red Sea

To connect to a real flight/hotel API, update the API service files in `frontend/src/api/`.

---

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the `frontend/` directory if needed:

```env
VITE_BACKEND_URL=http://localhost:8000
```

The `run.py` script automatically sets this for you.

### API Base URL

To change the backend URL, edit `frontend/src/api/*.js`:

```javascript
const BASE_URL = "http://localhost:8000";  // Change this
```

---

## 🌐 CORS Configuration

Your backend already has CORS enabled in `app/api/api.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Already configured
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

This allows the React frontend to communicate with the backend.

---

## 🎙️ Voice Features

The React Voice Agent page uses the **Web Speech API** for voice input:

- **Supported Browsers**: Chrome, Edge (Chromium-based)
- **Requirements**: HTTPS in production or localhost in development
- **Microphone Permission**: Browser will request permission on first use

The voice input is sent to your existing `/voice_chat` endpoint.

---

## 📱 Responsive Design

The React frontend is fully responsive:
- **Mobile**: Single column layout
- **Tablet**: 2-column grid
- **Desktop**: 3-column grid (where applicable)

All components use Tailwind's responsive utilities.

---

## 🚢 Deployment

### Build for Production

```bash
cd frontend
npm run build
```

This creates a `dist/` folder with optimized static files.

### Serve Production Build

```bash
# Preview locally
npm run preview

# Or use any static file server
npx serve dist
```

### Deploy to Hosting

The `dist/` folder can be deployed to:
- Vercel
- Netlify
- AWS S3 + CloudFront
- GitHub Pages
- Any static hosting service

Make sure to update `VITE_BACKEND_URL` to your production backend URL.

---

## 🐛 Troubleshooting

### React frontend won't start
```bash
# Make sure dependencies are installed
cd frontend
npm install
```

### Port already in use
```bash
# Use a different port
python run.py --react --react-port 3001
```

### API errors / CORS issues
- Ensure backend is running: `http://localhost:8000`
- Check browser console for specific errors
- Verify CORS is enabled in backend

### Voice recognition not working
- Use Chrome or Edge browser
- Allow microphone permissions
- HTTPS required in production (localhost OK in dev)

---

## 📊 Comparison: React vs Streamlit

| Feature | React Frontend | Streamlit Frontend |
|---------|---------------|-------------------|
| **Technology** | Vite + React + Tailwind | Streamlit Python |
| **Speed** | ⚡ Very fast | 🐌 Moderate |
| **Animations** | ✅ Smooth (Framer Motion) | ❌ Limited |
| **Customization** | ✅ Highly customizable | ⚠️ Moderate |
| **Learning Curve** | 📈 Steeper (JavaScript/React) | 📉 Easier (Python) |
| **Production Ready** | ✅ Yes | ✅ Yes |
| **Mobile Support** | ✅ Excellent | ⚠️ Good |
| **UI Polish** | ✅ Modern & professional | ⚠️ Functional |

**Choose React** for: Production apps, mobile users, custom animations, modern UI

**Choose Streamlit** for: Quick prototypes, Python-focused teams, data apps

---

## 🎉 Next Steps

1. **Install dependencies**: `cd frontend && npm install`
2. **Try it out**: `python run.py --react`
3. **Customize**: Edit colors in `frontend/tailwind.config.js`
4. **Add features**: Create new components in `frontend/src/components/`
5. **Connect real APIs**: Update service files in `frontend/src/api/`

Both frontends work side-by-side with your existing backend! 🚀

---

## 📝 Notes

- ✅ **No backend changes** - All existing functions preserved
- ✅ **Sample data included** - Works out of the box
- ✅ **Production ready** - Optimized build process
- ✅ **Fully responsive** - Mobile, tablet, desktop
- ✅ **Animated UI** - Smooth Framer Motion animations
- ✅ **Voice support** - Web Speech API integration

---

## 🤝 Support

For questions or issues:
1. Check the React frontend README: `frontend/README.md`
2. Review API docs: `http://localhost:8000/docs`
3. Check browser console for errors
4. Verify all services are running

Happy coding! ✨

