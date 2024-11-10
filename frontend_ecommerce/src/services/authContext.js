import React, { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authToken, setAuthToken] = useState(null);
  const [user, setUser] = useState(null); // Store user data (e.g., role, username)
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Function to handle login and save token
  const login = (token) => {
    localStorage.setItem("authToken", token);
    setAuthToken(token);

    // Decode the token to get user details
    const decodedToken = jwtDecode(token);
    setUser({
      id: decodedToken.sub,
      role: decodedToken.role_id, // Adjust to match your backend's payload
    });

    // Redirect based on role
    if (decodedToken.role_id === 1) {
      navigate("/admin"); // Admin dashboard
    } else {
      navigate("/"); // Home page
    }
  };

  // Function to handle logout
  const logout = () => {
    localStorage.removeItem("authToken");
    setAuthToken(null);
    setUser(null);
    navigate("/signin"); // Redirect to login page
  };

  // On app load, check if there's a token in localStorage
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      setAuthToken(token);

      // Decode the token and set user info
      try {
        const decodedToken = jwtDecode(token);
        setUser({
          id: decodedToken.sub,
          role: decodedToken.role_id,
        });
      } catch (err) {
        console.error("Invalid token:", err);
        logout(); // Logout if the token is invalid
      }
    }
    setLoading(false);
  }, []);

  // Provide these values to the entire app
  return (
    <AuthContext.Provider
      value={{
        authToken,
        user,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
