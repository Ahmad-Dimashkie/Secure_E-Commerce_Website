import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("authToken");
  const userRole = localStorage.getItem("userRole");

  // Check if the user is authenticated and has the right role
  if (!token || !allowedRoles.includes(userRole)) {
    return <Navigate to="/" />; // Redirect to Homepage if not authorized
  }

  return children; // Render the protected component if authorized
};

export default ProtectedRoute;
