import axios from "axios";

const BASE_URL = "http://localhost:8000";

// Get flight classes and pricing options from backend
export async function getFlightClasses() {
  try {
    const response = await axios.get(`${BASE_URL}/flight_classes`);
    return response.data;
  } catch (error) {
    console.error("Error fetching flight classes:", error);
    throw error;
  }
}

// Get available flights (sample data for display)
export async function getFlights() {
  try {
    // Return sample flights for the UI
    // In production, this would call a real flight search API
    return [
      {
        id: 1,
        airline: "Saudia Airlines",
        origin: "New York (JFK)",
        destination: "Riyadh (RUH)",
        departureTime: "2025-11-15 10:00 AM",
        arrivalTime: "2025-11-16 05:30 AM",
        duration: "13h 30m",
        price: 850,
        class: "Economy"
      },
      {
        id: 2,
        airline: "Emirates",
        origin: "London (LHR)",
        destination: "Jeddah (JED)",
        departureTime: "2025-11-15 02:00 PM",
        arrivalTime: "2025-11-15 11:45 PM",
        duration: "6h 45m",
        price: 1200,
        class: "Business"
      },
      {
        id: 3,
        airline: "Flynas",
        origin: "Dubai (DXB)",
        destination: "Riyadh (RUH)",
        departureTime: "2025-11-16 08:30 AM",
        arrivalTime: "2025-11-16 10:45 AM",
        duration: "2h 15m",
        price: 320,
        class: "Economy"
      },
      {
        id: 4,
        airline: "Qatar Airways",
        origin: "Paris (CDG)",
        destination: "Jeddah (JED)",
        departureTime: "2025-11-16 11:00 AM",
        arrivalTime: "2025-11-16 07:30 PM",
        duration: "6h 30m",
        price: 950,
        class: "Economy"
      },
      {
        id: 5,
        airline: "Saudia Airlines",
        origin: "New York (JFK)",
        destination: "Jeddah (JED)",
        departureTime: "2025-11-17 06:00 PM",
        arrivalTime: "2025-11-18 02:30 PM",
        duration: "14h 30m",
        price: 1500,
        class: "Business"
      },
      {
        id: 6,
        airline: "Flynas",
        origin: "Cairo (CAI)",
        destination: "Riyadh (RUH)",
        departureTime: "2025-11-18 09:00 AM",
        arrivalTime: "2025-11-18 12:00 PM",
        duration: "3h 00m",
        price: 280,
        class: "Economy"
      }
    ];
  } catch (error) {
    console.error("Error fetching flights:", error);
    throw error;
  }
}

// Book a flight using existing backend endpoint
export async function bookFlight(bookingData) {
  try {
    const response = await axios.post(`${BASE_URL}/create_flight_booking`, bookingData);
    return response.data;
  } catch (error) {
    console.error("Error booking flight:", error);
    throw error;
  }
}

