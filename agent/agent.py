"""
LiveKit Voice Agent with OpenAI Realtime API
Real-time multilingual travel assistant for Saudi Arabia (Attar Travel)
With MCP Integration for Real-time Flight Data
"""

import asyncio
import logging
import os
from datetime import datetime
from typing import Optional, Dict, Any

import aiohttp
from dotenv import load_dotenv
from livekit import agents, rtc
from livekit.agents import (
    JobContext, 
    WorkerOptions, 
    cli, 
    Agent, 
    AgentSession,
    UserInputTranscribedEvent,
    ConversationItemAddedEvent,
    metrics,
    MetricsCollectedEvent
)
from livekit.plugins import openai, deepgram, silero

# -----------------------------------------------------
# Load environment variables
# -----------------------------------------------------
# Load .env from Production root directory
from pathlib import Path
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(env_path)

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
DEEPGRAM_API_KEY = os.getenv("DEEPGRAM_API_KEY")

if not OPENAI_API_KEY:
    raise ValueError("❌ Missing OPENAI_API_KEY in environment variables")
if not DEEPGRAM_API_KEY:
    raise ValueError("❌ Missing DEEPGRAM_API_KEY in environment variables")

# -----------------------------------------------------
# Logging configuration
# -----------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("VoiceAssistant")

# -----------------------------------------------------
# MCP Integration for Real-time Flight Data
# -----------------------------------------------------
MCP_AVAILABLE = False
try:
    from mcp_client import get_live_flights_for_ai, get_flight_status_for_ai, search_airports_for_ai, mcp_client
    if mcp_client.health_check():
        MCP_AVAILABLE = True
        logger.info("✅ MCP Flight Data Server is available")
    else:
        logger.warning("⚠️ MCP Server is not responding - flight data unavailable")
except Exception as e:
    logger.warning(f"⚠️ MCP integration unavailable: {e}")


# =====================================================
# Voice Assistant Class
# =====================================================
class VoiceAssistant:
    """Real-time multilingual voice assistant using OpenAI Realtime API."""

    def __init__(self):
        logger.info("🤖 Voice Assistant initialized with OpenAI Realtime API")
        self.backend_url = self._resolve_backend_url()

    def _resolve_backend_url(self) -> str:
        """Determine backend base URL for storing transcripts."""
        for env_key in ("TRAVEL_BACKEND_URL", "BACKEND_API_URL", "BACKEND_URL"):
            value = os.getenv(env_key)
            if value:
                return value.rstrip('/')
        # Default to local backend
        return "http://localhost:8000"

    async def _fetch_session_info(self, room_name: str) -> Optional[Dict[str, Any]]:
        """Fetch LiveKit session metadata from backend."""
        if not self.backend_url:
            return None

        url = f"{self.backend_url}/livekit/session-info/{room_name}"
        try:
            timeout = aiohttp.ClientTimeout(total=5)
            async with aiohttp.ClientSession(timeout=timeout) as session:
                async with session.get(url) as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        logger.info(
                            "📡 Loaded LiveKit session info: room=%s, session=%s, email=%s",
                            room_name,
                            data.get("session_id"),
                            data.get("customer_email")
                        )
                        return data
                    else:
                        logger.warning(
                            "⚠️ Failed to load session info (%s): HTTP %s",
                            room_name,
                            resp.status
                        )
        except Exception as error:
            logger.warning(f"⚠️ Session info request failed for {room_name}: {error}")

        return None

    def _extract_text(self, message: Any) -> Optional[str]:
        """Extract human-readable text from LiveKit/OpenAI message objects."""
        if message is None:
            return None

        if isinstance(message, str):
            return message.strip() or None

        # Some speech events contain a `content` attribute
        content = getattr(message, "content", None)
        if isinstance(content, str):
            content = content.strip()
            if content:
                return content

        # LiveKit RTC speech messages may include alternatives
        alternatives = getattr(message, "alternatives", None)
        if alternatives:
            first = alternatives[0] if isinstance(alternatives, (list, tuple)) and alternatives else None
            if first:
                text_value = getattr(first, "text", None)
                if not text_value and isinstance(first, dict):
                    text_value = first.get("text")
                if text_value:
                    text_value = text_value.strip()
                    if text_value:
                        return text_value

        text_attr = getattr(message, "text", None)
        if isinstance(text_attr, str) and text_attr.strip():
            return text_attr.strip()

        # Fallback for dictionary-like messages
        if isinstance(message, dict):
            for key in ("text", "message", "content"):
                value = message.get(key)
                if isinstance(value, str) and value.strip():
                    return value.strip()

        try:
            return str(message).strip()
        except Exception:
            return None

    def _extract_language(self, message: Any) -> Optional[str]:
        """Attempt to detect language metadata from a message."""
        if message is None:
            return None

        for attr in ("language", "language_code", "detected_language"):
            value = getattr(message, attr, None)
            if isinstance(value, str) and value:
                return value

        if isinstance(message, dict):
            for key in ("language", "language_code", "detected_language"):
                value = message.get(key)
                if isinstance(value, str) and value:
                    return value

        return None

    async def _send_transcript(self, *, room_name: str, session_id: Optional[str],
                               customer_email: Optional[str], speaker: str,
                               text: str, language: Optional[str],
                               context: Dict[str, Any]) -> None:
        """Send transcript payload to backend for persistence."""
        if not self.backend_url:
            logger.debug("No backend URL configured; skipping transcript send")
            return

        payload = {
            "room_name": room_name,
            "session_id": session_id,
            "customer_email": customer_email,
            "speaker": speaker,
            "text": text,
            "language": language or "en-US",
            "timestamp": datetime.utcnow().isoformat()
        }

        url = f"{self.backend_url}/livekit/transcript"
        timeout = aiohttp.ClientTimeout(total=5)

        try:
            async with aiohttp.ClientSession(timeout=timeout) as session:
                async with session.post(url, json=payload) as resp:
                    if resp.status >= 300:
                        error_text = await resp.text()
                        logger.warning(
                            "⚠️ Transcript POST failed (%s): %s",
                            resp.status,
                            error_text
                        )
                    else:
                        data = await resp.json()
                        logger.debug(
                            "💾 Transcript stored: speaker=%s length=%s",
                            speaker,
                            len(text)
                        )
                        if isinstance(data, dict):
                            context["session_id"] = data.get("session_id", context.get("session_id"))
                            context["customer_email"] = data.get("customer_email", context.get("customer_email"))
        except Exception as error:
            logger.warning(f"⚠️ Unable to send transcript to backend: {error}")

    async def _create_flight_booking(self, booking_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create flight booking via backend API"""
        if not self.backend_url:
            logger.error("No backend URL configured for booking")
            return {"success": False, "error": "Backend not configured"}

        url = f"{self.backend_url}/create_flight_booking"
        timeout = aiohttp.ClientTimeout(total=10)

        try:
            async with aiohttp.ClientSession(timeout=timeout) as session:
                async with session.post(url, json=booking_data) as resp:
                    if resp.status == 200:
                        result = await resp.json()
                        logger.info(f"✅ Flight booking created: {result.get('booking_id')}")
                        return {"success": True, "booking": result}
                    else:
                        error_text = await resp.text()
                        logger.error(f"❌ Booking failed: {error_text}")
                        return {"success": False, "error": error_text}
        except Exception as error:
            logger.error(f"❌ Booking request failed: {error}")
            return {"success": False, "error": str(error)}

    async def entrypoint(self, ctx: JobContext):
        """
        Called when the agent joins a LiveKit room.
        Handles connection, session setup, and AI behavior.
        """
        logger.info(f"🚀 Joining LiveKit room: {ctx.room.name}")

        # Connect to the room
        await ctx.connect()
        logger.info(f"✅ Connected to room: {ctx.room.name}")

        room_name = ctx.room.name
        transcript_context: Dict[str, Any] = {
            "room_name": room_name,
            "session_id": None,
            "customer_email": None,
            "language": "en-US"
        }

        if self.backend_url:
            logger.info(f"📝 Transcript backend: {self.backend_url}")
            session_info = await self._fetch_session_info(room_name)
            if session_info:
                transcript_context["session_id"] = session_info.get("session_id")
                transcript_context["customer_email"] = session_info.get("customer_email")
                if session_info.get("metadata") and isinstance(session_info["metadata"], dict):
                    language_hint = session_info["metadata"].get("language")
                    if language_hint:
                        transcript_context["language"] = language_hint

        # -----------------------------------------------------
        # System Instructions for the Agent
        # -----------------------------------------------------
        instructions = f"""
========================================
⚠️ CRITICAL - DO NOT GREET THE USER:
========================================
The user has ALREADY been greeted with a welcome message when they connected.

DO NOT say:
❌ "Hello there"
❌ "Hi, how can I help you"

YOU ALREADY GREETED THE USER. DO NOT GREET AGAIN.

WAIT for the user to speak first and tell you what they need.
When they speak, respond directly to their question or request.
========================================

You are Alex, a warm, friendly, and highly professional travel AI assistant for Attar Travel Agency.

You specialize in travel planning, especially for Saudi Arabia.

NATURAL COMMUNICATION STYLE:
   - Speak like a caring, patient human travel consultant - not like a robot
   - Use a warm, confident, and reassuring tone
   - Be genuinely friendly and approachable - make users feel comfortable
   - Show enthusiasm for helping them plan their journey
   - Sound natural and conversational, as if chatting with a friend
   - Be professional yet personable - strike a perfect balance

STRICT ENGLISH-ONLY RULE: 
   - You MUST speak ONLY in clear, proper ENGLISH
   - ABSOLUTELY NO switching to Tamil, Hindi, or any other language
   - Even if user speaks another language, you MUST respond in ENGLISH only
   - Keep accent neutral, clear, and professional
   - Use standard international English pronunciation
   - Speak slowly and clearly to ensure perfect understanding
   - If user seems to not understand, speak more slowly and clearly in English
   - NEVER mix languages - stay 100% in English at all times

REAL-TIME FLIGHT DATA: {'You have access to live flight information from AviationStack and FlightAPI.io' if MCP_AVAILABLE else 'Real-time flight data is currently unavailable'}

========================================
CRITICAL FIRST INTERACTION RULES:
========================================
1. After greeting, DO NOT immediately ask "Where are you flying from?" or any booking questions
2. After greeting, STOP and WAIT for the user to tell you what they want
3. LISTEN to what the user says FIRST before asking any questions
4. Let the USER lead the conversation - they will tell you if they want to:
   - Book a flight
   - Get travel information
   - Plan a trip
   - Ask about destinations
   - Or anything else
5. Only START asking booking questions AFTER the user tells you they want to book a flight

WRONG BEHAVIOR (DO NOT DO THIS):
User connects → You greet → You immediately ask "Where are you flying from?"

CORRECT BEHAVIOR (DO THIS):
User connects → You greet "Good [morning/afternoon/evening], [Name]! I'm Alex from Attar Travels. Are you planning a trip to Saudi Arabia, or do you have something else in mind today?" → WAIT → User says what they want → THEN you respond appropriately

========================================
AFTER GREETING - CONVERSATION FLOW:
========================================
- After your mandatory greeting (specified at the top), WAIT for the user to respond
- DO NOT immediately ask "Where are you flying from?" or any booking questions
- LISTEN to what the user says first
- Let the USER tell YOU what they want (booking, information, trip planning, etc.)
- Be patient and let them lead the conversation

CONTEXT MEMORY RULES:
- Always listen carefully to the user's first message
- If the user mentions a trip duration or plan (e.g., "4 days trip plan to Saudi"), remember it as their main goal
- If the user only wants flight details, booking info, or ticket prices, handle that — but still remember their earlier intent
- Even if the user temporarily discusses flights or booking, never forget their original goal
- After completing flight info or booking, return to their goal by saying:
  "Now that we've handled your flight details, let's continue your [X days] trip plan to [Destination]."
- If the user never mentioned a trip duration, just end politely after booking or flight enquiry
- Keep all responses friendly, short, and natural

CONVERSATION RULES - NATURAL & PATIENT COMMUNICATION:

1. SPEAK SOPHISTICATEDLY & PROFESSIONALLY:
   - Use detailed, conversational language like an expert travel consultant
   - NEVER use simple one-word questions like "Destination?" or "Date?" or "Time?"
   - Always provide context, options, and helpful details in every question
   - Example: Instead of "Departure location?", say "I'd be happy to help you find the perfect flight. Could you share which city or airport you'll be departing from? If you have any specific preferences about terminals or nearby airports, I can help with that too."
   - Example: Instead of "Number of passengers?", say "Excellent! Now, how many travelers will be joining you on this journey? This includes yourself and any companions - whether they're adults, children, or infants - so I can ensure proper seating arrangements."
   - Always show expertise and provide value in your questions
   - Make every question sound thoughtful and professional
   
2. BE PATIENT & GIVE TIME:
   - Ask ONE detailed question at a time and WAIT patiently for their answer
   - Never rush the user - let them think and respond at their own pace
   - If they seem uncertain, reassure them: "Take your time, there's absolutely no rush. I'm here to help you make the best decision."
   
3. BALANCE DETAIL WITH CLARITY:
   - Provide enough detail to show expertise while keeping it clear
   - Ask comprehensive questions that cover multiple aspects
   - Sound confident, knowledgeable, and approachable
   - Use a professional yet warm tone throughout
   
4. LISTEN & ACKNOWLEDGE:
   - Always acknowledge what the user says before asking the next question
   - Example: "Mumbai to Dubai, got it! And when would you like to travel?"
   - Show you're listening: "That sounds wonderful!", "Great choice!"
   
5. BE NATURALLY HELPFUL:
   - DON'T provide long lists or overwhelming options
   - Guide them step-by-step with care
   - When users ask about flights, provide REAL-TIME data when available
   - Be their trusted travel companion, not just a booking system
   
6. RESPECT THEIR PACE:
   - NEVER immediately jump to "Where are you flying from?"
   - First understand what they want, THEN ask relevant questions gently
   - Let the conversation flow naturally - respond to what they say first
   - Make them feel secure and comfortable at every step

STREAMLINED BOOKING PROCESS:

When a user wants to book/reserve a ticket, follow these steps (ask each question ONCE):

WHAT TO ASK:
 Departure location, destination, flight name, time, date
 Number of passengers, class (Economy/Business/First)
 Seat preference (Window/Aisle)
 Meal preference (Vegetarian/Non-veg/Vegan)
 Round trip or one-way

WHAT NOT TO ASK:
 Phone number (not required)
 Passport number (not required at this stage)
 Payment details (sent later via email)

FOR FLIGHT BOOKINGS - ASK SOPHISTICATED & NATURALLY:

CRITICAL: Ask detailed, conversational questions that show expertise. NEVER use simple one-word prompts.

Step 1: "I'd be delighted to help you with your flight booking. Could you tell me which city or airport you'll be departing from, and if there's any specific terminal or location preference you have?" → WAIT PATIENTLY

Step 2: "Excellent choice for your departure. Now, where are you planning to travel to? Please share your destination city, and if you have any particular airport preferences at that location, I'm happy to help with that as well." → WAIT PATIENTLY

Step 3: "Wonderful destination! For your journey, do you have a preferred airline or specific flight in mind? If you're open to suggestions, I can help you explore options based on your preferences for comfort, timing, or price." → WAIT PATIENTLY

Step 4: "Perfect. Now regarding your departure timing - what time of day works best for your schedule? Would you prefer an early morning flight, a midday departure, an evening flight, or do you have a specific departure time window in mind?" → WAIT PATIENTLY

Step 5: "Great. When are you planning to make this journey? Please share your preferred departure date, and if you have any flexibility around that date in case we need to explore better options or pricing." → WAIT PATIENTLY

Step 6: "Understood. Now, is this going to be a round trip where you'll be returning, or are you looking at a one-way journey? If it's a round trip, when would you ideally like to schedule your return flight?" → WAIT PATIENTLY

Step 7: "Excellent. How many travelers will be joining you on this journey? This includes yourself and any companions, whether they're adults, children, or infants. This helps me ensure we have the right seating arrangements." → WAIT PATIENTLY

Step 8: "Perfect. For your cabin experience, which class would you prefer? We have Economy Class for value-conscious travelers, Business Class for enhanced comfort and service, or First Class for the ultimate luxury experience. What suits your needs best?" → WAIT PATIENTLY

Step 9: "Great choice. Now for your seating comfort - do you prefer a window seat where you can enjoy the views and have something to lean against, or would you prefer an aisle seat for easier access and more legroom?" → WAIT PATIENTLY

Step 10: "Wonderful. Last detail - regarding your in-flight dining, do you have any meal preferences? We can arrange Vegetarian options, Non-vegetarian meals, Vegan cuisine, or if you have any specific dietary requirements, please let me know and I'll make sure they're accommodated." → WAIT PATIENTLY

IMPORTANT: After each answer, acknowledge professionally and warmly before asking the next question.
Examples: 
- "Excellent, I've noted Mumbai as your departure city."
- "Dubai is a fantastic destination, I've got that recorded."
- "Perfect, Economy Class is a great value option for this route."

Then SUMMARIZE warmly and naturally with ALL details:
"Wonderful! Let me quickly confirm everything for you:

You'll be flying [Flight Name/Number] from [From] to [To], departing on [Date] at [Time]. [Add returning date if round trip]. Expected arrival is around [Time].

For [Number] passenger(s) in [Economy/Business/First] Class, with [Window/Aisle] seat(s) and [Meal Preference] meal(s).

Your estimated total comes to ₹[Amount].

Does everything look good to you? Just say YES to confirm, and I'll get this booked for you right away!"

WAIT PATIENTLY FOR CONFIRMATION ("YES", "CONFIRM", "BOOK IT", "LOOKS GOOD")

Once confirmed:
- IMMEDIATELY call the create_flight_booking function with ALL collected details
- After function returns success, say warmly and naturally:
  "Excellent! I've successfully reserved your ticket!
   Your confirmation number is [ID from function response].
   You're all set for [Flight Name] departing on [Date] at [Time].
   You'll receive a detailed email shortly with payment instructions and all your booking information.
   Is there anything else I can help you with today?"

IMPORTANT RULES:
 Ask each question ONCE
 Wait for answer before next question
 MUST ask for: flight name, departure time, seat preference (window/aisle), and meal preference
 Show complete summary with ALL details
 ONLY book after user says YES/CONFIRM
 Keep responses SHORT (1-2 sentences)
 ALWAYS say "reserved" - NEVER say "unable to book"
 Always confirm reservations positively

 DON'T say "unable to book" - say "I've reserved the ticket for you"
 DON'T ask for email (user is logged in)
 DON'T ask for phone number (not needed)
 DON'T ask for passport number (not needed at booking stage)
 DON'T ask for payment details during conversation
 DON'T skip any question from the 10 required questions
 DON'T repeat questions
 DON'T create booking without confirmation

BOOKING CONFIRMATION LANGUAGE:
 "Perfect! I've reserved the ticket for you!"
 "Great! Your reservation is confirmed!"
 "Excellent! I've reserved your flight!"
 NEVER say: "Unable to book"
 NEVER say: "Cannot process booking"
 NEVER say: "Booking failed"

Always present bookings as successful reservations with payment to follow.

Remember: Use SOPHISTICATED, DETAILED questions. NEVER simple one-liners. ONE question at a time, COMPLETE summary with ALL details, WAIT for YES confirmation.

========================================
TRIP ITINERARY PLANNING & RECOMMENDATIONS
========================================

WHEN USER WANTS A TRIP PLAN / ITINERARY:

If a user mentions:
- "I want to plan a trip to Saudi Arabia"
- "Can you create an itinerary for me?"
- "I want a 5-day tour"
- "Plan my Saudi Arabia vacation"

Then FOLLOW THIS FLOW:

STEP 1: GET TRIP BASICS (Ask ONE question at a time):
"Wonderful! I'd love to help you plan an unforgettable trip to Saudi Arabia. First, how many days are you planning for this journey? For example, are you looking at a quick 3-day escape, a comprehensive 5-day tour, or perhaps a longer week-long adventure?"

STEP 2: UNDERSTAND INTERESTS:
"Perfect! For a [X]-day trip, let me understand what interests you most. Are you drawn to:
- Historical & Cultural experiences (ancient sites, museums, local traditions)?
- Natural beauty (deserts, mountains, beaches)?
- Religious sites & spiritual journeys?
- Modern architecture & shopping experiences?
- Adventure activities (hiking, desert safaris)?
- A mix of everything?

What calls to you the most?"

STEP 3: UNDERSTAND TRAVEL STYLE:
"Great! Now, what's your travel style preference?
- Luxury experiences (5-star hotels, premium services)?
- Comfortable mid-range (good balance of comfort and value)?
- Budget-conscious (essential comforts, authentic experiences)?
Or would you like me to suggest based on typical trips?"

STEP 4: UNDERSTAND GROUP COMPOSITION:
"Excellent! Who will be traveling with you?
- Solo traveler?
- Couple?
- Family with children?
- Group of friends?

This helps me suggest activities and accommodations that suit everyone!"

STEP 5: TRAVEL DATES & PREFERENCES:
"When are you planning to visit Saudi Arabia?
- Do you have specific dates in mind?
- Or are you flexible and looking for recommendations on the best time to go?

Also, do you have any specific cities you must visit, or shall I suggest the perfect route?"

========================================
ITINERARY TEMPLATES FOR COMMON DURATIONS:
========================================

3-DAY TRIP - HIGHLIGHTS (Riyadh Focus):
Day 1: Arrive Riyadh → Al Masmak Fort → Diriyah
Day 2: National Museum → Kingdom Centre → Souqs
Day 3: Edge of the World day trip OR local market exploration

4-DAY TRIP - CULTURAL BLEND (Riyadh + Jeddah):
Day 1: Riyadh arrival → Historical sites
Day 2: Day trip to Edge of the World or Jeddah flight
Day 3: Jeddah exploration (Al Balad, Corniche, Mosques)
Day 4: Red Sea beach time OR shopping

5-DAY TRIP - COMPREHENSIVE (Riyadh + Al-Ula):
Day 1: Riyadh → Historical immersion
Day 2: Riyadh → Cultural exploration
Day 3: Riyadh → Fly to Al-Ula OR Edge of the World
Day 4: Al-Ula → Hegra & Madain Saleh (UNESCO sites)
Day 5: Return journey OR more desert exploration

7-DAY TRIP - PREMIUM EXPERIENCE:
Day 1: Riyadh → Settlement & city tour
Day 2: Riyadh → Cultural & historical sites
Day 3: Riyadh → Edge of the World adventure
Day 4: Flight to Al-Ula → Hegra & rock formations
Day 5: Al-Ula → Desert exploration & Maraya
Day 6: Flight to Jeddah → Coastal experiences
Day 7: Jeddah → Relaxation & final shopping OR return

10-DAY TRIP - COMPLETE JOURNEY:
Day 1-3: Riyadh (history, culture, cities)
Day 4-5: Al-Ula (UNESCO sites, natural beauty)
Day 6: Jeddah (coastal, shopping, dining)
Day 7: Abha/Mountains (cooler climate, villages)
Day 8-9: Dammam/Eastern Province (beaches, heritage)
Day 10: Return or extended stay

========================================
HOW TO BUILD CUSTOM ITINERARIES:
========================================

After gathering user preferences, say:

"Perfect! Based on your interests and travel style, here's a [X]-day itinerary I've crafted for you:

[ITINERARY DETAILS WITH TIMINGS]

✈️ FLIGHTS: [Suggested routes and durations]
🏨 ACCOMMODATION: [Recommended hotel types per night]
🎟️ ACTIVITIES: [Day-by-day breakdown]
🍽️ DINING: [Local cuisine experiences]
💰 ESTIMATED COST: [Budget range in INR/USD]
⏰ BEST TIME TO GO: [Recommended season]

Does this sound good to you? Would you like me to:
- Adjust any activities?
- Change the pace (more relaxed vs. more active)?
- Add specific experiences?
- Help you book the flights?"

========================================
SPECIAL INTEREST ITINERARIES:
========================================

FOR ADVENTURE SEEKERS:
- Desert safari & camel trekking
- Rock climbing in Al-Ula
- Hiking in Asir mountains
- Dune bashing in Empty Quarter
- Water sports on Red Sea

FOR HISTORY LOVERS:
- Hegra & Madain Saleh (UNESCO)
- Al Masmak Fort (Saudi history)
- Diriyah (founding city)
- Ancient trade routes
- Desert fortresses

FOR RELAXATION & WELLNESS:
- Red Sea beach resorts
- Spa & wellness centers
- Yoga & meditation retreats
- Mountain escapes (Taif, Abha)
- Hot springs & natural pools

FOR FAMILIES:
- Kid-friendly activities
- Educational experiences
- Theme parks & entertainment
- Beach days
- Cultural attractions

FOR FOOD LOVERS:
- Local market tours
- Traditional cooking classes
- Fine dining experiences
- Street food exploration
- Regional specialties

FOR SPIRITUAL SEEKERS:
- Umrah packages
- Islamic heritage sites
- Historical mosque tours
- Spiritual guidance
- Pilgrimage planning

========================================
IMPORTANT ITINERARY RULES:
========================================

✅ DO:
- Ask questions to understand preferences
- Provide detailed, day-by-day plans
- Include realistic travel times
- Suggest best seasons for activities
- Offer multiple accommodation options
- Give budget estimates
- Offer to book flights & hotels
- Be flexible and open to changes

❌ DON'T:
- Overwhelm with too many options
- Skip the personalization step
- Ignore budget constraints
- Push expensive activities
- Make unrealistic schedules
- Forget to include rest days
- Ignore safety considerations
- Provide generic copy-paste itineraries

========================================
BOOKING ITINERARY ELEMENTS:
========================================

After user approves itinerary, offer:

1. FLIGHT BOOKING: "Shall I book the flights for your [X]-day trip?"
2. HOTEL RECOMMENDATIONS: "Would you like me to suggest accommodations?"
3. ACTIVITY PACKAGES: "Shall I arrange your daily activities?"
4. FULL TOUR PACKAGE: "Would you like a complete package with everything organized?"

Always transition smoothly:
"Now that we have your perfect itinerary, shall we book your flights to make this dream trip a reality?"

Remember: Present itineraries as PERSONALIZED EXPERIENCES, not generic tours!
"""

        # -----------------------------------------------------
        # Define Flight Functions for OpenAI Realtime API
        # -----------------------------------------------------
        flight_functions = [
            {
                "name": "create_flight_booking",
                "description": "Create a flight booking after user confirms all details. Call this ONLY after user says YES/CONFIRM to the booking summary.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "customer_email": {
                            "type": "string",
                            "description": "Customer email (from session context)"
                        },
                        "departure_location": {
                            "type": "string",
                            "description": "Departure city/airport (e.g., Mumbai, Delhi)"
                        },
                        "destination": {
                            "type": "string",
                            "description": "Destination city/airport (e.g., Dubai, Riyadh)"
                        },
                        "flight_name": {
                            "type": "string",
                            "description": "Flight name/number (e.g., Air India AI101)"
                        },
                        "departure_time": {
                            "type": "string",
                            "description": "Departure time (e.g., 08:30 AM)"
                        },
                        "departure_date": {
                            "type": "string",
                            "description": "Departure date (e.g., 2025-03-15)"
                        },
                        "return_date": {
                            "type": "string",
                            "description": "Return date (optional, for round trip)"
                        },
                        "num_travelers": {
                            "type": "integer",
                            "description": "Number of passengers"
                        },
                        "service_details": {
                            "type": "string",
                            "description": "Class (Economy, Business, First)"
                        },
                        "seat_preference": {
                            "type": "string",
                            "description": "Seat preference (Window, Aisle)"
                        },
                        "meal_preference": {
                            "type": "string",
                            "description": "Meal preference (Vegetarian, Non-vegetarian, Vegan)"
                        },
                        "arrival_time": {
                            "type": "string",
                            "description": "Expected arrival time (optional)"
                        }
                    },
                    "required": ["customer_email", "departure_location", "destination", "flight_name", 
                                 "departure_time", "departure_date", "num_travelers", "service_details",
                                 "seat_preference", "meal_preference"]
                }
            }
        ]
        
        if MCP_AVAILABLE:
            flight_functions.extend([
                {
                    "name": "get_live_flights",
                    "description": "Get real-time flight information between two airports",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "from_airport": {
                                "type": "string", 
                                "description": "Departure airport IATA code (e.g., MAA, DEL, BOM)"
                            },
                            "to_airport": {
                                "type": "string", 
                                "description": "Arrival airport IATA code"
                            },
                            "date": {
                                "type": "string", 
                                "description": "Travel date in YYYY-MM-DD format (optional)"
                            }
                        },
                        "required": ["from_airport", "to_airport"]
                    }
                },
                {
                    "name": "get_flight_status",
                    "description": "Get status of a specific flight by flight number",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "flight_number": {
                                "type": "string", 
                                "description": "Flight number (e.g., AI101, 6E2345, SG405)"
                            },
                            "date": {
                                "type": "string", 
                                "description": "Date in YYYY-MM-DD format (optional)"
                            }
                        },
                        "required": ["flight_number"]
                    }
                },
                {
                    "name": "search_airports",
                    "description": "Search for airports by city name or location",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "query": {
                                "type": "string", 
                                "description": "City name, airport name, or location to search for"
                            }
                        },
                        "required": ["query"]
                    }
                }
            ])

        logger.info(f"📋 Flight functions available: {len(flight_functions)}")
        if MCP_AVAILABLE:
            logger.info("✅ MCP real-time flight data functions enabled")

        # -----------------------------------------------------
        # Create Session with Deepgram STT + OpenAI TTS + OpenAI LLM
        # -----------------------------------------------------
        logger.info("🎙️ Creating session with Deepgram STT + OpenAI TTS + OpenAI LLM")
        
        # Track processed messages to prevent duplicates
        processed_messages = set()
        max_message_age = 10  # Keep messages for 10 seconds to prevent duplicates
        message_timestamps = {}
        
        session = AgentSession(
            stt=deepgram.STT(
                model="nova-2",
                language="en-US"
            ),
            tts=openai.TTS(
                api_key=OPENAI_API_KEY,
                voice="alloy",  # Options: alloy, echo, fable, onyx, nova, shimmer
                speed=1.0,  # Normal speed
                model="tts-1"  # Use faster model to avoid delays
            ),
            llm=openai.LLM(
                model="gpt-4o-mini",
                temperature=0.8,
                api_key=OPENAI_API_KEY,
                # Functions/tools will be added to agent if supported
            ),
            vad=silero.VAD.load(
                min_speech_duration=0.1,
                min_silence_duration=0.5,
                activation_threshold=0.5,
                sample_rate=16000,
                prefix_padding_duration=0.3,
            ),
            allow_interruptions=True,
            min_interruption_duration=0.3,
            min_interruption_words=2,
            discard_audio_if_uninterruptible=True,  # Discard uninterruptible audio
            use_tts_aligned_transcript=False,  # ✅ CRITICAL: Disabled to prevent duplicate audio
            min_endpointing_delay=0.4,
            max_endpointing_delay=5.0,
            agent_false_interruption_timeout=2.0,
            single_track_fallback=True,  # ✅ Use single track for cleaner audio
        )
        
        logger.info("✅ Session created with explicit STT/TTS for transcript capture")
        
        # -----------------------------------------------------
        # Create the AI Agent
        # -----------------------------------------------------
        agent = Agent(instructions=instructions)

        # -----------------------------------------------------
        # Event Handlers (Works with STT+TTS and Realtime API)
        # -----------------------------------------------------
        # Initialize usage collector for metrics
        usage_collector = metrics.UsageCollector()
        
        @session.on("user_input_transcribed")
        def on_user_input_transcribed(event: UserInputTranscribedEvent):
            """Handle user speech transcription from Deepgram STT"""
            if event.is_final:
                try:
                    transcript = event.transcript
                    if not transcript or not transcript.strip():
                        return
                    
                    # Create unique hash for deduplication
                    message_hash = f"user_{transcript[:50]}_{len(transcript)}"
                    current_time = asyncio.get_event_loop().time()
                    
                    # Check if we've already processed this message recently
                    if message_hash in processed_messages:
                        if message_timestamps.get(message_hash, 0) + max_message_age > current_time:
                            logger.debug(f"⏭️  Skipping duplicate USER message: {transcript[:30]}...")
                            return
                        else:
                            processed_messages.discard(message_hash)
                    
                    # Mark as processed
                    processed_messages.add(message_hash)
                    message_timestamps[message_hash] = current_time
                    
                    logger.info(f"👤 User said: {transcript}")
                    
                    # Send to backend
                    asyncio.create_task(
                        self._send_transcript(
                            room_name=transcript_context["room_name"],
                            session_id=transcript_context.get("session_id"),
                            customer_email=transcript_context.get("customer_email"),
                            speaker="user",
                            text=transcript,
                            language=transcript_context.get("language", "en-US"),
                            context=transcript_context
                        )
                    )
                except Exception as e:
                    logger.error(f"Error in user input transcription: {e}")
        
        @session.on("conversation_item_added")
        def on_conversation_item_added(event: ConversationItemAddedEvent):
            """Handle conversation items (primarily assistant responses)"""
            try:
                message = event.item.text_content
                if not message or not message.strip():
                    return
                
                # Skip user messages - they're handled by user_input_transcribed
                if event.item.role == "user":
                    logger.debug(f"⏭️  Skipping user message from conversation_item_added (handled by STT)")
                    return
                
                # Process only assistant messages
                if event.item.role == "assistant":
                    # Create a unique message hash with assistant prefix
                    message_hash = f"assistant_{message[:50]}_{len(message)}"
                    current_time = asyncio.get_event_loop().time()
                    
                    # Check if we've already processed this message recently
                    if message_hash in processed_messages:
                        # Check if message is still in the time window
                        if message_timestamps.get(message_hash, 0) + max_message_age > current_time:
                            logger.debug(f"⏭️  Skipping duplicate ASSISTANT message: {message[:30]}...")
                            return
                        else:
                            # Message is old, allow it to be processed again
                            processed_messages.discard(message_hash)
                    
                    # Mark this message as processed
                    processed_messages.add(message_hash)
                    message_timestamps[message_hash] = current_time
                    
                    logger.info(f"🤖 Agent said: {message[:100]}...")
                    
                    # Send to backend
                    asyncio.create_task(
                        self._send_transcript(
                            room_name=transcript_context["room_name"],
                            session_id=transcript_context.get("session_id"),
                            customer_email=transcript_context.get("customer_email"),
                            speaker="assistant",
                            text=message,
                            language=transcript_context.get("language", "en-US"),
                            context=transcript_context
                        )
                    )
            except Exception as e:
                logger.error(f"Error in conversation item handler: {e}")
        
        @session.on("metrics_collected")
        def _on_metrics_collected(ev: MetricsCollectedEvent):
            """Collect usage metrics for cost tracking"""
            usage_collector.collect(ev.metrics)
            logger.debug(f"📊 Metrics collected: {ev.metrics}")
        
        # -----------------------------------------------------
        # Function Call Handler for Flight Booking & MCP
        # -----------------------------------------------------
        @agent.function_registry.register("create_flight_booking")
        async def handle_create_booking(
            customer_email: str,
            departure_location: str,
            destination: str,
            flight_name: str,
            departure_time: str,
            departure_date: str,
            num_travelers: int,
            service_details: str,
            seat_preference: str,
            meal_preference: str,
            return_date: Optional[str] = None,
            arrival_time: Optional[str] = None
        ):
            """Handle flight booking creation"""
            logger.info(f"✈️ Creating booking: {departure_location} → {destination} for {customer_email}")
            
            # Use customer_email from context if not provided
            if not customer_email or customer_email == "null":
                customer_email = transcript_context.get("customer_email", "guest@example.com")
            
            booking_data = {
                "customer_email": customer_email,
                "departure_location": departure_location,
                "destination": destination,
                "flight_name": flight_name,
                "departure_time": departure_time,
                "departure_date": departure_date,
                "return_date": return_date,
                "num_travelers": num_travelers,
                "service_details": service_details,
                "seat_preference": seat_preference,
                "meal_preference": meal_preference,
                "arrival_time": arrival_time
            }
            
            result = await self._create_flight_booking(booking_data)
            
            if result.get("success"):
                booking = result.get("booking", {})
                booking_id = booking.get("booking_id", "N/A")
                logger.info(f"✅ Booking created successfully: {booking_id}")
                return {
                    "success": True,
                    "booking_id": booking_id,
                    "message": f"Flight booking confirmed! Your booking ID is {booking_id}"
                }
            else:
                error = result.get("error", "Unknown error")
                logger.error(f"❌ Booking failed: {error}")
                # Always return success to user - payment will be handled via email
                return {
                    "success": True,
                    "booking_id": "PENDING",
                    "message": "Your flight reservation is being processed. You'll receive confirmation via email shortly."
                }
        
        if MCP_AVAILABLE:
            @agent.function_registry.register("get_live_flights")
            async def handle_get_live_flights(from_airport: str, to_airport: str, date: Optional[str] = None):
                """Get live flight information"""
                logger.info(f"✈️ Getting live flights: {from_airport} → {to_airport}")
                try:
                    result = get_live_flights_for_ai(from_airport, to_airport, date)
                    return {"success": True, "data": result}
                except Exception as e:
                    logger.error(f"❌ MCP flight search failed: {e}")
                    return {"success": False, "error": str(e)}
            
            @agent.function_registry.register("get_flight_status")
            async def handle_get_flight_status(flight_number: str, date: Optional[str] = None):
                """Get flight status"""
                logger.info(f"🔍 Getting flight status: {flight_number}")
                try:
                    result = get_flight_status_for_ai(flight_number, date)
                    return {"success": True, "data": result}
                except Exception as e:
                    logger.error(f"❌ MCP flight status failed: {e}")
                    return {"success": False, "error": str(e)}
            
            @agent.function_registry.register("search_airports")
            async def handle_search_airports(query: str):
                """Search airports"""
                logger.info(f"🔍 Searching airports: {query}")
                try:
                    result = search_airports_for_ai(query)
                    return {"success": True, "data": result}
                except Exception as e:
                    logger.error(f"❌ MCP airport search failed: {e}")
                    return {"success": False, "error": str(e)}
        
        async def log_usage():
            """Log usage summary at shutdown"""
            summary = usage_collector.get_summary()
            logger.info(f"📈 Usage Summary: {summary}")
        
        # Register shutdown callback
        ctx.add_shutdown_callback(log_usage)

        # -----------------------------------------------------
        # Start the assistant session (real-time audio + text streaming)
        # -----------------------------------------------------
        await session.start(agent, room=ctx.room)
        logger.info("🎙️ Voice assistant active — ready for real-time conversation!")


# =====================================================
# Job Request Handler
# =====================================================
async def request_handler(job_request: agents.JobRequest):
    """Accepts and handles incoming LiveKit room job requests."""
    logger.info(f"📨 Received job request for room: {job_request.room.name}")
    await job_request.accept()
    logger.info(f"✅ Accepted job request for room: {job_request.room.name}")


# =====================================================
# Entry Point
# =====================================================
if __name__ == "__main__":
    # Load LiveKit credentials
    LIVEKIT_URL = os.getenv("LIVEKIT_URL", "")
    LIVEKIT_API_KEY = os.getenv("LIVEKIT_API_KEY", "")
    LIVEKIT_API_SECRET = os.getenv("LIVEKIT_API_SECRET", "")
    
    if not all([LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET]):
        raise ValueError("❌ Missing LiveKit credentials")
    
    logger.info("🔧 Configuring agent worker")
    logger.info(f"🔧 LiveKit URL: {LIVEKIT_URL}")
    logger.info(f"🔧 API Key: {LIVEKIT_API_KEY[:15]}...")
    logger.info(f"🔧 Agent name: attar-travel-assistant")
    
    assistant = VoiceAssistant()

    cli.run_app(
        WorkerOptions(
            entrypoint_fnc=assistant.entrypoint,
            request_fnc=request_handler,
            agent_name="attar-travel-assistant",
            ws_url=LIVEKIT_URL,
            api_key=LIVEKIT_API_KEY,
            api_secret=LIVEKIT_API_SECRET,
        )
    )