import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL, // Ensure you have REACT_APP_API_URL set in your .env file
  withCredentials: true, // Include cookies in requests
});

// Handle token refresh for expired access tokens
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true; // Prevent infinite retry loop
      try {
        // Attempt to refresh the token
        await api.post("/refresh");
        return api(originalRequest); // Retry the original request
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
