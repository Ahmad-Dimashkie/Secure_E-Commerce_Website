import React from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import AdminOrders from "./AdminOrders";
import AdminProducts from "./AdminProducts";
import AdminUsers from "./AdminUsers";
import AdminInventory from "./AdminInventory";
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
      title: "Inventory Ratio",
      value: "58.82%",
      color: "linear-gradient(135deg, #ef4444, #b91c1c)",
      route: "/admin/inventory",
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
                // onClick={() => navigate(card.route)} will fix that once i have the routes for each page
              >
                <div className="icon">{card.icon}</div>
                <h3 className="value">{card.value}</h3>
                <p className="title">{card.title}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
