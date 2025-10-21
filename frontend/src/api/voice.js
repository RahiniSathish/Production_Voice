import axios from "axios";

const BASE_URL = "http://localhost:8000";

// Send voice query to AI assistant
export async function sendVoiceQuery(text, customerEmail = null, sessionId = null) {
  try {
    const response = await axios.post(`${BASE_URL}/voice_chat`, {
      text: text,  // Changed from 'query' to 'text' to match backend
      customer_email: customerEmail,
      session_id: sessionId
    });
    return response.data;
  } catch (error) {
    console.error("Error sending voice query:", error);
    throw error;
  }
}

// Get welcome message
export async function getWelcomeMessage() {
  try {
    const response = await axios.get(`${BASE_URL}/welcome`);
    return response.data;
  } catch (error) {
    console.error("Error getting welcome message:", error);
    throw error;
  }
}

// Clear chat session
export async function clearSession(sessionId) {
  try {
    const response = await axios.post(`${BASE_URL}/clear_session`, null, {
      params: { session_id: sessionId }
    });
    return response.data;
  } catch (error) {
    console.error("Error clearing session:", error);
    throw error;
  }
}

// Get chat history for a customer
export async function getChatHistory(customerEmail) {
  try {
    const response = await axios.get(`${BASE_URL}/chat_history/${customerEmail}`);
    return response.data;
  } catch (error) {
    console.error("Error getting chat history:", error);
    throw error;
  }
}

