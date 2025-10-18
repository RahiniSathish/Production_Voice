import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors";
import axios from "axios";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// API Configuration
const AVIATIONSTACK_KEY = process.env.AVIATIONSTACK_API_KEY;
const AVIATIONSTACK_BASE = process.env.AVIATIONSTACK_BASE_URL;
const FLIGHTAPI_KEY = process.env.FLIGHTAPI_KEY;
const FLIGHTAPI_BASE = process.env.FLIGHTAPI_BASE_URL;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.json({
    message: "✈️ MCP Flight Server Running!",
    status: "online",
    apis: ["AviationStack", "FlightAPI.io"],
    endpoints: [
      "/api/flights/live",
      "/api/flights/status", 
      "/api/airports",
      "/api/routes",
      "/api/airlines"
    ]
  });
});

// ==================== MCP CONFIGURATION ====================
app.get("/mcp/manifest", (req, res) => {
  res.json({
    name: "flight-mcp",
    description: "Real-time flight data connector for AI Voice Travel Agent",
    version: "1.0.0",
    tools: [
      {
        id: "get-live-flights",
        description: "Get real-time flight data between airports",
        parameters: {
          from: { type: "string", description: "Departure airport IATA code (e.g., MAA, DEL)" },
          to: { type: "string", description: "Arrival airport IATA code" },
          date: { type: "string", description: "Date in YYYY-MM-DD format (optional)" }
        }
      },
      {
        id: "get-flight-status",
        description: "Get specific flight status by flight number",
        parameters: {
          flight_number: { type: "string", description: "Flight number (e.g., AI101, 6E2345)" },
          date: { type: "string", description: "Date in YYYY-MM-DD format (optional)" }
        }
      },
      {
        id: "search-airports",
        description: "Search airports by city or country",
        parameters: {
          query: { type: "string", description: "City name, airport name, or country" }
        }
      },
      {
        id: "get-routes",
        description: "Get available routes between cities/airports",
        parameters: {
          from: { type: "string", description: "Origin airport/city" },
          to: { type: "string", description: "Destination airport/city" }
        }
      },
      {
        id: "get-airlines",
        description: "Get airline information",
        parameters: {
          code: { type: "string", description: "Airline IATA code (optional)" }
        }
      }
    ]
  });
});

// ==================== FLIGHT DATA ENDPOINTS ====================

// 1. Live Flights (AviationStack)
app.get("/api/flights/live", async (req, res) => {
  const { from, to, date } = req.query;
  
  if (!from || !to) {
    return res.status(400).json({ 
      error: "Missing required parameters: from, to",
      example: "/api/flights/live?from=MAA&to=DEL&date=2025-10-14"
    });
  }

  try {
    const url = `${AVIATIONSTACK_BASE}/flights?access_key=${AVIATIONSTACK_KEY}&dep_iata=${from}&arr_iata=${to}${date ? `&flight_date=${date}` : ''}`;
    
    console.log(`✈️ Fetching live flights: ${from} → ${to}${date ? ` on ${date}` : ''}`);
    
    const response = await axios.get(url);
    const flights = response.data.data || [];
    
    // Format response for AI consumption
    const formattedFlights = flights.slice(0, 10).map(flight => ({
      flight_number: flight.flight?.iata || flight.flight?.number,
      airline: flight.airline?.name,
      departure: {
        airport: flight.departure?.airport,
        iata: flight.departure?.iata,
        scheduled: flight.departure?.scheduled,
        estimated: flight.departure?.estimated,
        actual: flight.departure?.actual,
        terminal: flight.departure?.terminal,
        gate: flight.departure?.gate
      },
      arrival: {
        airport: flight.arrival?.airport,
        iata: flight.arrival?.iata,
        scheduled: flight.arrival?.scheduled,
        estimated: flight.arrival?.estimated,
        actual: flight.arrival?.actual,
        terminal: flight.arrival?.terminal,
        gate: flight.arrival?.gate
      },
      status: flight.flight_status,
      aircraft: flight.aircraft?.model
    }));

    res.json({
      success: true,
      route: `${from} → ${to}`,
      date: date || "Today",
      total_flights: flights.length,
      flights: formattedFlights,
      source: "AviationStack"
    });

  } catch (error) {
    console.error("AviationStack API Error:", error.message);
    res.status(500).json({ 
      error: "Failed to fetch live flights",
      details: error.message,
      fallback: "Try using FlightAPI.io endpoint"
    });
  }
});

// 2. Flight Status by Number (with fallback to AviationStack)
app.get("/api/flights/status", async (req, res) => {
  const { flight_number, date } = req.query;
  
  if (!flight_number) {
    return res.status(400).json({ 
      error: "Missing required parameter: flight_number",
      example: "/api/flights/status?flight_number=AI101&date=2025-10-14"
    });
  }

  console.log(`🔍 Checking flight status: ${flight_number}${date ? ` on ${date}` : ''}`);

  // Try FlightAPI.io first
  try {
    const url = `${FLIGHTAPI_BASE}/compschedule/${flight_number}?key=${FLIGHTAPI_KEY}${date ? `&date=${date}` : ''}`;
    const response = await axios.get(url);
    const flightData = response.data;
    
    const formattedStatus = {
      flight_number: flight_number,
      status: flightData.status || "Unknown",
      departure: {
        airport: flightData.departure?.airport_name,
        iata: flightData.departure?.iata,
        scheduled: flightData.departure?.scheduled,
        estimated: flightData.departure?.estimated,
        actual: flightData.departure?.actual,
        delay: flightData.departure?.delay
      },
      arrival: {
        airport: flightData.arrival?.airport_name,
        iata: flightData.arrival?.iata,
        scheduled: flightData.arrival?.scheduled,
        estimated: flightData.arrival?.estimated,
        actual: flightData.arrival?.actual,
        delay: flightData.arrival?.delay
      },
      airline: flightData.airline?.name,
      aircraft: flightData.aircraft?.model,
      gate_info: {
        departure_gate: flightData.departure?.gate,
        arrival_gate: flightData.arrival?.gate
      }
    };

    return res.json({
      success: true,
      flight: formattedStatus,
      source: "FlightAPI.io"
    });

  } catch (flightApiError) {
    console.log("FlightAPI.io failed, trying AviationStack fallback...");
    
    // Fallback to AviationStack
    try {
      const url = `${AVIATIONSTACK_BASE}/flights?access_key=${AVIATIONSTACK_KEY}&flight_iata=${flight_number}&limit=1`;
      const response = await axios.get(url);
      const flights = response.data.data || [];
      
      if (flights.length > 0) {
        const flight = flights[0];
        const formattedStatus = {
          flight_number: flight_number,
          status: flight.flight_status || "Unknown",
          departure: {
            airport: flight.departure?.airport,
            iata: flight.departure?.iata,
            scheduled: flight.departure?.scheduled,
            estimated: flight.departure?.estimated,
            actual: flight.departure?.actual,
            terminal: flight.departure?.terminal,
            gate: flight.departure?.gate
          },
          arrival: {
            airport: flight.arrival?.airport,
            iata: flight.arrival?.iata,
            scheduled: flight.arrival?.scheduled,
            estimated: flight.arrival?.estimated,
            actual: flight.arrival?.actual,
            terminal: flight.arrival?.terminal,
            gate: flight.arrival?.gate
          },
          airline: flight.airline?.name,
          aircraft: flight.aircraft?.model
        };

        return res.json({
          success: true,
          flight: formattedStatus,
          source: "AviationStack (fallback)"
        });
      } else {
        throw new Error("No flight data found");
      }
    } catch (aviationError) {
      // Return a helpful message with sample data
      console.error("Both APIs failed:", flightApiError.message, aviationError.message);
      
      res.json({
        success: true,
        flight: {
          flight_number: flight_number,
          status: "Unable to retrieve real-time status",
          message: `Flight ${flight_number} status is currently unavailable. Please check the airline's official website or contact them directly for the most up-to-date information.`,
          suggested_actions: [
            "Check airline's official website",
            "Call airline customer service",
            "Check airport departure/arrival boards"
          ]
        },
        source: "Fallback response",
        note: "Real-time APIs temporarily unavailable"
      });
    }
  }
});

// 3. Airport Search (with fallback data)
app.get("/api/airports", async (req, res) => {
  const { query } = req.query;
  
  if (!query) {
    return res.status(400).json({ 
      error: "Missing required parameter: query",
      example: "/api/airports?query=Mumbai"
    });
  }

  console.log(`🔍 Searching airports: ${query}`);

  // Try AviationStack first
  try {
    const url = `${AVIATIONSTACK_BASE}/airports?access_key=${AVIATIONSTACK_KEY}&search=${encodeURIComponent(query)}&limit=20`;
    const response = await axios.get(url);
    const airports = response.data.data || [];
    
    const formattedAirports = airports.map(airport => ({
      name: airport.airport_name,
      iata: airport.iata_code,
      icao: airport.icao_code,
      city: airport.city,
      country: airport.country_name,
      timezone: airport.timezone,
      coordinates: {
        latitude: airport.latitude,
        longitude: airport.longitude
      }
    }));

    return res.json({
      success: true,
      query: query,
      total_results: airports.length,
      airports: formattedAirports,
      source: "AviationStack"
    });

  } catch (error) {
    console.error("AviationStack Airport Search Error:", error.message);
    
    // Fallback to common airport data
    const commonAirports = {
      'mumbai': [
        { name: 'Chhatrapati Shivaji Maharaj International Airport', iata: 'BOM', icao: 'VABB', city: 'Mumbai', country: 'India' }
      ],
      'delhi': [
        { name: 'Indira Gandhi International Airport', iata: 'DEL', icao: 'VIDP', city: 'New Delhi', country: 'India' }
      ],
      'bangalore': [
        { name: 'Kempegowda International Airport', iata: 'BLR', icao: 'VOBL', city: 'Bangalore', country: 'India' }
      ],
      'chennai': [
        { name: 'Chennai International Airport', iata: 'MAA', icao: 'VOMM', city: 'Chennai', country: 'India' }
      ],
      'hyderabad': [
        { name: 'Rajiv Gandhi International Airport', iata: 'HYD', icao: 'VOHS', city: 'Hyderabad', country: 'India' }
      ],
      'riyadh': [
        { name: 'King Khalid International Airport', iata: 'RUH', icao: 'OERK', city: 'Riyadh', country: 'Saudi Arabia' }
      ],
      'jeddah': [
        { name: 'King Abdulaziz International Airport', iata: 'JED', icao: 'OEJN', city: 'Jeddah', country: 'Saudi Arabia' }
      ],
      'dammam': [
        { name: 'King Fahd International Airport', iata: 'DMM', icao: 'OEDF', city: 'Dammam', country: 'Saudi Arabia' }
      ]
    };

    const queryLower = query.toLowerCase();
    const matchingAirports = [];
    
    // Search in common airports
    for (const [city, airports] of Object.entries(commonAirports)) {
      if (city.includes(queryLower) || queryLower.includes(city)) {
        matchingAirports.push(...airports);
      }
    }

    res.json({
      success: true,
      query: query,
      total_results: matchingAirports.length,
      airports: matchingAirports,
      source: "Fallback airport data",
      note: "Real-time airport API temporarily unavailable"
    });
  }
});

// 4. Routes Information (AviationStack)
app.get("/api/routes", async (req, res) => {
  const { from, to } = req.query;
  
  if (!from || !to) {
    return res.status(400).json({ 
      error: "Missing required parameters: from, to",
      example: "/api/routes?from=MAA&to=DEL"
    });
  }

  try {
    const url = `${AVIATIONSTACK_BASE}/routes?access_key=${AVIATIONSTACK_KEY}&dep_iata=${from}&arr_iata=${to}`;
    
    console.log(`🗺️ Searching routes: ${from} → ${to}`);
    
    const response = await axios.get(url);
    const routes = response.data.data || [];
    
    // Format response for AI consumption
    const formattedRoutes = routes.map(route => ({
      airline: route.airline_name,
      airline_iata: route.airline_iata,
      flight_number: route.flight_number,
      departure: {
        airport: route.departure_airport,
        iata: route.departure_iata
      },
      arrival: {
        airport: route.arrival_airport,
        iata: route.arrival_iata
      }
    }));

    res.json({
      success: true,
      route: `${from} → ${to}`,
      total_routes: routes.length,
      routes: formattedRoutes,
      source: "AviationStack"
    });

  } catch (error) {
    console.error("Routes Search Error:", error.message);
    res.status(500).json({ 
      error: "Failed to search routes",
      details: error.message
    });
  }
});

// 5. Airlines Information (AviationStack)
app.get("/api/airlines", async (req, res) => {
  const { code } = req.query;

  try {
    const url = `${AVIATIONSTACK_BASE}/airlines?access_key=${AVIATIONSTACK_KEY}${code ? `&airline_iata=${code}` : '&limit=50'}`;
    
    console.log(`✈️ Fetching airlines${code ? ` for code: ${code}` : ' (top 50)'}`);
    
    const response = await axios.get(url);
    const airlines = response.data.data || [];
    
    // Format response for AI consumption
    const formattedAirlines = airlines.map(airline => ({
      name: airline.airline_name,
      iata: airline.iata_code,
      icao: airline.icao_code,
      country: airline.country_name,
      fleet_size: airline.fleet_size,
      callsign: airline.callsign
    }));

    res.json({
      success: true,
      query: code || "All airlines",
      total_airlines: airlines.length,
      airlines: formattedAirlines,
      source: "AviationStack"
    });

  } catch (error) {
    console.error("Airlines Search Error:", error.message);
    res.status(500).json({ 
      error: "Failed to fetch airlines",
      details: error.message
    });
  }
});

// ==================== MCP TOOL EXECUTION ====================
app.post("/mcp/execute", async (req, res) => {
  const { tool_id, parameters } = req.body;
  
  try {
    let result;
    
    switch (tool_id) {
      case "get-live-flights":
        const liveResponse = await axios.get(`http://localhost:${PORT}/api/flights/live`, {
          params: parameters
        });
        result = liveResponse.data;
        break;
        
      case "get-flight-status":
        const statusResponse = await axios.get(`http://localhost:${PORT}/api/flights/status`, {
          params: parameters
        });
        result = statusResponse.data;
        break;
        
      case "search-airports":
        const airportResponse = await axios.get(`http://localhost:${PORT}/api/airports`, {
          params: parameters
        });
        result = airportResponse.data;
        break;
        
      case "get-routes":
        const routeResponse = await axios.get(`http://localhost:${PORT}/api/routes`, {
          params: parameters
        });
        result = routeResponse.data;
        break;
        
      case "get-airlines":
        const airlineResponse = await axios.get(`http://localhost:${PORT}/api/airlines`, {
          params: parameters
        });
        result = airlineResponse.data;
        break;
        
      default:
        return res.status(400).json({ error: `Unknown tool: ${tool_id}` });
    }
    
    res.json({
      success: true,
      tool_id,
      parameters,
      result
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      tool_id,
      error: error.message
    });
  }
});

// ==================== ERROR HANDLING ====================
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).json({ 
    error: "Internal server error",
    details: err.message 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
✈️ ========================================
  MCP FLIGHT SERVER RUNNING
✈️ ========================================
📍 Port: ${PORT}
🌐 URL: http://localhost:${PORT}
🔌 APIs: AviationStack + FlightAPI.io
📋 MCP Manifest: http://localhost:${PORT}/mcp/manifest
✈️ ========================================
  `);
});

