import axios from "axios";

const api = axios.create({
  withCredentials: true, // Allow cookies to be sent with requests
  baseURL: process.env.REACT_APP_API_URL, // Ensure this is set in your .env file
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to attach the CSRF token
api.interceptors.request.use((config) => {
  const csrfToken = document.cookie
    .split("; ")
    .find((row) => row.startsWith("csrf_access_token="))
    ?.split("=")[1];
  if (csrfToken) {
    config.headers["X-CSRF-TOKEN"] = csrfToken;
  }
  return config;
});

export default api;
