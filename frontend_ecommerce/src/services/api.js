import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL, // Ensure this is set in your .env file
  withCredentials: true, // Allow cookies to be sent with requests
});
axios.defaults.withCredentials = true;

api.interceptors.request.use(
  (config) => {
    // Retrieve CSRF token from cookies
    const csrfToken = document.cookie
      .split("; ")
      .find((row) => row.startsWith("csrf_access_token="))
      ?.split("=")[1];

    if (csrfToken) {
      config.headers["X-CSRF-TOKEN"] = csrfToken;
      console.log("CSRF Token attached:", csrfToken); // Debugging log
    } else {
      console.error("CSRF Token not found in cookies"); // Debugging log
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
