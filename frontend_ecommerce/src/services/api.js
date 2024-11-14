import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL, // Use the correct base URL from your .env
  withCredentials: true, // Include cookies in requests
});

// Interceptors can handle CSRF tokens automatically
api.interceptors.request.use((config) => {
  const csrfToken = document.cookie
    .split("; ")
    .find((row) => row.startsWith("csrf_access_token="))
    ?.split("=")[1];
  if (csrfToken) {
    config.headers["X-CSRF-TOKEN"] = csrfToken; // Attach CSRF token to the header
  }
  return config;
});

export default api;
