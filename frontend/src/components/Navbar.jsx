import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-black/30 backdrop-blur-lg text-white shadow-lg">
      <div className="flex justify-between items-center px-12 py-4">
        <Link to="/" className="text-2xl font-bold text-gold tracking-wide hover:text-gold/80 transition">
          Attar Travel
        </Link>
        
        <ul className="flex items-center space-x-8 text-lg font-medium">
          {isAuthenticated ? (
            <>
              <li>
                <Link to="/dashboard" className="hover:text-gold transition">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/flights" className="hover:text-gold transition">
                  Flights
                </Link>
              </li>
              <li>
                <Link to="/hotels" className="hover:text-gold transition">
                  Hotels
                </Link>
              </li>
              <li>
                <Link to="/bookings" className="hover:text-gold transition">
                  My Bookings
                </Link>
              </li>
              <li>
                <Link to="/voice" className="hover:text-gold transition">
                  AI Assistant
                </Link>
              </li>
              
              {/* User Dropdown */}
              <li className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="text-gold font-semibold hover:text-gold/80 transition flex items-center gap-2"
                >
                  {user?.name || user?.email?.split('@')[0]} ▼
                </button>
                
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl py-2 text-base">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
                      <p className="text-xs text-gray-600">{user?.email}</p>
                    </div>
                    <Link
                      to="/dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                      onClick={() => setShowDropdown(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/bookings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                      onClick={() => setShowDropdown(false)}
                    >
                      My Bookings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/flights" className="hover:text-gold transition">
                  Flights
                </Link>
              </li>
              <li>
                <Link to="/hotels" className="hover:text-gold transition">
                  Hotels
                </Link>
              </li>
              <li>
                <Link
                  to="/login"
                  className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition"
                >
                  Login
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-gold text-white font-semibold rounded-lg hover:bg-gold/80 transition"
                >
                  Register
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}
