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
  const { user, logout } = useContext(AuthContext); // Access `user` from AuthContext
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

  // Define the menu items with role-based access
  const menuItems = [
    {
      label: "Dashboard",
      path: "/admin",
      icon: <Dashboard />,
      roles: ["Admin", "ProductManager", "OrderManager", "InventoryManager"], // Accessible by all roles
    },
    {
      label: "Orders",
      path: "/admin/orders",
      icon: <ShoppingCart />,
      roles: ["Admin", "OrderManager"], // Accessible by Admin and OrderManager
    },
    {
      label: "Products",
      path: "/admin/products",
      icon: <Store />,
      roles: ["Admin", "ProductManager"], // Accessible by Admin and ProductManager
    },
    {
      label: "Users",
      path: "/admin/users",
      icon: <People />,
      roles: ["Admin"], // Accessible only by Admin
    },
    {
      label: "Inventory",
      path: "/admin/inventory",
      icon: <PieChart />,
      roles: ["Admin", "InventoryManager"], // Accessible by Admin and InventoryManager
    },
  ];

  return (
    <div className={`sidebar ${isOpen ? "expanded" : "collapsed"}`}>
      <div className="sidebar-header">
        <h2 className="brand">E-Commerce</h2>
        <IconButton onClick={toggleSidebar} className="menu-button">
          <Menu style={{ color: "#fff" }} />
        </IconButton>
      </div>
      <List className="nav-menu">
        {menuItems.map((item) => {
          // Only show the menu item if the user's role is allowed
          if (user && item.roles.includes(user.role)) {
            return (
              <NavLink
                key={item.path}
                to={item.path}
                style={navLinkStyles(item.path)}
              >
                {({ isActive }) => (
                  <>
                    <ListItemIcon>
                      {React.cloneElement(item.icon, iconStyle(isActive))}
                    </ListItemIcon>
                    {isOpen && <ListItemText primary={item.label} />}
                  </>
                )}
              </NavLink>
            );
          }
          return null; // Do not render the menu item if the user's role is not allowed
        })}
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
