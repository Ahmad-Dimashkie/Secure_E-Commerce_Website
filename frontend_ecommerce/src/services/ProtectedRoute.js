import React, { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import AuthContext from "../services/authContext"; // Ensure correct import path

const ProtectedRoute = ({ requiredRole }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div>Loading...</div>; // Or use a spinner component
  }

  if (!user) {
    return <Navigate to="/signin" replace />; // Redirect to login if not authenticated
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />; // Redirect to home if role doesn't match
  }

  return <Outlet />;
};

export default ProtectedRoute;
