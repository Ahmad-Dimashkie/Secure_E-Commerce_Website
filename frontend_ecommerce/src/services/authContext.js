import React, { createContext, useState, useEffect } from "react";
import api from "./api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const validateToken = async () => {
    try {
      const response = await api.get("/validate-token"); // X-CSRF-TOKEN automatically added
      setUser({ role: response.data.role });
      return response.data.role; // Return the role for direct use if needed
    } catch (error) {
      setUser(null);
      throw new Error("Token validation failed");
    }
  };

  useEffect(() => {
    const validate = async () => {
      try {
        await validateToken();
      } catch {
        // No-op: Let the user handle the result (e.g., sign-in page redirection)
      } finally {
        setLoading(false);
      }
    };

    validate();
  }, []);

  const logout = async () => {
    try {
      await api.post("/logout"); // Clear cookies on the backend
      setUser(null); // Clear the frontend user state
      window.location.href = "/signin"; // Force redirection to login
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, validateToken, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
