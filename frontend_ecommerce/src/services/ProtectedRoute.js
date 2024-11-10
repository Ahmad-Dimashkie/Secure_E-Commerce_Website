import React, { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import AuthProvider from "../services/authContext";

const ProtectedRoute = ({ requiredRole }) => {
  const { user, loading } = useContext(AuthProvider);

  if (loading) {
    return <div>Loading...</div>; // Or a spinner component
  }

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />; // Redirect if role doesn't match
  }

  return <Outlet />;
};

export default ProtectedRoute;
