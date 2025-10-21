import axios from "axios";

const BASE_URL = "http://localhost:8000";

// Get customer bookings (acts as itinerary)
export async function getItinerary(customerEmail) {
  try {
    if (!customerEmail) {
      // Return sample itinerary for demo
      return [
        {
          id: 1,
          day: "Day 1",
          title: "Arrival in Riyadh",
          time: "10:00 AM - 6:00 PM",
          description: "Arrive at King Khalid International Airport and check into your hotel. Take some time to rest and freshen up.",
          location: "Riyadh, Saudi Arabia",
          activities: [
            "Airport pickup",
            "Hotel check-in at Ritz-Carlton",
            "Evening stroll at Kingdom Centre",
            "Dinner at local restaurant"
          ]
        },
        {
          id: 2,
          day: "Day 2",
          title: "Explore Riyadh",
          time: "9:00 AM - 8:00 PM",
          description: "Full day city tour exploring the modern and historic sites of Riyadh.",
          location: "Riyadh City",
          activities: [
            "Visit National Museum",
            "Tour Masmak Fortress",
            "Lunch at traditional Saudi restaurant",
            "Shopping at Al Batha Market",
            "Visit Kingdom Tower Sky Bridge"
          ]
        },
        {
          id: 3,
          day: "Day 3",
          title: "Journey to AlUla",
          time: "7:00 AM - 9:00 PM",
          description: "Travel to the ancient city of AlUla and explore the UNESCO World Heritage Site.",
          location: "AlUla, Saudi Arabia",
          activities: [
            "Flight to AlUla",
            "Check-in at Banyan Tree AlUla",
            "Visit Hegra (Madain Saleh)",
            "Explore ancient Nabatean tombs",
            "Sunset at Elephant Rock"
          ]
        },
        {
          id: 4,
          day: "Day 4",
          title: "Jeddah and the Red Sea",
          time: "8:00 AM - 10:00 PM",
          description: "Travel to Jeddah and explore the historic district and beautiful corniche.",
          location: "Jeddah, Saudi Arabia",
          activities: [
            "Morning flight to Jeddah",
            "Tour Al-Balad historic district",
            "Lunch at seafood restaurant",
            "Visit King Fahd Fountain",
            "Evening walk along the Corniche",
            "Traditional Saudi dinner"
          ]
        }
      ];
    }

    // Get user's bookings from backend
    const response = await axios.get(`${BASE_URL}/my_bookings/${customerEmail}`);
    return response.data.bookings || [];
  } catch (error) {
    console.error("Error fetching itinerary:", error);
    // Return empty array instead of throwing
    return [];
  }
}

// Get customer bookings
export async function getCustomerBookings(customerEmail) {
  try {
    const response = await axios.get(`${BASE_URL}/my_bookings/${customerEmail}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching bookings:", error);
    throw error;
  }
}

// Cancel a booking
export async function cancelBooking(bookingId, customerEmail) {
  try {
    const response = await axios.post(`${BASE_URL}/cancel_booking`, {
      booking_id: bookingId,
      customer_email: customerEmail
    });
    return response.data;
  } catch (error) {
    console.error("Error cancelling booking:", error);
    throw error;
  }
}

// Reschedule a booking
export async function rescheduleBooking(bookingId, customerEmail, newDates) {
  try {
    const response = await axios.post(`${BASE_URL}/reschedule_booking`, {
      booking_id: bookingId,
      customer_email: customerEmail,
      new_departure_date: newDates.departureDate,
      new_return_date: newDates.returnDate
    });
    return response.data;
  } catch (error) {
    console.error("Error rescheduling booking:", error);
    throw error;
  }
}

