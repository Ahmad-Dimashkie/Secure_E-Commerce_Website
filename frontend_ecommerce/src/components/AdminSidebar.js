import React, { useState, useContext } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  List,
  ListItemIcon,
  ListItemText,
  Button,
  IconButton,
} from "@mui/material";
import {
  Dashboard,
  ShoppingCart,
  Store,
  People,
  PieChart,
  Menu,
  ExitToApp,
} from "@mui/icons-material";
import "../styles/AdminSidebar.css";
import AuthContext from "../services/authContext";

const AdminSidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const navLinkStyles = (path) => ({
    backgroundColor: location.pathname === path ? "#3b82f6" : "transparent",
    color: location.pathname === path ? "#ffffff" : "#e5e7eb",
    fontWeight: location.pathname === path ? "bold" : "normal",
    borderRadius: "8px",
    textDecoration: "none",
    display: "flex",
    alignItems: "center",
    padding: "10px 15px",
  });

  const iconStyle = (isActive) => ({
    color: isActive ? "#ffffff" : "#e5e7eb",
  });

  // Define navigation links based on role
  const navigationLinks = {
    1: [
      // Admin
      { to: "/admin", label: "Dashboard", icon: <Dashboard /> },
      { to: "/admin/orders", label: "Orders", icon: <ShoppingCart /> },
      { to: "/admin/products", label: "Products", icon: <Store /> },
      { to: "/admin/users", label: "Users", icon: <People /> },
      { to: "/admin/inventory", label: "Inventory", icon: <PieChart /> },
    ],
    3: [
      // OrderManager
      { to: "/admin/orders", label: "Orders", icon: <ShoppingCart /> },
    ],
    2: [
      // ProductManager
      { to: "/admin/products", label: "Products", icon: <Store /> },
    ],
    4: [
      // InventoryManager
      { to: "/admin/inventory", label: "Inventory", icon: <PieChart /> },
    ],
  };

  // Fallback links if the user's role isn't recognized
  const links = navigationLinks[user?.role] || [];

  return (
    <div className={`sidebar ${isOpen ? "expanded" : "collapsed"}`}>
      <div className="sidebar-header">
        <h2 className="brand">E-Commerce</h2>
        <IconButton onClick={toggleSidebar} className="menu-button">
          <Menu style={{ color: "#fff" }} />
        </IconButton>
      </div>
      <List className="nav-menu">
        {links.map(({ to, label, icon }) => (
          <NavLink key={to} to={to} style={navLinkStyles(to)}>
            {({ isActive }) => (
              <>
                <ListItemIcon>
                  {React.cloneElement(icon, iconStyle(isActive))}
                </ListItemIcon>
                {isOpen && <ListItemText primary={label} />}
              </>
            )}
          </NavLink>
        ))}
      </List>
      <div className="logout-container">
        <Button
          variant="contained"
          color="error"
          className="logout-button"
          onClick={logout}
        >
          <ExitToApp className="logout-button-icon" />
          {isOpen && "Logout"}
        </Button>
      </div>
    </div>
  );
};

export default AdminSidebar;
