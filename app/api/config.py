"""
Configuration and Constants for AI Travel Agent Backend
"""

import os
from dotenv import load_dotenv
from pathlib import Path
import sys

# Load environment variables
load_dotenv()

# Azure OpenAI Configuration
AZURE_OPENAI_ENDPOINT = os.getenv("AZURE_OPENAI_ENDPOINT")
AZURE_OPENAI_API_KEY = os.getenv("AZURE_OPENAI_API_KEY")
AZURE_OPENAI_API_VERSION = os.getenv("AZURE_OPENAI_API_VERSION")
AZURE_OPENAI_DEPLOYMENT_NAME = os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME")

# Azure Speech Configuration
AZURE_SPEECH_KEY = os.getenv("AZURE_SPEECH_KEY")
AZURE_SPEECH_REGION = os.getenv("AZURE_SPEECH_REGION")

# Database Configuration - Use absolute path
DB_DIR = Path(__file__).parent.parent.parent / "database"
DB_DIR.mkdir(exist_ok=True, parents=True)
DB_PATH = str(DB_DIR / "customers.db")

# Multilingual Voice Configuration
LANGUAGE_VOICES = {
    'en': 'en-US-AriaNeural',  # Female voice (Alex)
    'ta': 'ta-IN-PallaviNeural',
    'hi': 'hi-IN-SwaraNeural',
    'te': 'te-IN-ShrutiNeural',
    'kn': 'kn-IN-SapnaNeural'
}

# Currency conversion rate (USD to INR)
USD_TO_INR_RATE = 83.0

# Service Pricing (USD)
# NOTE: Only "Flight" service is actively used in the system
# Flight bookings created via /create_flight_booking endpoint
SERVICE_PRICES = {
    'Flight': {
        'Economy': 400,      # India-Saudi round trip
        'Business': 1200,    # Business class with connections
        'First': 2500        # First class luxury
    }
}

# ============================================================================
# ⚠️ PROMPTS HAVE BEEN MOVED TO ACTIVE LOCATION
# ============================================================================
# The AI Agent prompts are now defined in:
# /Production/agent/agent.py (lines 282+)
# 
# This includes:
# - Flight booking instructions
# - Itinerary planning & recommendations
# - Conversation flow guidelines
# - Special interest templates
# - All system instructions for the LiveKit voice agent
#
# The old TRAVEL_CONTEXT below is DEPRECATED and no longer used.
# If you need to modify agent behavior, edit /agent/agent.py instead.
# ============================================================================

# [DEPRECATED - DO NOT USE]
# TRAVEL_CONTEXT has been removed. Use agent.py instead for all prompts.
TRAVEL_CONTEXT = ""  # Empty - all prompts moved to agent.py

