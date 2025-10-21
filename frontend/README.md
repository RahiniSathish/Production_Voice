# Attar Travel Frontend

A modern React frontend for the AI Travel Agency, built with Vite, Tailwind CSS, and Framer Motion.

## Features

- 🎨 Beautiful Saudi Arabia-themed UI with custom colors (sand, gold, night)
- ✈️ Flight booking interface
- 🏨 Hotel search and booking
- 📅 Itinerary management
- 🎤 Voice-powered AI assistant
- ⚡ Lightning-fast with Vite
- 🎭 Smooth animations with Framer Motion
- 📱 Fully responsive design

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **React Router** - Client-side routing
- **Axios** - HTTP client

## Getting Started

### Prerequisites

- Node.js 16+ and npm/yarn installed
- Backend API running on `http://localhost:8000`

### Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The app will open automatically at `http://localhost:3000`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Project Structure

```
frontend/
├── index.html              # HTML entry point
├── package.json            # Dependencies and scripts
├── vite.config.js          # Vite configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── postcss.config.js       # PostCSS configuration
└── src/
    ├── main.jsx            # Application entry point
    ├── App.jsx             # Main app component with routing
    ├── styles/
    │   └── globals.css     # Global styles with Tailwind
    ├── components/
    │   ├── Navbar.jsx      # Navigation bar
    │   ├── Footer.jsx      # Footer component
    │   ├── FlightCard.jsx  # Flight display card
    │   ├── HotelCard.jsx   # Hotel display card
    │   ├── ItineraryCard.jsx # Itinerary item card
    │   ├── VoiceMic.jsx    # Voice input component
    │   └── AnimatedLoader.jsx # Loading animation
    ├── pages/
    │   ├── Home.jsx        # Landing page
    │   ├── Flights.jsx     # Flights listing
    │   ├── Hotels.jsx      # Hotels listing
    │   ├── Itinerary.jsx   # Itinerary view
    │   └── VoiceAgent.jsx  # AI voice assistant
    └── api/
        ├── flights.js      # Flight API calls
        ├── hotels.js       # Hotel API calls
        ├── itinerary.js    # Itinerary API calls
        └── voice.js        # Voice assistant API calls
```

## API Configuration

The frontend expects the backend API to be running on `http://localhost:8000`. 

To change the API URL, update the `BASE_URL` constants in the API files:
- `src/api/flights.js`
- `src/api/hotels.js`
- `src/api/itinerary.js`
- `src/api/voice.js`

## Design System

### Colors

- **Sand** (`#F5F0E1`) - Background
- **Gold** (`#C6A664`) - Primary accent
- **Night** (`#1E1E1E`) - Text and dark elements

### Font

- **Cairo** - Arabic-friendly sans-serif font (loaded from Google Fonts)

## Browser Support

- Chrome/Edge (recommended for voice features)
- Firefox
- Safari

**Note:** Voice recognition features require Chrome or Edge browser with Web Speech API support.

## Troubleshooting

### Voice recognition not working
- Ensure you're using Chrome or Edge browser
- Check that microphone permissions are granted
- Voice recognition requires HTTPS in production

### API errors
- Verify the backend is running on `http://localhost:8000`
- Check browser console for specific error messages
- Ensure CORS is properly configured on the backend

## License

Part of the Attar Travel AI Voice Agent system.

