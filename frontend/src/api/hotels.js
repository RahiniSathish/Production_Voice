import axios from "axios";

const BASE_URL = "http://localhost:8000";

// Get available hotels (sample data for display)
export async function getHotels() {
  try {
    // Return sample hotels for the UI
    // In production, this would call a real hotel search API
    return [
      {
        id: 1,
        name: "Ritz-Carlton Riyadh",
        location: "Riyadh, Saudi Arabia",
        rating: 4.8,
        roomType: "Deluxe Suite",
        pricePerNight: 350,
        amenities: ["WiFi", "Pool", "Spa", "Gym", "Restaurant"]
      },
      {
        id: 2,
        name: "Al Mashreq Boutique Hotel",
        location: "Jeddah Historic District",
        rating: 4.6,
        roomType: "Standard Room",
        pricePerNight: 180,
        amenities: ["WiFi", "Breakfast", "AC", "City View"]
      },
      {
        id: 3,
        name: "Banyan Tree AlUla",
        location: "AlUla, Saudi Arabia",
        rating: 4.9,
        roomType: "Desert Villa",
        pricePerNight: 520,
        amenities: ["WiFi", "Pool", "Spa", "Desert View", "Private Terrace"]
      },
      {
        id: 4,
        name: "Hilton Jeddah",
        location: "Jeddah Corniche",
        rating: 4.5,
        roomType: "Executive Room",
        pricePerNight: 220,
        amenities: ["WiFi", "Pool", "Gym", "Sea View", "Restaurant"]
      },
      {
        id: 5,
        name: "Shaza Riyadh",
        location: "Riyadh City Center",
        rating: 4.7,
        roomType: "Premium Suite",
        pricePerNight: 280,
        amenities: ["WiFi", "Spa", "Gym", "Business Center", "Breakfast"]
      },
      {
        id: 6,
        name: "Habitas AlUla",
        location: "AlUla, Saudi Arabia",
        rating: 4.8,
        roomType: "Canyon Room",
        pricePerNight: 480,
        amenities: ["WiFi", "Pool", "Restaurant", "Desert Experience", "Eco-Friendly"]
      }
    ];
  } catch (error) {
    console.error("Error fetching hotels:", error);
    throw error;
  }
}

// Book a hotel using existing backend endpoint
export async function bookHotel(bookingData) {
  try {
    const response = await axios.post(`${BASE_URL}/book_travel`, {
      customer_email: bookingData.customerEmail,
      service_type: "Hotel",
      destination: bookingData.location,
      departure_date: bookingData.checkIn,
      return_date: bookingData.checkOut,
      num_travelers: bookingData.guests || 1,
      service_details: bookingData.roomType,
      special_requests: bookingData.specialRequests || "",
      total_amount: bookingData.totalAmount
    });
    return response.data;
  } catch (error) {
    console.error("Error booking hotel:", error);
    throw error;
  }
}

