import axios from "axios";

const getCsrfTokenFromCookie = () => {
  const match = document.cookie.match(
    new RegExp("(^| )csrf_access_token=([^;]+)")
  );
  if (match) return match[2];
  return null;
};

const api = axios.create({
  baseURL: "http://localhost:5000",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const csrfToken = getCsrfTokenFromCookie();
    if (csrfToken) {
      config.headers["X-CSRF-Token"] = csrfToken;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
export default api;
