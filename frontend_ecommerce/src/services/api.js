import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL, // Ensure this is set in your .env file
  withCredentials: true, // Allow cookies to be sent with requests
});

// Intercept requests to include CSRF tokens
api.interceptors.request.use((config) => {
  const csrfToken = document.cookie
    .split("; ")
    .find((row) => row.startsWith("csrf_access_token="))
    ?.split("=")[1];

  if (csrfToken) {
    config.headers["X-CSRF-TOKEN"] = csrfToken; // Add CSRF token to headers
  }

  return config;
});

export default api;
