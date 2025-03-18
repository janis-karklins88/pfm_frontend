// src/services/auth.js
import axios from 'axios';

const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api/users`; // Adjust to your backend URL if needed

export const registerUser = async (userData) => {
  const response = await axios.post(`${API_URL}/register`, userData);
  return response.data;
};

export const loginUser = async (credentials) => {
  const response = await axios.post(`${API_URL}/login`, credentials);
  return response.data;
};
