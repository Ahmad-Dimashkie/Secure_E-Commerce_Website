import React, { useContext, useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import api from "../services/api";
import AuthContext from "../services/authContext";

const ProtectedRoute = ({ requiredRole }) => {
  const { user, setUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const validateToken = async () => {
      try {
        const response = await api.get("/validate-token");
        setUser({ role: response.data.role });
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, [setUser]);

  if (loading) return <div>Loading...</div>;

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
