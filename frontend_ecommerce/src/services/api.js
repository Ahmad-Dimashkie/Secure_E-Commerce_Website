import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL, // Ensure you have REACT_APP_API_URL set in your .env file
});

// Add token to headers for authenticated requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
