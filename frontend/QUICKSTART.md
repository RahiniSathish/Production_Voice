# React Frontend - Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Install Dependencies

```bash
cd /Users/apple/AI-Travel-agency/AI-Voice-Agent-Travel-/Production/frontend
npm install
```

This will install:
- React 18
- Vite
- Tailwind CSS
- Framer Motion
- Axios
- React Router

### Step 2: Start the Application

From the **Production** directory:

```bash
cd /Users/apple/AI-Travel-agency/AI-Voice-Agent-Travel-/Production
python run.py --react
```

This will start:
- ✅ FastAPI Backend on `http://localhost:8000`
- ✅ React Frontend on `http://localhost:3000`

### Step 3: Open Your Browser

Navigate to: **http://localhost:3000**

---

## 🎯 What You Get

### 5 Pages Ready to Use

1. **Home** (`/`) - Landing page with hero section
2. **Flights** (`/flights`) - Animated flight cards with 6 sample flights
3. **Hotels** (`/hotels`) - Hotel listings with 6 sample hotels
4. **Itinerary** (`/itinerary`) - 4-day sample trip to Saudi Arabia
5. **Voice Agent** (`/voice`) - AI assistant with speech recognition

### Features

- ✨ **Smooth animations** with Framer Motion
- 🎨 **Saudi-themed design** (Sand, Gold, Night colors)
- 📱 **Fully responsive** (mobile, tablet, desktop)
- 🎤 **Voice input** (Chrome/Edge only)
- 🔄 **Real-time API integration** with your existing backend

---

## 🔧 Development Mode

### Run Frontend Only (for development)

```bash
cd frontend
npm run dev
```

Frontend will start on `http://localhost:3000`

**Note**: Make sure backend is running separately on port 8000!

### Run Backend Only

```bash
cd /Users/apple/AI-Travel-agency/AI-Voice-Agent-Travel-/Production
python run.py --no-frontend
```

---

## 📝 API Integration

All APIs connect to your existing backend at `http://localhost:8000`:

### Working Endpoints
- ✅ `/voice_chat` - AI voice assistant
- ✅ `/create_flight_booking` - Book flights
- ✅ `/book_travel` - Book hotels
- ✅ `/my_bookings/{email}` - Get customer bookings
- ✅ `/cancel_booking` - Cancel bookings
- ✅ `/register` - Customer registration
- ✅ `/login` - Customer login

**No backend changes needed** - everything uses your existing working functions!

---

## 🎨 Customization

### Change Colors

Edit `frontend/tailwind.config.js`:

```javascript
colors: {
  sand: "#F5F0E1",    // Background color
  gold: "#C6A664",    // Primary accent
  night: "#1E1E1E"    // Text color
}
```

### Change Backend URL

Edit each file in `frontend/src/api/`:

```javascript
const BASE_URL = "http://localhost:8000";  // Change this
```

### Add New Components

Create files in `frontend/src/components/` and import them in your pages.

---

## 🏗️ Build for Production

```bash
cd frontend
npm run build
```

Creates optimized files in `frontend/dist/`

---

## 🐛 Common Issues

### "npm: command not found"
Install Node.js from: https://nodejs.org/ (v16 or higher)

### "Port 3000 is already in use"
```bash
python run.py --react --react-port 3001
```

### Backend not responding
Make sure backend is running on port 8000:
```bash
curl http://localhost:8000
```

### Voice recognition not working
- Use Chrome or Edge browser
- Allow microphone permissions
- Localhost is OK, production needs HTTPS

---

## 📚 Project Structure

```
frontend/
├── src/
│   ├── components/     # Reusable components
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   ├── FlightCard.jsx
│   │   ├── HotelCard.jsx
│   │   ├── ItineraryCard.jsx
│   │   ├── VoiceMic.jsx
│   │   └── AnimatedLoader.jsx
│   ├── pages/          # Page components
│   │   ├── Home.jsx
│   │   ├── Flights.jsx
│   │   ├── Hotels.jsx
│   │   ├── Itinerary.jsx
│   │   └── VoiceAgent.jsx
│   ├── api/            # API service files
│   │   ├── flights.js
│   │   ├── hotels.js
│   │   ├── itinerary.js
│   │   └── voice.js
│   ├── styles/
│   │   └── globals.css
│   ├── App.jsx         # Main app with routing
│   └── main.jsx        # Entry point
├── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js
```

---

## 🎉 You're All Set!

Your React frontend is integrated with your existing backend. Both work together seamlessly!

### Next Steps:
1. ✅ Run `npm install` in frontend directory
2. ✅ Start with `python run.py --react`
3. ✅ Open `http://localhost:3000`
4. ✅ Explore the pages and features
5. ✅ Customize to your needs

---

## 📖 More Information

- Full integration guide: `REACT_INTEGRATION.md`
- Frontend README: `frontend/README.md`
- Backend API docs: `http://localhost:8000/docs`

Happy coding! 🚀✨

