export const getToken = () => localStorage.getItem("authToken");
export const getRole = () => localStorage.getItem("userRole");
export const clearAuth = () => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("userRole");
};
