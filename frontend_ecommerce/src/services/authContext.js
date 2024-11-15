import React, { createContext, useState, useEffect } from "react";
import api from "./api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const validateToken = async () => {
    try {
      const response = await api.get("/validate-token");
      const userRole = response.data.role;
      setUser({ id: response.data.id, role: userRole }); // Update user state
      console.log("validateToken - User role set:", userRole);
      return userRole; // Return the role
    } catch (error) {
      console.error("Token validation failed:", error);
      setUser(null); // Clear the user state on failure
      throw error; // Re-throw error for caller to handle
    }
  };

  useEffect(() => {
    const validate = async () => {
      try {
        await validateToken();
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    validate();
  }, []);

  const logout = async () => {
    try {
      await api.post("/logout"); // Call logout endpoint
      setUser(null);
      window.location.href = "/signin"; // Redirect to sign-in
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout, validateToken }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
