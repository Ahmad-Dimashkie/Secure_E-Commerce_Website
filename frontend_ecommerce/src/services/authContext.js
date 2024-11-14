import React, { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api"; // Your Axios instance

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Store user data (e.g., role, username)
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Function to handle logout
  const logout = async () => {
    try {
      await api.post("/logout"); // If your backend supports a logout endpoint
    } catch (err) {
      console.error("Error during logout:", err);
    }
    setUser(null);
    navigate("/signin"); // Redirect to login page
  };

  // Fetch user data on app load
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get("/validate-token");
        setUser({
          id: response.data.id,
          role: response.data.role, // Adjust to match your backend response
        });
      } catch (err) {
        console.error("Failed to validate token:", err);
        setUser(null);
        navigate("/signin"); // Redirect to login if validation fails
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  // Provide these values to the entire app
  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
