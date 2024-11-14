import React from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import AdminOrders from "./AdminOrders";
import AdminProducts from "./AdminProducts";
import AdminUsers from "./AdminUsers";
import AdminSales from "./AdminSales";
import { Route, Routes } from "react-router-dom";
import "../styles/App.css"; // Ensure this path is correct if CSS is needed
import "../styles/AdminDashboard.css";
import { Typography } from "@mui/material";
const AdminDashboard = () => {
  const navigate = useNavigate();

  const dataCards = [
    {
      title: "Total Orders",
      value: 13,
      color: "linear-gradient(135deg, #3b82f6, #1e3a8a)",
      route: "/admin/orders",
      icon: "🛒",
    },
    {
      title: "Total Products",
      value: 1,
      color: "linear-gradient(135deg, #10b981, #065f46)",
      route: "/admin/products",
      icon: "📦",
    },
    {
      title: "Total Users",
      value: 17,
      color: "linear-gradient(135deg, #fbbf24, #ca8a04)",
      route: "/admin/users",
      icon: "👥",
    },
    {
      title: "Sales Ratio",
      value: "58.82%",
      color: "linear-gradient(135deg, #ef4444, #b91c1c)",
      route: "/admin/sales",
      icon: "📊",
    },
  ];

  return (
    <div className="app-container">
      <AdminSidebar />
      <div className="main-content">
        <Typography variant="h4" component="h2" sx={{ marginBottom: "20px" }}>
          Dashboard
        </Typography>
        <div className="dashboard">
          <div className="dashboard-cards">
            {dataCards.map((card, index) => (
              <div
                key={index}
                className="dashboard-card"
                style={{ backgroundImage: card.color }}
                onClick={() => navigate(card.route)}
              >
                <div className="icon">{card.icon}</div>
                <h3 className="value">{card.value}</h3>
                <p className="title">{card.title}</p>
              </div>
            ))}
          </div>
        </div>
        <Routes>
          <Route path="/admin" />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/sales" element={<AdminSales />} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminDashboard;
