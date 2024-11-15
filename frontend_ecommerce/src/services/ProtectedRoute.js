import React, { useContext, useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import api from "../services/api";
import AuthContext from "../services/authContext";

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, setUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const validateToken = async () => {
      try {
        const response = await api.get("/validate-token");
        setUser({ role: response.data.role }); // Update with user's role
      } catch (error) {
        console.error("Token validation failed:", error);
        setUser(null); // Reset user state if validation fails
      } finally {
        setLoading(false); // Stop loading regardless of the result
      }
    };

    validateToken();
  }, [setUser]);

  if (loading) return <div>Loading...</div>; // Show a loading indicator while checking token

  if (!user) {
    return <Navigate to="/signin" replace />; // Redirect to login if not authenticated
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />; // Redirect to home if role is not allowed
  }

  return <Outlet />; // Allow access to the child routes if role matches
};

export default ProtectedRoute;
