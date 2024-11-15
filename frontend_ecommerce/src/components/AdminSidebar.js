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
  const { logout } = useContext(AuthContext);
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

  return (
    <div className={`sidebar ${isOpen ? "expanded" : "collapsed"}`}>
      <div className="sidebar-header">
        <h2 className="brand">E-Commerce</h2>
        <IconButton onClick={toggleSidebar} className="menu-button">
          <Menu style={{ color: "#fff" }} />
        </IconButton>
      </div>
      <List className="nav-menu">
        <NavLink to="/admin" style={navLinkStyles("/admin")}>
          {({ isActive }) => (
            <>
              <ListItemIcon>
                <Dashboard style={iconStyle(isActive)} />
              </ListItemIcon>
              {isOpen && <ListItemText primary="Dashboard" />}
            </>
          )}
        </NavLink>
        <NavLink to="/admin/orders" style={navLinkStyles("/admin/orders")}>
          {({ isActive }) => (
            <>
              <ListItemIcon>
                <ShoppingCart style={iconStyle(isActive)} />
              </ListItemIcon>
              {isOpen && <ListItemText primary="Orders" />}
            </>
          )}
        </NavLink>
        <NavLink to="/admin/products" style={navLinkStyles("/admin/products")}>
          {({ isActive }) => (
            <>
              <ListItemIcon>
                <Store style={iconStyle(isActive)} />
              </ListItemIcon>
              {isOpen && <ListItemText primary="Products" />}
            </>
          )}
        </NavLink>
        <NavLink to="/admin/users" style={navLinkStyles("/admin/users")}>
          {({ isActive }) => (
            <>
              <ListItemIcon>
                <People style={iconStyle(isActive)} />
              </ListItemIcon>
              {isOpen && <ListItemText primary="Users" />}
            </>
          )}
        </NavLink>
        <NavLink
          to="/admin/inventory"
          style={navLinkStyles("/admin/inventory")}
        >
          {({ isActive }) => (
            <>
              <ListItemIcon>
                <PieChart style={iconStyle(isActive)} />
              </ListItemIcon>
              {isOpen && <ListItemText primary="Inventory" />}
            </>
          )}
        </NavLink>
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
