import axios from "axios";

const BASE_URL = "http://localhost:8000";

// Check if customer exists
export async function checkCustomerExists(email) {
  try {
    const response = await axios.get(`${BASE_URL}/check_customer/${email}`);
    return response.data;
  } catch (error) {
    console.error("Error checking customer:", error);
    throw error;
  }
}

// Register new customer
export async function register(name, email, password) {
  try {
    const response = await axios.post(`${BASE_URL}/register`, {
      name,
      email,
      password
    });
    return response.data;
  } catch (error) {
    console.error("Error registering:", error);
    throw error;
  }
}

// Login customer
export async function login(email, password) {
  try {
    const response = await axios.post(`${BASE_URL}/login`, {
      email,
      password
    });
    return response.data;
  } catch (error) {
    console.error("Error logging in:", error);
    throw error;
  }
}

// Request password reset
export async function forgotPassword(email) {
  try {
    const response = await axios.post(`${BASE_URL}/forgot_password`, {
      email
    });
    return response.data;
  } catch (error) {
    console.error("Error requesting password reset:", error);
    throw error;
  }
}

// Reset password
export async function resetPassword(token, email, newPassword) {
  try {
    const response = await axios.post(`${BASE_URL}/reset_password`, {
      token,
      email,
      new_password: newPassword
    });
    return response.data;
  } catch (error) {
    console.error("Error resetting password:", error);
    throw error;
  }
}

