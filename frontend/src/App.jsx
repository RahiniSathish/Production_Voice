import { Route, Routes, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { BookingProvider } from "./context/BookingContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Flights from "./pages/Flights";
import Hotels from "./pages/Hotels";
import Itinerary from "./pages/Itinerary";
import MyBookings from "./pages/MyBookings";
import VoiceAgent from "./pages/VoiceAgent";

// Protected Route Component
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
}

// Public Route (redirect if logged in)
function PublicRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? children : <Navigate to="/dashboard" />;
}

function AppRoutes() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
          {/* Public pages */}
          <Route path="/flights" element={<Flights />} />
          <Route path="/hotels" element={<Hotels />} />
          <Route path="/itinerary" element={<Itinerary />} />
          <Route path="/voice" element={<VoiceAgent />} />
          
          {/* Protected pages */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BookingProvider>
        <AppRoutes />
      </BookingProvider>
    </AuthProvider>
  );
}

